import { Activity, Bell, Calendar, Clock, ShieldCheck, TrendingUp } from "lucide-react";

const ParentDashboard = () => {
  const days = [40, 65, 50, 80, 70, 95, 60];
  return (
    <section id="parents" className="py-24 bg-muted/40 relative overflow-hidden">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* Text */}
          <div className="space-y-6 order-2 lg:order-1">
            <span className="inline-block bg-secondary-soft text-secondary px-4 py-1.5 rounded-full text-sm font-bold">
              👨‍👩‍👧 لوحة الأهل
            </span>
            <h2 className="font-display text-4xl lg:text-5xl leading-tight">
              تابع تقدّم طفلك <span className="text-gradient">لحظة بلحظة</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              لوحة بسيطة وواضحة تخبرك بالضبط ماذا تعلّم طفلك اليوم، أين تفوّق، وما يحتاج دعماً إضافياً — كل ذلك بدون أي تعقيد تقني.
            </p>

            <div className="space-y-3">
              {[
                { icon: TrendingUp, t: "تقارير أسبوعية مفصّلة", d: "رسوم بيانية واضحة عن وقت التعلّم والمهارات المكتسبة." },
                { icon: Bell, t: "تنبيهات الإنجازات", d: "إشعارات فورية عند فتح طفلك لمستوى أو شارة جديدة." },
                { icon: ShieldCheck, t: "بيئة آمنة 100%", d: "لا إعلانات، لا محادثات خارجية، محتوى مراجَع بعناية." },
              ].map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.t} className="flex gap-4 bg-card rounded-2xl p-4 border border-border/50 shadow-soft hover-lift">
                    <div className="w-11 h-11 rounded-xl bg-primary-soft flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-display text-base mb-0.5">{f.t}</p>
                      <p className="text-sm text-muted-foreground">{f.d}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mockup */}
          <div className="relative order-1 lg:order-2">
            <div className="absolute inset-0 bg-sky-gradient blur-3xl opacity-20 rounded-[3rem]" />

            <div className="relative bg-card rounded-[2rem] p-6 shadow-glow border border-border/60">
              {/* Window dots */}
              <div className="flex items-center gap-1.5 mb-5">
                <span className="w-3 h-3 rounded-full bg-pink/70" />
                <span className="w-3 h-3 rounded-full bg-sun" />
                <span className="w-3 h-3 rounded-full bg-mint" />
                <span className="ms-auto text-[11px] text-muted-foreground font-mono">parent.dashboard / يوسف</span>
              </div>

              {/* Stat row */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-primary-soft rounded-2xl p-3 text-center">
                  <Clock className="w-4 h-4 mx-auto text-primary mb-1" />
                  <p className="font-display text-lg leading-none">42د</p>
                  <p className="text-[10px] text-muted-foreground mt-1">اليوم</p>
                </div>
                <div className="bg-mint-soft rounded-2xl p-3 text-center">
                  <Activity className="w-4 h-4 mx-auto text-mint mb-1" />
                  <p className="font-display text-lg leading-none">+18%</p>
                  <p className="text-[10px] text-muted-foreground mt-1">دقّة الإجابات</p>
                </div>
                <div className="bg-accent-soft rounded-2xl p-3 text-center">
                  <Calendar className="w-4 h-4 mx-auto text-accent mb-1" />
                  <p className="font-display text-lg leading-none">7</p>
                  <p className="text-[10px] text-muted-foreground mt-1">أيام نشطة</p>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-muted/40 rounded-2xl p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-display text-sm">نشاط الأسبوع</p>
                  <span className="text-[10px] bg-mint-soft text-mint font-bold px-2 py-0.5 rounded-full">↑ ممتاز</span>
                </div>
                <div className="flex items-end justify-between gap-2 h-24">
                  {days.map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-primary to-primary-glow transition-bounce hover:scale-y-110 origin-bottom"
                        style={{ height: `${h}%` }}
                      />
                      <span className="text-[9px] text-muted-foreground">{["س","ح","ن","ث","ر","خ","ج"][i]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-2.5">
                {[
                  { l: "الحروف", v: 92, c: "bg-mint" },
                  { l: "المفردات", v: 74, c: "bg-primary" },
                  { l: "المحادثة", v: 48, c: "bg-accent" },
                ].map((s) => (
                  <div key={s.l}>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="font-bold">{s.l}</span>
                      <span className="text-muted-foreground">{s.v}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full ${s.c} rounded-full animate-progress`} style={{ ["--target-width" as any]: `${s.v}%`, width: `${s.v}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating notification */}
            <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-medium p-3 flex items-center gap-3 animate-float-slow max-w-[220px]">
              <div className="w-10 h-10 rounded-xl bg-sun-gradient flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">شارة جديدة! 🏆</p>
                <p className="text-[10px] text-muted-foreground">يوسف فتح "بطل الحروف"</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ParentDashboard;
