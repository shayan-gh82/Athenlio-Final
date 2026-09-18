"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="fa" dir="rtl">
      <body className="grid min-h-screen place-items-center bg-[#faf9f6] px-6 text-[#17152b]">
        <main className="max-w-lg space-y-5 text-center">
          <p className="text-sm font-bold text-[#0f766e]">Athenlio</p>
          <h1 className="text-3xl font-bold">مشکلی در نمایش صفحه پیش آمد</h1>
          <p className="leading-8 text-[#625f72]">لطفاً یک‌بار دیگر تلاش کنید. اگر مشکل ادامه داشت، صفحه را تازه‌سازی کنید.</p>
          <button
            type="button"
            onClick={reset}
            className="rounded-xl bg-[#302a78] px-5 py-3 font-semibold text-white"
          >
            تلاش دوباره
          </button>
        </main>
      </body>
    </html>
  );
}
