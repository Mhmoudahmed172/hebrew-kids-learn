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

  return (
    <section className="py-24 relative">
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

        <div className="grid md:grid-cols-3 gap-6">
          {items.map((t) => (
            <div
              key={t.id}
              className="relative bg-card rounded-3xl p-8 border border-border/50 shadow-soft hover:shadow-medium transition-bounce hover:-translate-y-1"
            >
              <Quote className="absolute top-6 left-6 w-10 h-10 text-primary/10" />

              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: t.rating || 5 }).map((_, s) => (
                  <Star key={s} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>

              <p className="text-foreground/90 leading-relaxed mb-6 relative z-10">"{t.text}"</p>

              <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                <div className={`w-12 h-12 rounded-full ${t.avatar_color || "bg-primary-gradient"} flex items-center justify-center text-white font-display text-lg`}>
                  {t.name[0]}
                </div>
                <div>
                  <p className="font-bold">{t.name}</p>
                  {t.role && <p className="text-xs text-muted-foreground">{t.role}</p>}
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
