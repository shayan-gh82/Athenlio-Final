import { LocaleProvider } from "@/components/providers/locale-experience";
import { TutorProfileForm } from "@/features/tutors/components/tutor-profile-form";
export const dynamic = "force-dynamic";
export default function Page() { return <LocaleProvider locale="en"><TutorProfileForm /></LocaleProvider>; }
