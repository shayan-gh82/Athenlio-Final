export interface MeResponse {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_teacher: boolean;
  profile_picture: string | null;
  has_tutor_profile: boolean;
  tutor_id: number | null;
  tutor_approved: boolean | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  first_name: string;
  last_name: string;
  is_teacher: boolean;
}

export type AuthStatus =
  | "unknown"
  | "guest"
  | "student"
  | "tutor-no-profile"
  | "tutor-pending"
  | "tutor-approved";

export function getAuthStatus(user: MeResponse): AuthStatus {
  if (!user.is_teacher) return "student";
  if (!user.has_tutor_profile) return "tutor-no-profile";
  return user.tutor_approved ? "tutor-approved" : "tutor-pending";
}

export function getAuthenticatedRoute(user: MeResponse, locale: string) {
  const status = getAuthStatus(user);
  if (status === "student") return `/${locale}/dashboard/student`;
  if (status === "tutor-no-profile") return `/${locale}/dashboard/tutor/onboarding`;
  return `/${locale}/dashboard/tutor`;
}
