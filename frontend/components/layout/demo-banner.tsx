"use client";
import { useLocale } from "next-intl";
import { isDemoMode } from "@/lib/api/config";

export function DemoBanner() {
  const fa = useLocale() === "fa";
  if (!isDemoMode) return null;
  return <aside role="note" className="border-b border-secondary/20 bg-primary-soft px-4 py-3 text-center text-sm leading-6 text-foreground">
    <strong>{fa ? "نسخهٔ نمایشی" : "Portfolio demo"}</strong>{" — "}
    {fa ? "دوره‌ها و استادان نمونه‌اند. ورود، ثبت‌نام و پرداخت واقعی فعال نیست؛ مرور دوره‌ها و سبد خرید را امتحان کن." : "Courses and tutors are sample content. Real sign-in, registration, and payments are disabled. Explore the catalog and cart."}
  </aside>;
}
