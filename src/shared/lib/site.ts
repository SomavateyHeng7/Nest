/**
 * Canonical origin used for metadataBase, the sitemap and robots.txt.
 * Set NEXT_PUBLIC_SITE_URL in production (e.g. https://nest.example.com).
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");

export const SITE_NAME = "Nest";

/** Routes that are behind (future) auth or are transactional: kept out of search results. */
export const PRIVATE_PATHS = [
  "/admin",
  "/host",
  "/renter",
  "/booking",
  "/messages",
  "/profile",
  "/earning",
  "/maintenance",
];

/**
 * Public support inbox shown on /contact and in the legal pages.
 * Placeholder (`.example` is a reserved domain) — replace with the real address before launch.
 */
export const SUPPORT_EMAIL = "hello@nest.example";
