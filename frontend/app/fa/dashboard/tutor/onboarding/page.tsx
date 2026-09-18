import { LocaleProvider } from "@/components/providers/locale-experience";
import { TutorOnboarding } from "@/features/tutors/components/tutor-onboarding";

export default function PersianTutorOnboardingPage() {
  return <LocaleProvider locale="fa"><TutorOnboarding /></LocaleProvider>;
}
