import type { StudentDashboardData, StudentProfileData } from "@/features/students/types";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

export async function getStudentDashboard() {
  const response = await apiClient.get<StudentDashboardData>(endpoints.students.dashboard);
  return response.data;
}

export async function getStudentProfile() {
  const response = await apiClient.get<StudentProfileData>(endpoints.students.current);
  return response.data;
}

export interface StudentProfileUpdate {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  bio?: string;
  profilePicture?: File | null;
}

export async function updateStudentProfile(values: StudentProfileUpdate) {
  const data = new FormData();
  data.append("first_name", values.firstName.trim());
  data.append("last_name", values.lastName.trim());
  if (values.phoneNumber !== undefined) data.append("phone_number", values.phoneNumber.trim());
  if (values.bio !== undefined) data.append("bio", values.bio.trim());
  if (values.profilePicture) data.append("profile_picture", values.profilePicture);

  const response = await apiClient.patch<StudentProfileData>(endpoints.students.profile, data);
  return response.data;
}
