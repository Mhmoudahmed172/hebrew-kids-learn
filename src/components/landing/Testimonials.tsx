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

const Testimonials = () => {
  const [items, setItems] = useState<T[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const speedRef = useRef(1); // 1 = السرعة الطبيعية، سالب = للخلف، 0 = توقف
  const hoveringRef = useRef(false);
  const halfWidthRef = useRef(0);

  useEffect(() => {
    supabase
      .from("testimonials")
      .select("*")
      .eq("published", true)
      .order("sort_order")
      .then(({ data }) => setItems((data as T[]) || []));
  }, []);

  // حلقة الحركة بـ requestAnimationFrame
  useEffect(() => {
    if (items.length === 0) return;
    let raf = 0;
    let last = performance.now();
    const baseSpeed = 60; // px/sec

    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;

      const track = trackRef.current;
      if (track) {
        if (halfWidthRef.current === 0) {
          halfWidthRef.current = track.scrollWidth / 2;
        }
        offsetRef.current += baseSpeed * speedRef.current * dt;
        const half = halfWidthRef.current;
        if (half > 0) {
          // اتجاه RTL: نحرك بالموجب لليمين، ولكن نطبّق translateX سالب
          if (offsetRef.current >= half) offsetRef.current -= half;
          if (offsetRef.current < 0) offsetRef.current += half;
          track.style.transform = `translateX(-${offsetRef.current}px)`;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [items.length]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = x / rect.width; // 0..1
    // وسط الشريط (~0.45-0.55) = توقف، يمين = سريع للأمام، يسار = رجوع
    const centered = (ratio - 0.5) * 2; // -1..1
    const dead = 0.1;
    let v = 0;
    if (centered > dead) v = ((centered - dead) / (1 - dead)) * 3; // حتى 3x
    else if (centered < -dead) v = ((centered + dead) / (1 - dead)) * 3; // حتى -3x
    speedRef.current = v;
  };

  const handleMouseEnter = () => {
    hoveringRef.current = true;
    speedRef.current = 0;
  };

  const handleMouseLeave = () => {
    hoveringRef.current = false;
    speedRef.current = 1;
  };

  if (items.length === 0) return null;

  const loop = [...items, ...items];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block bg-mint-soft text-mint px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            ⭐ آراء العائلات
          </span>
          <h2 className="font-display text-4xl lg:text-5xl mb-4">
            عائلات سعيدة <span className="text-gradient">تتحدث عنا</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            مرّر الماوس على الشريط للتحكم — يمين = أسرع، يسار = للخلف، الوسط = توقف.
          </p>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative marquee-mask cursor-ew-resize"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
        <div
          ref={trackRef}
          className="flex gap-6 w-max"
          style={{ direction: "ltr", willChange: "transform" }}
        >
          {loop.map((t, idx) => (
            <div
              key={`${t.id}-${idx}`}
              className="relative bg-card rounded-3xl p-6 border border-border/50 shadow-soft hover:shadow-medium transition-bounce hover:-translate-y-1 w-[340px] shrink-0"
              style={{ direction: "rtl" }}
            >
              <Quote className="absolute top-4 left-4 w-8 h-8 text-primary/10" />

              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: t.rating || 5 }).map((_, s) => (
                  <Star key={s} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>

              <p className="text-foreground/90 leading-relaxed mb-5 relative z-10 text-sm line-clamp-4">
                "{t.text}"
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                <div
                  className={`w-11 h-11 rounded-full ${t.avatar_color || "bg-primary-gradient"} flex items-center justify-center text-white font-display text-lg shrink-0`}
                >
                  {t.name[0]}
                </div>
                <div className="min-w-0">
                  <p className="font-bold truncate">{t.name}</p>
                  {t.role && <p className="text-xs text-muted-foreground truncate">{t.role}</p>}
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
