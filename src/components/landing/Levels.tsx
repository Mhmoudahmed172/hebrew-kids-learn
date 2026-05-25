import { useEffect, useState } from "react";
import { Star, Lock, BookOpen, Sparkles, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useReveal } from "@/hooks/useReveal";

const themes = [
  { iconBg: "bg-mint", iconText: "text-mint-foreground", nameText: "text-mint", dot: "bg-mint", btn: "bg-mint text-mint-foreground hover:bg-mint/90", hebrew: "א", locked: false, youAreHere: false },
  { iconBg: "bg-secondary", iconText: "text-secondary-foreground", nameText: "text-secondary", dot: "bg-secondary", btn: "bg-secondary text-secondary-foreground hover:bg-secondary/90", hebrew: "ב", locked: false, youAreHere: false },
  { iconBg: "bg-primary", iconText: "text-primary-foreground", nameText: "text-primary", dot: "bg-primary", btn: "bg-primary text-primary-foreground hover:bg-primary/90", hebrew: "ג", locked: false, youAreHere: true },
  { iconBg: "bg-muted", iconText: "text-muted-foreground", nameText: "text-muted-foreground", dot: "bg-gradient-to-br from-[hsl(40_50%_70%)] to-[hsl(40_30%_55%)]", btn: "bg-muted text-muted-foreground hover:bg-muted", hebrew: "ד", locked: true, youAreHere: false },
  { iconBg: "bg-pink-soft", iconText: "text-pink", nameText: "text-pink", dot: "bg-pink", btn: "bg-pink/20 text-pink hover:bg-pink/30", hebrew: "ה", locked: true, youAreHere: false },
];

const PER_ROW = 4;
const STAGGER_PX = 56; // vertical offset between alternating cards
const ROW_HEIGHT = 360; // approx card+pin row height

const Levels = () => {
  const [levels, setLevels] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("levels").select("*").eq("published", true).order("sort_order")
      .then(({ data }) => setLevels(data || []));
  }, []);

  const rows: any[][] = [];
  for (let i = 0; i < levels.length; i += PER_ROW) {
    rows.push(levels.slice(i, i + PER_ROW));
  }

  return (
    <section
      id="levels"
      className="py-20 relative overflow-hidden bg-gradient-to-b from-background via-primary-soft/40 to-background"
    >
      <div aria-hidden className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full bg-mint/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute bottom-10 -left-20 w-80 h-80 rounded-full bg-pink/20 blur-3xl" />

      {/* Shared gradient defs */}
      <svg aria-hidden width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="lvl-path-grad" x1="0" x2="1">
            <stop offset="0%" stopColor="hsl(var(--mint))" />
            <stop offset="50%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--pink))" />
          </linearGradient>
        </defs>
      </svg>

      <div className="container max-w-6xl relative">
        <div className="max-w-3xl mx-auto mb-14 text-center reveal is-visible">
          <span className="inline-flex items-center gap-1.5 bg-primary-soft text-slate-700 px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            <MapPin className="w-4 h-4" /> خريطة المغامرة
          </span>
          <h2 className="font-display text-4xl lg:text-5xl mb-4">
            اتبع المسار واكتشف <span className="text-gradient-fun">عالم العبرية</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            كل محطة على الخريطة مغامرة جديدة وكنز من الكلمات بانتظار طفلك.
          </p>
        </div>

        {/* Mobile */}
        <div className="md:hidden space-y-5">
          {levels.map((lvl, i) => (
            <LevelCard key={lvl.id} lvl={lvl} index={i} />
          ))}
        </div>

        {/* Desktop adventure map */}
        <div className="hidden md:block">
          {rows.map((row, rowIdx) => {
            const reverse = rowIdx % 2 === 1;
            const ordered = reverse ? [...row].reverse() : row;
            const isLastRow = rowIdx === rows.length - 1;

            return (
              <div key={rowIdx} className="relative" style={{ marginBottom: isLastRow ? 0 : 80 }}>
                {/* Continuous snaking path through pin centers (handles stagger) */}
                <RowPath count={row.length} reverse={reverse} />

                <div
                  className="relative grid gap-5"
                  style={{
                    gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))`,
                    minHeight: ROW_HEIGHT,
                  }}
                >
                  {ordered.map((lvl, i) => {
                    const originalIdx = reverse
                      ? rowIdx * PER_ROW + (row.length - 1 - i)
                      : rowIdx * PER_ROW + i;
                    // alternate up / down based on visual position
                    const offsetClass = i % 2 === 0 ? "" : `mt-[${STAGGER_PX}px]`;
                    return (
                      <div
                        key={lvl.id}
                        style={{ marginTop: i % 2 === 0 ? 0 : STAGGER_PX }}
                      >
                        <LevelCard lvl={lvl} index={originalIdx} compact />
                      </div>
                    );
                  })}
                </div>

                {!isLastRow && <RowConnector reverse={reverse} cols={row.length} />}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

/* -------- Continuous snake through pin centers (with stagger) -------- */
const RowPath = ({ count, reverse }: { count: number; reverse: boolean }) => {
  if (count < 1) return null;
  // viewBox: x 0-100 across the row, y 0-100 mapped to ROW_HEIGHT
  // Pin sits ~24px from top of card; staggered cards push the odd-indexed pins down by STAGGER_PX.
  // Convert px → viewBox-y: 100 * px / ROW_HEIGHT
  const pinTopY = (24 / ROW_HEIGHT) * 100; // ~6.7
  const staggerY = (STAGGER_PX / ROW_HEIGHT) * 100; // ~15.5

  const pts = Array.from({ length: count }, (_, i) => {
    const x = ((i + 0.5) / count) * 100;
    const y = pinTopY + (i % 2 === 0 ? 0 : staggerY);
    return { x, y };
  });

  // Smooth bezier through points
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const cur = pts[i];
    const midX = (prev.x + cur.x) / 2;
    d += ` C ${midX} ${prev.y}, ${midX} ${cur.y}, ${cur.x} ${cur.y}`;
  }

  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full pointer-events-none z-0"
      style={{ height: ROW_HEIGHT, transform: reverse ? "scaleX(-1)" : undefined }}
    >
      <path
        d={d}
        fill="none"
        stroke="url(#lvl-path-grad)"
        strokeLinecap="round"
        strokeDasharray="0.8 2.4"
        opacity="0.85"
        vectorEffect="non-scaling-stroke"
        strokeWidth={3}
      />
    </svg>
  );
};

/* -------- Vertical connector to next row (continuous) -------- */
const RowConnector = ({ reverse, cols }: { reverse: boolean; cols: number }) => {
  // last visual pin of this row lives at column index (cols-1)
  // If cols-1 is odd → that pin is staggered down; next row's first pin (visual idx 0) is at top.
  // Connector x = end side of current row, then curves to start side of next row (same edge because next row is reversed).
  const lastIsStaggered = (cols - 1) % 2 === 1;
  const endX = reverse ? (0.5 / cols) * 100 : ((cols - 0.5) / cols) * 100;
  const startY = lastIsStaggered ? 60 : 20;
  const d = `M ${endX} ${startY} C ${endX} 80, ${endX} 90, ${endX} 100`;

  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute left-0 right-0 w-full pointer-events-none"
      style={{ height: 80, bottom: -80 }}
    >
      <path
        d={d}
        fill="none"
        stroke="url(#lvl-path-grad)"
        strokeLinecap="round"
        strokeDasharray="0.8 2.4"
        opacity="0.85"
        strokeWidth={3}
      />
    </svg>
  );
};

/* -------- Compact level card -------- */
const LevelCard = ({ lvl, index, compact = false }: { lvl: any; index: number; compact?: boolean }) => {
  const t = themes[index % themes.length];
  const stars = Math.max(0, Math.min(3, Number(lvl.stars ?? (t.locked ? 0 : 3 - Math.floor(index / 2)))));
  const lessonCount = lvl.lessons_count ?? lvl.total_lessons ?? 12;
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <div ref={ref} className={`reveal ${visible ? "is-visible" : ""} relative z-10`}>
      <div className="flex justify-center -mb-4 relative z-10">
        <div className={`relative w-10 h-10 rounded-full ${t.dot} flex items-center justify-center shadow-medium ring-4 ring-background`}>
          <span className="font-display text-sm text-white font-extrabold">{index + 1}</span>
          {t.youAreHere && (
            <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-soft flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> أنت هنا
            </span>
          )}
        </div>
      </div>

      <article
        className={`group bg-card rounded-2xl ${compact ? "p-3" : "p-4"} pt-6 border border-border/60 shadow-soft hover:shadow-medium hover:-translate-y-1 transition-bounce ${t.locked ? "opacity-90" : ""}`}
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className={`w-8 h-8 rounded-lg ${t.iconBg} ${t.iconText} flex items-center justify-center shadow-soft`}>
            {t.locked ? <Lock className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
          </div>
          <div className="px-2 py-0.5 rounded-md bg-muted/70 border border-border/50">
            <span className="font-display text-sm font-extrabold text-foreground">{t.hebrew}</span>
          </div>
        </div>

        <p className={`text-[10px] font-bold mb-0.5 ${t.nameText}`}>المستوى {index + 1}</p>
        <h3 className="font-display text-sm text-foreground mb-1 line-clamp-1">{lvl.title}</h3>
        <p className="text-[11px] text-muted-foreground line-clamp-2 mb-2 min-h-[1.75rem]">
          {lvl.description || "ابدأ مغامرة جديدة واكتشف المزيد."}
        </p>

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-0.5">
            {[0, 1, 2].map((s) => (
              <Star key={s} className={`w-3 h-3 ${s < stars ? "fill-orange text-orange" : "text-muted-foreground/40"}`} />
            ))}
          </div>
          <div className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
            <BookOpen className="w-2.5 h-2.5" />
            {lessonCount}
          </div>
        </div>

        {t.locked ? (
          <Button disabled size="sm" className={`w-full h-8 text-xs ${t.btn}`}>
            <Lock className="w-3 h-3" /> مقفل
          </Button>
        ) : (
          <Button asChild size="sm" className={`w-full h-8 text-xs ${t.btn}`}>
            <Link to={`/level/${lvl.slug}`}>
              {t.youAreHere ? "تابع" : "ابدأ"}
            </Link>
          </Button>
        )}
      </article>
    </div>
  );
};

export default Levels;
