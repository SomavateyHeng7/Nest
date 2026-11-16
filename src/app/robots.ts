import type { MetadataRoute } from "next";

import { PRIVATE_PATHS, SITE_URL } from "@/shared/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: PRIVATE_PATHS.map((p) => `${p}/`).concat(PRIVATE_PATHS) },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
