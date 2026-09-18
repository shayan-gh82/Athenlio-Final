export interface CourseTutorSummary {
  id: number;
  user: number | { id: number; email?: string; first_name?: string; last_name?: string };
  profile_picture: string | null;
  languages_spoken: unknown[];
  subjects: string[];
}

export interface Course {
  id: number;
  courseId: string;
  title: string;
  description: string;
  detail: string;
  requirements: string;
  materials: string;
  price_per_hour: string | null;
  price_per_dollar: string | null;
  price_per_toman: string | null;
  language: string;
  level: string;
  schedule_day: string;
  schedule_start: string;
  schedule_end: string;
  capacity: number;
  active_students: number;
  length: number | null;
  course_duration: number | string | null;
  image: string | null;
  language_flag: string | null;
  tutor: CourseTutorSummary | null;
  lessons?: Array<{ id: number; title: string; description: string; lesson_video: string | null; lesson_document: string | null; homeworks?: Array<{ id: number; title: string; document: string | null; due_date: string }> }>;
}

export interface CourseUpsertPayload {
  courseId: string;
  title: string;
  description: string;
  detail: string;
  requirements: string;
  materials: string;
  pricePerHour: number;
  pricePerDollar: number;
  pricePerToman: number;
  language: string;
  level: string;
  scheduleDay: string;
  scheduleStart: string;
  scheduleEnd: string;
  capacity: number;
  length: number;
  courseDuration: number;
  image?: File | null;
  languageFlag?: File | null;
}
