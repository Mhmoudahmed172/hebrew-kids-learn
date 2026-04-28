import { useEffect, useState } from "react";
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

  useEffect(() => {
    supabase
      .from("testimonials")
      .select("*")
      .eq("published", true)
      .order("sort_order")
      .then(({ data }) => setItems((data as T[]) || []));
  }, []);

  if (items.length === 0) return null;

  // duplicate for seamless loop
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
            انضم لآلاف العائلات اللي اختارت منصتنا لتعليم أطفالها العبرية.
          </p>
        </div>
      </div>

      <div
        className="group relative w-full overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        }}
      >
        <div className="flex gap-6 w-max animate-marquee group-hover:[animation-play-state:paused]">
          {loop.map((t, i) => (
            <div
              key={`${t.id}-${i}`}
              className="relative bg-card rounded-3xl p-6 border border-border/50 shadow-soft hover:shadow-medium transition-bounce w-[360px] shrink-0"
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
