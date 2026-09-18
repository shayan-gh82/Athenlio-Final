# معماری Athenlio

## Frontend

- Next.js App Router، React و TypeScript
- مسیرهای هم‌ارز `/fa/...` و `/en/...`
- RTL فارسی و LTR انگلیسی
- Redux Toolkit برای Session و نقش کاربر
- TanStack Query برای داده‌های API، cache و invalidation
- Axios مشترک با `withCredentials: true` و Refresh Token interceptor
- React Hook Form و Zod برای فرم‌ها
- ساختار Feature-Based در `features/auth`, `cart`, `courses`, `students`, `tutors`, `enrollments`, `blog`
- سبد خرید سمت کاربر با Local Storage و همگام‌سازی بین تب‌ها؛ ثبت نهایی هر دوره همچنان از قرارداد Enrollment و رسید انجام می‌شود.

## Backend

- Django و Django REST Framework
- SimpleJWT داخل HttpOnly Cookie
- SQLite برای تحویل دانشگاهی و اجرای محلی
- Appهای `accounts`, `students`, `tutors`, `courses`, `blog`
- Media برای Avatar، ویدیوی معرفی، تصویر دوره و رسید پرداخت
- Django Admin برای تأیید مدرس و مدیریت Enrollment

## جریان احراز هویت

1. Register یا Login توکن‌ها را در Cookieهای HttpOnly قرار می‌دهد.
2. `GET /api/me/` نقش و وضعیت پروفایل/تأیید مدرس را برمی‌گرداند.
3. Redux وضعیت `student`, `tutor-no-profile`, `tutor-pending` یا `tutor-approved` را نگه می‌دارد.
4. در پاسخ 401، Axios یک بار `/api/token/refresh/` را صدا می‌زند و درخواست را تکرار می‌کند.

## کنترل دسترسی

- صفحات عمومی: خانه، دوره‌ها، مدرس‌ها و بلاگ
- عملیات دانشجو: فقط حساب دانشجو و فقط اطلاعات خودش
- ویرایش مدرس: فقط صاحب پروفایل یا مدیر
- ساخت و ویرایش دوره: فقط مدرس مالک و تأییدشده
- بررسی Enrollment: مدرس مالک دوره یا مدیر
- فهرست عمومی مدرس‌ها: فقط `is_approved=True`
- فهرست عمومی دوره‌ها: فقط دوره‌های مدرس تأییدشده؛ مدیر و مدرس مالک به داده‌های مدیریتی لازم دسترسی دارند.
