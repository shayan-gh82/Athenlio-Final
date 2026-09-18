import type { Metadata } from "next";

export const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:5173",
);

export const publicRoutes = ["", "/courses", "/tutors", "/blog"] as const;

export function localeAlternates(
  locale: "fa" | "en",
  path = "",
): Metadata["alternates"] {
  return {
    canonical: `/${locale}${path}`,
    languages: {
      fa: `/fa${path}`,
      en: `/en${path}`,
      "x-default": `/fa${path}`,
    },
  };
}

export const privatePageRobots: Metadata["robots"] = {
  index: false,
  follow: false,
  googleBot: {
    index: false,
    follow: false,
  },
};
