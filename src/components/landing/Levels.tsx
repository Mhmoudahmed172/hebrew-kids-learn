import { useEffect, useState } from "react";
import { Star, Lock, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import bunny from "@/assets/bunny-mascot.png";

// Themed worlds for the journey
const worldThemes = [
  { name: "الغابة السحرية", emoji: "🌳", bg: "from-mint to-mint/60", textBg: "bg-mint" },
  { name: "وادي النجوم", emoji: "⭐", bg: "from-accent to-orange", textBg: "bg-accent" },
  { name: "بحر الحروف", emoji: "🌊", bg: "from-teal to-teal/60", textBg: "bg-teal" },
  { name: "قلعة الأحلام", emoji: "🏰", bg: "from-pink to-pink/60", textBg: "bg-pink" },
  { name: "الفضاء البعيد", emoji: "🚀", bg: "from-primary to-primary-dark", textBg: "bg-primary" },
];

const Levels = () => {
  const [levels, setLevels] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("levels").select("*").eq("published", true).order("sort_order")
      .then(({ data }) => setLevels(data || []));
  }, []);

  // Curvy positioning along path
  const positions = [
    "lg:translate-x-0",
    "lg:translate-x-32",
    "lg:translate-x-16",
    "lg:-translate-x-16",
    "lg:translate-x-8",
    "lg:translate-x-40",
    "lg:translate-x-20",
    "lg:-translate-x-8",
  ];

  return (
    <section id="levels" className="py-24 relative overflow-hidden bg-gradient-to-b from-background via-primary-soft/40 to-background">
      <div className="container relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block bg-accent text-white px-5 py-2 rounded-full text-sm font-extrabold mb-4 shadow-glow animate-wiggle">
            🗺️ خريطة المغامرة
          </span>
          <h2 className="font-display text-4xl lg:text-6xl mb-4">
            رحلتك عبر <span className="text-gradient-fun">5 عوالم سحرية</span>
          </h2>
          <p className="text-lg text-foreground/70 font-medium">
            كل عالم فيه مفاجآت، شخصيات، ومستويات تنتظرك!
          </p>
        </div>

        {/* Worlds grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 mb-20">
          {worldThemes.map((w, i) => (
            <div
              key={w.name}
              className="group relative bg-white rounded-3xl p-5 border-4 border-foreground/5 shadow-medium hover:-translate-y-2 hover:scale-105 transition-bounce cursor-pointer text-center"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className={`absolute -top-5 left-1/2 -translate-x-1/2 w-14 h-14 rounded-2xl bg-gradient-to-br ${w.bg} shadow-medium flex items-center justify-center text-3xl border-4 border-white group-hover:animate-wiggle`}>
                {w.emoji}
              </div>
              <div className="pt-8">
                <h3 className="font-display text-base">{w.name}</h3>
                <div className={`inline-block mt-2 ${w.textBg} text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full`}>
                  عالم {i + 1}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Adventure path with levels */}
        <div className="relative max-w-3xl mx-auto">
          {/* Bunny on path */}
          <div className="hidden lg:block absolute -top-8 right-1/2 translate-x-1/2 z-20 animate-float-slow">
            <img src={bunny} alt="" className="w-24 h-24 drop-shadow-2xl" loading="lazy" />
          </div>

          {/* Dashed path */}
          <div className="absolute inset-y-0 right-1/2 w-1.5 -translate-x-1/2 bg-[linear-gradient(180deg,transparent_50%,hsl(var(--accent))_50%)] bg-[length:100%_24px] opacity-60 hidden lg:block" />

          <div className="space-y-6 pt-24 lg:pt-32">
            {levels.length === 0 && (
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-32 rounded-3xl bg-muted/50 animate-pulse" />
                ))}
              </div>
            )}

            {levels.map((lvl, i) => {
              const locked = i > 1;
              const completed = i === 0;
              return (
                <Link
                  key={lvl.id}
                  to={locked ? "#" : `/level/${lvl.slug}`}
                  className={`block group ${positions[i % positions.length]} transition-bounce`}
                >
                  <div className={`relative bg-white rounded-3xl p-5 border-4 ${
                    completed ? "border-mint shadow-soft" :
                    locked ? "border-foreground/10 opacity-60" :
                    "border-accent shadow-glow animate-pulse"
                  } hover:-translate-y-1 hover:rotate-1 transition-bounce flex items-center gap-5 max-w-md mx-auto lg:mx-0`}>

                    {/* Level circle */}
                    <div className={`flex-shrink-0 relative w-20 h-20 rounded-full bg-gradient-to-br ${
                      completed ? "from-mint to-mint/60" :
                      locked ? "from-foreground/20 to-foreground/10" :
                      "from-accent to-orange"
                    } flex items-center justify-center shadow-medium border-4 border-white`}>
                      {locked ? (
                        <Lock className="w-7 h-7 text-white" />
                      ) : (
                        <span className="font-display text-3xl text-white">{i + 1}</span>
                      )}
                      {completed && (
                        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gold-gradient shadow-yellow flex items-center justify-center text-white text-lg border-2 border-white">
                          ★
                        </div>
                      )}
                    </div>

                    <div className="flex-1 text-right">
                      <div className="flex items-center justify-end gap-2 mb-1">
                        {!locked && !completed && (
                          <span className="bg-accent text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full animate-wiggle">
                            ابدأ الآن!
                          </span>
                        )}
                        <h3 className="font-display text-xl">{lvl.title}</h3>
                      </div>
                      {lvl.description && (
                        <p className="text-sm text-foreground/60 line-clamp-1">{lvl.description}</p>
                      )}
                      {!locked && (
                        <div className="flex items-center justify-end gap-1 mt-2">
                          {[1,2,3].map(s => (
                            <Star key={s} className={`w-4 h-4 ${
                              completed || s === 1 ? "fill-accent text-accent" : "text-foreground/20"
                            }`} />
                          ))}
                          <Sparkles className="w-4 h-4 text-pink mr-1" />
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Stats trophy bar */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { v: "+200", l: "درس ممتع", emoji: "📚", bg: "bg-primary" },
            { v: "+50", l: "لعبة", emoji: "🎮", bg: "bg-pink" },
            { v: "+1000", l: "بطل صغير", emoji: "👑", bg: "bg-accent" },
            { v: "5★", l: "تقييم العائلات", emoji: "❤️", bg: "bg-mint" },
          ].map((s) => (
            <div key={s.l} className={`${s.bg} text-white rounded-3xl p-5 text-center shadow-medium hover:-translate-y-1 hover:rotate-2 transition-bounce`}>
              <div className="text-4xl mb-2">{s.emoji}</div>
              <div className="font-display text-3xl">{s.v}</div>
              <div className="text-xs font-bold opacity-90">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Levels;
