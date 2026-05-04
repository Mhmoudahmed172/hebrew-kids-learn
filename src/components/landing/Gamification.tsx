import { Star, Trophy, Flame, Target, Crown, Medal, Sparkles, Award } from "lucide-react";

const badges = [
  { icon: Star, label: "نجمة الانطلاق", color: "from-sun to-accent", earned: true },
  { icon: Flame, label: "سلسلة 7 أيام", color: "from-pink to-accent", earned: true },
  { icon: Trophy, label: "بطل الحروف", color: "from-primary to-pink", earned: true },
  { icon: Medal, label: "خبير الكلمات", color: "from-mint to-teal", earned: false },
  { icon: Crown, label: "ملك العبرية", color: "from-secondary to-accent", earned: false },
  { icon: Award, label: "نجم المحادثة", color: "from-teal to-primary", earned: false },
];

const Gamification = () => {
  return (
    <section id="game" className="py-24 relative overflow-hidden">
      <div className="blob bg-pink w-[400px] h-[400px] top-20 -left-32" />
      <div className="blob bg-accent w-[350px] h-[350px] bottom-10 right-0" />

      <div className="container relative">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-block bg-pink-soft text-pink px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            🎮 نظام التحفيز
          </span>
          <h2 className="font-display text-4xl lg:text-5xl mb-4">
            تعلّم يشبه <span className="text-gradient-fun">اللعبة المفضلة</span> لطفلك
          </h2>
          <p className="text-lg text-muted-foreground">
            نقاط، شارات، مستويات، وسلاسل يومية. كل إنجاز صغير يفتح مكافأة جديدة ويزيد حماس طفلك للاستمرار.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6 items-stretch">
          {/* Left: Player Card Mockup */}
          <div className="lg:col-span-2 relative">
            <div className="relative bg-fun-gradient rounded-[2rem] p-7 shadow-glow text-white overflow-hidden">
              {/* Decorative confetti */}
              <div className="absolute top-4 right-6 text-2xl animate-float-slow">⭐</div>
              <div className="absolute top-10 right-20 text-xl animate-float-fast">🎯</div>
              <div className="absolute bottom-6 left-8 text-2xl animate-wiggle">🏆</div>

              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl ring-4 ring-white/30">
                    🦊
                  </div>
                  <span className="absolute -bottom-1 -right-1 bg-sun text-foreground text-xs font-extrabold px-2 py-0.5 rounded-full shadow-medium">
                    LV 7
                  </span>
                </div>
                <div>
                  <p className="text-xs opacity-80">المتعلّم النشِط</p>
                  <p className="font-display text-xl">يوسف</p>
                </div>
                <div className="ms-auto text-center bg-white/15 backdrop-blur rounded-2xl px-3 py-2">
                  <p className="text-xs opacity-80">النقاط</p>
                  <p className="font-display text-xl flex items-center gap-1"><Star className="w-4 h-4 fill-sun text-sun" /> 1,240</p>
                </div>
              </div>

              {/* Progress to next level */}
              <div className="relative z-10 mb-5">
                <div className="flex items-center justify-between text-xs mb-2 opacity-90">
                  <span>التقدّم للمستوى 8</span>
                  <span className="font-bold">720 / 1000</span>
                </div>
                <div className="h-3 rounded-full bg-white/20 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sun to-accent rounded-full animate-progress"
                    style={{ ["--target-width" as any]: "72%", width: "72%" }}
                  />
                </div>
              </div>

              {/* Streak */}
              <div className="relative z-10 grid grid-cols-3 gap-3">
                <div className="bg-white/15 backdrop-blur rounded-xl p-3 text-center">
                  <Flame className="w-5 h-5 mx-auto mb-1 text-sun" />
                  <p className="font-display text-lg leading-none">7</p>
                  <p className="text-[10px] opacity-80 mt-1">أيام متتالية</p>
                </div>
                <div className="bg-white/15 backdrop-blur rounded-xl p-3 text-center">
                  <Target className="w-5 h-5 mx-auto mb-1 text-mint" />
                  <p className="font-display text-lg leading-none">12</p>
                  <p className="text-[10px] opacity-80 mt-1">تحدي مكتمل</p>
                </div>
                <div className="bg-white/15 backdrop-blur rounded-xl p-3 text-center">
                  <Trophy className="w-5 h-5 mx-auto mb-1 text-pink" />
                  <p className="font-display text-lg leading-none">3</p>
                  <p className="text-[10px] opacity-80 mt-1">شارات اليوم</p>
                </div>
              </div>
            </div>

            {/* Floating XP popup */}
            <div className="absolute -top-3 -left-3 bg-white rounded-2xl shadow-medium px-4 py-2 flex items-center gap-2 animate-float-slow">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="font-display text-sm">+50 نقطة!</span>
            </div>
          </div>

          {/* Right: Badges grid */}
          <div className="lg:col-span-3">
            <div className="bg-card-gradient rounded-[2rem] p-7 border border-border/50 shadow-soft h-full">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-display text-2xl">شارات الإنجاز</h3>
                  <p className="text-sm text-muted-foreground">3 من 6 شارات تم فتحها</p>
                </div>
                <div className="bg-mint-soft text-mint font-bold text-sm px-3 py-1.5 rounded-full">
                  +50% هذا الأسبوع
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                {badges.map((b, i) => {
                  const Icon = b.icon;
                  return (
                    <div key={i} className="text-center group cursor-pointer">
                      <div
                        className={`relative w-full aspect-square rounded-2xl bg-gradient-to-br ${b.color} flex items-center justify-center shadow-medium transition-bounce group-hover:-translate-y-1 group-hover:rotate-3 ${
                          !b.earned ? "grayscale opacity-40" : "shine-on-hover"
                        }`}
                      >
                        <Icon className="w-7 h-7 text-white" />
                        {b.earned && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-mint ring-2 ring-background animate-ping-soft" />
                        )}
                      </div>
                      <p className="text-[11px] font-bold mt-2 leading-tight">{b.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Daily quest */}
              <div className="mt-7 bg-accent-soft border border-accent/20 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-sun-gradient flex items-center justify-center shadow-yellow shrink-0">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-display text-base">مهمة اليوم: تعلّم 5 كلمات جديدة</p>
                  <div className="h-2 rounded-full bg-white/70 overflow-hidden mt-2">
                    <div className="h-full bg-fun-gradient rounded-full animate-progress" style={{ ["--target-width" as any]: "60%", width: "60%" }} />
                  </div>
                </div>
                <span className="font-display text-accent text-lg">3/5</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Gamification;
