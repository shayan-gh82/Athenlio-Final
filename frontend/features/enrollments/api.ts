import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

export interface EnrollmentCreatePayload {
  courseId: number;
  paymentAmount: number;
  currency: "USD" | "TOMAN";
  paymentNote?: string;
  paymentProof: File;
}

export async function createEnrollment(payload: EnrollmentCreatePayload) {
  const data = new FormData();
  data.append("course", String(payload.courseId));
  data.append("payment_amount", String(payload.paymentAmount));
  data.append("currency", payload.currency);
  data.append("payment_note", payload.paymentNote?.trim() ?? "");
  data.append("payment_proof", payload.paymentProof);

  const response = await apiClient.post(endpoints.enrollments.list, data);
  return response.data;
}
