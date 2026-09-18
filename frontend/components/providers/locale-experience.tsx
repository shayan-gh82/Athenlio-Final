"use client";

import { useEffect } from "react";
import { NextIntlClientProvider } from "next-intl";

import { HomeExperience } from "@/features/home/components/home-experience";

import enMessages from "@/messages/en.json";
import faMessages from "@/messages/fa.json";

export type AthenlioLocale = "fa" | "en";

const messages = {
  fa: faMessages,
  en: enMessages,
};

export function LocaleProvider({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: AthenlioLocale;
}) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "fa" ? "rtl" : "ltr";
  }, [locale]);

  return (
    <NextIntlClientProvider locale={locale} messages={messages[locale]} timeZone="UTC">
      <div lang={locale} dir={locale === "fa" ? "rtl" : "ltr"}>{children}</div>
    </NextIntlClientProvider>
  );
}

export function LocaleExperience({ locale }: { locale: AthenlioLocale }) {
  return (
    <LocaleProvider locale={locale}>
      <HomeExperience />
    </LocaleProvider>
  );
}
