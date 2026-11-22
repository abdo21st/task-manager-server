<div dir="rtl" align="right">

# دليل نشر خادم إدارة المهام وربط تسجيل الدخول بحساب Google (Gmail)

## 1. إعداد Google Cloud Console (لتسجيل الدخول بحساب Gmail)
1. افتح [Google Cloud Console](https://console.cloud.google.com) وأنشئ مشروعاً جديداً.
2. من **APIs & Services > OAuth consent screen**: اختر **External** وأدخل اسم التطبيق والبريد الإلكتروني.
3. من **APIs & Services > Credentials > Create Credentials > OAuth client ID**:
   - **العميل الأول (Web application)**: انسخ الـ **Client ID** — هذا هو `GOOGLE_WEB_CLIENT_ID` الذي يُستخدم في السيرفر وفي التطبيق.
   - **العميل الثاني (Android)**:
     - Package name: `com.example.taskmanager`
     - SHA-1 certificate fingerprint: استخرجه بالأمر التالي من مجلد `task-manager-app`:
       ```powershell
       .\gradlew.bat signingReport
       ```
       *(ملاحظة: عند نشر نسخة إنتاج موقّعة، أضف بصمة SHA-1 الخاصة بمفتاح Release أيضاً).*

## 2. نشر السيرفر على Coolify مع PostgreSQL
1. ارفع مجلد `task-manager-server` إلى مستودع Git (أو استخدمه مباشرة في Coolify كـ Dockerfile).
2. أنشئ قاعدة بيانات **PostgreSQL** في Coolify وانسخ رابط الاتصال `DATABASE_URL`.
3. أضف متغيرات البيئة التالية في Coolify:
   - `DATABASE_URL`: رابط PostgreSQL
   - `GOOGLE_WEB_CLIENT_ID`: معرّف عميل الويب من الخطوة 1
   - `JWT_SECRET`: مفتاح سري عشوائي طويل (32 حرفاً على الأقل)
4. بعد أول تشغيل، نفّذ أمر إنشاء الجداول في Terminal الحاوية داخل Coolify:
   ```bash
   npx prisma db push
   ```
5. تحقق من الجاهزية بفتح: `https://your-server-domain.com/api/health`

## 3. ربط تطبيق الأندرويد بسيرفرك
أضف السطرين التاليين في ملف `task-manager-app/local.properties`:
```properties
API_BASE_URL=https://your-server-domain.com
GOOGLE_WEB_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
```
ثم أعد بناء ملف APK:
```powershell
.\gradlew.bat assembleDebug
```

</div>
