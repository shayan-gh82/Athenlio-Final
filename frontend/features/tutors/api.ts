import type { Course } from "@/features/courses/types";
import type { TutorDashboardData, TutorProfile, TutorProfileCreatePayload } from "@/features/tutors/types";
import { normalizeTutorProfile } from "@/features/tutors/normalize";
import { apiClient } from "@/lib/api/client";
import { unwrapCollection, type PaginatedResponse } from "@/lib/api/collections";
import { endpoints } from "@/lib/api/endpoints";

export async function getTutorDashboard() {
  const response = await apiClient.get<TutorDashboardData>(endpoints.tutors.dashboard);
  return {
    ...response.data,
    tutor: normalizeTutorProfile(response.data.tutor),
    courses: Array.isArray(response.data.courses) ? response.data.courses : [],
    enrollments: Array.isArray(response.data.enrollments) ? response.data.enrollments : [],
  };
}

export async function getTutorPublicProfile(id: number | string) {
  const [profileResponse, coursesResponse] = await Promise.all([
    apiClient.get<TutorProfile>(endpoints.tutors.detail(id)),
    apiClient.get<Course[] | PaginatedResponse<Course>>(endpoints.courses.list),
  ]);
  const tutorId = Number(id);
  const relatedCourses = unwrapCollection(coursesResponse.data).filter((course) => course.tutor?.id === tutorId);
  return { profile: normalizeTutorProfile(profileResponse.data), courses: relatedCourses };
}

export async function createTutorProfile(payload: TutorProfileCreatePayload) {
  const data = new FormData();
  data.append("first_name", payload.firstName.trim());
  data.append("last_name", payload.lastName.trim());
  data.append("country", payload.country.trim());
  data.append("phone_number", payload.phoneNumber?.trim() ?? "");
  data.append("subjects", JSON.stringify(payload.subjects));
  data.append("languages_spoken", JSON.stringify(payload.languagesSpoken));
  data.append("bio", payload.bio.trim());
  data.append("teaching_style", payload.teachingStyle.trim());
  data.append("expectation", payload.expectation.trim());
  data.append("certificates", JSON.stringify(payload.certificates));
  data.append("educations", JSON.stringify(payload.educations));
  data.append("experiences", JSON.stringify(payload.experiences));
  if (payload.introVideoUrl?.trim()) data.append("intro_video_url", payload.introVideoUrl.trim());
  if (payload.profilePicture) data.append("profile_picture", payload.profilePicture);
  if (payload.introVideoFile) data.append("intro_video_file", payload.introVideoFile);

  const response = await apiClient.post<TutorProfile>(endpoints.tutors.createProfile, data);
  return normalizeTutorProfile(response.data);
}

export async function approveEnrollment(id: number) {
  const response = await apiClient.patch(endpoints.enrollments.approve(id));
  return response.data;
}

export async function rejectEnrollment({ id, note }: { id: number; note: string }) {
  const response = await apiClient.patch(endpoints.enrollments.reject(id), { payment_note: note.trim() });
  return response.data;
}
