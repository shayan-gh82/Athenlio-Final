import { LocaleProvider } from "@/components/providers/locale-experience";
import { TutorOnboarding } from "@/features/tutors/components/tutor-onboarding";

export default function EnglishTutorOnboardingPage() {
  return <LocaleProvider locale="en"><TutorOnboarding /></LocaleProvider>;
}
