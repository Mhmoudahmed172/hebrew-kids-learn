import { Button } from "@/components/ui/button";
import { ArrowLeft, PlayCircle, Check, BookOpen, Award, Users } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-hero-gradient">
      {/* Subtle grid backdrop */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
        aria-hidden
      />

      <div className="container relative pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Copy */}
          <div className="lg:col-span-7 text-center lg:text-right space-y-7">
            <div className="inline-flex items-center gap-2 bg-white border border-border px-3 py-1.5 rounded-full text-xs font-semibold text-muted-foreground shadow-soft">
              <span className="w-1.5 h-1.5 rounded-full bg-mint" />
              منصة تعليمية حديثة لكل الأعمار
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.08] tracking-tight">
              تعلّم العبرية
              <br />
              <span className="text-gradient">بطريقة بسيطة وواضحة</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
              دروس قصيرة، تمارين تفاعلية، ومتابعة تقدّم منظّمة — مصمّمة بعناية للأطفال واليافعين والكبار.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Button variant="default" size="lg" asChild>
                <Link to="/signup">
                  ابدأ التعلّم مجاناً <ArrowLeft className="w-4 h-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg">
                <PlayCircle className="w-4 h-4" /> شاهد كيف تعمل
              </Button>
            </div>

            <ul className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
              {["بدون إعلانات", "محتوى آمن", "إلغاء في أي وقت"].map((t) => (
                <li key={t} className="inline-flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-accent" /> {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Visual: clean dashboard preview card */}
          <div className="lg:col-span-5">
            <div className="relative max-w-md mx-auto">
              <div className="absolute -inset-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl blur-2xl" aria-hidden />

              <div className="relative bg-white border border-border rounded-2xl shadow-medium overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary-soft text-primary flex items-center justify-center">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold leading-none">الدرس 4</p>
                      <p className="text-xs text-muted-foreground mt-0.5">الحروف الأساسية</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-accent bg-accent-soft px-2 py-1 rounded-md">
                    قيد التقدّم
                  </span>
                </div>

                {/* Letter card */}
                <div className="px-5 py-6 text-center bg-muted/40 border-b border-border">
                  <div className="font-display text-7xl text-foreground mb-2">שׁ</div>
                  <p className="text-sm text-muted-foreground">شين — تُلفظ "Sh"</p>
                </div>

                {/* Options */}
                <div className="p-5 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">اختر النطق الصحيح</p>
                  {[
                    { t: "Sh", correct: true },
                    { t: "S" },
                    { t: "Z" },
                  ].map((o) => (
                    <button
                      key={o.t}
                      className={`w-full text-right px-4 py-2.5 rounded-lg border text-sm font-semibold transition-smooth ${
                        o.correct
                          ? "border-accent bg-accent-soft text-accent"
                          : "border-border bg-white hover:border-primary/40 hover:bg-primary-soft/40"
                      }`}
                    >
                      {o.correct && <Check className="inline w-4 h-4 ml-2" />}
                      {o.t}
                    </button>
                  ))}
                </div>

                {/* Progress footer */}
                <div className="px-5 py-4 border-t border-border bg-white">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-muted-foreground">التقدّم</span>
                    <span className="font-bold text-foreground">68%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-[68%] bg-primary rounded-full" />
                  </div>
                </div>
              </div>

              {/* Floating stat chips */}
              <div className="absolute -top-4 -right-4 bg-white border border-border rounded-xl px-3 py-2 shadow-soft flex items-center gap-2">
                <Award className="w-4 h-4 text-accent" />
                <span className="text-xs font-bold">+12 نقطة</span>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white border border-border rounded-xl px-3 py-2 shadow-soft flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold">+10K متعلّم</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
