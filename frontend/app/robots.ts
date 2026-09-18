import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/fa/", "/en/"],
      disallow: [
        "/fa/login",
        "/en/login",
        "/fa/register",
        "/en/register",
        "/fa/dashboard/",
        "/en/dashboard/",
      ],
    },
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
    host: siteUrl.origin,
  };
}
