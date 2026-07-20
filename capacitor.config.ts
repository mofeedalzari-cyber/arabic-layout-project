import type { CapacitorConfig } from "@capacitor/cli";

// ⚠️ رابط الخادم (Render / Custom Domain). يُستخدم داخل www/index.html
// للتحقق من جاهزية الخادم قبل التحويل — بدل استخدام server.url الذي
// يعرض شاشة بيضاء عندما يكون الخادم في وضع Cold Start.
const config: CapacitorConfig = {
  appId: "com.mofeed.wificards",
  appName: "متجر كروت الواي فاي",
<<<<<<< HEAD
  
  // 💡 تأكد أن هذا المجلد هو المجلد الفعلي الذي تتجمع فيه ملفاتك النهائية
  webDir: "www", 

  server: {
    androidScheme: "https",
    // تم تفعيلها لضمان عدم حظر أي طلبات HTTP فرعية أثناء فحص الاتصال بالشبكة
    cleartext: true, 
=======
  webDir: "www",
  // ملاحظة: لا تضع server.url هنا — سيؤدي إلى شاشة بيضاء عند بطء الخادم.
  // بدلاً من ذلك www/index.html يتولى فحص الاتصال والتوجيه الذكي.
  server: {
    androidScheme: "https",
    cleartext: false,
>>>>>>> 621c85ef577c36db50a8848189feb16dcfae6c8a
    allowNavigation: [
      "arabic-layout-project.onrender.com",
      "*.onrender.com",
      "*.supabase.co",
      "*.lovable.app",
    ],
  },
  android: {
<<<<<<< HEAD
    allowMixedContent: true, // للسماح بتحميل الصور أو السكريبتات المختلطة إن وجدت
    backgroundColor: "#009688",
    // 🛠️ يمكنك تحويلها لـ true إذا كنت بحاجة لفحص الـ WebView عبر متصفح الكروم بالكمبيوتر أثناء التطوير
    webContentsDebuggingEnabled: false, 
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: false,
=======
    allowMixedContent: false,
    backgroundColor: "#009688",
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
>>>>>>> 621c85ef577c36db50a8848189feb16dcfae6c8a
      backgroundColor: "#009688",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      spinnerColor: "#ffffff",
<<<<<<< HEAD
      splashFullScreen: true,
      splashImmersive: true,
=======
      splashFullScreen: false,
      splashImmersive: false,
>>>>>>> 621c85ef577c36db50a8848189feb16dcfae6c8a
    },
    StatusBar: {
      backgroundColor: "#009688",
      style: "LIGHT",
<<<<<<< HEAD
      // ممتاز جداً! تفعيل هذا الخيار يجعل التصميم يتداخل مع الحواف (Edge-to-edge) 
      // ويتوافق تماماً مع حزمة safe-area-fix التي تعمل عليها بالـ CSS
      overlaysWebView: true,
=======
      overlaysWebView: false,
>>>>>>> 621c85ef577c36db50a8848189feb16dcfae6c8a
    },
    App: {
      launchUrl: "https://arabic-layout-project.onrender.com",
    },
  },
};

<<<<<<< HEAD
export default config;
=======
export default config;
>>>>>>> 621c85ef577c36db50a8848189feb16dcfae6c8a
