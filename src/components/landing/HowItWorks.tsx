import { UserPlus, Sparkles, TrendingUp } from "lucide-react";
import parentChild from "@/assets/parent-child.png";

const steps = [
  { n: "1", icon: UserPlus, title: "أنشئ حساب طفلك", desc: "تسجيل سريع في أقل من دقيقة. اختر العمر والمستوى المناسب." },
  { n: "2", icon: Sparkles, title: "ابدأ الرحلة الممتعة", desc: "دروس قصيرة يومية، فيديوهات وألعاب — كأنه يلعب لعبته المفضلة." },
  { n: "3", icon: TrendingUp, title: "تابع التقدّم بفخر", desc: "تقارير أسبوعية واضحة، شارات إنجاز، ونتائج تشعر بها بنفسك." },
];

const HowItWorks = () => {
  return (
    <section id="how" className="py-24 bg-muted/40 relative overflow-hidden">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="absolute inset-0 bg-sky-gradient rounded-[3rem] blur-3xl opacity-20" />
            <div className="relative bg-white rounded-[3rem] p-8 shadow-medium border border-white">
              <img src={parentChild} alt="أم وطفل يتعلمان معاً" width={768} height={768} loading="lazy" className="w-full h-auto" />
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-8">
            <div>
              <span className="inline-block bg-secondary-soft text-secondary px-4 py-1.5 rounded-full text-sm font-bold mb-4">
                👨‍👩‍👧 للأهل
              </span>
              <h2 className="font-display text-4xl lg:text-5xl mb-4">
                كيف تعمل <span className="text-gradient">المنصة؟</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                ثلاث خطوات بسيطة فقط ليبدأ طفلك رحلته في تعلم العبرية بطريقة ممتعة.
              </p>
            </div>

            <div className="space-y-5 relative">
              {/* Vertical journey path */}
              <div className="absolute right-7 top-14 bottom-14 w-0.5 bg-gradient-to-b from-primary via-accent to-pink opacity-30" />

              {steps.map((s, idx) => (
                <div key={s.n} className="flex gap-5 bg-card rounded-2xl p-5 shadow-soft border border-border/50 hover:border-primary/30 hover:shadow-medium hover-lift transition-bounce relative">
                  <div className="flex-shrink-0 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-primary-gradient flex items-center justify-center font-display text-2xl text-primary-foreground shadow-medium ring-4 ring-background">
                      {s.n}
                    </div>
                    {idx < steps.length - 1 && (
                      <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-primary/40 text-2xl">↓</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <s.icon className="w-5 h-5 text-primary" />
                      <h3 className="font-display text-xl">{s.title}</h3>
                    </div>
                    <p className="text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
