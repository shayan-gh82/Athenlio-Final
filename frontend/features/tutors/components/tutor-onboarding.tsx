"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Award, Camera, Check, Loader2, Plus, ServerOff, Trash2, UploadCloud, UserRoundCheck, Video } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { type FieldPath, useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { BrandLogo } from "@/components/brand/brand-logo";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { getMe } from "@/features/auth/api";
import { createTutorProfile } from "@/features/tutors/api";
import { isApiConfigured } from "@/lib/api/config";
import { normalizeApiError } from "@/lib/api/errors";
import { queryKeys } from "@/lib/query/keys";
import { setAuthenticatedUser } from "@/store/auth-slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const draftKeyPrefix = "athenlio:tutor-onboarding-draft:v1";
const imageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const videoTypes = new Set(["video/mp4", "video/webm"]);

export function TutorOnboarding() {
  const t = useTranslations("tutorOnboarding");
  const locale = useLocale();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const authStatus = useAppSelector((state) => state.auth.status);
  const user = useAppSelector((state) => state.auth.user);
  const draftKey = `${draftKeyPrefix}:${user?.id ?? "preview"}`;
  const [step, setStep] = useState(0);
  const [picture, setPicture] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [savedProfileId, setSavedProfileId] = useState<number | null>(null);
  const draftLoaded = useRef<string | null>(null);

  const schema = z.object({
    firstName: z.string().trim().min(2, t("nameTooShort")),
    lastName: z.string().trim().min(2, t("nameTooShort")),
    phoneNumber: z.string().trim().max(20, t("phoneTooLong")),
    country: z.string().trim().min(2, t("required")),
    subjectsText: z.string().trim().min(2, t("subjectsRequired")),
    languagesText: z.string().trim().min(2, t("languagesRequired")),
    certificates: z.array(z.object({ title: z.string().trim().min(2, t("required")), issuedBy: z.string().trim(), issueDate: z.string() })),
    educations: z.array(z.object({ degree: z.string().trim().min(2, t("required")), institution: z.string().trim().min(2, t("required")), field: z.string(), startDate: z.string(), endDate: z.string() })),
    bio: z.string().trim().min(30, t("bioTooShort")).max(1200, t("bioTooLong")),
    teachingStyle: z.string().trim().min(20, t("styleTooShort")).max(1000, t("bioTooLong")),
    expectation: z.string().trim().min(20, t("expectationTooShort")).max(1000, t("bioTooLong")),
    experiences: z.array(z.object({ title: z.string().trim().min(2, t("required")), organization: z.string().trim(), description: z.string().trim(), startDate: z.string(), endDate: z.string() })),
    introVideoUrl: z.string().trim().refine((value) => !value || (z.string().url().safeParse(value).success && /^https?:\/\//i.test(value)), t("urlInvalid")),
  });
  type OnboardingValues = z.infer<typeof schema>;
  const form = useForm<OnboardingValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: user?.first_name ?? "",
      lastName: user?.last_name ?? "",
      phoneNumber: "",
      country: "",
      subjectsText: "",
      languagesText: "",
      certificates: [],
      educations: [],
      bio: "",
      teachingStyle: "",
      expectation: "",
      experiences: [],
      introVideoUrl: "",
    },
  });
  const certificates = useFieldArray({ control: form.control, name: "certificates" });
  const educations = useFieldArray({ control: form.control, name: "educations" });
  const experiences = useFieldArray({ control: form.control, name: "experiences" });
  const values = useWatch({ control: form.control });
  const steps = ["basics", "credentials", "profile", "experience", "video", "review"] as const;
  const NextIcon = locale === "fa" ? ArrowLeft : ArrowRight;
  const BackIcon = locale === "fa" ? ArrowRight : ArrowLeft;
  const picturePreview = useMemo(() => picture ? URL.createObjectURL(picture) : null, [picture]);
  const mutation = useMutation({ mutationFn: createTutorProfile });

  useEffect(() => {
    if (!user?.id) return;
    const saved = sessionStorage.getItem(draftKey);
    try {
      if (saved) form.reset({ ...form.getValues(), ...JSON.parse(saved) });
      else form.reset({ ...form.getValues(), firstName: user.first_name, lastName: user.last_name });
    } catch {
      sessionStorage.removeItem(draftKey);
    }
    draftLoaded.current = draftKey;
  }, [draftKey, form, user?.id, user?.first_name, user?.last_name]);

  useEffect(() => {
    if (draftLoaded.current === draftKey && !savedProfileId) sessionStorage.setItem(draftKey, JSON.stringify(values));
  }, [draftKey, savedProfileId, values]);

  useEffect(() => {
    if (!picturePreview) return;
    return () => URL.revokeObjectURL(picturePreview);
  }, [picturePreview]);

  useEffect(() => {
    if (!isApiConfigured || authStatus === "unknown" || authStatus === "tutor-no-profile") return;
    if (authStatus === "tutor-pending" || authStatus === "tutor-approved") router.replace(`/${locale}/dashboard/tutor`);
    else router.replace(authStatus === "guest" ? `/${locale}/login` : `/${locale}`);
  }, [authStatus, locale, router]);

  const stepFields: Array<Array<FieldPath<OnboardingValues>>> = [
    ["firstName", "lastName", "phoneNumber", "country", "subjectsText", "languagesText"],
    ["certificates", "educations"],
    [],
    ["bio", "teachingStyle", "expectation", "experiences"],
    ["introVideoUrl"],
    [],
  ];

  const goNext = async () => {
    if (!(await form.trigger(stepFields[step]))) return;
    setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const choosePicture = (file?: File) => {
    setFileError(null);
    if (!file) return setPicture(null);
    if (!imageTypes.has(file.type)) return setFileError(t("imageTypeError"));
    if (file.size > 5 * 1024 * 1024) return setFileError(t("imageSizeError"));
    setPicture(file);
  };

  const chooseVideo = (file?: File) => {
    setFileError(null);
    if (!file) return setVideoFile(null);
    if (!videoTypes.has(file.type)) return setFileError(t("videoTypeError"));
    if (file.size > 25 * 1024 * 1024) return setFileError(t("videoSizeError"));
    setVideoFile(file);
  };

  const onSubmit = form.handleSubmit(async (submitted) => {
    if (step !== 5 || fileError || mutation.isPending) return;
    setServerError(null);
    const subjects = submitted.subjectsText.split(/[,،]/).map((item) => item.trim()).filter(Boolean);
    const languagesSpoken = submitted.languagesText.split(/[,،]/).map((item) => {
      const [language, level = "Native"] = item.split(":").map((part) => part.trim());
      return { language, level };
    }).filter((item) => item.language);
    try {
      const saved = savedProfileId ? null : await mutation.mutateAsync({
        ...submitted,
        subjects,
        languagesSpoken,
        profilePicture: picture,
        introVideoFile: videoFile,
        certificates: submitted.certificates.map((item) => ({ title: item.title, issued_by: item.issuedBy, issue_date: item.issueDate || null })),
        educations: submitted.educations.map((item) => ({ degree: item.degree, institution_name: item.institution, field: item.field, start_date: item.startDate || null, end_date: item.endDate || null })),
        experiences: submitted.experiences.map((item) => ({ title: item.title, organization: item.organization, description: item.description, start_date: item.startDate || null, end_date: item.endDate || null })),
      });
      if (saved) setSavedProfileId(saved.id);
      sessionStorage.removeItem(draftKey);
      const refreshedUser = await getMe();
      queryClient.setQueryData(queryKeys.me, refreshedUser);
      dispatch(setAuthenticatedUser(refreshedUser));
      sessionStorage.removeItem(draftKey);
      toast.success(t("success"));
      router.replace(`/${locale}/dashboard/tutor`);
    } catch (error) {
      const apiError = normalizeApiError(error);
      if (apiError.status === 400 && /already exists/i.test(apiError.message)) {
        try {
          const existing = await getMe();
          if (existing.has_tutor_profile) {
            queryClient.setQueryData(queryKeys.me, existing);
            dispatch(setAuthenticatedUser(existing));
            sessionStorage.removeItem(draftKey);
            router.replace(`/${locale}/dashboard/tutor`);
            return;
          }
        } catch { /* Keep the existing form and show the original response. */ }
      }
      setServerError(apiError.status === 400 ? Object.entries(apiError.fieldErrors).map(([field, errors]) => `${field.replace(/^detail\./, "")}: ${errors.join(" ")}`).join("\n") || apiError.message : t("connectionError"));
    }
  }, (errors) => {
    const index = stepFields.findIndex((fields) => fields.some((field) => field.split(".")[0] in errors));
    if (index >= 0) setStep(index);
    setServerError(t("required"));
  });

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-[1180px] items-center justify-between px-4 sm:px-6"><BrandLogo className="h-9 w-[158px]" /><div className="flex items-center gap-1"><LanguageSwitcher /><ThemeToggle /></div></div>
      </header>
      <main className="mx-auto max-w-[1020px] px-4 py-8 sm:px-6 lg:py-12">
        <div className="mb-8 text-center"><p className="text-sm font-bold text-secondary">{t("eyebrow")}</p><h1 className="mt-2 text-3xl font-bold sm:text-4xl">{t("title")}</h1><p className="mx-auto mt-3 max-w-2xl leading-7 text-muted-foreground">{t("description")}</p></div>
        {!isApiConfigured ? <Alert className="mb-6 border-secondary/20 bg-card/80"><ServerOff aria-hidden="true" /><AlertTitle>{t("previewTitle")}</AlertTitle><AlertDescription>{t("previewDescription")}</AlertDescription></Alert> : null}
        <Card className="overflow-hidden border-primary/10 bg-card/90 shadow-xl shadow-primary/8">
          <CardHeader className="border-b border-border bg-background/45">
            <div className="mb-3 flex items-center justify-between gap-4"><CardTitle className="text-xl">{t(steps[step])}</CardTitle><span className="text-sm font-bold text-muted-foreground">{t("stepCounter", { current: step + 1, total: steps.length })}</span></div>
            <Progress value={((step + 1) / steps.length) * 100} />
            <ol className="mt-4 hidden grid-cols-6 gap-2 lg:grid">
              {steps.map((key, index) => <li key={key} className={`text-center text-xs font-bold ${index <= step ? "text-primary" : "text-muted-foreground"}`}><span className={`mx-auto mb-2 grid size-7 place-items-center rounded-full ${index < step ? "bg-secondary text-secondary-foreground" : index === step ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{index < step ? <Check className="size-4" /> : index + 1}</span>{t(key)}</li>)}
            </ol>
          </CardHeader>
          <CardContent className="p-5 sm:p-7">
            {serverError ? <Alert variant="destructive" className="mb-6"><AlertTitle>{t("submitError")}</AlertTitle><AlertDescription>{serverError}</AlertDescription></Alert> : null}
            <form onSubmit={onSubmit} noValidate>
              {step === 0 ? <div className="space-y-5"><SectionLead icon={UserRoundCheck} title={t("basicsTitle")} description={t("basicsDescription")} /><div className="grid gap-5 sm:grid-cols-2"><Field id="tutor-first-name" label={t("firstName")} error={form.formState.errors.firstName?.message}><Input id="tutor-first-name" {...form.register("firstName")} /></Field><Field id="tutor-last-name" label={t("lastName")} error={form.formState.errors.lastName?.message}><Input id="tutor-last-name" {...form.register("lastName")} /></Field><Field id="tutor-country" label={t("country")} error={form.formState.errors.country?.message}><Input id="tutor-country" {...form.register("country")} /></Field><Field id="tutor-phone" label={t("phone")} error={form.formState.errors.phoneNumber?.message}><Input id="tutor-phone" dir="ltr" {...form.register("phoneNumber")} /></Field></div><Field id="tutor-subjects" label={t("subjects")} hint={t("subjectsHint")} error={form.formState.errors.subjectsText?.message}><Input id="tutor-subjects" placeholder={t("subjectsPlaceholder")} {...form.register("subjectsText")} /></Field><Field id="tutor-languages" label={t("languages")} hint={t("languagesHint")} error={form.formState.errors.languagesText?.message}><Input id="tutor-languages" dir="ltr" placeholder="English:C2, German:B2" {...form.register("languagesText")} /></Field></div> : null}

              {step === 1 ? <div className="space-y-7"><SectionLead icon={Award} title={t("credentialsTitle")} description={t("credentialsDescription")} /><RepeatSection title={t("certificates")} addLabel={t("addCertificate")} onAdd={() => certificates.append({ title: "", issuedBy: "", issueDate: "" })}>{certificates.fields.map((field, index) => <div key={field.id} className="grid gap-4 rounded-2xl border border-border bg-background/45 p-4 sm:grid-cols-[1fr_1fr_160px_auto]"><Input aria-label={t("certificateTitle")} placeholder={t("certificateTitle")} {...form.register(`certificates.${index}.title`)} /><Input aria-label={t("issuedBy")} placeholder={t("issuedBy")} {...form.register(`certificates.${index}.issuedBy`)} /><Input aria-label={t("issueDate")} type="date" {...form.register(`certificates.${index}.issueDate`)} /><Button type="button" variant="ghost" size="icon" aria-label={t("remove")} onClick={() => certificates.remove(index)}><Trash2 /></Button>{form.formState.errors.certificates?.[index]?.title ? <p className="text-sm text-destructive sm:col-span-4">{form.formState.errors.certificates[index]?.title?.message}</p> : null}</div>)}</RepeatSection><RepeatSection title={t("educations")} addLabel={t("addEducation")} onAdd={() => educations.append({ degree: "", institution: "", field: "", startDate: "", endDate: "" })}>{educations.fields.map((field, index) => <div key={field.id} className="grid gap-4 rounded-2xl border border-border bg-background/45 p-4 sm:grid-cols-2"><Input aria-label={t("degree")} placeholder={t("degree")} {...form.register(`educations.${index}.degree`)} /><Input aria-label={t("institution")} placeholder={t("institution")} {...form.register(`educations.${index}.institution`)} /><Input aria-label={t("fieldOfStudy")} placeholder={t("fieldOfStudy")} {...form.register(`educations.${index}.field`)} /><div className="flex gap-3"><Input aria-label={t("startDate")} type="date" {...form.register(`educations.${index}.startDate`)} /><Input aria-label={t("endDate")} type="date" {...form.register(`educations.${index}.endDate`)} /></div><Button type="button" variant="ghost" className="justify-self-end sm:col-span-2" onClick={() => educations.remove(index)}><Trash2 />{t("remove")}</Button></div>)}</RepeatSection></div> : null}

              {step === 2 ? <div className="space-y-6"><SectionLead icon={Camera} title={t("profileTitle")} description={t("profileDescription")} /><div className="flex flex-col items-center gap-5 rounded-3xl border border-dashed border-primary/25 bg-background/45 p-8 text-center"><div className="grid size-32 place-items-center rounded-[2rem] bg-primary-soft bg-cover bg-center text-primary dark:bg-primary/15" style={picturePreview ? { backgroundImage: `url("${picturePreview}")` } : undefined}>{!picturePreview ? <Camera className="size-10" /> : null}</div><div><Label htmlFor="tutor-picture" className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground"><UploadCloud className="size-5" />{picture ? t("replacePicture") : t("choosePicture")}</Label><input id="tutor-picture" className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => choosePicture(event.target.files?.[0])} /><p className="mt-3 text-sm text-muted-foreground">{t("pictureHint")}</p></div></div></div> : null}

              {step === 3 ? <div className="space-y-6"><SectionLead icon={UserRoundCheck} title={t("experienceTitle")} description={t("experienceDescription")} /><Field id="tutor-bio" label={t("bio")} error={form.formState.errors.bio?.message}><Textarea id="tutor-bio" rows={5} {...form.register("bio")} /></Field><Field id="tutor-style" label={t("teachingStyle")} error={form.formState.errors.teachingStyle?.message}><Textarea id="tutor-style" rows={4} {...form.register("teachingStyle")} /></Field><Field id="tutor-expectation" label={t("expectation")} error={form.formState.errors.expectation?.message}><Textarea id="tutor-expectation" rows={4} {...form.register("expectation")} /></Field><RepeatSection title={t("experiences")} addLabel={t("addExperience")} onAdd={() => experiences.append({ title: "", organization: "", description: "", startDate: "", endDate: "" })}>{experiences.fields.map((field, index) => <div key={field.id} className="grid gap-4 rounded-2xl border border-border bg-background/45 p-4 sm:grid-cols-2"><Input aria-label={t("jobTitle")} placeholder={t("jobTitle")} {...form.register(`experiences.${index}.title`)} /><Input aria-label={t("organization")} placeholder={t("organization")} {...form.register(`experiences.${index}.organization`)} /><Textarea aria-label={t("experienceDescriptionField")} placeholder={t("experienceDescriptionField")} className="sm:col-span-2" {...form.register(`experiences.${index}.description`)} /><Input aria-label={t("startDate")} type="date" {...form.register(`experiences.${index}.startDate`)} /><Input aria-label={t("endDate")} type="date" {...form.register(`experiences.${index}.endDate`)} /><Button type="button" variant="ghost" className="justify-self-end sm:col-span-2" onClick={() => experiences.remove(index)}><Trash2 />{t("remove")}</Button></div>)}</RepeatSection></div> : null}

              {step === 4 ? <div className="space-y-6"><SectionLead icon={Video} title={t("videoTitle")} description={t("videoDescription")} /><Field id="intro-url" label={t("videoUrl")} hint={t("videoUrlHint")} error={form.formState.errors.introVideoUrl?.message}><Input id="intro-url" dir="ltr" placeholder="https://..." {...form.register("introVideoUrl")} /></Field><div className="rounded-2xl border border-dashed border-primary/25 bg-background/45 p-6"><Label htmlFor="intro-video" className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 font-bold shadow-sm"><UploadCloud className="size-5" />{videoFile ? t("replaceVideo") : t("chooseVideo")}</Label><input id="intro-video" className="sr-only" type="file" accept="video/mp4,video/webm" onChange={(event) => chooseVideo(event.target.files?.[0])} /><p className="mt-3 text-sm text-muted-foreground">{videoFile?.name ?? t("videoHint")}</p></div></div> : null}

              {step === 5 ? <div className="space-y-6"><SectionLead icon={Check} title={t("reviewTitle")} description={t("reviewDescription")} /><div className="grid gap-4 sm:grid-cols-2"><ReviewItem label={t("fullName")} value={`${values.firstName ?? ""} ${values.lastName ?? ""}`} /><ReviewItem label={t("country")} value={values.country ?? ""} /><ReviewItem label={t("subjects")} value={values.subjectsText ?? ""} /><ReviewItem label={t("languages")} value={values.languagesText ?? ""} /><ReviewItem label={t("credentialsSummary")} value={t("credentialsCount", { certificates: values.certificates?.length ?? 0, educations: values.educations?.length ?? 0 })} /><ReviewItem label={t("mediaSummary")} value={picture || videoFile || values.introVideoUrl ? t("mediaAdded") : t("mediaOptional")} /></div><Alert className="border-secondary/20 bg-secondary/5"><UserRoundCheck /><AlertTitle>{t("approvalTitle")}</AlertTitle><AlertDescription>{t("approvalDescription")}</AlertDescription></Alert></div> : null}

              {fileError ? <p className="mt-5 text-sm font-medium text-destructive">{fileError}</p> : null}
              <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-6">
                <Button type="button" variant="outline" className="rounded-xl" disabled={step === 0 || mutation.isPending} onClick={() => setStep((current) => Math.max(0, current - 1))}><BackIcon />{t("back")}</Button>
                {step < steps.length - 1 ? <Button type="button" className="rounded-xl" onClick={goNext}>{t("next")}<NextIcon /></Button> : <Button type="submit" className="rounded-xl" disabled={!isApiConfigured || mutation.isPending || Boolean(fileError)}>{mutation.isPending ? <Loader2 className="animate-spin" /> : <UserRoundCheck />}{mutation.isPending ? t("submitting") : t("submit")}</Button>}
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label>{children}{hint ? <p className="text-xs leading-5 text-muted-foreground">{hint}</p> : null}{error ? <p className="text-sm text-destructive">{error}</p> : null}</div>;
}

function SectionLead({ icon: Icon, title, description }: { icon: typeof UserRoundCheck; title: string; description: string }) {
  return <div className="flex gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary dark:bg-primary/15"><Icon /></span><div><h2 className="text-lg font-bold">{title}</h2><p className="mt-1 leading-7 text-muted-foreground">{description}</p></div></div>;
}

function RepeatSection({ title, addLabel, onAdd, children }: { title: string; addLabel: string; onAdd: () => void; children: React.ReactNode }) {
  return <section className="space-y-3"><div className="flex items-center justify-between gap-3"><h2 className="font-bold">{title}</h2><Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={onAdd}><Plus />{addLabel}</Button></div>{children}</section>;
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-border bg-background/45 p-4"><p className="text-xs font-bold text-muted-foreground">{label}</p><p className="mt-2 font-bold">{value || "—"}</p></div>;
}
