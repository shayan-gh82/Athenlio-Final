import { LocaleProvider } from "@/components/providers/locale-experience";
import { TutorDashboard } from "@/features/tutors/components/tutor-dashboard";

export default function EnglishTutorDashboardPage() {
  return <LocaleProvider locale="en"><TutorDashboard /></LocaleProvider>;
}
