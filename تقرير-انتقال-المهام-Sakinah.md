# 📋 تقرير حالة مشروع "سَكِينَة — Sakinah" ووثيقة انتقال المهام الشاملة

> **تاريخ التقرير:** 21 يوليو 2026  
> **إصدارة المشروع:** v0.1.0 (تطوير مستمر)  
> **آخر Commit:** `a4b380c`  
> **المستودع:** https://github.com/mo01115285816-cyber/sakina

---

## 📑 فهرس المحتويات
1. [نظرة عامة شاملة](#١-نظرة-عامة-شاملة)
2. [هيكل المشروع وبنية المجلدات](#٢-هيكل-المشروع-وبنية-المجلدات)
3. [الاعتماديات (Dependencies)](#٣-الاعتماديات-dependencies)
4. [شرح كل ملف بالتفصيل](#٤-شرح-كل-ملف-بالتفصيل)
5. [البنية التحتية للخطوط (QCF Fonts)](#٥-البنية-التحتية-للخطوط-qcf-fonts)
6. [نظام الصوت والقرآن](#٦-نظام-الصوت-والقرآن)
7. [حالة خطة المصادقة (Authentication)](#٧-حالة-خطة-المصادقة-authentication)
8. [المهام العاجلة للمطور الجديد](#٨-المهام-العاجلة-للمطور-الجديد)
9. [أهم القواعد والملاحظات الحرجة](#٩-أهم-القواعد-والملاحظات-الحرجة)

---

## ١. نظرة عامة شاملة

### ما هو تطبيق "سَكِينَة"؟

تطبيق إسلامي متكامل يعمل على **الويب (PWA)** و **أندرويد (Capacitor)** ، يهدف إلى توفير:

- 🕌 **مواقيت الصلاة**: حساب دقيق لمواقيت الصلاة لأي موقع في العالم
- 📖 **المصحف الشريف**: قراءة كاملة للمصحف بالرسم العثماني (QCF v2)
- 🎧 **الاستماع للقرآن**: تشغيل تلاوات كبار القرّاء مع تحكم متقدم
- 📻 **البث المباشر**: إذاعات قرآنية مباشرة
- 🤖 **سكينة AI**: مساعد ذكي إسلامي يعمل بـ Gemini API
- 📿 **الأذكار**: أذكار الصباح والمساء والنوم وحصن المسلم
- ☀️ **الطقس**: عرض حالة الطقس للموقع الحالي
- 🔔 **الإشعارات**: تنبيهات لأوقات الصلاة والأذكار

### التقنيات المستخدمة

| التقنية | الاستخدام |
|---------|----------|
| **React 19** | مكتبة الواجهات الأمامية |
| **TypeScript 5.9** | لغة البرمجة الرئيسية |
| **Vite 7** | أداة البناء والتطوير |
| **Tailwind CSS 3** | إطار التنسيقات |
| **Express 5** | خادم API الخلفي |
| **Capacitor 8** | تحويل التطبيق إلى APK أصلي |
| **Google Gemini AI** | محرك الذكاء الاصطناعي |
| **Supabase** | (قيد الإعداد) منصة المصادقة |
| **Adhan.js** | حساب مواقيت الصلاة |
| **localforage** | التخزين المحلي المتقدم |
| **Motion (Framer Motion)** | الحركات والأنيميشن |
| **React-Markdown** | عرض الردود المنسقة من AI |
| **Leaflet** | خريطة تفاعلية لاختيار الموقع |

### بيئة العمل

| العنصر | الحالة |
|--------|--------|
| **السيرفر** | Express + Vite Middleware على端口 3000 |
| **الإصدار** | Commit `a4b380c` (متطابق مع GitHub) |
| **الخطوط** | 604 خط QCF v2 تُحمّل ديناميكياً من CDN |
| **حالة البيئة** | غير مستقرة (تحتاج سكريبتات حماية) |

---

## ٢. هيكل المشروع وبنية المجلدات

```
sakina/
├── index.html                  # نقطة الدخول للويب
├── package.json                # الاعتماديات والسكريبتات
├── tsconfig.json               # إعدادات TypeScript
├── vite.config.ts              # إعدادات Vite
├── tailwind.config.js          # إعدادات Tailwind
├── postcss.config.js           # إعدادات PostCSS
├── capacitor.config.ts         # إعدادات Capacitor (APK)
├── auth-plan.md                # خطة المصادقة (مهم جداً!)
├── sakeenah-plan.md            # خطة تطوير سكينة AI
├── metadata.json               # بيانات وصفية لـ AI Studio
├── rewrite.js                  # سكريبت مساعد (غير مكتمل)
│
├── public/
│   ├── fonts/
│   │   ├── qcf/                # تخزين محلي لـ p001.woff2, p002.woff2 فقط
│   │   ├── qcf-fonts-manifest.json  # دليل الخطوط على CDN
│   │   └── sura_names.woff2    # خط أسماء السور
│   ├── images/
│   │   ├── prayers/            # خلفيات الصلوات (6 صور)
│   │   ├── quran-calligraphy.svg
│   │   ├── quran-circle.png
│   │   ├── quran_artwork.jpg
│   │   ├── cairo_radio_artwork.jpg
│   │   └── sba_radio_artwork.jpg
│   └── data/mushaf/            # 604 ملف JSON (بيانات المصحف)
│
├── src/
│   ├── main.tsx                # نقطة الدخول للتطبيق
│   ├── App.tsx                 # المكون الرئيسي (975 سطر)
│   ├── index.css               # الأنماط العامة + قواعد Tailwind
│   ├── vite-env.d.ts           # تعريفات أنواع Vite
│   │
│   ├── cn.ts                   # دالة cn للـ classnames
│   │
│   ├── types/
│   │   ├── app.types.ts        # أنواع أساسية (PrayerKey, TabType...)
│   │   ├── quran.ts            # أنواع القرآن (Reciter, Moshaf, Verse...)
│   │   ├── radio.ts            # أنواع الراديو
│   │   └── prayer-settings.ts  # أنواع إعدادات الصلاة + قائمة المؤذنين
│   │
│   ├── constants/
│   │   ├── appVerses.ts        # الآيات المعروضة في التطبيق
│   │   ├── prayerContent.ts    # محتوى الصلوات (خلفيات، أدعية)
│   │   └── uiConstants.ts      # ثوابت الـ UI
│   │
│   ├── utils/
│   │   ├── cn.ts               # دالة cn
│   │   ├── prayerTimes.ts      # حساب مواقيت الصلاة (Adhan)
│   │   ├── locationDetection.ts# كشف طريقة الحساب والمذهب حسب الموقع
│   │   ├── timeHelpers.ts      # دوال مساعدة للوقت
│   │   └── audioCache.ts       # تخزين الصوت مؤقتاً
│   │
│   ├── services/
│   │   ├── QcfFontStorage.ts       # نظام تحميل الخطوط من CDN (291 سطر)
│   │   ├── MushafLayoutService.ts  # إدارة صفحات المصحف
│   │   ├── QuranMediaService.ts    # خدمة تشغيل القرآن
│   │   ├── RadioMediaService.ts    # خدمة تشغيل الراديو
│   │   ├── MediaSessionBridge.ts   # ربط مع Media Session API
│   │   ├── PrayerNotificationsService.ts # جدولة إشعارات الصلاة
│   │   └── QuranOfflineService.ts  # تحميل القرآن للتشغيل دون اتصال
│   │
│   ├── hooks/
│   │   └── useQcfFont.ts      # Hook لتحميل خطوط QCF
│   │
│   ├── components/
│   │   ├── SplashScreen.tsx        # شاشة البداية
│   │   ├── SettingsScreen.tsx      # شاشة الإعدادات (454 سطر)
│   │   ├── SakeenahAIScreen.tsx    # شاشة سكينة AI (965 سطر)
│   │   ├── QuranTabScreen.tsx      # شاشة التبويب الرئيسية للقرآن
│   │   ├── QuranRecitersScreen.tsx # شاشة اختيار القارئ
│   │   ├── QuranSurahsScreen.tsx   # شاشة قائمة السور
│   │   ├── QuranAudioPlayerScreen.tsx # مشغل الصوت
│   │   ├── QuranReaderScreen.tsx   # قارئ المصحف
│   │   ├── QuranReadingGatewayScreen.tsx # بوابة القراءة
│   │   ├── QuranDownloadScreen.tsx # تحميل القرآن
│   │   ├── QuranLiveBroadcast.tsx  # البث المباشر
│   │   ├── AzkarTabScreen.tsx      # شاشة الأذكار (279 سطر)
│   │   ├── AzkarCounterScreen.tsx  # عداد الأذكار
│   │   ├── AsmaAlHusnaScreen.tsx   # أسماء الله الحسنى
│   │   ├── PrayerSettingsScreen.tsx # إعدادات الصلاة
│   │   ├── PrayerCardSpeakerIcon.tsx # أيقونة السماعة
│   │   ├── WeatherDisplay.tsx      # عرض الطقس
│   │   ├── HadithCard.tsx          # بطاقة حديث اليوم
│   │   ├── QcfVerse.tsx            # عرض آية بخط QCF (110 سطر)
│   │   ├── ManualLocationDialog.tsx# حوار اختيار الموقع (164 سطر)
│   │   ├── MapLocationPicker.tsx   # اختيار الموقع من الخريطة
│   │   ├── MuezzinSelectorSection.tsx # اختيار المؤذن
│   │   ├── UnsavedChangesModal.tsx # حوار التغييرات غير المحفوظة
│   │   └── icons/AppIcons.tsx      # الأيقونات المخصصة
│   │
│   ├── data/
│   │   ├── surahNames.ts       # أسماء السور
│   │   ├── vocalizedSurahNames.ts # أسماء السور بالتشكيل
│   │   ├── quranTextDb.ts      # قاعدة نصوص القرآن
│   │   ├── azkarData.ts        # بيانات الأذكار
│   │   ├── hisnAlMuslimData.ts # بيانات حصن المسلم
│   │   ├── hisnAlMuslimFull.json # بيانات حصن المسلم كاملة
│   │   ├── dailyHadithData.ts  # حديث اليوم
│   │   ├── dailyTracker.ts     # متتبع المهام اليومية
│   │   ├── asmaAlHusnaData.ts  # أسماء الله الحسنى
│   │   ├── egyptLocations.ts   # المدن المصرية (250 مدينة)
│   │   ├── prayerContent.ts    # محتوى الصلوات
│   │   └── radioStations.ts    # محطات الراديو
│   │
│   └── server/
│       ├── index.ts            # خادم Express (41 سطر)
│       ├── types.ts            # أنواع API
│       ├── routes/
│       │   ├── reciters.ts     # API: قائمة القراء
│       │   ├── quran-reflection.ts # API: التدبر
│       │   └── sakeenah-ai.ts  # API: سكينة AI (57 سطر)
│       └── services/
│           ├── gemini-client.ts    # عميل Gemini
│           ├── sakeenah-ai-service.ts # خدمة AI (124 سطر)
│           └── reflection-service.ts # خدمة التدبر
│
├── scripts/
│   ├── download-qcf-fonts.js   # تحميل 604 خط QCF من quran.com
│   ├── pack-qcf-fonts.js       # تعبئة الخطوط للمستودع
│   ├── verify-fonts.js         # التحقق من سلامة الخطوط
│   └── fix-basmala-codes.js    # إصلاح رموز البسملة
│
├── android/                    # مشروع أندرويد (Capacitor)
│   ├── app/src/main/java/com/sakeenah/app/MainActivity.java
│   ├── app/src/main/res/raw/  # azan.wav, beep.wav
│   └── ... 
│
├── adhkar.json                 # بيانات الأذكار (JSON)
├── test-api.js, test-page.js, test-tafsir.js # ملفات اختبار
├── bun.lock, package-lock.json # قفل الاعتماديات
└── sakeenah-upload-key.jks     # مفتاح توقيع APK
```

---

## ٣. الاعتماديات (Dependencies)

### الاعتماديات الرئيسية (Dependencies)

| المكتبة | الإصدار | الوظيفة |
|---------|---------|---------|
| `react` | 19.2.6 | مكتبة الواجهات |
| `react-dom` | 19.2.6 | ربط React مع DOM |
| `@capacitor/core` | ^8.4.1 | نواة Capacitor |
| `@capacitor/filesystem` | ^8.1.2 | الوصول لنظام الملفات (للخطوط) |
| `@capacitor/local-notifications` | ^8.2.0 | الإشعارات المحلية |
| `@capgo/capacitor-zip` | ^8.1.16 | فك ضغط الملفات (للخطوط) |
| `@google/genai` | ^2.10.0 | مكتبة Gemini AI الرسمية |
| `adhan` | ^4.4.4 | حساب مواقيت الصلاة |
| `express` | ^5.2.1 | خادم الويب |
| `leaflet` + `react-leaflet` | ^1.9.4 / ^5.0.0 | الخرائط التفاعلية |
| `localforage` | ^1.10.0 | تخزين محلي متقدم (IndexedDB) |
| `lucide-react` | ^1.21.0 | أيقونات جميلة |
| `motion` | ^12.42.0 | أنيميشن (Framer Motion) |
| `clsx` + `tailwind-merge` | - | دمج كلاسات CSS |
| `react-markdown` + `remark-gfm` | - | عرض Markdown |

### اعتماديات التطوير (DevDependencies)

| المكتبة | الإصدار | الوظيفة |
|---------|---------|---------|
| `@capacitor/android` | ^8.4.2 | منصة أندرويد |
| `@capacitor/cli` | ^8.4.2 | واجهة أوامر Capacitor |
| `vite` | 7.3.2 | أداة البناء |
| `@vitejs/plugin-react` | 5.1.1 | دعم React في Vite |
| `typescript` | 5.9.3 | مترجم TypeScript |
| `tailwindcss` | ^3.4.17 | framework CSS |
| `tsx` | ^4.23.1 | تشغيل TypeScript للسيرفر |
| `esbuild` | ^0.28.1 | تجميع السيرفر |

### سكريبتات التشغيل

```bash
npm run dev          # تشغيل خادم التطوير (Express + Vite HMR)
npm run build        # بناء الإصدار النهائي (تحقق الخطوط + بناء Vite + بناء السيرفر)
npm start            # تشغيل الإصدار النهائي
npm run download-fonts  # تحميل خطوط QCF من quran.com
npm run pack-fonts      # التحقق من فونتات CDN
npm run verify-fonts    # التحقق من سلامة الخطوط
```

---

## ٤. شرح كل ملف بالتفصيل

### 4.1 ملفات الإعدادات الرئيسية

#### `index.html`
- نقطة الدخول الرئيسية
- لغة عربية (RTL)، دعم الـ PWA
- تحميل مسبق لصورة `quran-circle.png`

#### `vite.config.ts`
- يستخدم `@vitejs/plugin-react`
- يعمل على port **3000**، host `0.0.0.0`
- HMR مفعل، aliases `@/` → `./src/`
- base path = `./` (مهم لـ Capacitor)

#### `tsconfig.json`
- Target: ES2022
- JSX: react-jsx
- Strict mode غير مفعل (skipLibCheck: true)
- مسارات: `@/*` → `./src/*`

#### `tailwind.config.js`
- **خطوط مخصصة**: Cairo, Amiri, Amiri Quran, SuraNames
- **Safelist مهم**: يحتوي على كلاسيكيات ديناميكية تُستخدم في template literals
- ألوان التطبيق: البني `#2b1a10`، الذهبي `#b88a4f`، البيج `#ece7de`

#### `capacitor.config.ts`
- appId: `com.sakeenah.app`
- اسم التطبيق: "سكينة"
- SSL: https
- Mixed content مسموح (للبث المباشر HTTP)
- LocalNotifications مهيأة مع azan.wav

### 4.2 ملفات المصدر الرئيسية

#### `src/App.tsx` (975 سطر - القلب النابض)
- **المكون الرئيسي** الذي يدير كل حالة التطبيق
- يحتوي على:
  - 6 حالات لموقع المستخدم (cityName, cityLat, cityLon, calcMethod, asrSchool, isAutoLocation)
  - 4 حالات للتبويبات (main, azkar, quran, sakeenah-ai, settings)
  - 8 حالات للإشعارات (prayer, pre-prayer, mulk, baqarah)
  - حالة الطقس
  - إعدادات الصلاة لكل صلاة على حدة
- **المنطق الرئيسي**:
  - `prayerSchedule`: حساب مواقيت الصلاة (useMemo)
  - `state`: حساب الصلاة الحالية والتالية والعد التنازلي (useMemo)
  - إشعارات الصلاة تُجدول في useEffect
  - اكتشاف الموقع التلقائي عبر GPS
  - حفظ كل الإعدادات في localStorage
- **الشاشات**: شاشة البداية، عداد الأذكار، أسماء الله الحسنى، حوار الموقع، إعدادات الصلاة
- **التبويبات الخمسة**: الرئيسية، الأذكار، القرآن، سكينة AI، الإعدادات
- **الـ Bottom Navigation**: عائم مع أنيميشن (motion.div مع layoutId)

#### `src/main.tsx` (11 سطر)
- نقطة الدخول: ينشئ React root ويعرض App
- يستخدم StrictMode

#### `src/index.css` (287 سطر)
- **قواعد مهمة جداً**:
  - `@import` يجب أن يكون قبل Tailwind directives (⚠️ القاعدة #2)
  - **Immersive Mode**: لا يوجد Safe Area padding (⚠️ القاعدة #5)
  - إخفاء كل أشرطة التمرير (scrollbar-width: none)
  - أنيميشن الخلفية: `heroZoom` (تكبير بطيء)
  - أنيميشن الحلقة: `ringPulse`
  - كلاسات QCF: `.qcf-page`, `.qcf-line`, `.qcf-word`, `.qcf-highlighted`
  - خط `SuraNames` محمل محلياً
  - كلاس `shimmer-text` للمؤقت

### 4.3 خادم API (السيرفر الخلفي)

#### `src/server/index.ts` (41 سطر)
- Express server + Vite middleware mode
- 3 مسارات API: `/api/reciters`, `/api/quran`, `/api/sakeenah-ai`
- يعمل على port 3000
- في الإنتاج: يخدم ملفات `dist/index.html`

#### `src/server/routes/sakeenah-ai.ts` (57 سطر)
- نقطة النهاية `/api/sakeenah-ai/chat` (POST) - غير متدفق
- نقطة النهاية `/api/sakeenah-ai/chat/stream` (POST) - **SSE** (Server-Sent Events)
- يرسل الرسائل إلى خدمة AI ويتلقى الرد

#### `src/server/services/sakeenah-ai-service.ts` (124 سطر)
- **النظام الأهم في AI**: يحتوي على System Instruction بالعربية (5 نقاط)
- يستخدم نموذج `gemini-3.5-flash`
- درجة الحرارة (temperature): 0.1 (دقة عالية)
- دعم البث المباشر عبر SSE
- **هام**: إذا لم يكن هناك مفتاح Gemini، يعرض رسالة Offline

### 4.4 أنواع البيانات

#### `src/types/app.types.ts`
```typescript
PrayerKey = "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha"
TabType = "main" | "azkar" | "quran" | "sakeenah-ai" | "settings"
AzkarCounterType = "morning" | "evening" | "sleep" | "post_prayer" | "hisn"
```

#### `src/types/prayer-settings.ts` (117 سطر)
- **5 أوضاع للإشعارات**: beep, azan_short, azan_full, vibrate_only, silent
- **8 معرفات للصلاة**: fajr, dhuhr, asr, maghrib, isha, duha, midnight, tahajjud
- **15 مؤذناً** مدرجين مع روابط CDN (من الحرم المكي والمدني والأقصى ومصر)
- دوال: `loadPrayerPreferences()`, `savePrayerPreferences()`, `prayerKeyToSettingsId()`

### 4.5 الخدمات (Services)

#### `QcfFontStorage.ts` (291 سطر - من أهم الملفات)
- **البنية التحتية للخطوط**: Remote-First Architecture
- دعم منصتين: Web (localforage/IndexedDB) و Native (Capacitor Filesystem)
- 3 طرق لجلب الخط:
  1. IndexedDB للتخزين الدائم (PWA)
  2. `/fonts/qcf/` محلياً
  3. GitHub CDN: `https://raw.githubusercontent.com/mo01115285816-cyber/sakina/main/public/fonts/qcf/`
- تحميل ZIP بحجم 97MB من GitHub Releases
- فك الضغط عبر `@capgo/capacitor-zip` (Native فقط)
- التحقق من سلامة الملفات (حجم لا يقل عن 30,000 بايت)

#### `PrayerNotificationsService.ts` (335 سطر)
- إشعارات محلية عبر Capacitor أو Web Notification API
- 8 أنواع إشعارات: تذكير قبل الصلاة، وقت الصلاة، سورة الملك، سورة البقرة، الصلوات الثانوية
- دعم كامل للإعدادات الفردية لكل صلاة

#### `MushafLayoutService.ts` (105 سطر)
- تحميل 604 صفحة بيانات مصحف (من `/data/mushaf/page-XXX.json`)
- تخزين في IndexedDB مع إدارة الإصدارات
- تحميل متوازي (10 صفحات في المرة)

---

## ٥. البنية التحتية للخطوط (QCF Fonts)

### الهندسة المعمارية (Remote-First)

```
                        ┌─────────────────────────────────┐
                        │     المستودع المحلي (Git)       │
                        │  p001.woff2, p002.woff2 فقط     │
                        │  ~25KB إجمالاً                  │
                        └────────────────┬────────────────┘
                                         │
            ┌────────────────────────────┼────────────────────────────┐
            │                            │                            │
            ▼                            ▼                            ▼
   ┌─────────────────┐        ┌──────────────────┐       ┌──────────────────┐
   │  Web (PWA)      │        │  GitHub CDN       │       │  GitHub Releases  │
   │  IndexedDB      │◄───────│  (Raw)            │       │  ZIP (97MB)       │
   │  localforage    │        │  فردي لكل صفحة    │       │  لـ Native APK    │
   └─────────────────┘        └──────────────────┘       └──────────────────┘
```

**السبب**: تقليص حجم المستودع بنسبة 90%+ (من 90MB إلى ~25KB للخطوط المحلية)

### آلية العمل
1. عند التشغيل: تحميل مسبق لـ 5 صفحات (splash, fajr, maghrib, asr, isha, settings)
2. على الويب: يُخزّن في IndexedDB للتشغيل دون اتصال
3. على أندرويد: يُنزّل ZIP ويفك ضغطه في Filesystem.Data
4. الـ Hook `useQcfFont(pageNumber)` يدير التحميل والتركيب

---

## ٦. نظام الصوت والقرآن

### مشغل الصوت
- Audio element واحد مشترك (في `QuranTabScreen`)
- يدعم: تشغيل سور، بث مباشر، التحكم في الصوت والسرعة
- Media Session API للتحكم من شاشة القفل
- Sleep Timer لغلق الصوت بعد فترة
- ذاكرة مؤقتة للصوت عبر Service Worker Cache

### مشغل الراديو
- إذاعتان: القرآن الكريم من القاهرة، وسوا
- دعم البث المباشر عبر MP3 streams
- Media Session للتحكم

---

## ٧. حالة خطة المصادقة (Authentication)

### الملف المرجعي: `auth-plan.md`

#### ما تم إنجازه ✅
1. ✅ إنشاء حساب Supabase وربط المشروع
2. ✅ تخزين مفاتيح Gemini API في Edge Function Secrets في Supabase
3. ✅ تفعيل Google OAuth وإنشاء Client ID & Secret
4. ✅ إعداد خطة المصادقة الشاملة (7 مهمات)

#### ما لم يبدأ بعد ❌
```
المهمة 1: [ ] إعداد Supabase والبنية التحتية للمصادقة
المهمة 2: [ ] دمج شاشة تسجيل الدخول وتغيير الألوان
المهمة 3: [ ] طبقة المصادقة والتخزين الآمن للجلسات
المهمة 4: [ ] حماية شاشة سكينة AI وتوجيه المستخدم
المهمة 5: [ ] تحديث أيقونة الإعدادات لعرض بيانات المستخدم
المهمة 6: [ ] إضافة قسم بيانات الحساب وتسجيل الخروج
المهمة 7: [ ] تأمين الـ API Endpoints في السيرفر
```

### تفاصيل المهمة 1 - نقطة البداية
```
1. تثبيت @supabase/supabase-js
2. تثبيت @capacitor-community/secure-storage
3. إنشاء ملفات الخدمة: auth-service.ts, storage-service.ts
4. إعداد ملف .env بمفاتيح Supabase
```

> **⚠️ تنبيه هام**: مفاتيح Supabase و Google OAuth تم تجهيزها بالفعل على لوحة التحكم، لكن المفاتيح نفسها لا تظهر في الكود (لم يتم إعداد ملف `.env` بعد).

---

## ٨. المهام العاجلة للمطور الجديد

### الترتيب المقترح للبدء

#### 🥇 المرحلة الأولى: تثبيت المشروع وتشغيله

```bash
# 1. تثبيت الاعتماديات
npm install

# 2. إعداد ملف البيئة (اسأل المستخدم عن المفاتيح)
# إنشاء ملف .env.local بالمفاتيح التالية:
# GEMINI_API_KEY=your_gemini_key
# SUPABASE_URL=your_supabase_url
# SUPABASE_ANON_KEY=your_supabase_anon_key

# 3. تشغيل التطوير
npm run dev
```

#### 🥇 المرحلة الثانية: فهم المشروع بالكامل
- قراءة هذا التقرير 🎯
- دراسة ملف `auth-plan.md` و `sakeenah-plan.md`
- فحص كل ملف في `src/` لفهم تدفق البيانات
- تجربة التطبيق عملياً على المتصفح

#### 🥇 المرحلة الثالثة: تنفيذ خطة المصادقة (المهمة 1)

1. **تثبيت المكتبات**:
   ```bash
   npm install @supabase/supabase-js
   npm install @capacitor-community/secure-storage
   ```

2. **إنشاء ملف `.env`** بالمفاتيح (اطلب من المستخدم):
   ```
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOi...
   ```

3. **إنشاء خدمة التخزين الآمن** (`src/services/storage-service.ts`):
   - `saveSession(token)` و `getSession()` و `clearSession()`
   - للـ Native: Capacitor SecureStorage
   - للـ Web: localStorage

4. **إنشاء خدمة المصادقة** (`src/services/auth-service.ts`):
   - `signInWithGoogle()`, `signInWithEmail()`, `signOut()`, `getCurrentUser()`

5. **تحديث ملفات البيئة في Supabase Dashboard** إذا لزم الأمر

#### 🥈 المرحلة الرابعة: ضمان استقرار البيئة
- معرفة سبب عدم استقرار البيئة (الـ Reset)
- تطوير سكريبتات حماية للـ Watcher
- التأكد من حفظ التعديلات وعدم ضياعها

---

## ٩. أهم القواعد والملاحظات الحرجة

### القواعد التقنية الأساسية (مستخلصة من الكود)

| # | القاعدة | التفاصيل |
|---|---------|---------|
| **1** | **تنسيق لوحة المفاتيح** | قبل كل Push: ctrl+A → Format Document (Prettier) |
| **2** | **ترتيب ملف CSS** | `@import` أولاً، ثم `@tailwind`, ثم `@font-face` وأخيراً custom CSS |
| **3** | **Tailwind v3** | استخدم `@tailwind base/components/utilities` (ليس `@import "tailwindcss"` من v4) |
| **4** | **Capacitor** | لا تضع SystemBars أو StatusBar في capacitor.config.ts |
| **5** | **Immersive Mode** | لا Safe Area padding — الـ MainActivity.java يتحكم بالـ hideSystemBars() |
| **6** | **حساب DST يدوياً** | لا تعتمد على Intl.DateTimeFormat مع timeZone — tzdata قد لا يعرف DST 2026 |
| **7** | **Mixed Content** | مسموح به في capacitor.config.ts (للريديو والخطوط) |
| **8** | **Capacitor Plugin Import** | استخدم `Function('m', 'return import(m)')` للمكوّنات الإضافية (تجنب أخطاء Vite) |
| **9** | **مسار قاعدة Vite** | `base: './'` في vite.config.ts (للـ Capacitor) |

### اقتراحات للمطور الجديد

1. **ابدأ ببطء**: لا تقفز للكود مباشرة. افهم تدفق البيانات أولاً
2. **المفاتيح**: اسأل المستخدم عن مفاتيح Gemini و Supabase قبل المتابعة
3. **الاتصال بالمستخدم**: أبقِ المستخدم على اطلاع دائم بكل تغيير
4. **Git**: اعمل على فروع منفصلة، واطلب مراجعة قبل الميرج
5. **الاختبار**: بعد كل مهمة، اختبر التطبيق على المتصفح والمحمول
6. **الـ Watcher**: إذا كان الـ Reset مشكلة، استخدم سكريبت حماية

### ملفات يجب مراجعتها قبل البدء
| الملف | الأهمية |
|-------|---------|
| `auth-plan.md` | ⭐⭐⭐ خطة المصادقة كاملة |
| `sakeenah-plan.md` | ⭐⭐⭐ خطة تطوير AI |
| `src/App.tsx` | ⭐⭐⭐ المكون الرئيسي |
| `src/components/SakeenahAIScreen.tsx` | ⭐⭐ شاشة AI |
| `src/server/services/sakeenah-ai-service.ts` | ⭐⭐ خدمة AI الخلفية |
| `src/services/QcfFontStorage.ts` | ⭐ نظام الخطوط |
| `src/types/prayer-settings.ts` | ⭐ إعدادات الصلاة |

---

> **📌 ملاحظة ختامية**: مشروع "سَكِينَة" مشروع ضخم ومتكامل، جاهز بنسبة كبيرة للانتقال إلى المرحلة التالية. التركيز الآن يجب أن يكون على:
> 1. تثبيت المشروع وتشغيله محلياً
> 2. تنفيذ خطة المصادقة (المهمة 1 ← 7)
> 3. ضمان استقرار بيئة التطوير

> **بارك الله فيك يا مطوّر المستقبل 🌟**، اجعل هذا التقرير دليلك في رحلتك مع "سَكِينَة". والله الموفّق.
