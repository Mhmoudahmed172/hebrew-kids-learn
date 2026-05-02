import { useEffect, useState } from "react";
import { Check, Lock, ArrowLeft, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Levels = () => {
  const [levels, setLevels] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from("levels")
      .select("*")
      .eq("published", true)
      .order("sort_order")
      .then(({ data }) => setLevels(data || []));
  }, []);

  return (
    <section id="levels" className="py-24 bg-background">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <span className="inline-block text-xs font-semibold tracking-wider uppercase text-primary bg-primary-soft px-3 py-1 rounded-full mb-4">
            المستويات
          </span>
          <h2 className="font-display text-3xl lg:text-5xl tracking-tight mb-4">
            مسار واضح من الحرف الأول حتى الطلاقة
          </h2>
          <p className="text-muted-foreground text-lg">
            مستويات متدرّجة تناسب الأطفال واليافعين والكبار — ابدأ من حيث تشاء.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {levels.length === 0 &&
            [1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-40 rounded-2xl bg-muted animate-pulse" />
            ))}

          {levels.map((lvl, i) => {
            const locked = i > 2;
            const completed = i === 0;
            const inProgress = i === 1;

            return (
              <Link
                key={lvl.id}
                to={locked ? "#" : `/level/${lvl.slug}`}
                className={`group relative bg-white border rounded-2xl p-5 transition-smooth ${
                  locked
                    ? "border-border opacity-60 cursor-not-allowed"
                    : "border-border hover:border-primary/40 hover:shadow-medium"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold ${
                      completed
                        ? "bg-accent-soft text-accent"
                        : inProgress
                          ? "bg-primary-soft text-primary"
                          : locked
                            ? "bg-muted text-muted-foreground"
                            : "bg-muted text-foreground"
                    }`}
                  >
                    {locked ? (
                      <Lock className="w-4 h-4" />
                    ) : completed ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <BookOpen className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">
                    المستوى {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                <h3 className="font-display text-lg mb-1.5 leading-tight">{lvl.title}</h3>
                {lvl.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                    {lvl.description}
                  </p>
                )}

                {/* Status row */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  {completed && (
                    <span className="text-xs font-semibold text-accent inline-flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> مكتمل
                    </span>
                  )}
                  {inProgress && (
                    <div className="flex-1 ml-3">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-muted-foreground font-medium">التقدّم</span>
                        <span className="font-bold">45%</span>
                      </div>
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div className="h-full w-[45%] bg-primary rounded-full" />
                      </div>
                    </div>
                  )}
                  {!completed && !inProgress && (
                    <span className="text-xs font-semibold text-muted-foreground">
                      {locked ? "مغلق" : "ابدأ"}
                    </span>
                  )}
                  {!locked && (
                    <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:-translate-x-1 transition-smooth" />
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Stats — minimal */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            { v: "+200", l: "درس مدروس" },
            { v: "+50", l: "تمرين تفاعلي" },
            { v: "+10K", l: "متعلّم نشط" },
            { v: "4.8★", l: "تقييم المستخدمين" },
          ].map((s) => (
            <div
              key={s.l}
              className="bg-white border border-border rounded-xl p-5 text-center hover:border-primary/40 transition-smooth"
            >
              <div className="font-display text-2xl lg:text-3xl text-foreground">{s.v}</div>
              <div className="text-xs text-muted-foreground font-medium mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Levels;
