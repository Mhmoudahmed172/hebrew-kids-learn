import { Lock, Star, Trophy, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { levels } from "@/data/levels";

const Levels = () => {
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
          {levels.map((lvl) => {
            const Inner = (
              <div className={`relative bg-card rounded-3xl p-6 border-2 ${lvl.unlocked ? "border-primary/20 shadow-soft hover:shadow-glow hover:-translate-y-2 cursor-pointer" : "border-border"} transition-bounce text-center h-full`}>
                <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${lvl.color} flex items-center justify-center shadow-medium`}>
                  <span className="font-display text-5xl text-white">{lvl.icon}</span>
                </div>
                <p className="text-xs font-bold text-muted-foreground mb-1">المستوى {lvl.n}</p>
                <h3 className="font-display text-lg mb-3">{lvl.title}</h3>
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[1,2,3].map(i => (
                    <Star key={i} className={`w-4 h-4 ${i <= lvl.stars ? "fill-accent text-accent" : "text-muted"}`} />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">{lvl.totalLessons} درس</p>
                {!lvl.unlocked && (
                  <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
                {lvl.unlocked && lvl.stars === 3 && (
                  <div className="absolute -top-2 -right-2 w-9 h-9 rounded-full bg-sun-gradient flex items-center justify-center shadow-yellow">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            );
            return (
              <div key={lvl.n} className={`relative group ${lvl.unlocked ? "" : "opacity-60"}`}>
                {lvl.unlocked ? (
                  <Link to={`/level/${lvl.slug}`} className="block h-full">{Inner}</Link>
                ) : (
                  Inner
                )}
              </div>
            );
          })}
        </div>

        {/* Stats bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 bg-card-gradient rounded-3xl p-8 border border-border/50 shadow-soft">
          {[
            { v: "+200", l: "درس تفاعلي", icon: Star, color: "text-accent" },
            { v: "+50", l: "لعبة تعليمية", icon: Trophy, color: "text-pink" },
            { v: "+1000", l: "كلمة عبرية", icon: Crown, color: "text-primary" },
            { v: "98%", l: "رضا الأهل", icon: Star, color: "text-mint" },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <s.icon className={`w-8 h-8 mx-auto mb-2 ${s.color}`} />
              <p className="font-display text-3xl text-gradient">{s.v}</p>
              <p className="text-sm text-muted-foreground font-medium">{s.l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Levels;
