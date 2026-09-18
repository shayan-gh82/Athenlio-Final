import type { Course } from "@/features/courses/types";
import type { Enrollment } from "@/features/enrollments/types";

export interface StudentSummary {
  id: number;
  user: number;
  courses_list: number[];
  favourite_tutors: number[];
  student_active: boolean;
  student_homework_completed: unknown[];
}

export interface StudentDashboardData {
  student: StudentSummary;
  enrollments: Enrollment[];
  approved_courses: Course[];
}

export interface StudentProfileData {
  user: { first_name: string; last_name: string; phone_number: string | null; bio: string | null; profile_picture: string | null };
  student: StudentSummary;
}
