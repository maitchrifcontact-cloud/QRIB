# QREB — قريب | النسخة الكاملة الأولية

هذا المشروع هو **MVP كامل من ناحية الهيكلة**: تطبيق Android/iOS/Web بـ Expo، تسجيل الدخول، ملف المستخدم، المنشورات، البحث، الرسائل التجريبية، ونشر المنشورات، مع قاعدة بيانات Supabase جاهزة للحسابات والمنشورات والإعجابات والتعليقات والتبليغات والإعلانات والإشعارات.

## 1) التثبيت على PC
- ثبّت Node.js LTS.
- فك الضغط.
- افتح Terminal داخل مجلد `QREB-COMPLETE`.
- نفّذ:
  `npm install`
  `npx expo start`

## 2) ربط قاعدة البيانات
- أنشئ مشروع Supabase.
- افتح SQL Editor ونفّذ `supabase/schema.sql`.
- انسخ `.env.example` إلى `.env`.
- ضع `EXPO_PUBLIC_SUPABASE_URL` و `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
- أعد تشغيل Expo.

## 3) إخراج APK للتجربة
`npm install -g eas-cli`
`eas login`
`eas build:configure`
`eas build --platform android --profile preview`

## 4) Google Play
للإصدار النهائي:
`eas build --platform android --profile production`

## ما تبقى قبل الإطلاق التجاري
- ربط Storage لرفع الصور والفيديو.
- رسائل حقيقية Realtime.
- إشعارات Push حقيقية.
- خرائط وموقع المستخدم بعد أخذ الإذن.
- لوحة Admin منفصلة بصلاحيات آمنة.
- نظام الإعلانات والدفع/الاشتراكات.
- التبليغ والحظر ومراجعة المحتوى.
- سياسة الخصوصية وشروط الاستخدام.
- اختبارات أمنية وأداء، وتجهيز صفحة Google Play ومواد المتجر.

**مهم:** لا تضع `service_role` key داخل تطبيق الهاتف. استعمل فقط `anon key` في التطبيق، والعمليات الحساسة تكون في الخادم/Edge Functions.
