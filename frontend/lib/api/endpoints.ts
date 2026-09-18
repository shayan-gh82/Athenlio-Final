export const endpoints = {
  auth: {
    register: "/api/register/",
    login: "/api/login/",
    refresh: "/api/token/refresh/",
    me: "/api/me/",
    logout: "/api/logout/",
  },
  students: {
    current: "/api/students/me/",
    dashboard: "/api/students/me/dashboard/",
    profile: "/api/students/me/profile/",
  },
  tutors: {
    list: "/api/tutors/",
    detail: (id: number | string) => `/api/tutors/${id}/`,
    dashboard: "/api/tutors/me/dashboard/",
    createProfile: "/api/create-tutor-profile/",
  },
  courses: {
    list: "/api/courses/",
    detail: (id: number | string) => `/api/courses/${id}/`,
  },
  enrollments: {
    list: "/api/enrollments/",
    detail: (id: number | string) => `/api/enrollments/${id}/`,
    approve: (id: number | string) => `/api/enrollments/${id}/approve/`,
    reject: (id: number | string) => `/api/enrollments/${id}/reject/`,
  },
  blogs: {
    list: "/api/blogs/",
    detail: (id: number | string) => `/api/blogs/${id}/`,
  },
} as const;

export const authRetryExcludedEndpoints = new Set<string>([
  endpoints.auth.register,
  endpoints.auth.login,
  endpoints.auth.refresh,
  endpoints.auth.logout,
]);
