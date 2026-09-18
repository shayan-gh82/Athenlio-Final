import { LocaleProvider } from "@/components/providers/locale-experience";
import { StudentCoursesPage } from "@/features/students/components/student-courses-page";

export default function EnglishStudentCoursesPage() {
  return <LocaleProvider locale="en"><StudentCoursesPage /></LocaleProvider>;
}
