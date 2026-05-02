import { UserPlus, Sparkles, TrendingUp, Shield } from "lucide-react";
import bunny from "@/assets/bunny-mascot.png";

const steps = [
  { n: "1", icon: UserPlus, emoji: "👶", title: "اختر بطلك", desc: "أنشئ شخصية طفلك واختر مستواه", color: "bg-primary", shadow: "shadow-medium" },
  { n: "2", icon: Sparkles, emoji: "🎮", title: "العب وتعلّم", desc: "ادخل العالم وابدأ المغامرة", color: "bg-pink", shadow: "shadow-pink" },
  { n: "3", icon: TrendingUp, emoji: "🏆", title: "اجمع الجوائز", desc: "نجوم، شارات، ومستويات جديدة", color: "bg-accent", shadow: "shadow-glow" },
];

const HowItWorks = () => {
  return (
    <section id="how" className="py-24 relative overflow-hidden bg-gradient-to-b from-background to-secondary-soft/30">
      <div className="container relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block bg-mint text-white px-5 py-2 rounded-full text-sm font-extrabold mb-4 shadow-soft">
            🚀 ابدأ في 3 خطوات
          </span>
          <h2 className="font-display text-4xl lg:text-6xl mb-4">
            بسيطة <span className="text-gradient-fun">جداً!</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16 relative">
          {/* Connecting dotted line */}
          <div className="hidden md:block absolute top-16 right-[16%] left-[16%] h-1 bg-[linear-gradient(90deg,hsl(var(--accent))_50%,transparent_50%)] bg-[length:16px_4px] opacity-50" />

          {steps.map((s, i) => (
            <div key={s.n} className="relative">
              <div className={`relative bg-white rounded-3xl p-8 border-4 border-foreground/5 shadow-medium hover:-translate-y-2 transition-bounce text-center group cursor-pointer`}>
                {/* Step circle */}
                <div className={`relative w-24 h-24 mx-auto mb-5 rounded-full ${s.color} ${s.shadow} flex items-center justify-center border-4 border-white group-hover:animate-wiggle`}>
                  <span className="text-5xl">{s.emoji}</span>
                  <div className="absolute -top-2 -right-2 w-9 h-9 rounded-full bg-white border-4 border-foreground/10 flex items-center justify-center font-display text-lg shadow-soft">
                    {s.n}
                  </div>
                </div>
                <h3 className="font-display text-2xl mb-2">{s.title}</h3>
                <p className="text-foreground/60 font-medium">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Parents section - secondary, hidden by default */}
        <div className="max-w-4xl mx-auto bg-primary-dark text-white rounded-[2.5rem] p-8 lg:p-10 shadow-medium relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-accent/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-pink/30 rounded-full blur-3xl" />

          <div className="relative grid md:grid-cols-[auto_1fr_auto] gap-6 items-center">
            <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center text-4xl flex-shrink-0 mx-auto md:mx-0">
              👨‍👩‍👧
            </div>
            <div className="text-center md:text-right">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-3 py-1 rounded-full text-xs font-bold mb-2">
                <Shield className="w-3.5 h-3.5" /> منطقة الأهل
              </div>
              <h3 className="font-display text-2xl mb-1">تابع رحلة طفلك بكل ثقة</h3>
              <p className="text-white/70 text-sm">تقارير تقدم، تحكم بالوقت، ومحتوى آمن 100%.</p>
            </div>
            <button className="bg-accent text-accent-foreground hover:bg-accent/90 font-extrabold px-6 py-3 rounded-full shadow-glow transition-bounce hover:scale-105">
              لوحة الأهل
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
