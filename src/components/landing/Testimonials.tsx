import { useEffect, useRef, useState } from "react";
import { Star, RotateCcw, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

type T = {
  id: string;
  name: string;
  role: string | null;
  text: string;
  rating: number;
  avatar_color: string | null;
  card_color: string | null;
};

const MESSAGE_DELAY = 1600; // ms بين كل رسالة وأخرى

const Testimonials = () => {
  const [items, setItems] = useState<T[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [runId, setRunId] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase
      .from("testimonials")
      .select("*")
      .eq("published", true)
      .order("sort_order")
      .then(({ data }) => setItems((data as T[]) || []));
  }, []);

  // التشغيل التدريجي + إعادة تلقائية
  useEffect(() => {
    if (items.length === 0) return;
    setVisibleCount(0);
    setFinished(false);

    const timers: number[] = [];
    items.forEach((_, idx) => {
      const t = window.setTimeout(() => {
        setVisibleCount(idx + 1);
        if (idx === items.length - 1) {
          window.setTimeout(() => setFinished(true), 700);
        }
      }, MESSAGE_DELAY * (idx + 1));
      timers.push(t);
    });

    // إعادة تلقائية بعد انتهاء كل الرسائل
    const restart = window.setTimeout(() => {
      setRunId((r) => r + 1);
    }, MESSAGE_DELAY * items.length + 3500);
    timers.push(restart);

    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [items, runId]);

  // تمرير تلقائي للأسفل عند ظهور رسالة جديدة
  useEffect(() => {
    if (visibleCount > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [visibleCount, finished]);

  if (items.length === 0) return null;

  

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block bg-mint-soft text-mint px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            ⭐ آراء العائلات
          </span>
          <h2 className="font-display text-4xl lg:text-5xl mb-4">
            عائلات سعيدة <span className="text-gradient">تتحدث عنا</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            رسائل حقيقية من أهالي أطفالنا 💬
          </p>
        </div>

        {/* إطار الدردشة */}
        <div className="max-w-2xl mx-auto bg-gradient-to-b from-primary-soft/40 to-background rounded-3xl border border-border/50 shadow-soft overflow-hidden">
          {/* هيدر شات */}
          <div className="flex items-center gap-3 px-5 py-3 bg-card border-b border-border/50">
            <div className="w-10 h-10 rounded-full bg-primary-gradient flex items-center justify-center text-white font-display">
              ع
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">عائلاتنا</p>
              <p className="text-xs text-mint flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-mint inline-block" />
                {visibleCount < items.length ? "يكتب الآن…" : "متصل الآن"}
              </p>
            </div>
          </div>

          {/* الرسائل */}
          <div
            className="px-4 sm:px-6 py-6 space-y-4 max-h-[560px] overflow-y-auto"
            style={{
              backgroundImage:
                "radial-gradient(hsl(var(--primary) / 0.06) 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
          >
            {items.slice(0, visibleCount).map((t, i) => {
              const isRight = i % 2 === 0; // يمين / شمال بالتناوب
              return (
                <div
                  key={`${runId}-${t.id}`}
                  className={`flex items-end gap-2 animate-fade-in ${
                    isRight ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isRight && (
                    <div
                      className={`w-8 h-8 rounded-full ${
                        t.avatar_color || "bg-primary-gradient"
                      } flex items-center justify-center text-white text-xs font-bold shrink-0`}
                    >
                      {t.name[0]}
                    </div>
                  )}

                  <div
                    className={`relative max-w-[78%] px-4 py-2.5 shadow-soft ${
                      isRight
                        ? "bg-primary-gradient text-primary-foreground rounded-2xl rounded-br-sm"
                        : "bg-card text-foreground rounded-2xl rounded-bl-sm border border-border/50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <p className={`font-bold text-xs ${isRight ? "text-white/90" : "text-primary"}`}>
                        {t.name}
                        {t.role && (
                          <span className={`font-normal mx-1 ${isRight ? "text-white/70" : "text-muted-foreground"}`}>
                            · {t.role}
                          </span>
                        )}
                      </p>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: t.rating || 5 }).map((_, s) => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${
                              isRight ? "fill-white text-white" : "fill-accent text-accent"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed">{t.text}</p>
                    <div
                      className={`flex items-center gap-1 justify-end mt-1 text-[10px] ${
                        isRight ? "text-white/70" : "text-muted-foreground"
                      }`}
                    >
                      <span>الآن</span>
                      <Check className="w-3 h-3" />
                      <Check className="w-3 h-3 -mr-2" />
                    </div>
                  </div>

                  {isRight && (
                    <div
                      className={`w-8 h-8 rounded-full ${
                        t.avatar_color || "bg-primary-gradient"
                      } flex items-center justify-center text-white text-xs font-bold shrink-0`}
                    >
                      {t.name[0]}
                    </div>
                  )}
                </div>
              );
            })}

            {/* مؤشر "يكتب الآن" */}
            {visibleCount < items.length && (
              <div className="flex items-end gap-2 animate-fade-in">
                <div className="bg-card border border-border/50 rounded-2xl rounded-bl-sm px-4 py-3 shadow-soft">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce" />
                  </div>
                </div>
              </div>
            )}


            <div ref={bottomRef} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
