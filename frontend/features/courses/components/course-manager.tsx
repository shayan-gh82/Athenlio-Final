"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, BookOpen, Clock3, Edit3, ExternalLink, Loader2, Plus, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { deleteCourse } from "@/features/courses/api";
import { CourseForm } from "@/features/courses/components/course-form";
import type { Course } from "@/features/courses/types";
import { getTutorDashboard } from "@/features/tutors/api";
import { isApiConfigured } from "@/lib/api/config";
import { normalizeApiError } from "@/lib/api/errors";
import { queryKeys } from "@/lib/query/keys";
import { useAppSelector } from "@/store/hooks";

export function CourseManager() {
  const locale = useLocale();
  const t = useTranslations("courseManagement");
  const router = useRouter();
  const queryClient = useQueryClient();
  const authStatus = useAppSelector((state) => state.auth.status);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | undefined>();
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const query = useQuery({
    queryKey: queryKeys.tutorDashboard,
    queryFn: getTutorDashboard,
    enabled: isApiConfigured && authStatus === "tutor-approved",
    retry: false,
    staleTime: 45_000,
  });
  const deleteMutation = useMutation({
    mutationFn: deleteCourse,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.tutorDashboard }),
        queryClient.invalidateQueries({ queryKey: queryKeys.courseList }),
      ]);
      toast.success(t("deleteSuccess"));
      setDeletingCourse(null);
    },
    onError: (error) => {
      const apiError = normalizeApiError(error);
      toast.error(apiError.status === 403 ? t("ownershipError") : t("connectionError"));
    },
  });

  useEffect(() => {
    if (!isApiConfigured || authStatus === "unknown" || authStatus === "tutor-approved") return;
    if (authStatus === "tutor-no-profile") router.replace(`/${locale}/dashboard/tutor/onboarding`);
    else if (authStatus === "tutor-pending") router.replace(`/${locale}/dashboard/tutor`);
    else router.replace(authStatus === "guest" ? `/${locale}/login` : `/${locale}`);
  }, [authStatus, locale, router]);

  const openCreate = () => { setEditingCourse(undefined); setEditorOpen(true); };
  const openEdit = (course: Course) => { setEditingCourse(course); setEditorOpen(true); };
  const closeEditor = () => { setEditorOpen(false); setEditingCourse(undefined); };

  return (
    <DashboardShell title={t("pageTitle")} area="tutor" avatarSrc={query.data?.tutor.profile_picture}>
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-6 flex flex-col justify-between gap-4 rounded-3xl border border-primary/10 bg-card/85 p-5 shadow-sm sm:flex-row sm:items-center sm:p-6">
            <div><p className="text-sm font-bold text-secondary">{t("eyebrow")}</p><h2 className="mt-2 text-2xl font-bold">{t("title")}</h2><p className="mt-2 max-w-2xl leading-7 text-muted-foreground">{t("description")}</p></div>
            <Button className="h-11 shrink-0 rounded-xl" onClick={openCreate} disabled={!isApiConfigured || authStatus !== "tutor-approved"}><Plus aria-hidden="true" />{t("newCourse")}</Button>
          </div>

          {!isApiConfigured ? <Alert className="mb-6 border-secondary/20 bg-card/80"><AlertCircle aria-hidden="true" /><AlertTitle>{t("previewTitle")}</AlertTitle><AlertDescription>{t("previewDescription")}</AlertDescription></Alert> : null}
          {query.isLoading ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-64 rounded-3xl" />)}</div> : null}
          {query.isError ? <Alert variant="destructive"><AlertCircle aria-hidden="true" /><AlertTitle>{t("loadError")}</AlertTitle><AlertDescription>{t("connectionError")} <button className="font-bold underline" onClick={() => query.refetch()}>{t("retry")}</button></AlertDescription></Alert> : null}

          {(!isApiConfigured || query.isSuccess) && !query.data?.courses.length ? <EmptyCourses title={t("emptyTitle")} description={t("emptyDescription")} actionLabel={t("newCourse")} actionDisabled={!isApiConfigured || authStatus !== "tutor-approved"} onCreate={openCreate} /> : null}
          {query.data?.courses.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{query.data.courses.map((course) => <Card key={course.id} className="overflow-hidden border-primary/10 bg-card/90 shadow-sm"><div className="h-2 bg-gradient-to-r from-primary via-primary/80 to-secondary" /><CardContent className="p-5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><Badge variant="secondary">{course.language} · {course.level}</Badge><h3 className="mt-3 truncate text-xl font-bold">{course.title}</h3><p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-muted-foreground">{course.description}</p></div><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary dark:bg-primary/15"><BookOpen aria-hidden="true" /></span></div><div className="mt-5 grid grid-cols-2 gap-3 text-sm"><p className="flex items-center gap-2 text-muted-foreground"><Clock3 className="size-4" />{course.schedule_day} · {course.schedule_start?.slice(0, 5)}</p><p className="flex items-center gap-2 text-muted-foreground"><Users className="size-4" />{course.active_students}/{course.capacity}</p></div><div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4"><Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => openEdit(course)}><Edit3 />{t("edit")}</Button><Button asChild variant="ghost" size="sm" className="rounded-xl"><Link href={`/${locale}/courses/${course.id}`}><ExternalLink />{t("view")}</Link></Button><Button type="button" variant="ghost" size="sm" className="ms-auto rounded-xl text-destructive hover:text-destructive" onClick={() => setDeletingCourse(course)}><Trash2 />{t("delete")}</Button></div></CardContent></Card>)}</div> : null}
        </div>
      </main>

      <Dialog open={editorOpen} onOpenChange={(open) => open ? setEditorOpen(true) : closeEditor()}>
        <DialogContent className="max-h-[94vh] overflow-y-auto rounded-3xl sm:max-w-4xl">
          <DialogHeader className="text-start"><DialogTitle className="text-2xl">{t(editingCourse ? "editCourseTitle" : "createCourseTitle")}</DialogTitle><DialogDescription>{t(editingCourse ? "editCourseDescription" : "createCourseDescription")}</DialogDescription></DialogHeader>
          <CourseForm key={editingCourse?.id ?? "new"} course={editingCourse} onSuccess={closeEditor} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deletingCourse)} onOpenChange={(open) => { if (!open && !deleteMutation.isPending) setDeletingCourse(null); }}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle><AlertDialogDescription>{t("deleteDescription", { course: deletingCourse?.title ?? "" })}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={deleteMutation.isPending}>{t("cancel")}</AlertDialogCancel><AlertDialogAction variant="destructive" disabled={deleteMutation.isPending} onClick={(event) => { event.preventDefault(); if (deletingCourse) deleteMutation.mutate(deletingCourse.id); }}>{deleteMutation.isPending ? <Loader2 className="animate-spin" /> : <Trash2 />}{t("confirmDelete")}</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </DashboardShell>
  );
}

function EmptyCourses({ title, description, actionLabel, actionDisabled, onCreate }: { title: string; description: string; actionLabel: string; actionDisabled: boolean; onCreate: () => void }) {
  return <div className="grid min-h-80 place-items-center rounded-3xl border border-dashed border-primary/20 bg-card/70 px-6 text-center"><div><span className="mx-auto grid size-16 place-items-center rounded-3xl bg-primary-soft text-primary dark:bg-primary/15"><BookOpen className="size-8" /></span><h3 className="mt-4 text-xl font-bold">{title}</h3><p className="mx-auto mt-2 max-w-md leading-7 text-muted-foreground">{description}</p><Button className="mt-5 rounded-xl" onClick={onCreate} disabled={actionDisabled}><Plus />{actionLabel}</Button></div></div>;
}
