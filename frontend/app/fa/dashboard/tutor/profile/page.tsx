import { TutorProfileForm } from "@/features/tutors/components/tutor-profile-form";
import { LocaleProvider } from "@/components/providers/locale-experience";
export const dynamic = "force-dynamic";
export default function Page() { return <LocaleProvider locale="fa"><TutorProfileForm /></LocaleProvider>; }
