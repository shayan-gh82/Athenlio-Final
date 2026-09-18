import { LocaleProvider } from "@/components/providers/locale-experience";
import { StudentProfileForm } from "@/features/students/components/student-profile-form";

export default function EnglishStudentProfilePage() {
  return <LocaleProvider locale="en"><StudentProfileForm /></LocaleProvider>;
}
