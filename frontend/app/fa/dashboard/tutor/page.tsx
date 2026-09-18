import { LocaleProvider } from "@/components/providers/locale-experience";
import { TutorDashboard } from "@/features/tutors/components/tutor-dashboard";

export default function PersianTutorDashboardPage() {
  return <LocaleProvider locale="fa"><TutorDashboard /></LocaleProvider>;
}
