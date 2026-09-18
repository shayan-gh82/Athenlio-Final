import type { Metadata } from "next";

import { privatePageRobots } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: privatePageRobots,
};

export default function EnglishDashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
