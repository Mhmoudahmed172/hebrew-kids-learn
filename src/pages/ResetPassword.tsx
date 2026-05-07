import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validSession, setValidSession] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Detect recovery flow from URL hash
    const hash = window.location.hash;
    if (hash.includes("type=recovery") || hash.includes("access_token")) {
      setValidSession(true);
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setValidSession(!!session);
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "كلمة المرور قصيرة", description: "6 أحرف على الأقل.", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "كلمتا المرور غير متطابقتين", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast({ title: "تم تحديث كلمة المرور! ✨" });
      navigate("/");
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main dir="rtl" className="min-h-screen bg-hero-gradient flex items-center justify-center p-4">
      <div className="bg-card rounded-3xl p-8 lg:p-10 shadow-glow border border-border/50 w-full max-w-md">
        <div className="flex items-center justify-center gap-2 font-display font-extrabold text-xl mb-6">
          <img src={logo} alt="عبري ببساطة" className="w-10 h-10 rounded-full ring-2 ring-accent/40 object-cover" />
          <span className="text-gradient">عبري ببساطة</span>
        </div>

        <div className="text-center mb-6">
          <h2 className="font-display text-2xl mb-2">إعادة تعيين كلمة المرور 🔐</h2>
          <p className="text-sm text-muted-foreground">أدخل كلمة المرور الجديدة.</p>
        </div>

        {!validSession ? (
          <div className="text-center text-sm text-destructive">
            رابط غير صالح أو منتهي. <a href="/forgot-password" className="text-primary font-bold">طلب رابط جديد</a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-sm font-bold mb-1.5 block">كلمة المرور الجديدة</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type={show ? "text" : "password"} placeholder="••••••••" value={password}
                  onChange={(e) => setPassword(e.target.value)} className="pr-10 pl-10 h-12 rounded-xl" dir="ltr" />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label className="text-sm font-bold mb-1.5 block">تأكيد كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type={show ? "text" : "password"} placeholder="••••••••" value={confirm}
                  onChange={(e) => setConfirm(e.target.value)} className="pr-10 h-12 rounded-xl" dir="ltr" />
              </div>
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={submitting}>
              <Sparkles />
              {submitting ? "جاري الحفظ..." : "حفظ كلمة المرور"}
              <ArrowRight />
            </Button>
          </form>
        )}
      </div>
    </main>
  );
};

export default ResetPassword;
