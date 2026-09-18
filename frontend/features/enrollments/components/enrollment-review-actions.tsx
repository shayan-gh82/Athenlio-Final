"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { approveEnrollment, rejectEnrollment } from "@/features/tutors/api";
import type { TutorEnrollment } from "@/features/tutors/types";
import { normalizeApiError } from "@/lib/api/errors";
import { queryKeys } from "@/lib/query/keys";

export function EnrollmentReviewActions({ enrollment }: { enrollment: TutorEnrollment }) {
  const t = useTranslations("enrollmentReview");
  const queryClient = useQueryClient();
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [note, setNote] = useState("");
  const approveMutation = useMutation({ mutationFn: () => approveEnrollment(enrollment.id) });
  const rejectMutation = useMutation({ mutationFn: () => rejectEnrollment({ id: enrollment.id, note }) });

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.tutorDashboard }),
      queryClient.invalidateQueries({ queryKey: queryKeys.course(enrollment.course.id) }),
    ]);
  };

  const approve = async () => {
    try {
      await approveMutation.mutateAsync();
      await refresh();
      toast.success(t("approveSuccess"));
      setApproveOpen(false);
    } catch (error) {
      const apiError = normalizeApiError(error);
      toast.error(apiError.status === 403 ? t("ownershipError") : t("actionError"));
    }
  };

  const reject = async () => {
    if (note.trim().length < 3) return;
    try {
      await rejectMutation.mutateAsync();
      await refresh();
      toast.success(t("rejectSuccess"));
      setRejectOpen(false);
      setNote("");
    } catch (error) {
      const apiError = normalizeApiError(error);
      toast.error(apiError.status === 403 ? t("ownershipError") : t("actionError"));
    }
  };

  if (enrollment.status !== "under_review") return null;

  return (
    <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
      <AlertDialog open={approveOpen} onOpenChange={(open) => { if (!approveMutation.isPending) setApproveOpen(open); }}>
        <AlertDialogTrigger asChild><Button type="button" size="sm" className="rounded-xl"><CheckCircle2 aria-hidden="true" />{t("approve")}</Button></AlertDialogTrigger>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{t("approveTitle")}</AlertDialogTitle><AlertDialogDescription>{t("approveDescription", { course: enrollment.course.title })}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={approveMutation.isPending}>{t("cancel")}</AlertDialogCancel><AlertDialogAction disabled={approveMutation.isPending} onClick={(event) => { event.preventDefault(); void approve(); }}>{approveMutation.isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <CheckCircle2 aria-hidden="true" />}{t("confirmApprove")}</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
      <Button type="button" variant="outline" size="sm" className="rounded-xl text-destructive hover:text-destructive" onClick={() => setRejectOpen(true)}><XCircle aria-hidden="true" />{t("reject")}</Button>

      <Dialog open={rejectOpen} onOpenChange={(open) => { if (!rejectMutation.isPending) setRejectOpen(open); }}>
        <DialogContent className="rounded-3xl sm:max-w-lg"><DialogHeader className="text-start"><DialogTitle>{t("rejectTitle")}</DialogTitle><DialogDescription>{t("rejectDescription", { course: enrollment.course.title })}</DialogDescription></DialogHeader><div className="space-y-2"><Label htmlFor={`reject-note-${enrollment.id}`}>{t("note")}</Label><Textarea id={`reject-note-${enrollment.id}`} rows={4} value={note} onChange={(event) => setNote(event.target.value)} placeholder={t("notePlaceholder")} maxLength={500} /><p className="text-xs text-muted-foreground">{t("noteHint")}</p></div><DialogFooter><Button type="button" variant="outline" onClick={() => setRejectOpen(false)} disabled={rejectMutation.isPending}>{t("cancel")}</Button><Button type="button" variant="destructive" onClick={() => void reject()} disabled={rejectMutation.isPending || note.trim().length < 3}>{rejectMutation.isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <XCircle aria-hidden="true" />}{t("confirmReject")}</Button></DialogFooter></DialogContent>
      </Dialog>
    </div>
  );
}
