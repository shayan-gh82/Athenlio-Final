import { LocaleProvider } from "@/components/providers/locale-experience";
import { StudentDashboard } from "@/features/students/components/student-dashboard";

export default function EnglishStudentDashboardPage() {
  return <LocaleProvider locale="en"><StudentDashboard /></LocaleProvider>;
}
