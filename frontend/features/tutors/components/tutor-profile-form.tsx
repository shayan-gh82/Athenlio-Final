"use client";
import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Camera, Loader2, Save } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { getTutorDashboard } from "@/features/tutors/api";
import { normalizeLanguagesSpoken, normalizeStringList } from "@/features/tutors/normalize";
import { apiClient } from "@/lib/api/client";
import { normalizeApiError } from "@/lib/api/errors";
import { queryKeys } from "@/lib/query/keys";
import { useAppSelector } from "@/store/hooks";

const schema = z.object({ first_name: z.string().trim().min(2), last_name: z.string().trim().min(2), country: z.string().trim().min(2), phone_number: z.string().max(30), bio: z.string().trim().min(30), subjects: z.string().trim().min(2), languages: z.string().trim().min(2), teaching_style: z.string().trim().min(20), expectation: z.string().trim().min(20), intro_video_url: z.union([z.literal(""), z.string().url()]) });
type Values = z.infer<typeof schema>;
const acceptedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxImageSize = 5 * 1024 * 1024;

export function TutorProfileForm() {
  const locale = useLocale(); const fa = locale === "fa";
  const router = useRouter(); const client = useQueryClient();
  const status = useAppSelector((s) => s.auth.status);
  const allowed = status === "tutor-pending" || status === "tutor-approved";
  const query = useQuery({ queryKey: queryKeys.tutorDashboard, queryFn: getTutorDashboard, enabled: allowed });
  const form = useForm<Values>({ resolver: zodResolver(schema) });
  const profile = query.data?.tutor;
  const [picture, setPicture] = useState<File | null>(null);
  const [pictureError, setPictureError] = useState<string | null>(null);
  const previewUrl = useMemo(() => picture ? URL.createObjectURL(picture) : profile?.profile_picture ?? null, [picture, profile?.profile_picture]);
  useEffect(() => { if (profile) form.reset({ first_name: profile.user.first_name, last_name: profile.user.last_name, country: profile.country, phone_number: profile.phone_number ?? "", bio: profile.bio, subjects: profile.subjects.join(", "), languages: profile.languages_spoken.map((item) => `${item.language}:${item.level}`).join(", "), teaching_style: profile.teaching_style, expectation: profile.expectation, intro_video_url: profile.intro_video_url ?? "" }); }, [form, profile]);
  useEffect(() => { if (status !== "unknown" && !allowed) router.replace(`/${locale}/${status === "tutor-no-profile" ? "dashboard/tutor/onboarding" : "login"}`); }, [allowed, locale, router, status]);
  useEffect(() => { if (!picture || !previewUrl) return; return () => URL.revokeObjectURL(previewUrl); }, [picture, previewUrl]);
  const mutation = useMutation({ mutationFn: async (values: Values) => {
    if (!profile) throw new Error("Profile missing");
    const data = new FormData();
    data.append("user_first_name", values.first_name.trim());
    data.append("user_last_name", values.last_name.trim());
    data.append("country", values.country.trim());
    data.append("phone_number", values.phone_number.trim());
    data.append("bio", values.bio.trim());
    data.append("subjects", JSON.stringify(normalizeStringList(values.subjects)));
    data.append("languages_spoken", JSON.stringify(normalizeLanguagesSpoken(values.languages)));
    data.append("teaching_style", values.teaching_style.trim());
    data.append("expectation", values.expectation.trim());
    data.append("intro_video_url", values.intro_video_url.trim());
    if (picture) data.append("profile_picture", picture);
    return apiClient.patch(`/api/tutors/${profile.id}/`, data);
  } });
  const fields = [
    ["first_name", "نام", "First name"], ["last_name", "نام خانوادگی", "Last name"], ["country", "کشور", "Country"], ["phone_number", "شماره تماس", "Phone"], ["subjects", "زبان‌های تدریس (با ویرگول جدا کن)", "Subjects (comma separated)"], ["languages", "زبان و سطح، مثال English:C2", "Languages and levels, e.g. English:C2"], ["bio", "معرفی کوتاه (حداقل ۳۰ نویسه)", "Biography (at least 30 characters)"], ["teaching_style", "روش تدریس (حداقل ۲۰ نویسه)", "Teaching style (at least 20 characters)"], ["expectation", "انتظارات (حداقل ۲۰ نویسه)", "Expectations (at least 20 characters)"], ["intro_video_url", "لینک ویدیوی معرفی", "Introduction video URL"],
  ] as const;
  const choosePicture = (file?: File) => {
    setPictureError(null);
    if (!file) return setPicture(null);
    if (!acceptedImageTypes.has(file.type)) return setPictureError(fa ? "فرمت تصویر باید JPG، PNG یا WebP باشد." : "Use a JPG, PNG or WebP image.");
    if (file.size > maxImageSize) return setPictureError(fa ? "حجم تصویر نباید بیشتر از ۵ مگابایت باشد." : "The image must be smaller than 5 MB.");
    setPicture(file);
  };
  return <DashboardShell area="tutor" title={fa ? "ویرایش پروفایل مدرس" : "Edit tutor profile"} avatarSrc={previewUrl}><main className="mx-auto w-full max-w-4xl p-5 sm:p-8"><Card className="overflow-hidden border-primary/10 bg-card/90 shadow-sm"><CardHeader className="border-b bg-background/45"><p className="text-sm font-bold text-secondary">{fa ? "پروفایل عمومی مدرس" : "Public tutor profile"}</p><CardTitle className="text-2xl">{fa ? "اطلاعات و تصویر پروفایل" : "Profile details and picture"}</CardTitle><p className="leading-7 text-muted-foreground">{fa ? "اطلاعاتی که زبان‌آموزان در صفحه استادها می‌بینند از اینجا قابل ویرایش است." : "Edit the information students see in the tutor directory."}</p></CardHeader><CardContent className="p-5 sm:p-7"><form className="space-y-7" noValidate onSubmit={form.handleSubmit(async (values) => {
    if (pictureError) return;
    try { await mutation.mutateAsync(values); setPicture(null); await Promise.all([client.invalidateQueries({queryKey:["tutors"]}), client.invalidateQueries({queryKey:queryKeys.me}), client.invalidateQueries({queryKey:["home","tutors"]})]); toast.success(fa ? "پروفایل و تصویر با موفقیت ذخیره شد." : "Profile and picture saved."); } catch (error) { toast.error(normalizeApiError(error).message); }
  })}>
    {query.isLoading ? <p role="status">{fa ? "در حال دریافت…" : "Loading…"}</p> : null}
    {query.isError ? <button type="button" onClick={() => query.refetch()} className="text-destructive underline">{fa ? "دریافت ناموفق؛ تلاش دوباره" : "Load failed; retry"}</button> : null}
    <fieldset disabled={!profile || mutation.isPending} className="space-y-7">
      <div className="flex flex-col items-center gap-5 rounded-2xl border border-dashed border-primary/25 bg-background/55 p-6 sm:flex-row sm:text-start"><div role="img" aria-label={fa ? "تصویر پروفایل مدرس" : "Tutor profile picture"} className="grid size-28 shrink-0 place-items-center rounded-3xl bg-primary-soft bg-cover bg-center text-primary" style={previewUrl ? { backgroundImage: `url("${previewUrl}")` } : undefined}>{!previewUrl ? <Camera className="size-9" aria-hidden="true" /> : null}</div><div className="flex-1 text-center sm:text-start"><Label htmlFor="tutor-profile-picture" className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-semibold text-primary-foreground"><Camera className="size-4" />{picture ? (fa ? "تعویض تصویر انتخاب‌شده" : "Replace selected picture") : (fa ? "انتخاب یا تغییر تصویر" : "Choose or change picture")}</Label><input id="tutor-profile-picture" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => choosePicture(event.target.files?.[0])} /><p className="mt-2 text-sm text-muted-foreground">{fa ? "JPG، PNG یا WebP؛ حداکثر ۵ مگابایت" : "JPG, PNG or WebP; up to 5 MB"}</p>{pictureError ? <p className="mt-2 text-sm text-destructive">{pictureError}</p> : null}</div></div>
      <div className="grid gap-5 sm:grid-cols-2">{fields.map(([key, persian, english]) => <div key={key} className={["bio", "teaching_style", "expectation"].includes(key) ? "space-y-2 sm:col-span-2" : "space-y-2"}><Label htmlFor={`edit-${key}`}>{fa ? persian : english}</Label>{["bio", "teaching_style", "expectation"].includes(key) ? <Textarea id={`edit-${key}`} rows={4} className="rounded-xl bg-background/60" {...form.register(key)} /> : <Input id={`edit-${key}`} className="h-11 rounded-xl bg-background/60" {...form.register(key)} />}{form.formState.errors[key] ? <p className="text-sm text-destructive">{fa ? "مقدار این فیلد معتبر نیست." : "Please enter a valid value."}</p> : null}</div>)}</div>
      <div className="flex justify-end border-t pt-5"><Button className="rounded-xl" disabled={!profile || mutation.isPending || Boolean(pictureError)}>{mutation.isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Save aria-hidden="true" />}{mutation.isPending ? (fa ? "در حال ذخیره…" : "Saving…") : (fa ? "ذخیره تغییرات" : "Save changes")}</Button></div>
    </fieldset>
  </form></CardContent></Card></main></DashboardShell>;
}
