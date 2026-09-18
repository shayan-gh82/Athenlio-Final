"use client";

import { AlertCircle, DatabaseZap, Inbox, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

export function CatalogLoading() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="Loading">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="h-72 animate-pulse rounded-3xl border border-border bg-card/70" />
      ))}
    </div>
  );
}

export function CatalogState({
  kind,
  onRetry,
}: {
  kind: "unconfigured" | "error" | "empty";
  onRetry?: () => void;
}) {
  const t = useTranslations("catalogState");
  const Icon = kind === "unconfigured" ? DatabaseZap : kind === "error" ? AlertCircle : Inbox;

  return (
    <div className="grid min-h-80 place-items-center rounded-3xl border border-dashed border-primary/25 bg-card/65 px-6 py-12 text-center">
      <div className="max-w-lg">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary-soft text-primary dark:bg-primary/15">
          <Icon aria-hidden="true" />
        </span>
        <h2 className="mt-5 text-xl font-bold">{t(`${kind}Title`)}</h2>
        <p className="mt-3 leading-8 text-muted-foreground">{t(`${kind}Description`)}</p>
        {kind === "error" && onRetry ? (
          <Button type="button" variant="outline" className="mt-6 rounded-xl" onClick={onRetry}>
            <RefreshCw aria-hidden="true" />
            {t("retry")}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
