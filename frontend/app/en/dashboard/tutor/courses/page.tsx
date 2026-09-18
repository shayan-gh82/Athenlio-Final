import { LocaleProvider } from "@/components/providers/locale-experience";
import { CourseManager } from "@/features/courses/components/course-manager";

export default function EnglishTutorCoursesPage() {
  return <LocaleProvider locale="en"><CourseManager /></LocaleProvider>;
}
