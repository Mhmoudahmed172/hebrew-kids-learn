import { UserPlus, Sparkles, TrendingUp } from "lucide-react";
import parentChild from "@/assets/parent-child.webp";
import { useReveal } from "@/hooks/useReveal";

const steps = [
  { n: "1", icon: UserPlus, title: "سجّلي حساب طفلك", desc: "تسجيل آمن في أقل من دقيقة، واختاري المستوى المناسب لعمره." },
  { n: "2", icon: Sparkles, title: "15 دقيقة يومياً فقط", desc: "درس قصير ممتع كل يوم — فيديوهات وألعاب تجعل التعلّم عادة محبّبة." },
  { n: "3", icon: TrendingUp, title: "تقرير أسبوعي لكِ", desc: "اطّلعي على تقدّم طفلك وإنجازاته أسبوعياً بوضوح كامل وثقة." },
];

const HowItWorks = () => {
  const head = useReveal<HTMLDivElement>();
  const list = useReveal<HTMLDivElement>();
  const img = useReveal<HTMLDivElement>();

  return (
    <section id="how" className="py-24 bg-muted/40 relative overflow-hidden">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div
            ref={img.ref}
            className={`relative order-2 lg:order-1 reveal-zoom ${img.visible ? "is-visible" : ""}`}
          >
            <div className="absolute inset-0 bg-sky-gradient rounded-[3rem] blur-3xl opacity-20" />
            <div className="relative bg-white rounded-[3rem] p-8 shadow-medium border border-white animate-float-slow">
              <img src={parentChild} alt="أم وطفل يتعلمان معاً" width={768} height={768} loading="lazy" className="w-full h-auto" />
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-8">
            <div ref={head.ref} className={`reveal ${head.visible ? "is-visible" : ""}`}>
              <span className="inline-block bg-secondary-soft text-secondary px-4 py-1.5 rounded-full text-sm font-bold mb-4">
                👨‍👩‍👧 للأهل
              </span>
              <h2 className="font-display text-4xl lg:text-5xl mb-4">
                ابدأ خلال دقيقة — <span className="text-gradient">3 خطوات فقط</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                صمّمنا الرحلة لتكون بسيطة وواضحة، حتى لو لم تستخدم منصّات تعليمية من قبل.
              </p>
            </div>

            <div
              ref={list.ref}
              className={`space-y-5 reveal-stagger ${list.visible ? "is-visible" : ""}`}
            >
              {steps.map((s) => (
                <div key={s.n} className="group flex gap-5 bg-card rounded-2xl p-5 shadow-soft border border-border/50 hover:border-primary/40 hover:shadow-medium hover:-translate-y-0.5 transition-smooth">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-primary-gradient flex items-center justify-center font-display text-2xl text-primary-foreground shadow-soft animate-step-pulse group-hover:scale-110 transition-bounce">
                      {s.n}
                    </div>
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
