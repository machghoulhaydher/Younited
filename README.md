# RBU Funnel — نظام قمع الاستقطاب الرقمي

## 🗂 هيكل المشروع

```
rbu-funnel/
├── app/
│   ├── page.tsx                    # المرحلة 1: صفحة الهبوط + الاستبيان
│   ├── vsl/page.tsx                # المرحلة 2: عرض العمل التفاعلي
│   ├── register/page.tsx           # المرحلة 3: التوجيه والتسجيل
│   ├── booking/page.tsx            # المرحلة 4: حجز الجلسة
│   ├── partner/[slug]/page.tsx     # صفحة الشريك الشخصية
│   ├── dashboard/page.tsx          # لوحة تحكم المدير
│   ├── layout.tsx
│   └── globals.css
│   └── api/
│       ├── auth/register/route.ts  # POST تسجيل مستخدم جديد
│       ├── auth/login/route.ts     # POST تسجيل الدخول
│       ├── funnel/survey/route.ts  # POST إرسال الاستبيان + التقييم
│       ├── funnel/vsl/route.ts     # POST إكمال مشاهدة الفيديو
│       ├── funnel/progress/route.ts# GET حالة المترشح
│       ├── sessions/book/route.ts  # POST حجز جلسة
│       ├── subscriptions/checkout/ # POST إنشاء اشتراك
│       └── admin/dashboard/route.ts# GET لوحة التحكم
├── prisma/
│   ├── schema.prisma               # كامل جداول قاعدة البيانات
│   └── seed.ts                     # بيانات تجريبية
├── lib/
│   ├── prisma.ts                   # Prisma client singleton
│   ├── auth.ts                     # JWT + bcrypt utilities
│   └── survey-scoring.ts           # خوارزمية تقييم الاستبيان
├── .env.example                    # متغيرات البيئة المطلوبة
├── package.json
└── tailwind.config.ts
```

---

## 🚀 تشغيل المشروع — خطوة بخطوة

### 1. المتطلبات

```bash
node --version   # v18+ مطلوب
npm --version    # v8+
```

### 2. نسخ الملفات وتثبيت الحزم

```bash
# داخل مجلد المشروع
npm install
```

### 3. إعداد قاعدة البيانات (Supabase — مجاني)

1. انتقل إلى https://supabase.com → إنشاء مشروع جديد
2. من لوحة التحكم → Settings → Database → انسخ **Connection String (URI)**
3. انسخ الملف:
```bash
cp .env.example .env.local
```
4. افتح `.env.local` وأضف:
```
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
JWT_SECRET="$(openssl rand -base64 32)"
```

### 4. إنشاء الجداول في قاعدة البيانات

```bash
# إنشاء الجداول
npm run db:push

# إضافة البيانات التجريبية
npm run db:seed
```

### 5. تشغيل المشروع محلياً

```bash
npm run dev
# افتح: http://localhost:3000
```

---

## 📦 النشر على Vercel (مجاني)

```bash
# تثبيت Vercel CLI
npm i -g vercel

# نشر المشروع
vercel

# أضف متغيرات البيئة في لوحة تحكم Vercel:
# vercel.com → مشروعك → Settings → Environment Variables
```

---

## 🗃 قاعدة البيانات — الجداول

| الجدول | الوصف |
|--------|-------|
| `users` | كل المستخدمين (مترشحون + شركاء + مدير) |
| `funnel_progress` | تقدم كل مترشح عبر مراحل القمع |
| `subscriptions` | اشتراكات الشركاء (شهري/سنوي) |
| `payments` | سجل كل المدفوعات |
| `sessions` | الجلسات الاستراتيجية المحجوزة |
| `testimonials` | شهادات الشركاء على الصفحات الشخصية |
| `notifications` | الإشعارات التلقائية (إيميل/واتساب) |
| `activity_logs` | سجل كل الأحداث لكل مستخدم |

---

## 🔑 حسابات تجريبية (بعد seed)

| الدور | الإيميل | كلمة المرور |
|-------|---------|------------|
| مدير | admin@rbu.network | Admin@2026 |
| شريك | ahmed@rbu.network | Partner@2026 |

---

## 🌐 صفحات النظام

| المسار | الوصف |
|--------|-------|
| `/` | صفحة الهبوط + الاستبيان |
| `/vsl` | عرض العمل التفاعلي |
| `/register` | التوجيه والتسجيل في RBU |
| `/booking` | حجز الجلسة الاستراتيجية |
| `/partner/[slug]` | الصفحة الشخصية للشريك |
| `/dashboard` | لوحة تحكم المدير |

---

## 💳 إعداد الدفع (Stripe)

1. أنشئ حساباً على https://stripe.com
2. أنشئ منتجَين (شهري وسنوي) واحفظ الـ Price IDs
3. أضف في `.env.local`:
```
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_MONTHLY_PRICE_ID="price_..."
STRIPE_YEARLY_PRICE_ID="price_..."
```

---

## 🎨 الهوية البصرية

| اللون | HEX | الاستخدام |
|-------|-----|-----------|
| أزرق ملكي | #1A5FBE | العناوين والأقسام الرئيسية |
| ذهبي | #D4A017 | أزرار CTA فقط |
| أخضر | #1D9E75 | النجاح والنشاط |
| برتقالي | #993C1D | التنبيهات والطوارئ |

---

## 📞 الدعم

للأسئلة التقنية، راجع الوثيقة التقنية الشاملة (RBU_Tech_Spec.docx)
