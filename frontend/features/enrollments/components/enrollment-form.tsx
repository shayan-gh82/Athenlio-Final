"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileCheck2, Loader2, ReceiptText, UploadCloud } from "lucide-react";
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
import { createEnrollment } from "@/features/enrollments/api";
import { getStudentDashboard } from "@/features/students/api";
import { normalizeApiError } from "@/lib/api/errors";
import { queryKeys } from "@/lib/query/keys";

const proofTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxProofSize = 8 * 1024 * 1024;

export function EnrollmentForm({ courseId, defaultAmount, defaultCurrency, onSuccess }: {
  courseId: number;
  defaultAmount: number;
  defaultCurrency: "USD" | "TOMAN";
  onSuccess: () => void;
}) {
  const t = useTranslations("enrollmentForm");
  const queryClient = useQueryClient();
  const [proof, setProof] = useState<File | null>(null);
  const [proofError, setProofError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSynchronizing, setIsSynchronizing] = useState(false);
  const schema = z.object({
    paymentAmount: z.coerce.number().positive(t("amountPositive")),
    currency: z.enum(["USD", "TOMAN"]),
    paymentNote: z.string().trim().max(500, t("noteTooLong")),
  });
  type EnrollmentValues = z.infer<typeof schema>;
  const form = useForm<EnrollmentValues>({
    resolver: zodResolver(schema),
    defaultValues: { paymentAmount: defaultAmount, currency: defaultCurrency, paymentNote: "" },
  });
  const mutation = useMutation({ mutationFn: createEnrollment });

  const chooseProof = (file?: File) => {
    setProofError(null);
    if (!file) return setProof(null);
    if (!proofTypes.has(file.type)) return setProofError(t("proofTypeError"));
    if (file.size > maxProofSize) return setProofError(t("proofSizeError"));
    setProof(file);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setServerError(null);
    if (!proof) return setProofError(t("proofRequired"));
    if (proofError) return;
    try {
      await mutation.mutateAsync({ courseId, paymentAmount: values.paymentAmount, currency: values.currency, paymentNote: values.paymentNote, paymentProof: proof });

      setIsSynchronizing(true);
      try {
        await queryClient.fetchQuery({
          queryKey: queryKeys.studentDashboard,
          queryFn: getStudentDashboard,
          staleTime: 0,
        });
      } catch {
        await queryClient.invalidateQueries({ queryKey: queryKeys.studentDashboard });
        toast.warning(t("syncWarning"));
      } finally {
        setIsSynchronizing(false);
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.myEnrollments }),
        queryClient.invalidateQueries({ queryKey: queryKeys.course(courseId) }),
      ]);
      toast.success(t("success"));
      onSuccess();
    } catch (error) {
      const apiError = normalizeApiError(error);
      setServerError(apiError.status === 400 ? t("duplicateOrInvalid") : t("connectionError"));
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      {serverError ? <Alert variant="destructive"><ReceiptText aria-hidden="true" /><AlertTitle>{t("errorTitle")}</AlertTitle><AlertDescription>{serverError}</AlertDescription></Alert> : null}
      <div className="grid gap-4 sm:grid-cols-[1fr_150px]">
        <div className="space-y-2"><Label htmlFor="payment-amount">{t("amount")}</Label><Input id="payment-amount" type="number" min="0" step="0.01" dir="ltr" className="h-11 rounded-xl bg-background/60" aria-invalid={Boolean(form.formState.errors.paymentAmount)} {...form.register("paymentAmount")} />{form.formState.errors.paymentAmount ? <p className="text-sm text-destructive">{form.formState.errors.paymentAmount.message}</p> : null}</div>
        <div className="space-y-2"><Label htmlFor="payment-currency">{t("currency")}</Label><NativeSelect id="payment-currency" className="h-11 w-full rounded-xl bg-background/60" {...form.register("currency")}><NativeSelectOption value="USD">USD</NativeSelectOption><NativeSelectOption value="TOMAN">TOMAN</NativeSelectOption></NativeSelect></div>
      </div>
      <div className="space-y-2"><Label htmlFor="payment-note">{t("note")}</Label><Textarea id="payment-note" rows={3} className="rounded-xl bg-background/60" placeholder={t("notePlaceholder")} {...form.register("paymentNote")} />{form.formState.errors.paymentNote ? <p className="text-sm text-destructive">{form.formState.errors.paymentNote.message}</p> : null}</div>
      <div className="rounded-2xl border border-dashed border-primary/25 bg-background/55 p-5">
        <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-primary-soft text-primary dark:bg-primary/15">{proof ? <FileCheck2 aria-hidden="true" /> : <UploadCloud aria-hidden="true" />}</span><div><p className="font-bold">{proof ? proof.name : t("uploadTitle")}</p><p className="mt-1 text-sm text-muted-foreground">{proof ? t("fileReady") : t("uploadHint")}</p></div></div>
        <Label htmlFor="payment-proof" className="mt-4 inline-flex cursor-pointer rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold shadow-sm">{proof ? t("replaceFile") : t("chooseFile")}</Label>
        <input id="payment-proof" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => chooseProof(event.target.files?.[0])} />
        {proofError ? <p className="mt-2 text-sm text-destructive">{proofError}</p> : null}
      </div>
      <Button type="submit" className="h-11 w-full rounded-xl" disabled={mutation.isPending || isSynchronizing}>{mutation.isPending || isSynchronizing ? <Loader2 aria-hidden="true" className="animate-spin" /> : <ReceiptText aria-hidden="true" />}{mutation.isPending ? t("submitting") : isSynchronizing ? t("synchronizing") : t("submit")}</Button>
    </form>
  );
}
