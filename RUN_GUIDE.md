# راهنمای اجرای Athenlio در Windows PowerShell

## پیش‌نیازها

- Node.js نسخه 22.13 یا جدیدتر
- Python نسخه 3.12 یا جدیدتر

## 1. اجرای بک‌اند

در PowerShell وارد پوشه `backend` شوید:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
python manage.py migrate
python manage.py check
python manage.py runserver 8000
```

بک‌اند در `http://localhost:8000` و Swagger در `http://localhost:8000/api/schema/swagger-ui/` اجرا می‌شود.

برای اجرای محلی، تنظیمات پیش‌فرض پروژه کافی است. فایل `.env` به‌صورت خودکار خوانده نمی‌شود؛ اگر نیاز به تغییر Secret یا Originها دارید، متغیرها را پیش از اجرای سرور در PowerShell با `$env:VARIABLE_NAME="value"` تنظیم کنید.

## 2. ساخت مدیر Django

در یک PowerShell جدید و داخل پوشه `backend`:

```powershell
.\.venv\Scripts\Activate.ps1
python manage.py createsuperuser
```

سپس وارد `http://localhost:8000/admin/` شوید. از `Tutors → Tutors` مدرس را تأیید یا رد کنید و از `Courses → Enrollments` رسید و وضعیت ثبت‌نام را مدیریت کنید.

## 3. اجرای فرانت‌اند

در یک PowerShell جدید:

```powershell
cd frontend
npm ci
Copy-Item .env.example .env.local
npm run dev
```

آدرس‌ها:

- فارسی: `http://localhost:5173/fa`
- انگلیسی: `http://localhost:5173/en`

محتوای `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_SITE_URL=http://localhost:5173
```

## 4. تست نهایی

بک‌اند:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python manage.py check
python manage.py showmigrations
python manage.py test
```

فرانت‌اند:

```powershell
cd frontend
npm run typecheck
npm run lint
npm run build
npm test
```

`npm test` را پس از `npm run build` اجرا کنید، چون یکی از تست‌ها خروجی Production Build را بررسی می‌کند.

## جریان مدرس

1. مدرس از مسیر `/fa/register/tutor` ثبت‌نام می‌کند.
2. فرم تکمیل پروفایل و فایل‌های لازم را ارسال می‌کند.
3. تا قبل از تأیید مدیر، ساخت دوره در UI و API مسدود است.
4. مدیر در Django Admin فیلد `is_approved` را فعال می‌کند.
5. مدرس پس از Refresh به داشبورد کامل و ساخت دوره دسترسی می‌گیرد.
6. مدرس بعداً از `Dashboard → Edit profile` تصویر و اطلاعات عمومی خود را تغییر می‌دهد.

## جریان دانشجو

1. دانشجو ثبت‌نام یا Login می‌کند.
2. پروفایل و Avatar را ویرایش می‌کند.
3. دوره‌ها را مستقیم یا از سبد خرید انتخاب و رسید ثبت‌نام هر دوره را ارسال می‌کند.
4. مدرس مالک دوره یا مدیر درخواست را تأیید می‌کند.
5. دوره، جلسات و تکالیف تأییدشده در داشبورد و صفحه مستقل «دوره‌های من» نمایش داده می‌شوند.
6. وضعیت رسیدها در صفحه مستقل «خریدها و ثبت‌نام‌ها» قابل پیگیری است.
