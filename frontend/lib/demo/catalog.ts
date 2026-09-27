import type { Course } from "@/features/courses/types";
import type { TutorProfile } from "@/features/tutors/types";
import type { BlogPost } from "@/features/blog/types";

/** Fictional catalog for the explicitly labelled, read-only portfolio demo. */
export function demoCatalog(locale: string) {
  const fa = locale === "fa";
  const names = fa ? [["سارا", "مهر"], ["آرمان", "نوری"], ["لیلا", "راد"]] : [["Sara", "Mehr"], ["Arman", "Nouri"], ["Leila", "Rad"]];
  const tutors: TutorProfile[] = names.map(([first_name, last_name], index) => ({
    id: index + 1, is_approved: true,
    user: { id: index + 1, email: `tutor${index + 1}@example.com`, first_name, last_name },
    profile_picture: null, country: fa ? "ایران" : "Iran", phone_number: "",
    subjects: [index === 1 ? "German" : "English"],
    languages_spoken: [{ language: index === 1 ? "German" : "English", level: "C2" }],
    bio: fa ? "پروفایل نمونه برای نمایش تجربهٔ انتخاب استاد؛ این شخص و کلاس‌ها واقعی نیستند." : "A fictional tutor profile demonstrating the discovery experience. No real classes are offered in this demo.",
    teaching_style: fa ? "تمرین تعاملی، گفت‌وگو و بازخورد مرحله‌به‌مرحله" : "Interactive practice, conversation, and step-by-step feedback",
    expectation: fa ? "تمرین کوتاه و منظم بین جلسات" : "Short, regular practice between lessons",
    description: "", intro_video_url: "", intro_video_file: null, certificates: [], educations: [], experiences: [],
  }));
  const titles = fa ? ["مکالمهٔ کاربردی انگلیسی", "آلمانی از پایه", "آمادگی اسپیکینگ آیلتس", "انگلیسی محیط کار"] : ["Everyday English Conversation", "German from the Beginning", "IELTS Speaking Practice", "English for the Workplace"];
  const courses: Course[] = titles.map((title, index) => {
    const tutor = tutors[index % tutors.length];
    return {
      id: index + 1, courseId: `DEMO-${index + 1}`, title,
      description: fa ? "دورهٔ نمونه برای مرور سرفصل‌ها، فیلتر دوره‌ها و آزمایش سبد خرید." : "A sample course for exploring the catalog, filters, course details, and cart.",
      detail: fa ? "در این دورهٔ نمایشی، مسیر یادگیری را از تمرین‌های پایه تا کاربردهای روزمره مرور می‌کنید. ثبت‌نام و پرداخت واقعی در این نسخه غیرفعال است." : "Explore a sample learning path from foundations to everyday practice. Enrollment and real payments are unavailable in this demo.",
      requirements: fa ? "انگیزهٔ یادگیری و زمان برای تمرین" : "Motivation and time for regular practice",
      materials: fa ? "تمرین‌های مکالمه و مرور واژگان" : "Conversation exercises and vocabulary review",
      price_per_hour: "12", price_per_dollar: String(12 + index * 4), price_per_toman: null,
      language: index === 1 ? "German" : "English", level: ["B1", "A1", "B2", "B1"][index],
      schedule_day: index % 2 ? "Monday" : "Saturday", schedule_start: "17:00:00", schedule_end: "18:00:00",
      capacity: 12, active_students: 4 + index, length: 60, course_duration: 8,
      image: null, language_flag: null, tutor, lessons: [],
    };
  });
  const blogTitles = fa ? ["چطور هر روز کمی زبان تمرین کنیم؟", "یادگیری واژگان در جمله", "تمرین مکالمه با هدف روشن"] : ["Make Language Practice a Daily Habit", "Learn Vocabulary in Context", "Give Your Speaking Practice a Clear Goal"];
  const paragraphs = fa ? [
    "برای شروع، ده دقیقه از روز را به یک کار مشخص اختصاص بده: خواندن یک متن کوتاه یا شنیدن یک گفت‌وگو. برنامه‌ای انتخاب کن که بتوانی ادامه‌اش بدهی.",
    "واژه‌های تازه را در یک جمله ثبت کن. سپس با همان واژه، جمله‌ای دربارهٔ زندگی خودت بساز و چند روز بعد دوباره آن را مرور کن.",
    "قبل از صحبت‌کردن یک هدف کوچک انتخاب کن، مثل معرفی یک تجربه یا توضیح یک نظر. صدایت را ضبط کن و فقط یک نکته را برای دفعهٔ بعد بهتر کن.",
  ] : [
    "Start with ten minutes and one clear activity: a short text or a conversation to listen to. Choose a routine you can sustain and review it each week.",
    "Record a new word inside a useful sentence. Then write another sentence about your own life and revisit it a few days later.",
    "Choose one small speaking goal, such as describing an experience or explaining an opinion. Record your answer and improve one detail next time.",
  ];
  const blogs: BlogPost[] = blogTitles.map((title, index) => ({
    id: index + 1, title, author: "Athenlio Demo", description: paragraphs[index],
    content: paragraphs[index] + "\n\n" + (fa ? "این مقاله بخشی از محتوای نمونهٔ دموی Athenlio است." : "This article is sample content for the Athenlio portfolio demo."),
    category: null, difficulty_level: "Easy", featured: index === 0,
    created_at: "2026-09-27T12:00:00Z", updated_at: "2026-09-27T12:00:00Z", picture: null,
  }));
  return { courses, tutors, blogs };
}

export function resolveDemoRead(path: string, locale: string): unknown | undefined {
  const match = /^\/api\/(courses|tutors|blogs)(?:\/(\d+))?\/$/.exec(path);
  if (!match) return undefined;
  const records = demoCatalog(locale)[match[1] as "courses" | "tutors" | "blogs"];
  return match[2] ? records.find((record) => record.id === Number(match[2])) : records;
}
