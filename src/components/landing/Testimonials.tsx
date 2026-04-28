import { useEffect, useRef, useState } from "react";
import { Star, Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type T = {
  id: string;
  name: string;
  role: string | null;
  text: string;
  rating: number;
  avatar_color: string | null;
  card_color: string | null;
};

const SPEED_PX_PER_SEC = 55;

const Testimonials = () => {
  const [items, setItems] = useState<T[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const halfWidthRef = useRef(0);

  useEffect(() => {
    supabase
      .from("testimonials")
      .select("*")
      .eq("published", true)
      .order("sort_order")
      .then(({ data }) => setItems((data as T[]) || []));
  }, []);

  useEffect(() => {
    if (items.length === 0) return;

    const measure = () => {
      if (trackRef.current) {
        // العنصر الذي يمثل بداية النسخة الثانية تم وسمه بـ data-loop-mid
        const mid = trackRef.current.querySelector<HTMLElement>("[data-loop-mid]");
        if (mid) {
          // المسافة من بداية التراك حتى بداية أول بطاقة في النسخة الثانية
          // = عرض النسخة الأولى + الـ gap الذي يفصل بينها وبين النسخة الثانية
          halfWidthRef.current = mid.offsetLeft;
        } else {
          halfWidthRef.current = trackRef.current.scrollWidth / 2;
        }
      }
    };
    requestAnimationFrame(measure);
    window.addEventListener("resize", measure);

    let last = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (halfWidthRef.current === 0) measure();

      if (halfWidthRef.current > 0) {
        offsetRef.current -= SPEED_PX_PER_SEC * dt;
        if (offsetRef.current <= -halfWidthRef.current) {
          offsetRef.current += halfWidthRef.current;
        }
        if (trackRef.current) {
          trackRef.current.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, [items.length]);

  if (items.length === 0) return null;

  // كل بطاقة 360px + gap 24px = 384px. نحرص أن تكون النسخة الواحدة أعرض من الشاشة
  // حتى يبقى السلسلة متصلة بدون فراغ مهما كان حجم الشاشة.
  const CARD_W = 384;
  const viewportW = typeof window !== "undefined" ? window.innerWidth : 1920;
  const cardsNeeded = Math.ceil((viewportW + CARD_W) / CARD_W) + 2; // هامش أمان
  const MIN_REPEATS = Math.max(2, Math.ceil(cardsNeeded / items.length));
  const single: T[] = [];
  for (let i = 0; i < MIN_REPEATS; i++) single.push(...items);
  // نسختان متطابقتان للوب السلس
  const loop = [...single, ...single];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* خلفية ناعمة */}
      <div className="absolute inset-0 -z-10 opacity-60">
        <div className="absolute top-10 right-1/4 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-10 left-1/4 w-72 h-72 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-block bg-mint-soft text-mint px-4 py-1.5 rounded-full text-sm font-bold mb-4 animate-fade-in">
            ⭐ آراء العائلات
          </span>
          <h2 className="font-display text-4xl lg:text-5xl mb-4">
            عائلات سعيدة <span className="text-gradient">تتحدث عنا</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            انضم لآلاف العائلات اللي اختارت منصتنا لتعليم أطفالها العبرية.
          </p>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative w-full overflow-hidden select-none py-4 pointer-events-none"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
        }}
      >
        <div
          ref={trackRef}
          dir="ltr"
          className="flex gap-6 w-max will-change-transform"
          style={{ transform: "translate3d(0,0,0)" }}
        >
          {loop.map((t, i) => (
            <div
              key={`${t.id}-${i}`}
              {...(i === single.length ? { "data-loop-mid": "true" } : {})}
              className="group relative bg-card rounded-3xl p-6 border border-border/50 shadow-soft hover:shadow-glow w-[360px] shrink-0 pointer-events-auto transition-all duration-500 hover:-translate-y-2 hover:border-primary/40 hover:scale-[1.02]"
            >
              {/* تدرّج زخرفي يظهر عند الـ hover */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              {/* أيقونة الاقتباس */}
              <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-primary-gradient flex items-center justify-center shadow-soft transform rotate-0 group-hover:rotate-12 transition-transform duration-500">
                <Quote className="w-5 h-5 text-white" />
              </div>

              <div className="relative">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: t.rating || 5 }).map((_, s) => (
                    <Star
                      key={s}
                      className="w-4 h-4 fill-accent text-accent transition-transform duration-300 group-hover:scale-110"
                      style={{ transitionDelay: `${s * 40}ms` }}
                    />
                  ))}
                </div>

                <p className="text-foreground/90 leading-relaxed mb-4 line-clamp-4 min-h-[6rem]">
                  "{t.text}"
                </p>

                <div className="flex items-center gap-3 pt-3 border-t border-border/50">
                  <div className="relative">
                    <div
                      className={`w-11 h-11 rounded-full ${
                        t.avatar_color || "bg-primary-gradient"
                      } flex items-center justify-center text-white font-display text-lg shadow-soft`}
                    >
                      {t.name[0]}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-mint border-2 border-card" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{t.name}</p>
                    {t.role && (
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
