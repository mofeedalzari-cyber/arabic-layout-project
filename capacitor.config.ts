import type { CapacitorConfig } from "@capacitor/cli";

// ⚠️ رابط الخادم (Render / Custom Domain). يُستخدم داخل www/index.html
// للتحقق من جاهزية الخادم قبل التحويل — بدل استخدام server.url الذي
// يعرض شاشة بيضاء عندما يكون الخادم في وضع Cold Start.
const config: CapacitorConfig = {
  appId: "com.mofeed.wificards",
  appName: "متجر كروت الواي فاي",
  webDir: "www",
  // ملاحظة: لا تضع server.url هنا — سيؤدي إلى شاشة بيضاء عند بطء الخادم.
  // بدلاً من ذلك www/index.html يتولى فحص الاتصال والتوجيه الذكي.
  server: {
    androidScheme: "https",
    cleartext: false,
    allowNavigation: [
      "arabic-layout-project.onrender.com",
      "*.onrender.com",
      "*.supabase.co",
      "*.lovable.app",
    ],
  },
  android: {
    allowMixedContent: false,
    backgroundColor: "#009688",
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
      // Edge-to-edge — WebView يمتد خلف شريط الحالة، ونستخدم safe-area-insets داخل CSS
      overlaysWebView: true,
    },
    App: {
      launchUrl: "https://arabic-layout-project.onrender.com",
    },
  },
};

export default config;
