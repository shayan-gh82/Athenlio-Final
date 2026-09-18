import type { Metadata } from "next";
import { LocaleProvider } from "@/components/providers/locale-experience";
import { CartPage } from "@/features/cart/components/cart-page";
import { privatePageRobots } from "@/lib/seo/site";

export const metadata: Metadata = { title: "سبد خرید", robots: privatePageRobots };

export default function PersianCartPage() {
  return <LocaleProvider locale="fa"><CartPage /></LocaleProvider>;
}
