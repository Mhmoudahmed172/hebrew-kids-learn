import { Button } from "@/components/ui/button";
import { Check, Crown, Sparkles } from "lucide-react";

const plans = [
  {
    name: "المجاني",
    price: "0",
    period: "للأبد",
    desc: "ابدأ رحلة طفلك بدون أي التزام",
    features: ["3 دروس مجانية", "ألعاب تجريبية", "تتبع أساسي للتقدم", "حساب طفل واحد"],
    cta: "ابدأ مجاناً",
    variant: "outline" as const,
  },
  {
    name: "العائلي",
    price: "49",
    period: "ر.س / شهرياً",
    desc: "الأكثر شعبية للعائلات",
    features: ["كل الدروس والمستويات", "فيديوهات بجودة عالية", "تقارير تفصيلية للأهل", "حتى 3 حسابات أطفال", "شهادات إنجاز", "دعم متميز"],
    cta: "اشترك الآن",
    variant: "hero" as const,
    popular: true,
  },
  {
    name: "السنوي",
    price: "399",
    period: "ر.س / سنوياً",
    desc: "وفّر 35% مع الاشتراك السنوي",
    features: ["كل مزايا الباقة العائلية", "حتى 5 حسابات أطفال", "محتوى حصري شهرياً", "جلسات حية مع معلمين", "أولوية في الدعم"],
    cta: "اختر السنوي",
    variant: "fun" as const,
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="py-24 bg-muted/40 relative overflow-hidden">
      <div className="blob bg-primary w-[400px] h-[400px] -top-20 right-1/4" />
      <div className="container relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block bg-primary-soft text-primary px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            💎 الباقات
          </span>
          <h2 className="font-display text-4xl lg:text-5xl mb-4">
            باقات بأسعار <span className="text-gradient">مناسبة لكل عائلة</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            اختر الباقة المناسبة لاحتياجات طفلك. يمكنك التغيير أو الإلغاء في أي وقت.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative bg-card rounded-3xl p-8 transition-bounce hover:-translate-y-2 ${
                p.popular
                  ? "border-2 border-primary shadow-glow scale-105 lg:scale-110"
                  : "border border-border/50 shadow-soft hover:shadow-medium"
              }`}
            >
              {p.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-fun-gradient text-white px-5 py-1.5 rounded-full text-sm font-bold flex items-center gap-1 shadow-pink">
                  <Crown className="w-4 h-4" /> الأكثر شعبية
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="font-display text-2xl mb-2">{p.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{p.desc}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="font-display text-5xl text-gradient">{p.price}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{p.period}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-mint-soft flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-mint" />
                    </div>
                    <span className="text-sm">{f}</span>
                  </li>
                ))}
              </ul>

              <Button variant={p.variant} size="lg" className="w-full">
                {p.popular && <Sparkles />}
                {p.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
