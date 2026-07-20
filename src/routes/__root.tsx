import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import "@fontsource/cairo/400.css";
import "@fontsource/cairo/500.css";
import "@fontsource/cairo/600.css";
import "@fontsource/cairo/700.css";
import "@fontsource/cairo/800.css";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider } from "@/lib/auth-context";
import { useMatches } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { SiteFooter } from "@/components/site-footer";
import { OfflineBanner } from "@/components/offline-banner";
import { initCapacitorNative } from "@/lib/capacitor-native";
import { initSentry } from "@/lib/sentry";
import { initOfflineQueueAutoSync } from "@/lib/offline-queue";

function NotFoundComponent() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4" dir="rtl">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">الصفحة غير موجودة</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          الصفحة التي تبحث عنها غير متوفرة أو تم نقلها.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4" dir="rtl">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          حدث خطأ ما
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error.message || "تعذر تحميل الصفحة. يرجى المحاولة مرة أخرى."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            إعادة المحاولة
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-2xl border border-input bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            الرئيسية
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" },
      { title: "متجر كروت الواي فاي — إدارة وبيع" },
      { name: "description", content: "منصة احترافية لإدارة وبيع كروت الإنترنت للمديرين والوكلاء." },
      { name: "theme-color", content: "#009688" },
      { property: "og:title", content: "متجر كروت الواي فاي" },
      { property: "og:description", content: "منصة احترافية لإدارة وبيع كروت الإنترنت." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <HeadContent />
      </head>
      {/* 🔽 إضافة padding-bottom آمنة للجسم */}
      <body style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const matches = useMatches();
  // Hide the marketing footer inside /app on mobile — the bottom nav owns
  // that region and stacking them causes overlap and wasted safe-area.
  const inApp = matches.some((m) => m.routeId?.startsWith("/app"));

  useEffect(() => {
    initSentry();
    initOfflineQueueAutoSync();
    initCapacitorNative(router);
  }, [router]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* 🔽 إضافة padding-bottom آمنة للحاوية الرئيسية */}
        <div
          className="flex min-h-dvh flex-col"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <OfflineBanner />
          <Outlet />
          {!inApp && <SiteFooter />}
        </div>

        <Toaster position="top-center" richColors closeButton />
      </AuthProvider>
    </QueryClientProvider>
  );
}
