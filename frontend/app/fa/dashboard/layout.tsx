import type { Metadata } from "next";

import { privatePageRobots } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "داشبورد",
  robots: privatePageRobots,
};

export default function PersianDashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
