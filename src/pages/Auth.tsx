import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Sparkles, Mail, Lock, User, ArrowRight, Eye, EyeOff, Baby, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

type Mode = "login" | "signup";

const Auth = ({ mode: initialMode }: { mode: Mode }) => {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [showPwd, setShowPwd] = useState(false);
  const [role, setRole] = useState<"kid" | "parent">("kid");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", age: "" });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/login") setMode("login");
    if (location.pathname === "/signup") setMode("signup");
  }, [location.pathname]);

  // Redirect if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/", { replace: true });
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password || (mode === "signup" && !form.name)) {
      toast({ title: "حقول ناقصة", description: "يرجى تعبئة جميع الحقول.", variant: "destructive" });
      return;
    }
    if (form.password.length < 6) {
      toast({ title: "كلمة المرور قصيرة", description: "6 أحرف على الأقل.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { full_name: form.name, age: form.age || null, role },
          },
        });
        if (error) throw error;
        toast({ title: "تم إنشاء الحساب! 🌟", description: "أهلاً بك في منصة عبرية." });
        navigate("/");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
        toast({ title: "أهلاً بعودتك! 🎉" });
        navigate("/");
      }
    } catch (err: any) {
      const msg = err?.message?.includes("already registered")
        ? "هذا البريد مسجّل مسبقاً."
        : err?.message?.includes("Invalid login")
        ? "البريد أو كلمة المرور غير صحيحة."
        : err?.message || "حدث خطأ.";
      toast({ title: "خطأ", description: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    navigate(m === "login" ? "/login" : "/signup", { replace: true });
  };

  return (
    <main dir="rtl" className="min-h-screen bg-hero-gradient relative overflow-hidden flex items-center justify-center py-10 px-4">
      <div className="blob bg-primary/30 w-96 h-96 -top-20 -right-20" />
      <div className="blob bg-accent/30 w-96 h-96 -bottom-20 -left-20" />

      <div className="relative w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
        <div className="hidden lg:block text-right">
          <Link to="/" className="inline-flex items-center gap-2 font-display font-extrabold text-2xl mb-8">
            <img src={logo} alt="عبري ببساطة" className="w-12 h-12 rounded-full ring-2 ring-accent/40 object-cover" />
            <span className="text-gradient">منصة عبرية</span>
          </Link>
          <h1 className="font-display text-4xl xl:text-5xl mb-4 leading-tight">
            ابدأ رحلة طفلك في تعلّم <span className="text-gradient-fun">العبرية</span> بمرح!
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            انضم لآلاف العائلات واكتشف عالماً مليئاً بالدروس التفاعلية.
          </p>
        </div>

        <div className="bg-card rounded-3xl p-8 lg:p-10 shadow-glow border border-border/50">
          <div className="flex bg-muted/50 p-1.5 rounded-2xl mb-6">
            <button onClick={() => switchMode("login")}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-bounce ${mode === "login" ? "bg-card shadow-soft text-primary" : "text-muted-foreground"}`}>
              تسجيل الدخول
            </button>
            <button onClick={() => switchMode("signup")}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-bounce ${mode === "signup" ? "bg-card shadow-soft text-primary" : "text-muted-foreground"}`}>
              إنشاء حساب
            </button>
          </div>

          <div className="text-center mb-6">
            <h2 className="font-display text-2xl mb-1">
              {mode === "login" ? "أهلاً بعودتك! 👋" : "مرحباً بك معنا! ✨"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                <div>
                  <Label className="mb-2 block text-sm font-bold">من سيستخدم الحساب؟</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setRole("kid")}
                      className={`p-4 rounded-2xl border-2 transition-bounce flex flex-col items-center gap-2 ${role === "kid" ? "border-pink bg-pink-soft" : "border-border"}`}>
                      <Baby className={`w-6 h-6 ${role === "kid" ? "text-pink" : "text-muted-foreground"}`} />
                      <span className="text-sm font-bold">طفل</span>
                    </button>
                    <button type="button" onClick={() => setRole("parent")}
                      className={`p-4 rounded-2xl border-2 transition-bounce flex flex-col items-center gap-2 ${role === "parent" ? "border-secondary bg-secondary-soft" : "border-border"}`}>
                      <Users className={`w-6 h-6 ${role === "parent" ? "text-secondary" : "text-muted-foreground"}`} />
                      <span className="text-sm font-bold">ولي أمر</span>
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="name" className="text-sm font-bold mb-1.5 block">الاسم الكامل</Label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="name" placeholder="أدخل اسمك" value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })} className="pr-10 h-12 rounded-xl" />
                  </div>
                </div>

                {role === "kid" && (
                  <div>
                    <Label htmlFor="age" className="text-sm font-bold mb-1.5 block">العمر</Label>
                    <Input id="age" type="number" min={3} max={15} placeholder="مثال: 8" value={form.age}
                      onChange={(e) => setForm({ ...form, age: e.target.value })} className="h-12 rounded-xl" />
                  </div>
                )}
              </>
            )}

            <div>
              <Label htmlFor="email" className="text-sm font-bold mb-1.5 block">البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="example@email.com" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} className="pr-10 h-12 rounded-xl" dir="ltr" />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-bold mb-1.5 block">كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="password" type={showPwd ? "text" : "password"} placeholder="••••••••" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} className="pr-10 pl-10 h-12 rounded-xl" dir="ltr" />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === "login" && (
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-xs font-bold text-primary hover:underline">
                  نسيت كلمة المرور؟
                </Link>
              </div>
            )}

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={submitting}>
              <Sparkles />
              {submitting ? "جاري المعالجة..." : mode === "login" ? "دخول" : "إنشاء الحساب"}
              <ArrowRight />
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default Auth;
