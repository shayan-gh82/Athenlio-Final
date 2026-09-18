import type { MetadataRoute } from "next";

import { publicRoutes, siteUrl } from "@/lib/seo/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return (["fa", "en"] as const).flatMap((locale) =>
    publicRoutes.map((path) => ({
      url: new URL(`/${locale}${path}`, siteUrl).toString(),
      changeFrequency: path === "" ? ("weekly" as const) : ("daily" as const),
      priority: path === "" ? 1 : 0.8,
      alternates: {
        languages: {
          fa: new URL(`/fa${path}`, siteUrl).toString(),
          en: new URL(`/en${path}`, siteUrl).toString(),
        },
      },
    })),
  );
}
