import type { CapacitorConfig } from "@capacitor/cli";

// ⚠️ رابط الخادم (Render / Custom Domain). يُستخدم داخل www/index.html
// للتحقق من جاهزية الخادم قبل التحويل — بدل استخدام server.url الذي
// يعرض شاشة بيضاء عندما يكون الخادم في وضع Cold Start.
const config: CapacitorConfig = {
  appId: "com.mofeed.wificards",
  appName: "متجر كروت الواي فاي",
  
  // 💡 تأكد أن هذا المجلد هو المجلد الفعلي الذي تتجمع فيه ملفاتك النهائية
  webDir: "www", 

  server: {
    androidScheme: "https",
    // تم تفعيلها لضمان عدم حظر أي طلبات HTTP فرعية أثناء فحص الاتصال بالشبكة
    cleartext: true, 
    allowNavigation: [
      "arabic-layout-project.onrender.com",
      "*.onrender.com",
      "*.supabase.co",
      "*.lovable.app",
    ],
  },
  android: {
    allowMixedContent: true, // للسماح بتحميل الصور أو السكريبتات المختلطة إن وجدت
    backgroundColor: "#009688",
    // 🛠️ يمكنك تحويلها لـ true إذا كنت بحاجة لفحص الـ WebView عبر متصفح الكروم بالكمبيوتر أثناء التطوير
    webContentsDebuggingEnabled: false, 
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: false,
      backgroundColor: "#009688",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      spinnerColor: "#ffffff",
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      backgroundColor: "#009688",
      style: "LIGHT",
      // ممتاز جداً! تفعيل هذا الخيار يجعل التصميم يتداخل مع الحواف (Edge-to-edge) 
      // ويتوافق تماماً مع حزمة safe-area-fix التي تعمل عليها بالـ CSS
      overlaysWebView: true,
    },
    App: {
      launchUrl: "https://arabic-layout-project.onrender.com",
    },
  },
};

export default config;