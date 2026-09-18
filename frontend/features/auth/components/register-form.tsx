"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GraduationCap, Loader2, ServerOff, UserRoundCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AuthField } from "@/features/auth/components/auth-field";
import { register } from "@/features/auth/api";
import { getAuthenticatedRoute } from "@/features/auth/types";
import { getSafeReturnPath, withReturnPath } from "@/lib/auth/return-path";
import { isApiConfigured } from "@/lib/api/config";
import { normalizeApiError } from "@/lib/api/errors";
import { queryKeys } from "@/lib/query/keys";
import { setAuthenticatedUser } from "@/store/auth-slice";
import { useAppDispatch } from "@/store/hooks";

export function RegisterForm({ returnPath, defaultRole = "student" }: { returnPath?: string; defaultRole?: "student" | "tutor" }) {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);
  const schema = z.object({
    firstName: z.string().trim().min(2, t("nameTooShort")),
    lastName: z.string().trim().min(2, t("nameTooShort")),
    email: z.string().trim().min(1, t("required")).email(t("emailInvalid")),
    password: z.string().min(8, t("passwordMin")),
    confirmPassword: z.string().min(1, t("required")),
    role: z.enum(["student", "tutor"]),
  }).refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: t("passwordMismatch"),
  });
  type RegisterValues = z.infer<typeof schema>;
  const form = useForm<RegisterValues>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: "", lastName: "", email: "", password: "", confirmPassword: "", role: defaultRole },
  });
  const selectedRole = useWatch({ control: form.control, name: "role" });
  const mutation = useMutation({ mutationFn: register });
  const safeReturnPath = getSafeReturnPath(returnPath, locale);

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    try {
      const user = await mutation.mutateAsync({
        email: values.email,
        password: values.password,
        first_name: values.firstName,
        last_name: values.lastName,
        is_teacher: values.role === "tutor",
      });
      queryClient.setQueryData(queryKeys.me, user);
      dispatch(setAuthenticatedUser(user));
      toast.success(t("registerSuccess"));
      router.replace(!user.is_teacher && safeReturnPath ? safeReturnPath : getAuthenticatedRoute(user, locale));
    } catch (error) {
      const apiError = normalizeApiError(error);
      if (apiError.fieldErrors.email?.length) form.setError("email", { message: t("emailTaken") });
      setFormError(t("registerFailedDescription"));
    }
  });

  return (
    <div>
      <p className="text-sm font-bold text-secondary">{t("startJourney")}</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">{t("registerTitle")}</h1>
      <p className="mt-3 leading-7 text-muted-foreground">{t("registerDescription")}</p>

      {!isApiConfigured ? (
        <Alert className="mt-6 border-warning/25 bg-accent/10 text-foreground">
          <ServerOff aria-hidden="true" />
          <AlertTitle>{t("previewModeTitle")}</AlertTitle>
          <AlertDescription>{t("previewModeDescription")}</AlertDescription>
        </Alert>
      ) : null}
      {formError ? (
        <Alert variant="destructive" className="mt-6"><AlertTitle>{t("registerFailed")}</AlertTitle><AlertDescription>{formError}</AlertDescription></Alert>
      ) : null}

      <form className="mt-7 space-y-5" onSubmit={onSubmit} noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <AuthField id="register-first-name" autoComplete="given-name" label={t("firstName")} error={form.formState.errors.firstName?.message} {...form.register("firstName")} />
          <AuthField id="register-last-name" autoComplete="family-name" label={t("lastName")} error={form.formState.errors.lastName?.message} {...form.register("lastName")} />
        </div>
        <AuthField id="register-email" type="email" autoComplete="email" label={t("email")} placeholder="name@example.com" error={form.formState.errors.email?.message} {...form.register("email")} />
        <div className="grid gap-4 sm:grid-cols-2">
          <AuthField id="register-password" type="password" autoComplete="new-password" label={t("password")} error={form.formState.errors.password?.message} {...form.register("password")} />
          <AuthField id="register-confirm-password" type="password" autoComplete="new-password" label={t("confirmPassword")} error={form.formState.errors.confirmPassword?.message} {...form.register("confirmPassword")} />
        </div>
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">{t("accountType")}</legend>
          <RadioGroup value={selectedRole} onValueChange={(value) => form.setValue("role", value as "student" | "tutor", { shouldValidate: true })} className="grid gap-3 sm:grid-cols-2">
            <Label htmlFor="role-student" className="cursor-pointer rounded-2xl border border-border bg-background/60 p-4 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary-soft dark:has-[[data-state=checked]]:bg-primary/15">
              <RadioGroupItem id="role-student" value="student" />
              <GraduationCap className="size-5 text-primary" aria-hidden="true" />
              <span><strong className="block">{t("student")}</strong><small className="mt-1 block font-normal text-muted-foreground">{t("studentDescription")}</small></span>
            </Label>
            <Label htmlFor="role-tutor" className="cursor-pointer rounded-2xl border border-border bg-background/60 p-4 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary-soft dark:has-[[data-state=checked]]:bg-primary/15">
              <RadioGroupItem id="role-tutor" value="tutor" />
              <UserRoundCheck className="size-5 text-secondary" aria-hidden="true" />
              <span><strong className="block">{t("tutor")}</strong><small className="mt-1 block font-normal text-muted-foreground">{t("tutorDescription")}</small></span>
            </Label>
          </RadioGroup>
        </fieldset>
        <Button type="submit" size="lg" className="h-12 w-full rounded-xl" disabled={!isApiConfigured || mutation.isPending}>
          {mutation.isPending ? <Loader2 aria-hidden="true" className="animate-spin" /> : <UserRoundCheck aria-hidden="true" />}
          {mutation.isPending ? t("creatingAccount") : t("createAccount")}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t("alreadyAccount")} <Link className="font-bold text-primary hover:underline" href={withReturnPath(`/${locale}/login`, safeReturnPath)}>{t("signIn")}</Link>
      </p>
    </div>
  );
}
