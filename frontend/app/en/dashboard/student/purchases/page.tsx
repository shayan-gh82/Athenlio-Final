import { LocaleProvider } from "@/components/providers/locale-experience";
import { StudentRecordsPage } from "@/features/students/components/student-records-page";

export default function EnglishStudentPurchasesPage() {
  return <LocaleProvider locale="en"><StudentRecordsPage section="purchases" /></LocaleProvider>;
}
