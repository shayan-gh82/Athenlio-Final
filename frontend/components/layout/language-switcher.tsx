"use client";

import { Languages } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { useLocationSearch } from "@/hooks/use-location-search";

export function LanguageSwitcher({ initialSearch = "" }: { initialSearch?: string }) {
  const locale = useLocale();
  const t = useTranslations("common");
  const pathname = usePathname();
  const search = useLocationSearch() ?? initialSearch;
  const nextLocale = locale === "fa" ? "en" : "fa";
  const translatedPath = /^\/(fa|en)(?=\/|$)/.test(pathname)
    ? pathname.replace(/^\/(fa|en)(?=\/|$)/, `/${nextLocale}`)
    : `/${nextLocale}`;
  const nextPath = `${translatedPath}${search}`;

  return (
    <Button asChild variant="ghost" size="sm" className="rounded-xl px-3 font-bold">
      <Link href={nextPath} aria-label={t("changeLanguage")}>
        <Languages aria-hidden="true" />
        {nextLocale === "fa" ? "فا" : "EN"}
      </Link>
    </Button>
  );
}
