import type { Metadata, Viewport } from "next";

import { AppProviders } from "@/components/providers/app-providers";
import { siteUrl } from "@/lib/seo/site";

import "./globals.css";

const localeRootScript = `(() => {
  const isEnglish = location.pathname === "/en" || location.pathname.startsWith("/en/");
  document.documentElement.lang = isEnglish ? "en" : "fa";
  document.documentElement.dir = isEnglish ? "ltr" : "rtl";
})();`;

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "Athenlio",
    template: "%s | Athenlio",
  },
  description:
    "A bilingual language-learning platform for discovering the right courses and tutors.",
  applicationName: "Athenlio",
  authors: [{ name: "Athenlio" }],
  creator: "Athenlio",
  keywords: [
    "language learning",
    "online language courses",
    "language tutors",
    "آموزش زبان",
    "دوره زبان",
    "استاد زبان",
  ],
  formatDetection: {
    address: false,
    email: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Athenlio",
    title: "Athenlio",
    description:
      "Discover language courses and tutors in a bilingual learning experience.",
    locale: "fa_IR",
    alternateLocale: ["en_US"],
  },
  twitter: {
    card: "summary",
    title: "Athenlio",
    description:
      "Discover language courses and tutors in a bilingual learning experience.",
  },
  icons: {
    icon: "/brand/athenlio-favicon.svg",
    shortcut: "/brand/athenlio-favicon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#edf5f2" },
    { media: "(prefers-color-scheme: dark)", color: "#12101f" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: localeRootScript }} />
        <meta name="codex-preview" content="development" />
      </head>
      <body className="min-h-screen antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
