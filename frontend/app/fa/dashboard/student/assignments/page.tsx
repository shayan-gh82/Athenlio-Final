import { LocaleProvider } from "@/components/providers/locale-experience";
import { StudentRecordsPage } from "@/features/students/components/student-records-page";

export default function PersianStudentAssignmentsPage() {
  return <LocaleProvider locale="fa"><StudentRecordsPage section="homeworks" /></LocaleProvider>;
}
