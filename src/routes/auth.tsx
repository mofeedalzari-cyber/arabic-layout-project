import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, usernameToEmail } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import { Eye, EyeOff, Bike, Network, ChevronLeft, User as UserIcon, Mail, Phone, MessageCircle } from "lucide-react";
import logo from "@/assets/wifi-store-logo.png";

export const Route = createFileRoute("/auth")({ component: AuthPage });

const APP_NAME = "متجر كروت الواي فاي";
const phoneSchema = z.string().trim().min(6, "رقم الهاتف غير صحيح").max(20).regex(/^[0-9+\-\s]+$/, "أرقام فقط");
const passwordSchema = z.string().min(6, "6 أحرف على الأقل").max(72);

type AccountType = "agent" | "network";

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [accountType, setAccountType] = useState<AccountType>("agent");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [networks, setNetworks] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => { if (!loading && user) navigate({ to: "/app" }); }, [loading, user, navigate]);

  useEffect(() => {
    if (mode === "register" && accountType === "agent") {
      (supabase.rpc as any)("list_active_networks").then(({ data }: any) => {
        setNetworks((data as { id: string; name: string }[]) ?? []);
      });
    }
  }, [mode, accountType]);

  // login
  const [loginPhone, setLoginPhone] = useState("");
  const [loginP, setLoginP] = useState("");
  // register
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regNet, setRegNet] = useState("");
  const [regP, setRegP] = useState("");
  const [regP2, setRegP2] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const identifier = loginPhone.trim();
    const p = passwordSchema.safeParse(loginP);
    if (!identifier) return toast.error("أدخل رقم الجوال");
    if (!p.success) return toast.error(p.error.issues[0].message);
    setBusy(true);
    const { data: username, error: rpcErr } = await (supabase.rpc as any)("username_from_phone", { _phone: identifier });
    const loginName = (username as string | null) ?? (/^[a-zA-Z0-9._-]{3,30}$/.test(identifier) ? identifier : null);
    if (rpcErr || !loginName) { setBusy(false); return toast.error("رقم الجوال غير مسجّل"); }
    const { error } = await supabase.auth.signInWithPassword({ email: usernameToEmail(loginName), password: p.data });
    setBusy(false);
    if (error) return toast.error("رقم الجوال أو كلمة المرور غير صحيحة");
    toast.success("تم تسجيل الدخول");
    navigate({ to: "/app" });
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    const ph = phoneSchema.safeParse(regPhone);
    const p = passwordSchema.safeParse(regP);
    if (!regName.trim()) return toast.error("أدخل الاسم الرباعي");
    if (!ph.success) return toast.error(ph.error.issues[0].message);
    if (accountType === "network" && !regNet.trim()) return toast.error("أدخل اسم الشبكة");
    if (!p.success) return toast.error(p.error.issues[0].message);
    if (regP !== regP2) return toast.error("كلمة المرور غير متطابقة");
    // username derived from phone (backend-safe)
    const username = `u${ph.data.replace(/\D/g, "")}`.slice(0, 30);
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: usernameToEmail(username), password: p.data,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { username, full_name: regName.trim(), phone: ph.data, account_type: accountType, network_name: regNet.trim() || null },
      },
    });
    setBusy(false);
    if (error) {
      if (error.message.toLowerCase().includes("registered")) return toast.error("رقم الجوال مستخدم من قبل");
      return toast.error(error.message);
    }
    toast.success("تم إنشاء الحساب! سيتم تفعيله من قبل المدير قبل البدء.");
    setMode("login"); setLoginPhone(ph.data); setLoginP("");
  }

  const typeLabel = accountType === "agent" ? "مندوب توزيع" : "وكيل / مدير شبكة";

  return (
    <div dir="rtl" className="min-h-screen bg-[#eaf7ef] px-4 py-6 flex items-start justify-center">
      <div className="w-full max-w-md">
        {mode === "login" ? (
          <div className="bg-white rounded-[28px] shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)] p-6 pb-8">
            <BrandHeader subtitle="قم بتسجيل الدخول." />







            <form onSubmit={handleLogin} className="space-y-3">
              <SoftInput dir="rtl" value={loginPhone} onChange={(e) => setLoginPhone(e.target.value)} placeholder="رقم الجوال" inputMode="tel" autoComplete="tel" />
              <div className="relative">
                <SoftInput dir="rtl" type={showPwd ? "text" : "password"} value={loginP} onChange={(e) => setLoginP(e.target.value)} placeholder="كلمة المرور" autoComplete="current-password" className="pl-11" />
                <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  {showPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <div className="text-left">
                <button type="button" className="text-teal-700 text-sm font-medium hover:underline">هل نسيت كلمة المرور؟</button>
              </div>

              <Button type="submit" disabled={busy} className="w-full h-14 rounded-2xl bg-[#22a06b] hover:bg-[#1c8a5b] text-white text-lg font-bold shadow-none">
                {busy ? "…" : "تسجيل الدخول"}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-gray-700">
              لا تملك حساب ؟{" "}
              <button onClick={() => setSheetOpen(true)} className="text-teal-700 font-semibold underline underline-offset-4">
                انقر هنا لإنشاء حساب
              </button>
            </p>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-center text-sm text-gray-700 mb-3">بحاجة لمساعدة؟ تواصل مع خدمة العملاء:</p>
              <div className="flex items-center justify-center gap-3">
                <ContactBtn><Mail className="h-5 w-5" /></ContactBtn>
                <ContactBtn><Phone className="h-5 w-5" /></ContactBtn>
                <ContactBtn><MessageCircle className="h-5 w-5" /></ContactBtn>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[28px] shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)] p-6 pb-8">
            <BrandHeader subtitle="أنشئ حسابك وابدأ إدارة أعمالك فوراً." />

            <div className="flex items-start justify-between gap-3 mb-1">
              <button onClick={() => setSheetOpen(true)} className="text-teal-700 font-semibold text-sm hover:underline shrink-0 mt-1">تغيير النوع</button>
              <h2 className="text-2xl font-bold leading-tight text-right">إنشاء حساب {typeLabel}</h2>
            </div>
            <p className="text-gray-600 text-sm text-right mb-5">
              {accountType === "network" ? "أدخل بياناتك واسم شبكتك للبدء." : "أدخل بياناتك للبدء."}
            </p>

            <form onSubmit={handleRegister} className="space-y-3">
              <SoftInput dir="rtl" value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="الاسم الرباعي" autoComplete="name" />
              <SoftInput dir="rtl" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} placeholder="رقم الجوال" inputMode="tel" autoComplete="tel" />
              {accountType === "network" ? (
                <SoftInput dir="rtl" value={regNet} onChange={(e) => setRegNet(e.target.value)} placeholder="اسم شبكتك" />
              ) : (
                <select
                  dir="rtl"
                  value={regNet}
                  onChange={(e) => setRegNet(e.target.value)}
                  className="w-full h-14 rounded-2xl bg-gray-100 border-0 text-right text-base placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-teal-600 px-4"
                >
                  <option value="">اختر الشبكة التي تتبع لها</option>
                  {networks.map((n) => (
                    <option key={n.id} value={n.name}>{n.name}</option>
                  ))}
                </select>
              )}
              <div className="relative">
                <SoftInput dir="rtl" type={showPwd ? "text" : "password"} value={regP} onChange={(e) => setRegP(e.target.value)} placeholder="كلمة المرور" autoComplete="new-password" className="pl-11" />
                <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  {showPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <div className="relative">
                <SoftInput dir="rtl" type={showPwd2 ? "text" : "password"} value={regP2} onChange={(e) => setRegP2(e.target.value)} placeholder="تأكيد كلمة المرور" autoComplete="new-password" className="pl-11" />
                <button type="button" onClick={() => setShowPwd2((v) => !v)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  {showPwd2 ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <Button type="submit" disabled={busy} className="w-full h-14 rounded-2xl bg-[#22a06b] hover:bg-[#1c8a5b] text-white text-lg font-bold shadow-none mt-2">
                {busy ? "…" : "إنشاء الحساب"}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-gray-700">
              لديك حساب بالفعل ؟{" "}
              <button onClick={() => setMode("login")} className="text-teal-700 font-semibold underline underline-offset-4">
                اضغط هنا لتسجيل الدخول
              </button>
            </p>
          </div>
        )}
      </div>

      {/* Account type bottom sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-[28px] p-6 max-w-md mx-auto" dir="rtl">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-center text-2xl font-bold">اختر نوع الحساب</SheetTitle>
          </SheetHeader>
          <div className="space-y-3">
            <TypeRow
              icon={<UserIcon className="h-6 w-6 text-white" />}
              iconBg="bg-teal-700"
              title="مندوب توزيع"
              desc="بيع الكروت والتوزيع الميداني"
              onClick={() => { setAccountType("agent"); setMode("register"); setSheetOpen(false); }}
            />
            <TypeRow
              icon={<UserIcon className="h-6 w-6 text-white" />}
              iconBg="bg-[#22a06b]"
              title="وكيل / مدير شبكة"
              desc="إدارة الشبكة ومتابعة مبيعات المناديب"
              onClick={() => { setAccountType("network"); setMode("register"); setSheetOpen(false); }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function BrandHeader({ subtitle }: { subtitle: string }) {
  return (
    <div className="flex flex-col items-center text-center mb-5">
      <img src={logo} alt={APP_NAME} width={96} height={96} className="h-20 w-20 object-contain" />
      <h1 className="text-3xl font-extrabold tracking-tight mt-1 text-gray-900">{APP_NAME}</h1>
      <p className="text-gray-600 mt-2 text-base">{subtitle}</p>
    </div>
  );
}

function TypeCard({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 rounded-2xl p-4 h-32 transition ${
        active
          ? "bg-teal-50 border-2 border-teal-600 shadow-[0_0_0_4px_rgba(13,148,136,0.08)]"
          : "bg-gray-100 border-2 border-transparent"
      }`}
    >
      <div className={`h-12 w-12 rounded-full flex items-center justify-center ${active ? "bg-teal-700 text-white" : "bg-gray-300 text-gray-500"}`}>
        {icon}
      </div>
      <div className={`text-sm font-bold leading-tight ${active ? "text-gray-900" : "text-gray-600"}`}>{label}</div>
    </button>
  );
}

function SoftInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return (
    <Input
      {...rest}
      className={`h-14 rounded-2xl bg-gray-100 border-0 text-right text-base placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-teal-600 ${className}`}
    />
  );
}

function ContactBtn({ children }: { children: React.ReactNode }) {
  return (
    <button type="button" className="h-11 w-11 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center hover:bg-gray-200">
      {children}
    </button>
  );
}

function TypeRow({ icon, iconBg, title, desc, onClick }: { icon: React.ReactNode; iconBg: string; title: string; desc: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 text-right">
      <ChevronLeft className="h-5 w-5 text-gray-400 shrink-0" />
      <div className="flex-1">
        <div className="text-xl font-bold text-gray-900">{title}</div>
        <div className="text-sm text-gray-600 mt-0.5">{desc}</div>
      </div>
      <div className={`h-14 w-14 rounded-full ${iconBg} flex items-center justify-center shrink-0`}>{icon}</div>
    </button>
  );
}
