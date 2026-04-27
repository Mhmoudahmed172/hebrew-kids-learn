import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, KeyRound, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const LinkParent = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (!loading && !user) { navigate("/login"); return null; }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) { toast.error("الكود يجب أن يكون 6 أحرف"); return; }
    setSubmitting(true);
    const { error } = await supabase.rpc("link_kid_with_code", { invite_code: code.trim() });
    setSubmitting(false);
    if (error) { toast.error("كود غير صالح أو منتهي"); return; }
    setDone(true);
    toast.success("تم الربط بنجاح! 🎉");
  };

  return (
    <main dir="rtl" className="min-h-screen bg-background">
      <Navbar />
      <section className="container py-10 max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-primary mb-6 hover:underline">
          <ArrowRight className="w-4 h-4 rotate-180" /> العودة للرئيسية
        </Link>

        <div className="bg-card border-2 border-border/60 rounded-3xl p-8 text-center">
          {done ? (
            <>
              <CheckCircle2 className="w-16 h-16 mx-auto text-secondary mb-4" />
              <h1 className="font-display text-3xl mb-2">تم الربط! 🎉</h1>
              <p className="text-muted-foreground mb-6">أصبح أحد والديك يستطيع متابعة تقدمك.</p>
              <Button variant="hero" asChild><Link to="/">ابدأ التعلم</Link></Button>
            </>
          ) : (
            <>
              <KeyRound className="w-16 h-16 mx-auto text-primary mb-4" />
              <h1 className="font-display text-3xl mb-2">ربط بحساب أهلك</h1>
              <p className="text-muted-foreground mb-6">أدخل الكود الذي حصلت عليه من والديك (6 أحرف)</p>
              <form onSubmit={submit} className="space-y-4">
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
                  placeholder="ABC123"
                  className="text-center text-2xl font-mono tracking-widest h-14"
                  maxLength={6}
                  required
                />
                <Button type="submit" variant="hero" size="lg" className="w-full" disabled={submitting}>
                  {submitting ? "جاري الربط..." : "تأكيد الربط"}
                </Button>
              </form>
            </>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default LinkParent;
