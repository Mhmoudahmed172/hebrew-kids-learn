import { Button } from "@/components/ui/button";
import { Sparkles, PlayCircle, Star, Trophy, Zap, Volume2 } from "lucide-react";
import { useState } from "react";
import bunny from "@/assets/bunny-mascot.png";
import worldBg from "@/assets/world-bg.jpg";

const Hero = () => {
  const [bubble, setBubble] = useState(true);

  return (
    <section
      className="relative overflow-hidden pt-10 pb-32 lg:pt-16 lg:pb-40"
      style={{
        backgroundImage: `linear-gradient(180deg, hsl(var(--primary-soft)) 0%, hsl(var(--accent-soft)) 100%)`,
      }}
    >
      {/* World illustration as bottom layer */}
      <div
        className="absolute inset-x-0 bottom-0 h-[55%] bg-cover bg-bottom opacity-90"
        style={{ backgroundImage: `url(${worldBg})` }}
        aria-hidden
      />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" aria-hidden />

      {/* Floating Hebrew letters as collectibles */}
      <div className="absolute top-24 right-[12%] text-6xl font-display text-primary/40 animate-float-slow drop-shadow-lg hidden md:block">א</div>
      <div className="absolute top-1/3 left-[8%] text-7xl font-display text-pink/50 animate-float-fast drop-shadow-lg hidden md:block">ב</div>
      <div className="absolute top-20 left-[40%] text-5xl font-display text-accent/60 animate-wiggle drop-shadow-lg hidden md:block">ג</div>
      <div className="absolute top-1/2 right-[35%] text-5xl font-display text-mint/60 animate-float-slow drop-shadow-lg hidden md:block">ד</div>

      {/* Floating coins/stars */}
      <div className="absolute top-32 left-[25%] animate-float-fast hidden md:block">
        <div className="w-10 h-10 rounded-full bg-gold-gradient shadow-yellow flex items-center justify-center text-white font-extrabold">★</div>
      </div>
      <div className="absolute top-40 right-[28%] animate-float-slow hidden md:block">
        <div className="w-8 h-8 rounded-full bg-pink shadow-pink flex items-center justify-center text-white text-xs font-extrabold">★</div>
      </div>

      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Text */}
          <div className="text-center lg:text-right space-y-6 animate-pop-in relative z-10">
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border-2 border-accent/30 shadow-medium">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mint opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-mint" />
              </span>
              <span className="text-sm font-extrabold text-foreground">+10,000 طفل يلعب الآن!</span>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl leading-[1.05]">
              تعلّم العبرية{" "}
              <span className="text-gradient-fun inline-block animate-wiggle origin-bottom">باللعب</span>
              <span className="inline-block ml-2">🎮</span>
            </h1>

            <p className="text-lg lg:text-xl text-foreground/70 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
              ابدأ مغامرتك مع الأرنب <span className="font-extrabold text-primary">شالوم</span>! اجمع النجوم، افتح المستويات، وكوّن صداقات مع حروف عبرية لطيفة. ✨
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button variant="hero" size="xl" className="group">
                <Sparkles className="group-hover:animate-spin" /> ابدأ المغامرة مجاناً
              </Button>
              <Button variant="outline" size="xl" className="border-2 border-primary/30 bg-white/80 backdrop-blur">
                <PlayCircle /> شاهد جولة سريعة
              </Button>
            </div>

            {/* Reward bar */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-4">
              {[
                { icon: "⭐", label: "نجوم", color: "bg-gold-gradient text-white shadow-yellow" },
                { icon: "🏆", label: "كؤوس", color: "bg-primary-gradient text-white shadow-medium" },
                { icon: "🪙", label: "عملات", color: "bg-fun-gradient text-white shadow-pink" },
                { icon: "🎖️", label: "شارات", color: "bg-sky-gradient text-white shadow-soft" },
              ].map((r) => (
                <div key={r.label} className={`flex items-center gap-2 px-4 py-2 rounded-full font-extrabold text-sm ${r.color} hover:scale-110 transition-bounce cursor-default`}>
                  <span className="text-lg">{r.icon}</span>
                  <span>{r.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bunny mascot stage */}
          <div className="relative animate-pop-in">
            <div className="relative max-w-md mx-auto">
              {/* Glow under bunny */}
              <div className="absolute inset-x-10 bottom-10 h-40 bg-accent/40 rounded-full blur-3xl" />

              {/* Speech bubble from bunny */}
              {bubble && (
                <div className="absolute -top-2 -right-2 lg:-right-8 z-20 animate-pop-in">
                  <div className="relative bg-white border-4 border-primary rounded-3xl px-5 py-3 shadow-medium max-w-[220px]">
                    <button
                      onClick={() => setBubble(false)}
                      className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-pink text-white text-xs font-bold shadow-pink hover:scale-110 transition-bounce"
                      aria-label="إغلاق"
                    >
                      ✕
                    </button>
                    <p className="font-display text-base text-foreground leading-tight">
                      مرحباً! أنا <span className="text-primary">شالوم</span> 🐰
                      <br />
                      جاهز للمغامرة؟
                    </p>
                    <button className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-accent transition-smooth">
                      <Volume2 className="w-3.5 h-3.5" /> اسمع صوتي
                    </button>
                    {/* Tail */}
                    <div className="absolute bottom-0 right-12 translate-y-1/2 w-5 h-5 bg-white border-r-4 border-b-4 border-primary rotate-45" />
                  </div>
                </div>
              )}

              {/* Bunny image */}
              <div className="relative animate-float-slow">
                <img
                  src={bunny}
                  alt="الأرنب شالوم - مرشد تعلم العبرية"
                  width={1024}
                  height={1024}
                  className="w-full h-auto drop-shadow-2xl"
                />
              </div>

              {/* Floating XP badges */}
              <div className="absolute top-8 -left-2 lg:-left-8 bg-white rounded-2xl shadow-medium px-3 py-2 flex items-center gap-2 animate-float-fast border-2 border-mint/30">
                <div className="w-9 h-9 rounded-xl bg-mint flex items-center justify-center text-white font-extrabold text-sm">
                  +50
                </div>
                <div className="text-right">
                  <p className="font-display font-extrabold text-sm leading-none">XP</p>
                  <p className="text-[10px] text-muted-foreground">اليوم</p>
                </div>
              </div>

              <div className="absolute bottom-20 -right-2 lg:-right-6 bg-white rounded-2xl shadow-medium px-3 py-2 flex items-center gap-2 animate-float-slow border-2 border-pink/30">
                <div className="w-9 h-9 rounded-xl bg-fun-gradient flex items-center justify-center text-white">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <p className="font-display font-extrabold text-sm leading-none">7🔥</p>
                  <p className="text-[10px] text-muted-foreground">سلسلة</p>
                </div>
              </div>

              <div className="absolute top-1/3 -left-4 bg-pink rounded-2xl shadow-pink p-2.5 animate-wiggle border-4 border-white">
                <span className="font-display font-extrabold text-xl text-white">שלום</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
