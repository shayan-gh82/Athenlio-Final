import type { Course } from "@/features/courses/types";
import type { EnrollmentStatus } from "@/features/enrollments/types";

export interface TutorUserSummary {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

export interface TutorCertificate {
  id: number;
  title: string;
  issued_by: string;
  issue_date: string | null;
}

export interface TutorEducation {
  id: number;
  degree: string;
  institution_name: string;
  country: string;
  city: string;
  field: string;
  start_date: string | null;
  end_date: string | null;
}

export interface TutorExperience {
  id: number;
  title: string;
  organization: string;
  country: string;
  city: string;
  start_date: string | null;
  end_date: string | null;
  description: string;
}

export interface TutorProfile {
  id: number;
  is_approved?: boolean;
  user: TutorUserSummary;
  profile_picture: string | null;
  languages_spoken: Array<{ language: string; level: string }>;
  country: string;
  subjects: string[];
  phone_number: string;
  bio: string;
  teaching_style: string;
  expectation: string;
  description: string;
  intro_video_url: string;
  intro_video_file: string | null;
  certificates: TutorCertificate[];
  educations: TutorEducation[];
  experiences: TutorExperience[];
  courses?: Course[];
}

export type Tutor = TutorProfile;

export interface TutorEnrollment {
  id: number;
  student_name?: string;
  student_id?: number;
  course: Course;
  status: EnrollmentStatus;
  payment_amount: string | null;
  currency: string;
  payment_note: string;
  payment_proof: string | null;
  submitted_at: string;
  reviewed_at: string | null;
}

export interface TutorDashboardData {
  tutor: TutorProfile;
  courses: Course[];
  enrollments: TutorEnrollment[];
  reviews?: Array<{ id: number; review_text: string; rating: number; review_date: string; student__user__first_name: string; student__user__last_name: string }>;
}

export interface TutorProfileCreatePayload {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  country: string;
  subjects: string[];
  languagesSpoken: Array<{ language: string; level: string }>;
  bio: string;
  teachingStyle: string;
  expectation: string;
  certificates: Array<{ title: string; issued_by?: string; issue_date?: string | null }>;
  educations: Array<{
    degree: string;
    institution_name: string;
    country?: string;
    city?: string;
    field?: string;
    start_date?: string | null;
    end_date?: string | null;
  }>;
  experiences: Array<{
    title: string;
    organization?: string;
    description?: string;
    start_date?: string | null;
    end_date?: string | null;
  }>;
  introVideoUrl?: string;
  profilePicture?: File | null;
  introVideoFile?: File | null;
}
