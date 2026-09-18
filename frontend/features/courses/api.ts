import type { Course, CourseUpsertPayload } from "@/features/courses/types";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

function courseFormData(payload: CourseUpsertPayload) {
  const data = new FormData();
  data.append("courseId", payload.courseId.trim());
  data.append("title", payload.title.trim());
  data.append("description", payload.description.trim());
  data.append("detail", payload.detail.trim());
  data.append("requirements", payload.requirements.trim());
  data.append("materials", payload.materials.trim());
  data.append("price_per_hour", String(payload.pricePerHour));
  data.append("price_per_dollar", String(payload.pricePerDollar));
  data.append("price_per_toman", String(payload.pricePerToman));
  data.append("language", payload.language.trim());
  data.append("level", payload.level.trim());
  data.append("schedule_day", payload.scheduleDay.trim());
  data.append("schedule_start", payload.scheduleStart);
  data.append("schedule_end", payload.scheduleEnd);
  data.append("capacity", String(payload.capacity));
  data.append("length", String(payload.length));
  data.append("course_duration", String(payload.courseDuration));
  if (payload.image) data.append("image", payload.image);
  if (payload.languageFlag) data.append("language_flag", payload.languageFlag);
  return data;
}

export async function createCourse(payload: CourseUpsertPayload) {
  const response = await apiClient.post<Course>(endpoints.courses.list, courseFormData(payload));
  return response.data;
}

export async function updateCourse({ id, payload }: { id: number; payload: CourseUpsertPayload }) {
  const response = await apiClient.patch<Course>(endpoints.courses.detail(id), courseFormData(payload));
  return response.data;
}

export async function deleteCourse(id: number) {
  await apiClient.delete(endpoints.courses.detail(id));
}
