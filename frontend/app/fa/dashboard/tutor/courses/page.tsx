import { LocaleProvider } from "@/components/providers/locale-experience";
import { CourseManager } from "@/features/courses/components/course-manager";

export default function PersianTutorCoursesPage() {
  return <LocaleProvider locale="fa"><CourseManager /></LocaleProvider>;
}
