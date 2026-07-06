import { translateError } from "@/lib/errorMessages";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight, Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.webp";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: "أدخل بريدك الإلكتروني", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "https://learnsimplyhebrew.com/reset-password",
      });
      if (error) throw error;
      setSent(true);
      toast({ title: "تم إرسال الرابط! 📧", description: "افحص بريدك الإلكتروني." });
    } catch (err: any) {
      toast({ title: "خطأ", description: translateError(err), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main dir="rtl" className="min-h-screen bg-hero-gradient flex items-center justify-center p-4">
      <div className="bg-card rounded-3xl p-8 lg:p-10 shadow-glow border border-border/50 w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 font-display font-extrabold text-xl mb-6">
          <img src={logo} alt="عبري ببساطة" className="w-10 h-10 rounded-full ring-2 ring-accent/40 object-cover" />
          <span className="text-gradient">عبري ببساطة</span>
        </Link>

        <div className="text-center mb-6">
          <h2 className="font-display text-2xl mb-2">نسيت كلمة المرور؟ 🔑</h2>
          <p className="text-sm text-muted-foreground">
            أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.
          </p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-mint-soft flex items-center justify-center">
              <Mail className="w-10 h-10 text-mint" />
            </div>
            <p className="font-bold">تحقق من بريدك الإلكتروني</p>
            <p className="text-sm text-muted-foreground">
              أرسلنا رابطاً لإعادة تعيين كلمة المرور إلى <strong>{email}</strong>
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/login"><ArrowLeft className="w-4 h-4" /> العودة لتسجيل الدخول</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-bold mb-1.5 block">البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="example@email.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} className="pr-10 h-12 rounded-xl" dir="ltr" />
              </div>
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={submitting}>
              <Sparkles />
              {submitting ? "جاري الإرسال..." : "إرسال رابط الاستعادة"}
              <ArrowRight />
            </Button>
            <Link to="/login" className="block text-center text-sm font-bold text-primary hover:underline">
              العودة لتسجيل الدخول
            </Link>
          </form>
        )}
      </div>
    </main>
  );
};

export default ForgotPassword;
