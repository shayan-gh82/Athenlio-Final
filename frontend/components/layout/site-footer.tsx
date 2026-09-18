"use client";

import { useTranslations } from "next-intl";

import { BrandLogo } from "@/components/brand/brand-logo";

export function SiteFooter() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-border bg-card/50">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="space-y-3">
          <BrandLogo className="h-9 w-[158px]" />
          <p className="max-w-md text-sm leading-7 text-muted-foreground">{t("description")}</p>
        </div>
        <p className="text-sm text-muted-foreground">{t("copyright", { year: new Date().getUTCFullYear() })}</p>
      </div>
    </footer>
  );
}
