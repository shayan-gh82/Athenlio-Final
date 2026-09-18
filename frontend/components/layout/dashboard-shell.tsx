"use client";

import { BookOpen, ClipboardCheck, Home, Languages, LibraryBig, ListChecks, LogOut, ReceiptText, ShoppingCart, UserRound, UserRoundSearch } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { BrandLogo } from "@/components/brand/brand-logo";
import { SupportDialog } from "./support-dialog";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { logout } from "@/features/auth/api";
import { setGuest } from "@/store/auth-slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const studentNavigation = [
  { icon: Home, key: "overview", route: "/dashboard/student" },
  { icon: UserRound, key: "profile", route: "/dashboard/student/profile" },
  { icon: LibraryBig, key: "myCourses", route: "/dashboard/student/courses" },
  { icon: ReceiptText, key: "purchases", route: "/dashboard/student/purchases" },
  { icon: ListChecks, key: "assignments", route: "/dashboard/student/assignments" },
  { icon: ShoppingCart, key: "cart", route: "/cart" },
  { icon: BookOpen, key: "courseCatalog", route: "/courses" },
  { icon: UserRoundSearch, key: "tutors", route: "/tutors" },
] as const;

const tutorNavigation = [
  { icon: Home, key: "overview", route: "/dashboard/tutor" },
  { icon: BookOpen, key: "myCourses", route: "/dashboard/tutor/courses" },
  { icon: ClipboardCheck, key: "requests", route: "/dashboard/tutor#requests" },
  { icon: UserRoundSearch, key: "publicTutors", route: "/tutors" },
] as const;

function initials(firstName?: string, lastName?: string) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "A";
}

export function DashboardShell({ children, title, area = "student", avatarSrc }: { children: React.ReactNode; title: string; area?: "student" | "tutor"; avatarSrc?: string | null }) {
  const locale = useLocale();
  const t = useTranslations("dashboardShell");
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const user = useAppSelector((state) => state.auth.user);
  const authStatus = useAppSelector((state) => state.auth.status);
  const logoutMutation = useMutation({ mutationFn: logout });
  const navigation = area === "tutor" ? [
    tutorNavigation[0],
    { icon: UserRound, key: "profile", route: user?.tutor_id ? "/dashboard/tutor/profile" : "/dashboard/tutor/onboarding" },
    ...tutorNavigation.slice(1),
  ] : studentNavigation;
  const displayedAvatar = avatarSrc ?? user?.profile_picture;
  const profileHref = area === "student"
    ? `/${locale}/dashboard/student/profile`
    : `/${locale}${user?.tutor_id ? "/dashboard/tutor/profile" : "/dashboard/tutor/onboarding"}`;

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      queryClient.clear();
      dispatch(setGuest());
      toast.success(t("logoutSuccess"));
      router.replace(`/${locale}/login`);
    } catch {
      toast.error(t("logoutError"));
    }
  };

  return (
    <SidebarProvider>
      <Sidebar side={locale === "fa" ? "right" : "left"} variant="inset" collapsible="offcanvas">
        <SidebarHeader className="border-b border-sidebar-border p-4">
          <Link href={`/${locale}`} className="inline-flex"><BrandLogo className="h-9 w-[158px]" /></Link>
        </SidebarHeader>
        <SidebarContent>
          <Link href={profileHref} className="m-3 block rounded-2xl border bg-card p-4 text-center shadow-sm transition hover:border-primary/30">
            <Avatar className="mx-auto size-20 rounded-2xl"><AvatarImage src={displayedAvatar ?? undefined} alt="" /><AvatarFallback>{initials(user?.first_name, user?.last_name)}</AvatarFallback></Avatar>
            <p dir="auto" className="mt-3 break-words font-bold">{user ? `${user.first_name} ${user.last_name}` : t("preview")}</p>
            <p className="mt-2 text-xs text-secondary">{t(area === "tutor" ? "tutorAccount" : "studentAccount")}</p>
            <p dir="ltr" className="mt-2 break-all text-xs text-muted-foreground">{user?.email}</p>
            {area === "tutor" ? <p className="mt-3 rounded-lg bg-primary-soft p-2 text-xs">{locale === "fa" ? (authStatus === "tutor-approved" ? "تأییدشده" : "در انتظار تکمیل / تأیید") : (authStatus === "tutor-approved" ? "Approved" : "Pending completion / approval")}</p> : null}
          </Link>
          <SidebarGroup>
            <SidebarGroupLabel>{t(area === "tutor" ? "tutorArea" : "studentArea")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigation.map(({ icon: Icon, key, route }) => {
                  const href = `/${locale}${route}`;
                  return (
                    <SidebarMenuItem key={key}>
                      <SidebarMenuButton asChild isActive={pathname === href} tooltip={t(key)}>
                        <Link href={href}><Icon aria-hidden="true" /><span>{t(key)}</span></Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <div className="px-3 pb-4"><SupportDialog /></div>
        </SidebarContent>
        <SidebarFooter className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-3 rounded-xl p-2">
            <Avatar size="lg">
              {displayedAvatar ? <AvatarImage src={displayedAvatar} alt="" /> : null}
              <AvatarFallback>{initials(user?.first_name, user?.last_name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{user ? `${user.first_name} ${user.last_name}`.trim() || t(area === "tutor" ? "tutorAccount" : "studentAccount") : t(area === "tutor" ? "tutorAccount" : "studentAccount")}</p>
              <p className="truncate text-xs text-muted-foreground" dir="ltr">{user?.email ?? t("preview")}</p>
            </div>
            {authStatus !== "guest" ? (
              <Button type="button" variant="ghost" size="icon" className="rounded-lg" aria-label={t("logout")} onClick={handleLogout} disabled={logoutMutation.isPending}>
                <LogOut aria-hidden="true" />
              </Button>
            ) : null}
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-transparent">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border/70 bg-background/80 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <SidebarTrigger className="rounded-xl" aria-label={t("toggleSidebar")} />
            <div className="h-6 w-px bg-border" aria-hidden="true" />
            <h1 className="truncate font-bold sm:text-lg">{title}</h1>
          </div>
          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />
            <Button asChild variant="ghost" size="icon" className="hidden rounded-xl sm:inline-flex">
              <Link href={`/${locale}`} aria-label={t("home")}><Languages aria-hidden="true" /></Link>
            </Button>
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
