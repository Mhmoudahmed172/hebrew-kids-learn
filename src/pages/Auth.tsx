import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Sparkles, Mail, Lock, User, ArrowRight, Eye, EyeOff, Baby, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import mascot from "@/assets/mascot-owl.png";

type Mode = "login" | "signup";

const Auth = ({ mode: initialMode }: { mode: Mode }) => {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [showPwd, setShowPwd] = useState(false);
  const [role, setRole] = useState<"kid" | "parent">("kid");
  const [form, setForm] = useState({ name: "", email: "", password: "", age: "" });
  const navigate = useNavigate();
  const location = useLocation();

  // Sync mode with route
  if (location.pathname === "/login" && mode !== "login") setMode("login");
  if (location.pathname === "/signup" && mode !== "signup") setMode("signup");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password || (mode === "signup" && !form.name)) {
      toast({ title: "حقول ناقصة", description: "يرجى تعبئة جميع الحقول المطلوبة.", variant: "destructive" });
      return;
    }
    if (form.password.length < 6) {
      toast({ title: "كلمة المرور قصيرة", description: "يجب أن تكون 6 أحرف على الأقل.", variant: "destructive" });
      return;
    }
    toast({
      title: mode === "login" ? "أهلاً بعودتك! 🎉" : "تم إنشاء الحساب بنجاح! 🌟",
      description: mode === "login" ? "جاري تسجيل الدخول..." : "ابدأ مغامرتك مع تعلم العبرية.",
    });
    setTimeout(() => navigate("/"), 800);
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    navigate(m === "login" ? "/login" : "/signup", { replace: true });
  };

  return (
    <main className="min-h-screen bg-hero-gradient relative overflow-hidden flex items-center justify-center py-10 px-4">
      <div className="blob bg-primary/30 w-96 h-96 -top-20 -right-20" />
      <div className="blob bg-accent/30 w-96 h-96 -bottom-20 -left-20" />
      <div className="blob bg-pink/20 w-72 h-72 top-1/2 right-1/3" />

      <div className="relative w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Side panel */}
        <div className="hidden lg:block text-center lg:text-right">
          <Link to="/" className="inline-flex items-center gap-2 font-display font-extrabold text-2xl mb-8">
            <img src={mascot} alt="" className="w-12 h-12" />
            <span className="text-gradient">منصة عبرية</span>
          </Link>
          <h1 className="font-display text-4xl xl:text-5xl mb-4 leading-tight">
            ابدأ رحلة طفلك في تعلّم <span className="text-gradient-fun">العبرية</span> بمرح!
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            انضم لآلاف العائلات واكتشف عالماً مليئاً بالدروس التفاعلية والألعاب الممتعة.
          </p>
          <div className="space-y-4">
            {[
              { icon: "🎬", text: "+200 درس فيديو ممتع" },
              { icon: "🎮", text: "+50 لعبة تعليمية تفاعلية" },
              { icon: "🏆", text: "نظام شارات ومكافآت" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 bg-card/70 backdrop-blur p-4 rounded-2xl shadow-soft">
                <span className="text-3xl">{f.icon}</span>
                <span className="font-bold">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form card */}
        <div className="bg-card rounded-3xl p-8 lg:p-10 shadow-glow border border-border/50">
          <Link to="/" className="lg:hidden flex items-center justify-center gap-2 font-display font-extrabold text-xl mb-6">
            <img src={mascot} alt="" className="w-10 h-10" />
            <span className="text-gradient">منصة عبرية</span>
          </Link>

          {/* Tabs */}
          <div className="flex bg-muted/50 p-1.5 rounded-2xl mb-6">
            <button
              onClick={() => switchMode("login")}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-bounce ${
                mode === "login" ? "bg-card shadow-soft text-primary" : "text-muted-foreground"
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              onClick={() => switchMode("signup")}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-bounce ${
                mode === "signup" ? "bg-card shadow-soft text-primary" : "text-muted-foreground"
              }`}
            >
              إنشاء حساب
            </button>
          </div>

          <div className="text-center mb-6">
            <h2 className="font-display text-2xl mb-1">
              {mode === "login" ? "أهلاً بعودتك! 👋" : "مرحباً بك معنا! ✨"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {mode === "login" ? "سجّل دخولك لمواصلة رحلتك التعليمية" : "أنشئ حسابك المجاني وابدأ التعلم"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                {/* Role selector */}
                <div>
                  <Label className="mb-2 block text-sm font-bold">من سيستخدم الحساب؟</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole("kid")}
                      className={`p-4 rounded-2xl border-2 transition-bounce flex flex-col items-center gap-2 ${
                        role === "kid" ? "border-pink bg-pink-soft" : "border-border hover:border-border/80"
                      }`}
                    >
                      <Baby className={`w-6 h-6 ${role === "kid" ? "text-pink" : "text-muted-foreground"}`} />
                      <span className="text-sm font-bold">طفل</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("parent")}
                      className={`p-4 rounded-2xl border-2 transition-bounce flex flex-col items-center gap-2 ${
                        role === "parent" ? "border-secondary bg-secondary-soft" : "border-border hover:border-border/80"
                      }`}
                    >
                      <Users className={`w-6 h-6 ${role === "parent" ? "text-secondary" : "text-muted-foreground"}`} />
                      <span className="text-sm font-bold">ولي أمر</span>
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="name" className="text-sm font-bold mb-1.5 block">الاسم الكامل</Label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="أدخل اسمك"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="pr-10 h-12 rounded-xl"
                    />
                  </div>
                </div>

                {role === "kid" && (
                  <div>
                    <Label htmlFor="age" className="text-sm font-bold mb-1.5 block">العمر</Label>
                    <Input
                      id="age"
                      type="number"
                      min={3}
                      max={15}
                      placeholder="مثال: 8"
                      value={form.age}
                      onChange={(e) => setForm({ ...form, age: e.target.value })}
                      className="h-12 rounded-xl"
                    />
                  </div>
                )}
              </>
            )}

            <div>
              <Label htmlFor="email" className="text-sm font-bold mb-1.5 block">البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="pr-10 h-12 rounded-xl"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-bold mb-1.5 block">كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="pr-10 pl-10 h-12 rounded-xl"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === "login" && (
              <div className="flex justify-end">
                <button type="button" className="text-xs font-bold text-primary hover:underline">
                  نسيت كلمة المرور؟
                </button>
              </div>
            )}

            <Button type="submit" variant="hero" size="lg" className="w-full">
              <Sparkles />
              {mode === "login" ? "دخول" : "إنشاء الحساب"}
              <ArrowRight />
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">أو</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button
            type="button"
            onClick={() => toast({ title: "قريباً!", description: "تسجيل الدخول عبر Google سيكون متاحاً قريباً." })}
            className="w-full h-12 rounded-xl border-2 border-border hover:border-primary/40 hover:bg-primary-soft/30 transition-bounce flex items-center justify-center gap-3 font-bold text-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
            </svg>
            المتابعة باستخدام Google
          </button>

          <p className="text-center text-xs text-muted-foreground mt-6">
            بإنشاء الحساب فأنت توافق على{" "}
            <a className="text-primary font-bold hover:underline" href="#">شروط الاستخدام</a> و
            <a className="text-primary font-bold hover:underline mr-1" href="#">سياسة الخصوصية</a>.
          </p>
        </div>
      </div>
    </main>
  );
};

export default Auth;
