import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, XCircle, Trophy } from "lucide-react";
import LockedContent from "@/components/LockedContent";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { recordProgress } from "@/hooks/useUserPoints";
import { toast } from "sonner";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { cn } from "@/lib/utils";

const Quiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canPlay, loading: permsLoading } = usePermissions();
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const { data: q } = await supabase.from("quizzes").select("*").eq("id", id).maybeSingle();
      const { data: qs } = await supabase.from("quiz_questions").select("*").eq("quiz_id", id).order("sort_order");
      setQuiz(q);
      setQuestions(qs || []);
      setLoading(false);
    })();
  }, [id]);

  if (loading || permsLoading) return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;
  if (!quiz) return <div className="min-h-screen flex items-center justify-center">الاختبار غير موجود</div>;

  if (!canPlay("quiz", quiz.id, quiz.level_id)) {
    return (
      <main dir="rtl" className="min-h-screen bg-background">
        <Navbar />
        <section className="container py-20">
          <div className="max-w-md mx-auto text-center bg-card rounded-3xl p-10 border-2 border-border">
            <Lock className="w-14 h-14 text-muted-foreground mx-auto mb-4" />
            <h1 className="font-display text-2xl mb-2">الاختبار مقفل</h1>
            <p className="text-muted-foreground mb-6">لا تملك صلاحية الدخول لهذا الاختبار. تواصل مع المشرف لمنحك الصلاحية.</p>
            <Button variant="hero" onClick={() => navigate(-1)}>رجوع</Button>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  const q = questions[current];
  const total = questions.length;

  const submit = () => {
    if (selected === null) return;
    setRevealed(true);
    if (selected === q.correct_index) setScore((s) => s + 1);
  };

  const next = async () => {
    if (current + 1 >= total) {
      setDone(true);
      if (user && quiz) {
        const { error } = await recordProgress({
          userId: user.id,
          contentType: "quiz",
          contentId: quiz.id,
          levelId: quiz.level_id,
          score,
          maxScore: total,
        });
        if (!error) toast.success(`+${score * 5} نقطة! 🎉`);
      }
    } else {
      setCurrent(current + 1);
      setSelected(null);
      setRevealed(false);
    }
  };

  return (
    <main dir="rtl" className="min-h-screen bg-background">
      <Navbar />
      <section className="container py-10 max-w-2xl">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-bold text-primary mb-6 hover:underline">
          <ArrowRight className="w-4 h-4 rotate-180" /> رجوع
        </button>

        <div className="text-center mb-8">
          <h1 className="font-display text-3xl mb-2">{quiz.title}</h1>
          {quiz.description && <p className="text-muted-foreground">{quiz.description}</p>}
        </div>

        {total === 0 ? (
          <p className="text-center text-muted-foreground py-20">لا توجد أسئلة في هذا الاختبار.</p>
        ) : done ? (
          <div className="bg-card border-2 border-border rounded-3xl p-10 text-center">
            <Trophy className="w-20 h-20 mx-auto text-primary mb-4" />
            <h2 className="font-display text-3xl mb-2">أحسنت!</h2>
            <p className="text-xl mb-6">نتيجتك: <span className="font-bold text-primary">{score} / {total}</span></p>
            <Button variant="hero" onClick={() => navigate(-1)}>العودة</Button>
          </div>
        ) : (
          <div className="bg-card border-2 border-border rounded-3xl p-6">
            <p className="text-sm text-muted-foreground mb-2">سؤال {current + 1} من {total}</p>
            <h2 className="font-display text-2xl mb-6">{q.question}</h2>
            <div className="space-y-3">
              {(q.options as string[]).map((opt, i) => {
                const isCorrect = i === q.correct_index;
                const isSelected = i === selected;
                return (
                  <button
                    key={i}
                    disabled={revealed}
                    onClick={() => setSelected(i)}
                    className={cn(
                      "w-full text-right p-4 rounded-2xl border-2 transition-all flex items-center justify-between",
                      !revealed && isSelected && "border-primary bg-primary/10",
                      !revealed && !isSelected && "border-border hover:border-primary/40",
                      revealed && isCorrect && "border-secondary bg-secondary/20",
                      revealed && isSelected && !isCorrect && "border-destructive bg-destructive/10",
                      revealed && !isSelected && !isCorrect && "border-border opacity-60"
                    )}
                  >
                    <span className="font-medium">{opt}</span>
                    {revealed && isCorrect && <CheckCircle2 className="w-5 h-5 text-secondary" />}
                    {revealed && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-destructive" />}
                  </button>
                );
              })}
            </div>
            <div className="mt-6 flex justify-end">
              {!revealed ? (
                <Button variant="hero" onClick={submit} disabled={selected === null}>تحقق</Button>
              ) : (
                <Button variant="hero" onClick={next}>{current + 1 >= total ? "إنهاء" : "السؤال التالي"}</Button>
              )}
            </div>
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
};

export default Quiz;
