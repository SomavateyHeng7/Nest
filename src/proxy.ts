import { NextResponse, type NextRequest } from "next/server";
import { getListingById } from "@/features/listings/data";

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * Maintenance mode. Set MAINTENANCE_MODE=true (and restart/redeploy) to serve
 * the maintenance screen for every page with a real 503 status, so search
 * engines and monitors treat it as temporary. Turning it off needs no code change.
 *
 * Optional: MAINTENANCE_RETRY_AFTER (seconds, default 1800) sets the Retry-After header.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const on = process.env.MAINTENANCE_MODE === "true";

  if (!on) {
    // Don't leave a stale /maintenance URL reachable when the site is up.
    if (pathname === "/maintenance") return NextResponse.redirect(new URL("/", request.url));

    // Unknown listing IDs: loading.tsx makes the page stream, so notFound() in the page can't
    // change the 200 status. Answer here instead, with the normal not-found page and a real 404.
    const listingId = pathname.match(/^\/listing\/([^/]+)\/?$/)?.[1];
    if (listingId && !getListingById(safeDecode(listingId))) {
      return NextResponse.rewrite(new URL("/listing-not-found", request.url), { status: 404 });
    }

    return NextResponse.next();
  }

  if (pathname === "/maintenance") return NextResponse.next();

  return NextResponse.rewrite(new URL("/maintenance", request.url), {
    status: 503,
    headers: {
      "Retry-After": process.env.MAINTENANCE_RETRY_AFTER ?? "1800",
      "Cache-Control": "no-store",
    },
  });
}

export const config = {
  // Skip framework assets, files in /public, robots/sitemap, the favicon and the
  // /maintenance/status error-state gallery (so the 503 design stays reviewable while live).
  matcher: ["/((?!_next/|maintenance/status|robots\\.txt|sitemap\\.xml|favicon\\.ico|.*\\.[a-zA-Z0-9]+$).*)"],
};
