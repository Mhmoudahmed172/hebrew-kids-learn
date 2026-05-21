import { useEffect, useState } from "react";
import { Star, Lock, BookOpen, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

// Per-level visual theme (icon bg, name color, button, dot, hebrew sample)
const themes = [
  {
    // 1 — green
    iconBg: "bg-mint",
    iconText: "text-mint-foreground",
    nameText: "text-mint",
    dot: "bg-mint",
    btn: "bg-mint text-mint-foreground hover:bg-mint/90",
    hebrew: "א",
    locked: false,
    youAreHere: false,
  },
  {
    // 2 — green
    iconBg: "bg-mint",
    iconText: "text-mint-foreground",
    nameText: "text-mint",
    dot: "bg-mint",
    btn: "bg-mint text-mint-foreground hover:bg-mint/90",
    hebrew: "ב",
    locked: false,
    youAreHere: false,
  },
  {
    // 3 — purple + "you are here"
    iconBg: "bg-primary",
    iconText: "text-primary-foreground",
    nameText: "text-primary",
    dot: "bg-primary",
    btn: "bg-primary text-primary-foreground hover:bg-primary/90",
    hebrew: "ג",
    locked: false,
    youAreHere: true,
  },
  {
    // 4 — gold/grey locked
    iconBg: "bg-muted",
    iconText: "text-muted-foreground",
    nameText: "text-muted-foreground",
    dot: "bg-gradient-to-br from-[hsl(40_50%_70%)] to-[hsl(40_30%_55%)]",
    btn: "bg-muted text-muted-foreground hover:bg-muted",
    hebrew: "ד",
    locked: true,
    youAreHere: false,
  },
  {
    // 5 — pink locked
    iconBg: "bg-pink-soft",
    iconText: "text-pink",
    nameText: "text-pink",
    dot: "bg-pink",
    btn: "bg-pink/20 text-pink hover:bg-pink/30",
    hebrew: "ה",
    locked: true,
    youAreHere: false,
  },
];

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
    <section
      id="levels"
      className="py-24 relative overflow-hidden bg-gradient-to-b from-background via-primary-soft/40 to-background"
    >
      <div className="container max-w-5xl">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 reveal is-visible">
          <span className="inline-block bg-primary-soft text-primary px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            🎮 رحلة المغامرة
          </span>
          <h2 className="font-display text-4xl lg:text-5xl mb-4">
            مستويات <span className="text-gradient-fun">شيّقة</span> تنتظر طفلك
          </h2>
          <p className="text-lg text-muted-foreground">
            كل مستوى مغامرة جديدة، ومع كل إنجاز يكتشف طفلك عالماً أوسع من الكلمات والمعرفة.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical gradient line */}
          <div
            aria-hidden
            className="absolute top-0 bottom-0 right-1/2 translate-x-1/2 w-[3px] rounded-full"
            style={{
              background:
                "linear-gradient(to bottom, hsl(var(--mint)) 0%, hsl(var(--primary)) 50%, hsl(var(--pink)) 100%)",
            }}
          />

          <div className="space-y-16 md:space-y-24">
            {levels.map((lvl, i) => {
              const t = themes[i % themes.length];
              const isRight = i % 2 === 0; // 1st right, 2nd left, ...
              const stars = Math.max(0, Math.min(3, Number(lvl.stars ?? (t.locked ? 0 : 3 - Math.floor(i / 2)))));
              const lessonCount = lvl.lessons_count ?? lvl.total_lessons ?? 12;

              return (
                <div
                  key={lvl.id}
                  className="relative grid grid-cols-1 md:grid-cols-2 items-center gap-6"
                >
                  {/* Number dot on the line */}
                  <div className="absolute right-1/2 translate-x-1/2 top-1/2 -translate-y-1/2 z-10">
                    <div
                      className={`relative w-14 h-14 rounded-full ${t.dot} flex items-center justify-center shadow-medium ring-4 ring-background`}
                    >
                      <span className="font-display text-2xl text-white font-extrabold">
                        {i + 1}
                      </span>
                      {t.youAreHere && (
                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-soft flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          أنت هنا
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card column — right or left */}
                  <div
                    className={
                      isRight
                        ? "md:col-start-1 md:pl-12 md:pr-0"
                        : "md:col-start-2 md:pr-12 md:pl-0"
                    }
                  >
                    <article
                      className={`group bg-card rounded-3xl p-6 md:p-7 border border-border/60 shadow-soft hover:shadow-medium hover:-translate-y-1 transition-bounce ${
                        t.locked ? "opacity-90" : ""
                      }`}
                    >
                      {/* Top row: icon + hebrew chip */}
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div
                          className={`w-12 h-12 rounded-2xl ${t.iconBg} ${t.iconText} flex items-center justify-center shadow-soft`}
                        >
                          {t.locked ? (
                            <Lock className="w-5 h-5" />
                          ) : (
                            <BookOpen className="w-5 h-5" />
                          )}
                        </div>
                        <div className="px-3 py-1.5 rounded-xl bg-muted/70 border border-border/50">
                          <span className="font-display text-xl font-extrabold text-foreground">
                            {t.hebrew}
                          </span>
                        </div>
                      </div>

                      {/* Texts */}
                      <p className={`text-xs font-bold mb-1 ${t.nameText}`}>
                        المستوى {i + 1}
                      </p>
                      <h3 className="font-display text-2xl text-foreground mb-2">
                        {lvl.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-5">
                        {lvl.description || "ابدأ مغامرة جديدة واكتشف المزيد من الكلمات والمهارات."}
                      </p>

                      {/* Meta row: stars + lessons */}
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-1">
                          {[0, 1, 2].map((s) => (
                            <Star
                              key={s}
                              className={`w-4 h-4 ${
                                s < stars
                                  ? "fill-orange text-orange"
                                  : "text-muted-foreground/40"
                              }`}
                            />
                          ))}
                        </div>
                        <div className="text-xs text-muted-foreground font-bold flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" />
                          {lessonCount} درس
                        </div>
                      </div>

                      {/* CTA */}
                      {t.locked ? (
                        <Button disabled className={`w-full ${t.btn}`}>
                          <Lock className="w-4 h-4" />
                          مقفل
                        </Button>
                      ) : (
                        <Button asChild className={`w-full ${t.btn}`}>
                          <Link to={`/level/${lvl.slug}`}>
                            {t.youAreHere ? "تابع المغامرة" : "ابدأ المستوى"}
                          </Link>
                        </Button>
                      )}
                    </article>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Levels;
