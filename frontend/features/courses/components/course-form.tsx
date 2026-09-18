"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Flag, ImagePlus, Loader2, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { createCourse, updateCourse } from "@/features/courses/api";
import type { Course } from "@/features/courses/types";
import { normalizeApiError } from "@/lib/api/errors";
import { queryKeys } from "@/lib/query/keys";

const imageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export function CourseForm({ course, onSuccess }: { course?: Course; onSuccess: () => void }) {
  const t = useTranslations("courseManagement");
  const queryClient = useQueryClient();
  const [image, setImage] = useState<File | null>(null);
  const [flag, setFlag] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const schema = z.object({
    courseId: z.string().trim().min(3, t("codeTooShort")).max(20, t("codeTooLong")).regex(/^[A-Za-z0-9_-]+$/, t("codeInvalid")),
    title: z.string().trim().min(3, t("titleTooShort")).max(255, t("titleTooLong")),
    description: z.string().trim().min(20, t("descriptionTooShort")),
    detail: z.string().trim().min(30, t("detailTooShort")),
    requirements: z.string().trim().min(3, t("required")),
    materials: z.string().trim().min(3, t("required")),
    pricePerHour: z.coerce.number().min(0, t("nonNegative")),
    pricePerDollar: z.coerce.number().min(0, t("nonNegative")),
    pricePerToman: z.coerce.number().min(0, t("nonNegative")),
    language: z.string().trim().min(2, t("required")),
    level: z.string().trim().min(1, t("required")),
    scheduleDay: z.string().trim().min(2, t("required")),
    scheduleStart: z.string().min(1, t("required")),
    scheduleEnd: z.string().min(1, t("required")),
    capacity: z.coerce.number().int().min(1, t("positiveInteger")),
    length: z.coerce.number().int().min(1, t("positiveInteger")),
    courseDuration: z.coerce.number().int().min(15, t("durationMinimum")),
  })
    .refine((values) => values.scheduleEnd > values.scheduleStart, { path: ["scheduleEnd"], message: t("endAfterStart") })
    .refine((values) => values.pricePerHour > 0 || values.pricePerDollar > 0 || values.pricePerToman > 0, { path: ["pricePerHour"], message: t("onePriceRequired") });
  type CourseValues = z.infer<typeof schema>;
  const form = useForm<CourseValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      courseId: course?.courseId ?? "",
      title: course?.title ?? "",
      description: course?.description ?? "",
      detail: course?.detail ?? "",
      requirements: course?.requirements ?? "",
      materials: course?.materials ?? "",
      pricePerHour: Number(course?.price_per_hour ?? 0),
      pricePerDollar: Number(course?.price_per_dollar ?? 0),
      pricePerToman: Number(course?.price_per_toman ?? 0),
      language: course?.language ?? "",
      level: course?.level ?? "A1",
      scheduleDay: course?.schedule_day ?? "",
      scheduleStart: course?.schedule_start?.slice(0, 5) ?? "09:00",
      scheduleEnd: course?.schedule_end?.slice(0, 5) ?? "10:00",
      capacity: course?.capacity ?? 10,
      length: course?.length ?? 20,
      courseDuration: Number(course?.course_duration ?? 60),
    },
  });
  const mutation = useMutation({
    mutationFn: (values: CourseValues) => course ? updateCourse({ id: course.id, payload: { ...values, image, languageFlag: flag } }) : createCourse({ ...values, image, languageFlag: flag }),
  });

  const chooseImage = (file: File | undefined, kind: "image" | "flag") => {
    setFileError(null);
    if (!file) return kind === "image" ? setImage(null) : setFlag(null);
    if (!imageTypes.has(file.type)) return setFileError(t("imageTypeError"));
    if (file.size > 5 * 1024 * 1024) return setFileError(t("imageSizeError"));
    if (kind === "image") setImage(file); else setFlag(file);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    if (fileError) return;
    setServerError(null);
    try {
      await mutation.mutateAsync(values);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.tutorDashboard }),
        queryClient.invalidateQueries({ queryKey: queryKeys.courseList }),
      ]);
      toast.success(t(course ? "updateSuccess" : "createSuccess"));
      onSuccess();
    } catch (error) {
      const apiError = normalizeApiError(error);
      setServerError(apiError.status === 400 ? t("invalidOrDuplicate") : t("connectionError"));
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-7" noValidate>
      {serverError ? <Alert variant="destructive"><AlertCircle aria-hidden="true" /><AlertTitle>{t("saveFailed")}</AlertTitle><AlertDescription>{serverError}</AlertDescription></Alert> : null}

      <FormSection title={t("identitySection")} description={t("identityDescription")}>
        <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
          <Field id="course-code" label={t("courseCode")} error={form.formState.errors.courseId?.message}><Input id="course-code" dir="ltr" {...form.register("courseId")} /></Field>
          <Field id="course-title" label={t("courseTitle")} error={form.formState.errors.title?.message}><Input id="course-title" {...form.register("title")} /></Field>
        </div>
        <Field id="course-description" label={t("shortDescription")} error={form.formState.errors.description?.message}><Textarea id="course-description" rows={3} {...form.register("description")} /></Field>
        <Field id="course-detail" label={t("fullDescription")} error={form.formState.errors.detail?.message}><Textarea id="course-detail" rows={5} {...form.register("detail")} /></Field>
        <div className="grid gap-4 sm:grid-cols-2"><Field id="course-requirements" label={t("requirements")} error={form.formState.errors.requirements?.message}><Textarea id="course-requirements" rows={3} {...form.register("requirements")} /></Field><Field id="course-materials" label={t("materials")} error={form.formState.errors.materials?.message}><Textarea id="course-materials" rows={3} {...form.register("materials")} /></Field></div>
      </FormSection>

      <FormSection title={t("scheduleSection")} description={t("scheduleDescription")}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field id="course-language" label={t("language")} error={form.formState.errors.language?.message}><Input id="course-language" {...form.register("language")} /></Field>
          <Field id="course-level" label={t("level")} error={form.formState.errors.level?.message}><NativeSelect id="course-level" className="h-10 w-full rounded-md" {...form.register("level")}>{["A1", "A2", "B1", "B2", "C1", "C2"].map((level) => <NativeSelectOption key={level} value={level}>{level}</NativeSelectOption>)}</NativeSelect></Field>
          <Field id="course-day" label={t("scheduleDay")} error={form.formState.errors.scheduleDay?.message}><Input id="course-day" {...form.register("scheduleDay")} /></Field>
          <Field id="course-start" label={t("startTime")} error={form.formState.errors.scheduleStart?.message}><Input id="course-start" type="time" {...form.register("scheduleStart")} /></Field>
          <Field id="course-end" label={t("endTime")} error={form.formState.errors.scheduleEnd?.message}><Input id="course-end" type="time" {...form.register("scheduleEnd")} /></Field>
          <Field id="course-duration" label={t("sessionDuration")} error={form.formState.errors.courseDuration?.message}><Input id="course-duration" type="number" min="15" {...form.register("courseDuration")} /></Field>
          <Field id="course-capacity" label={t("capacity")} error={form.formState.errors.capacity?.message}><Input id="course-capacity" type="number" min="1" {...form.register("capacity")} /></Field>
          <Field id="course-length" label={t("sessionCount")} error={form.formState.errors.length?.message}><Input id="course-length" type="number" min="1" {...form.register("length")} /></Field>
        </div>
      </FormSection>

      <FormSection title={t("pricingSection")} description={t("pricingDescription")}>
        <div className="grid gap-4 sm:grid-cols-3"><Field id="price-hour" label={t("pricePerHour")} error={form.formState.errors.pricePerHour?.message}><Input id="price-hour" type="number" min="0" step="0.01" dir="ltr" {...form.register("pricePerHour")} /></Field><Field id="price-dollar" label={t("priceUsd")} error={form.formState.errors.pricePerDollar?.message}><Input id="price-dollar" type="number" min="0" step="0.01" dir="ltr" {...form.register("pricePerDollar")} /></Field><Field id="price-toman" label={t("priceToman")} error={form.formState.errors.pricePerToman?.message}><Input id="price-toman" type="number" min="0" step="1" dir="ltr" {...form.register("pricePerToman")} /></Field></div>
      </FormSection>

      <FormSection title={t("mediaSection")} description={t("mediaDescription")}>
        <div className="grid gap-4 sm:grid-cols-2"><UploadField id="course-image" icon={ImagePlus} label={t("courseImage")} file={image} chooseLabel={t("chooseFile")} replaceLabel={t("replaceFile")} hint={t("imageHint")} onChange={(file) => chooseImage(file, "image")} /><UploadField id="course-flag" icon={Flag} label={t("languageFlag")} file={flag} chooseLabel={t("chooseFile")} replaceLabel={t("replaceFile")} hint={t("imageHint")} onChange={(file) => chooseImage(file, "flag")} /></div>
        {fileError ? <p className="text-sm font-medium text-destructive">{fileError}</p> : null}
      </FormSection>

      <div className="sticky bottom-0 flex justify-end border-t border-border bg-card/95 py-4 backdrop-blur-xl"><Button type="submit" className="h-11 rounded-xl" disabled={mutation.isPending || Boolean(fileError)}>{mutation.isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Save aria-hidden="true" />}{mutation.isPending ? t("saving") : t(course ? "saveChanges" : "createCourse")}</Button></div>
    </form>
  );
}

function FormSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section className="space-y-4 rounded-2xl border border-border bg-background/45 p-4 sm:p-5"><div><h3 className="font-bold">{title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p></div>{children}</section>;
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label>{children}{error ? <p className="text-sm text-destructive">{error}</p> : null}</div>;
}

function UploadField({ id, icon: Icon, label, file, chooseLabel, replaceLabel, hint, onChange }: { id: string; icon: typeof ImagePlus; label: string; file: File | null; chooseLabel: string; replaceLabel: string; hint: string; onChange: (file?: File) => void }) {
  return <div className="rounded-2xl border border-dashed border-primary/20 p-4"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary dark:bg-primary/15"><Icon aria-hidden="true" /></span><div className="min-w-0"><p className="font-bold">{label}</p><p className="truncate text-sm text-muted-foreground">{file?.name ?? hint}</p></div></div><Label htmlFor={id} className="mt-4 inline-flex cursor-pointer rounded-xl border border-border bg-card px-4 py-2 text-sm font-bold shadow-sm">{file ? replaceLabel : chooseLabel}</Label><input id={id} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => onChange(event.target.files?.[0])} /></div>;
}
