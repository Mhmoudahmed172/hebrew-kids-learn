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

const SPEED_PX_PER_SEC = 60; // سرعة اللوب التلقائي

const Testimonials = () => {
  const [items, setItems] = useState<T[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0); // الإزاحة الحالية
  const halfWidthRef = useRef(0); // عرض نصف الشريط (نسخة واحدة)
  const pausedRef = useRef(false);
  const draggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartOffsetRef = useRef(0);

  useEffect(() => {
    supabase
      .from("testimonials")
      .select("*")
      .eq("published", true)
      .order("sort_order")
      .then(({ data }) => setItems((data as T[]) || []));
  }, []);

  // اللوب التلقائي عبر requestAnimationFrame
  useEffect(() => {
    if (items.length === 0) return;

    const measure = () => {
      if (trackRef.current) {
        halfWidthRef.current = trackRef.current.scrollWidth / 2;
      }
    };
    measure();
    window.addEventListener("resize", measure);

    let last = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;

      if (!pausedRef.current && !draggingRef.current && halfWidthRef.current > 0) {
        offsetRef.current -= SPEED_PX_PER_SEC * dt;
        // wrap بسلاسة
        if (offsetRef.current <= -halfWidthRef.current) {
          offsetRef.current += halfWidthRef.current;
        } else if (offsetRef.current > 0) {
          offsetRef.current -= halfWidthRef.current;
        }
        if (trackRef.current) {
          trackRef.current.style.transform = `translateX(${offsetRef.current}px)`;
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

  const loop = [...items, ...items];

  // Handlers
  const handleMouseEnter = () => {
    pausedRef.current = true;
  };
  const handleMouseLeave = () => {
    pausedRef.current = false;
    draggingRef.current = false;
  };
  const handleMouseDown = (e: React.MouseEvent) => {
    draggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartOffsetRef.current = offsetRef.current;
  };
  const handleMouseUp = () => {
    draggingRef.current = false;
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingRef.current) return;
    const delta = e.clientX - dragStartXRef.current;
    let next = dragStartOffsetRef.current + delta;
    const half = halfWidthRef.current;
    if (half > 0) {
      // الإبقاء على الإزاحة ضمن نطاق نسخة واحدة
      while (next <= -half) next += half;
      while (next > 0) next -= half;
    }
    offsetRef.current = next;
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(${next}px)`;
    }
  };

  // Touch (موبايل)
  const handleTouchStart = (e: React.TouchEvent) => {
    pausedRef.current = true;
    draggingRef.current = true;
    dragStartXRef.current = e.touches[0].clientX;
    dragStartOffsetRef.current = offsetRef.current;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!draggingRef.current) return;
    const delta = e.touches[0].clientX - dragStartXRef.current;
    let next = dragStartOffsetRef.current + delta;
    const half = halfWidthRef.current;
    if (half > 0) {
      while (next <= -half) next += half;
      while (next > 0) next -= half;
    }
    offsetRef.current = next;
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(${next}px)`;
    }
  };
  const handleTouchEnd = () => {
    draggingRef.current = false;
    pausedRef.current = false;
  };

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
            انضم لآلاف العائلات اللي اختارت منصتنا لتعليم أطفالها العبرية.
          </p>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative w-full overflow-hidden cursor-grab active:cursor-grabbing select-none"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={trackRef}
          className="flex gap-6 w-max will-change-transform"
          style={{ transform: "translateX(0px)" }}
        >
          {loop.map((t, i) => (
            <div
              key={`${t.id}-${i}`}
              className="relative bg-card rounded-3xl p-6 border border-border/50 shadow-soft w-[360px] shrink-0 pointer-events-auto"
            >
              <Quote className="absolute top-4 left-4 w-8 h-8 text-primary/10" />

              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: t.rating || 5 }).map((_, s) => (
                  <Star key={s} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>

              <p className="text-foreground/90 leading-relaxed mb-4 relative z-10 line-clamp-4">
                "{t.text}"
              </p>

              <div className="flex items-center gap-3 pt-3 border-t border-border/50">
                <div
                  className={`w-11 h-11 rounded-full ${
                    t.avatar_color || "bg-primary-gradient"
                  } flex items-center justify-center text-white font-display text-lg`}
                >
                  {t.name[0]}
                </div>
                <div>
                  <p className="font-bold text-sm">{t.name}</p>
                  {t.role && (
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  )}
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
