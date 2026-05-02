import { useEffect, useState } from "react";
import { Star, Trophy, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const colorMap: Record<string, string> = {
  mint: "from-mint to-mint/70",
  peach: "from-accent to-accent/70",
  sky: "from-secondary to-secondary/70",
  pink: "from-pink to-pink/70",
  sun: "from-sun to-sun/70",
};

const Levels = () => {
  const [levels, setLevels] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("levels").select("*").eq("published", true).order("sort_order")
      .then(({ data }) => setLevels(data || []));
  }, []);

  return (
    <section id="levels" className="py-24 relative">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block bg-pink-soft text-pink px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            🎮 رحلة المغامرة
          </span>
          <h2 className="font-display text-4xl lg:text-5xl mb-4">
            مستويات <span className="text-gradient-fun">شيقة</span> ينتظر فتحها طفلك
          </h2>
          <p className="text-lg text-muted-foreground">
            كل مستوى مغامرة جديدة، ومع كل إنجاز يفتح طفلك عالماً أوسع من المعرفة.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {levels.map((lvl, i) => (
            <Link key={lvl.id} to={`/level/${lvl.slug}`} className="block h-full group">
              <div className="relative bg-card rounded-3xl p-6 border-2 border-primary/20 shadow-soft hover:shadow-glow hover:-translate-y-2 cursor-pointer transition-bounce text-center h-full">
                <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${colorMap[lvl.color] || colorMap.mint} flex items-center justify-center shadow-medium`}>
                  <span className="font-display text-4xl text-white">{i + 1}</span>
                </div>
                <p className="text-xs font-bold text-muted-foreground mb-1">المستوى {i + 1}</p>
                <h3 className="font-display text-lg mb-2">{lvl.title}</h3>
                {lvl.description && <p className="text-xs text-muted-foreground line-clamp-2">{lvl.description}</p>}
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 bg-card-gradient rounded-3xl p-8 border border-border/50 shadow-soft">
          {[
            { v: "+200", l: "درس تفاعلي", icon: Star, color: "text-accent" },
            { v: "+50", l: "لعبة تعليمية", icon: Trophy, color: "text-pink" },
            { v: "+1000", l: "طفل سعيد", icon: Crown, color: "text-primary" },
            { v: "5⭐", l: "تقييم العائلات", icon: Star, color: "text-sun" },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.l} className="text-center">
                <Icon className={`w-8 h-8 mx-auto mb-2 ${s.color}`} />
                <div className="font-display text-2xl">{s.v}</div>
                <div className="text-xs text-muted-foreground">{s.l}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Levels;
