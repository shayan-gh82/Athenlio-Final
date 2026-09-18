import type { Course } from "@/features/courses/types";

export type EnrollmentStatus =
  | "draft"
  | "pending_payment"
  | "under_review"
  | "approved"
  | "rejected"
  | "cancelled";

export interface Enrollment {
  id: number;
  course: Course;
  status: EnrollmentStatus;
  payment_amount: string | null;
  currency: string;
  payment_note: string;
  payment_proof: string | null;
  submitted_at: string;
  reviewed_at: string | null;
}

export const enrollmentStatusPresentation: Record<EnrollmentStatus, {
  labelKey: string;
  nextActionKey: string;
  tone: "default" | "secondary" | "destructive" | "outline";
}> = {
  draft: { labelKey: "draft", nextActionKey: "completePayment", tone: "outline" },
  pending_payment: { labelKey: "pendingPayment", nextActionKey: "completePayment", tone: "secondary" },
  under_review: { labelKey: "underReview", nextActionKey: "waitForReview", tone: "secondary" },
  approved: { labelKey: "approved", nextActionKey: "startCourse", tone: "default" },
  rejected: { labelKey: "rejected", nextActionKey: "reviewRejection", tone: "destructive" },
  cancelled: { labelKey: "cancelled", nextActionKey: "exploreCourses", tone: "outline" },
};
