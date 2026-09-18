import type { Metadata } from "next";

import { localeAlternates } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Find the right language course and tutor",
  description:
    "Discover language courses and tutors that match your goals, then manage your learning journey with Athenlio.",
  alternates: localeAlternates("en"),
  openGraph: {
    locale: "en_US",
    alternateLocale: ["fa_IR"],
  },
};

export default function EnglishLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
