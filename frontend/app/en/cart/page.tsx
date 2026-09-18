import type { Metadata } from "next";
import { LocaleProvider } from "@/components/providers/locale-experience";
import { CartPage } from "@/features/cart/components/cart-page";
import { privatePageRobots } from "@/lib/seo/site";

export const metadata: Metadata = { title: "Shopping cart", robots: privatePageRobots };

export default function EnglishCartPage() {
  return <LocaleProvider locale="en"><CartPage /></LocaleProvider>;
}
