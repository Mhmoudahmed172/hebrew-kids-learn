import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
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

const CARD_STEP = 384;
const SPEED_PX_PER_SEC = 55;

const Testimonials = () => {
  const [items, setItems] = useState<T[]>([]);
  const [viewportWidth, setViewportWidth] = useState(1920);
  const [groupWidth, setGroupWidth] = useState(0);
  const groupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase
      .from("testimonials")
      .select("*")
      .eq("published", true)
      .order("sort_order")
      .then(({ data }) => setItems((data as T[]) || []));
  }, []);

  useEffect(() => {
    const updateViewport = () => setViewportWidth(window.innerWidth);
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  const group = useMemo(() => {
    if (items.length === 0) return [];
    const minCards = Math.max(18, Math.ceil((viewportWidth * 3) / CARD_STEP));

    return Array.from({ length: minCards }, (_, index) => items[index % items.length]);
  }, [items, viewportWidth]);

  useEffect(() => {
    if (!groupRef.current || group.length === 0) return;

    const measure = () => setGroupWidth(groupRef.current?.scrollWidth || 0);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(groupRef.current);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [group.length]);

  const duration = Math.max(36, groupWidth / SPEED_PX_PER_SEC);
  const marqueeStyle = {
    "--marquee-distance": `-${groupWidth}px`,
    "--marquee-duration": `${duration}s`,
  } as CSSProperties;

  if (items.length === 0) return null;

  const renderCard = (t: T, key: string) => (
    <div
      key={key}
      dir="rtl"
      className="group relative bg-card rounded-3xl p-6 border border-border/50 shadow-soft w-[360px] shrink-0 select-none text-right transition-all duration-500"
    >
      {/* تدرّج زخرفي يظهر عند الـ hover */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* أيقونة الاقتباس */}
      <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-primary-gradient flex items-center justify-center shadow-soft transform rotate-0 group-hover:rotate-12 transition-transform duration-500">
        <Quote className="w-5 h-5 text-white" />
      </div>

      <div className="relative">
        <div className="flex items-center justify-start gap-1 mb-3">
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
          <div className="text-right">
            <p className="font-bold text-sm">{t.name}</p>
            {t.role && <p className="text-xs text-muted-foreground">{t.role}</p>}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section className="py-24 relative overflow-hidden select-none" onCopy={(event) => event.preventDefault()}>
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
        className="relative w-full overflow-hidden select-none py-4 pointer-events-none"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
        }}
      >
        <div
          dir="ltr"
          className="testimonials-marquee-track flex w-max will-change-transform"
          style={marqueeStyle}
        >
          {[0, 1].map((groupIndex) => (
            <div
              ref={groupIndex === 0 ? groupRef : undefined}
              key={groupIndex}
              className="flex shrink-0 gap-6 pr-6"
              aria-hidden={groupIndex === 1}
            >
              {group.map((t, i) => renderCard(t, `${groupIndex}-${t.id}-${i}`))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
