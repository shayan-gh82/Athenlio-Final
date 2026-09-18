"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Loader2, LogIn, ServerOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AuthField } from "@/features/auth/components/auth-field";
import { login } from "@/features/auth/api";
import { getAuthenticatedRoute } from "@/features/auth/types";
import { getSafeReturnPath, withReturnPath } from "@/lib/auth/return-path";
import { isApiConfigured } from "@/lib/api/config";
import { normalizeApiError } from "@/lib/api/errors";
import { queryKeys } from "@/lib/query/keys";
import { setAuthenticatedUser } from "@/store/auth-slice";
import { useAppDispatch } from "@/store/hooks";

export function LoginForm({ returnPath }: { returnPath?: string }) {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const schema = z.object({
    email: z.string().trim().min(1, t("required")).email(t("emailInvalid")),
    password: z.string().min(1, t("required")),
  });
  type LoginValues = z.infer<typeof schema>;
  const form = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });
  const mutation = useMutation({ mutationFn: login });
  const safeReturnPath = getSafeReturnPath(returnPath, locale);

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    try {
      const user = await mutation.mutateAsync(values);
      queryClient.setQueryData(queryKeys.me, user);
      dispatch(setAuthenticatedUser(user));
      toast.success(t("loginSuccess"));
      router.replace(!user.is_teacher && safeReturnPath ? safeReturnPath : getAuthenticatedRoute(user, locale));
    } catch (error) {
      const apiError = normalizeApiError(error);
      setFormError(apiError.status === 400 || apiError.status === 401 ? t("invalidCredentials") : t("connectionError"));
    }
  });

  return (
    <div>
      <p className="text-sm font-bold text-secondary">{t("welcomeBack")}</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">{t("loginTitle")}</h1>
      <p className="mt-3 leading-7 text-muted-foreground">{t("loginDescription")}</p>

      {!isApiConfigured ? (
        <Alert className="mt-6 border-warning/25 bg-accent/10 text-foreground">
          <ServerOff aria-hidden="true" />
          <AlertTitle>{t("previewModeTitle")}</AlertTitle>
          <AlertDescription>{t("previewModeDescription")}</AlertDescription>
        </Alert>
      ) : null}
      {formError ? (
        <Alert variant="destructive" className="mt-6">
          <AlertTitle>{t("loginFailed")}</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      <form className="mt-7 space-y-5" onSubmit={onSubmit} noValidate>
        <AuthField id="login-email" type="email" autoComplete="email" label={t("email")} placeholder="name@example.com" error={form.formState.errors.email?.message} {...form.register("email")} />
        <div className="relative">
          <AuthField id="login-password" type={showPassword ? "text" : "password"} autoComplete="current-password" label={t("password")} error={form.formState.errors.password?.message} {...form.register("password")} />
          <Button type="button" variant="ghost" size="icon" className="absolute end-1 top-7 rounded-lg" aria-label={showPassword ? t("hidePassword") : t("showPassword")} onClick={() => setShowPassword((value) => !value)}>
            {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
          </Button>
        </div>
        <Button type="submit" size="lg" className="h-12 w-full rounded-xl" disabled={!isApiConfigured || mutation.isPending}>
          {mutation.isPending ? <Loader2 aria-hidden="true" className="animate-spin" /> : <LogIn aria-hidden="true" />}
          {mutation.isPending ? t("signingIn") : t("signIn")}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t("noAccount")} <Link className="font-bold text-primary hover:underline" href={withReturnPath(`/${locale}/register`, safeReturnPath)}>{t("createAccount")}</Link>
      </p>
    </div>
  );
}
