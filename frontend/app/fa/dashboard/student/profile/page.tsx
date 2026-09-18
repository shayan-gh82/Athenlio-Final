import { LocaleProvider } from "@/components/providers/locale-experience";
import { StudentProfileForm } from "@/features/students/components/student-profile-form";

export default function PersianStudentProfilePage() {
  return <LocaleProvider locale="fa"><StudentProfileForm /></LocaleProvider>;
}
