import { LocaleProvider } from "@/components/providers/locale-experience";
import { StudentRecordsPage } from "@/features/students/components/student-records-page";

export default function PersianStudentPurchasesPage() {
  return <LocaleProvider locale="fa"><StudentRecordsPage section="purchases" /></LocaleProvider>;
}
