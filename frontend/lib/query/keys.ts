export const queryKeys = {
  me: ["auth", "me"] as const,
  courseList: ["courses"] as const,
  courses: (filters: Record<string, unknown> = {}) => ["courses", filters] as const,
  course: (id: number | string) => ["courses", id] as const,
  tutors: (filters: Record<string, unknown> = {}) => ["tutors", filters] as const,
  tutor: (id: number | string) => ["tutors", id] as const,
  blogs: ["blogs"] as const,
  blog: (id: number | string) => ["blogs", id] as const,
  studentDashboard: ["students", "me", "dashboard"] as const,
  studentProfile: ["students", "me", "profile"] as const,
  tutorDashboard: ["tutors", "me", "dashboard"] as const,
  myEnrollments: ["enrollments", "my"] as const,
};
