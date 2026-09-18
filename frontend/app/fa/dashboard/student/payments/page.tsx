import { LocaleProvider } from "@/components/providers/locale-experience";
import { StudentRecordsPage } from "@/features/students/components/student-records-page";

export default function PersianStudentPaymentsPage() {
  return <LocaleProvider locale="fa"><StudentRecordsPage section="payments" /></LocaleProvider>;
}
