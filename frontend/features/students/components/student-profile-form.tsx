"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Camera, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getStudentProfile, updateStudentProfile } from "@/features/students/api";
import { isApiConfigured } from "@/lib/api/config";
import { normalizeApiError } from "@/lib/api/errors";
import { queryKeys } from "@/lib/query/keys";
import { useAppSelector } from "@/store/hooks";

const acceptedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxImageSize = 5 * 1024 * 1024;

export function StudentProfileForm() {
  const locale = useLocale();
  const t = useTranslations("studentProfile");
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAppSelector((state) => state.auth.user);
  const authStatus = useAppSelector((state) => state.auth.status);
  const profileQuery = useQuery({ queryKey: queryKeys.studentProfile, queryFn: getStudentProfile, enabled: isApiConfigured && authStatus === "student", retry: false });
  const [picture, setPicture] = useState<File | null>(null);
  const [pictureError, setPictureError] = useState<string | null>(null);
  const schema = z.object({
    firstName: z.string().trim().min(2, t("nameTooShort")),
    lastName: z.string().trim().min(2, t("nameTooShort")),
    phoneNumber: z.string().trim().max(30, t("phoneTooLong")),
    bio: z.string().trim().max(500, t("bioTooLong")),
  });
  type ProfileValues = z.infer<typeof schema>;
  const form = useForm<ProfileValues>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: "", lastName: "", phoneNumber: "", bio: "" },
  });
  const savedPicture = profileQuery.data?.user.profile_picture ?? user?.profile_picture;
  const previewUrl = useMemo(() => picture ? URL.createObjectURL(picture) : savedPicture ?? null, [picture, savedPicture]);
  const mutation = useMutation({
    mutationFn: (values: ProfileValues) => updateStudentProfile({
      firstName: values.firstName,
      lastName: values.lastName,
      phoneNumber: values.phoneNumber,
      bio: values.bio,
      profilePicture: picture,
    }),
  });

  useEffect(() => {
    const profile = profileQuery.data?.user;
    if (profile) form.reset({ firstName: profile.first_name ?? "", lastName: profile.last_name ?? "", phoneNumber: profile.phone_number ?? "", bio: profile.bio ?? "" });
  }, [form, profileQuery.data]);

  useEffect(() => {
    if (!picture || !previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [picture, previewUrl]);

  useEffect(() => {
    if (!isApiConfigured || authStatus === "unknown" || authStatus === "student") return;
    router.replace(authStatus === "guest" ? `/${locale}/login` : `/${locale}`);
  }, [authStatus, locale, router]);

  const choosePicture = (file?: File) => {
    setPictureError(null);
    if (!file) return setPicture(null);
    if (!acceptedImageTypes.has(file.type)) return setPictureError(t("imageTypeError"));
    if (file.size > maxImageSize) return setPictureError(t("imageSizeError"));
    setPicture(file);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    if (pictureError) return;
    try {
      const saved = await mutation.mutateAsync(values);
      queryClient.setQueryData(queryKeys.studentProfile, saved);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.me }),
        queryClient.invalidateQueries({ queryKey: queryKeys.studentDashboard }),
      ]);
      toast.success(t("success"));
      router.push(`/${locale}/dashboard/student`);
    } catch (error) {
      const apiError = normalizeApiError(error);
      toast.error(apiError.status === 400 ? apiError.message : t("connectionError"));
    }
  });

  return (
    <DashboardShell title={t("pageTitle")}>
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl">
          <Card className="border-primary/10 bg-card/88 shadow-sm">
            <CardHeader>
              <p className="text-sm font-bold text-secondary">{t("eyebrow")}</p>
              <CardTitle className="text-2xl">{t("title")}</CardTitle>
              <p className="leading-7 text-muted-foreground">{t("description")}</p>
            </CardHeader>
            <CardContent>
              {!isApiConfigured ? (
                <Alert className="mb-6 border-secondary/20 bg-background/60"><AlertCircle aria-hidden="true" /><AlertTitle>{t("previewTitle")}</AlertTitle><AlertDescription>{t("previewDescription")}</AlertDescription></Alert>
              ) : null}
              <form onSubmit={onSubmit} className="space-y-6" noValidate>
                {profileQuery.isLoading ? <p role="status">{locale === "fa" ? "در حال دریافت پروفایل…" : "Loading profile…"}</p> : null}
                {profileQuery.isError ? <Alert variant="destructive"><AlertTitle>{t("connectionError")}</AlertTitle><AlertDescription>{locale === "fa" ? "اطلاعات پروفایل دریافت نشد. اتصال و اصلاح سازگاری بک‌اند را بررسی کن." : "Profile could not be loaded. Check the connection and backend compatibility update."}<button type="button" onClick={() => profileQuery.refetch()} className="underline">{locale === "fa" ? "تلاش دوباره" : "Retry"}</button></AlertDescription></Alert> : null}
                <fieldset className="space-y-6" disabled={!profileQuery.isSuccess || mutation.isPending}>
                <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-primary/20 bg-background/55 p-6 sm:flex-row sm:text-start">
                  <div role="img" aria-label={t("profilePicture")} className="grid size-24 shrink-0 place-items-center rounded-3xl bg-primary-soft bg-cover bg-center text-primary dark:bg-primary/15" style={previewUrl ? { backgroundImage: `url("${previewUrl}")` } : undefined}>
                    {!previewUrl ? <Camera aria-hidden="true" className="size-8" /> : null}
                  </div>
                  <div className="flex-1 text-center sm:text-start">
                    <Label htmlFor="profile-picture" className="inline-flex cursor-pointer rounded-xl bg-primary px-4 py-2.5 text-primary-foreground shadow-sm">{t("choosePicture")}</Label>
                    <input id="profile-picture" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => choosePicture(event.target.files?.[0])} />
                    <p className="mt-2 text-sm text-muted-foreground">{t("pictureHint")}</p>
                    {pictureError ? <p className="mt-2 text-sm text-destructive">{pictureError}</p> : null}
                  </div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2"><Label htmlFor="profile-first-name">{t("firstName")}</Label><Input id="profile-first-name" className="h-11 rounded-xl bg-background/60" aria-invalid={Boolean(form.formState.errors.firstName)} {...form.register("firstName")} />{form.formState.errors.firstName ? <p className="text-sm text-destructive">{form.formState.errors.firstName.message}</p> : null}</div>
                  <div className="space-y-2"><Label htmlFor="profile-last-name">{t("lastName")}</Label><Input id="profile-last-name" className="h-11 rounded-xl bg-background/60" aria-invalid={Boolean(form.formState.errors.lastName)} {...form.register("lastName")} />{form.formState.errors.lastName ? <p className="text-sm text-destructive">{form.formState.errors.lastName.message}</p> : null}</div>
                </div>
                <div className="space-y-2"><Label htmlFor="profile-phone">{t("phone")}</Label><Input id="profile-phone" dir="ltr" className="h-11 rounded-xl bg-background/60 text-start" placeholder="+49 ..." aria-invalid={Boolean(form.formState.errors.phoneNumber)} {...form.register("phoneNumber")} />{form.formState.errors.phoneNumber ? <p className="text-sm text-destructive">{form.formState.errors.phoneNumber.message}</p> : null}<p className="text-xs text-muted-foreground">{t("optionalContractNote")}</p></div>
                <div className="space-y-2"><Label htmlFor="profile-bio">{t("bio")}</Label><Textarea id="profile-bio" rows={5} className="rounded-xl bg-background/60" aria-invalid={Boolean(form.formState.errors.bio)} {...form.register("bio")} />{form.formState.errors.bio ? <p className="text-sm text-destructive">{form.formState.errors.bio.message}</p> : null}</div>
                <div className="flex justify-end gap-3 border-t border-border pt-5">
                  <Button type="button" variant="outline" className="rounded-xl" onClick={() => router.back()}>{t("cancel")}</Button>
                  <Button type="submit" className="rounded-xl" disabled={!isApiConfigured || mutation.isPending || Boolean(pictureError)}>{mutation.isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Save aria-hidden="true" />}{mutation.isPending ? t("saving") : t("save")}</Button>
                </div>
                </fieldset>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </DashboardShell>
  );
}
