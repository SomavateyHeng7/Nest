import type { MetadataRoute } from "next";

import { listings } from "@/features/listings/data";
import { SITE_URL } from "@/shared/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/listing`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/owners`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/signup`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/login`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const stays: MetadataRoute.Sitemap = listings.map((l) => ({
    url: `${SITE_URL}/listing/${l.id}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...pages, ...stays];
}
