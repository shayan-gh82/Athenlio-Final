"use client";

import { LayoutDashboard, Menu, ShoppingCart, X } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import { BrandLogo } from "@/components/brand/brand-logo";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getAuthenticatedRoute } from "@/features/auth/types";
import { useCourseCart } from "@/features/cart/cart-store";
import { useAppSelector } from "@/store/hooks";

const navItems = [
  { key: "home", route: "" },
  { key: "courses", route: "/courses" },
  { key: "tutors", route: "/tutors" },
  { key: "blog", route: "/blog" },
  { key: "journey", route: "#journey" },
] as const;

export function SiteHeader({ initialSearch = "" }: { initialSearch?: string }) {
  const locale = useLocale();
  const t = useTranslations("navigation");
  const isRtl = locale === "fa";
  const localeRoot = `/${locale}`;
  const itemHref = (route: string) => `${localeRoot}${route}`;
  const user = useAppSelector((state) => state.auth.user);
  const authStatus = useAppSelector((state) => state.auth.status);
  const isAuthenticated = Boolean(user && authStatus !== "guest" && authStatus !== "unknown");
  const dashboardHref = user ? getAuthenticatedRoute(user, locale) : `${localeRoot}/login`;
  const fallback = `${user?.first_name?.[0] ?? ""}${user?.last_name?.[0] ?? ""}`.toUpperCase() || "A";
  const cart = useCourseCart();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href={localeRoot} aria-label={t("homeLabel")} className="shrink-0 rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40">
          <BrandLogo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label={t("mainMenu")}>
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={itemHref(item.route)}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-1 sm:flex">
          <LanguageSwitcher initialSearch={initialSearch} />
          <ThemeToggle />
          <Button asChild variant="ghost" size="icon" className="relative rounded-xl">
            <Link href={`${localeRoot}/cart`} aria-label={locale === "fa" ? "سبد خرید" : "Shopping cart"}>
              <ShoppingCart aria-hidden="true" />
              {cart.isReady && cart.count > 0 ? <span className="absolute -end-1 -top-1 grid min-w-5 place-items-center rounded-full bg-secondary px-1 text-[10px] font-black text-secondary-foreground">{cart.count}</span> : null}
            </Link>
          </Button>
          {isAuthenticated ? (
            <Button asChild variant="outline" className="h-11 rounded-xl ps-2 pe-4">
              <Link href={dashboardHref}>
                <Avatar size="sm" className="size-7"><AvatarImage src={user?.profile_picture ?? undefined} alt="" /><AvatarFallback>{fallback}</AvatarFallback></Avatar>
                {t("dashboard")}
              </Link>
            </Button>
          ) : (
            <><Button asChild variant="ghost" className="rounded-xl"><Link href={`${localeRoot}/login`}>{t("signIn")}</Link></Button><Button asChild className="rounded-xl px-5 shadow-sm"><Link href={`${localeRoot}/register`}>{t("register")}</Link></Button></>
          )}
        </div>

        <div className="flex items-center gap-1 sm:hidden">
          <LanguageSwitcher initialSearch={initialSearch} />
          <ThemeToggle />
          <Button asChild variant="ghost" size="icon" className="relative rounded-xl">
            <Link href={`${localeRoot}/cart`} aria-label={locale === "fa" ? "سبد خرید" : "Shopping cart"}>
              <ShoppingCart aria-hidden="true" />
              {cart.isReady && cart.count > 0 ? <span className="absolute -end-1 -top-1 grid min-w-5 place-items-center rounded-full bg-secondary px-1 text-[10px] font-black text-secondary-foreground">{cart.count}</span> : null}
            </Link>
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-xl" aria-label={t("openMenu")}>
                <Menu aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side={isRtl ? "left" : "right"} showCloseButton={false} className="w-[88%] max-w-sm p-0">
              <SheetHeader className="border-b border-border p-5 text-start">
                <div className="flex items-center justify-between gap-4">
                  <BrandLogo className="h-9 w-[158px]" />
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon" className="rounded-xl" aria-label={t("closeMenu")}>
                      <X aria-hidden="true" />
                    </Button>
                  </SheetClose>
                </div>
                <SheetTitle className="sr-only">{t("mainMenu")}</SheetTitle>
                <SheetDescription className="sr-only">{t("menuDescription")}</SheetDescription>
              </SheetHeader>
              <nav className="flex flex-col gap-2 p-5" aria-label={t("mainMenu")}>
                {navItems.map((item) => (
                  <SheetClose asChild key={item.key}>
                    <Link className="rounded-xl px-4 py-3 font-semibold hover:bg-muted" href={itemHref(item.route)}>
                      {t(item.key)}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-auto grid gap-2 border-t border-border p-5">
                {isAuthenticated ? (
                  <Button asChild className="rounded-xl"><Link href={dashboardHref}><LayoutDashboard aria-hidden="true" />{t("dashboard")}</Link></Button>
                ) : (
                  <><Button asChild variant="outline" className="rounded-xl"><Link href={`${localeRoot}/login`}>{t("signIn")}</Link></Button><Button asChild className="rounded-xl"><Link href={`${localeRoot}/register`}>{t("register")}</Link></Button></>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
