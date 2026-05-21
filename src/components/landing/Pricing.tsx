import { Button } from "@/components/ui/button";
import { Check, Crown, Sparkles, ShieldCheck } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";

const plans = [
  {
    name: "المجاني",
    price: "0",
    period: "للأبد",
    desc: "جرّب المنصة بدون أي التزام",
    features: ["3 دروس مجانية", "ألعاب تجريبية", "تتبّع أساسي للتقدم", "حساب طفل واحد"],
    cta: "ابدأ مجانًا",
    variant: "outline" as const,
  },
  {
    name: "العائلي",
    price: "49",
    period: "ر.س / شهرياً",
    desc: "الخيار الأمثل للعائلات",
    features: ["كل الدروس والمستويات", "فيديوهات بجودة عالية", "تقارير تفصيلية للأهل", "حتى 3 حسابات أطفال", "شهادات إنجاز", "دعم متميّز"],
    cta: "اشترك الآن",
    variant: "hero" as const,
    popular: true,
  },
  {
    name: "السنوي",
    price: "399",
    period: "ر.س / سنوياً",
    desc: "وفّر 35% — أفضل قيمة للعائلات",
    features: ["كل مزايا الباقة العائلية", "حتى 5 حسابات أطفال", "محتوى حصري شهرياً", "جلسات حية مع معلّمين", "أولوية في الدعم"],
    cta: "اختر السنوي",
    variant: "fun" as const,
  },
];

const Pricing = () => {
  const head = useReveal<HTMLDivElement>();
  const grid = useReveal<HTMLDivElement>();

  return (
    <section id="pricing" className="py-24 bg-muted/40 relative overflow-hidden">
      <div className="blob bg-primary w-[400px] h-[400px] -top-20 right-1/4" />
      <div className="container relative">
        <div
          ref={head.ref}
          className={`text-right max-w-3xl mb-16 reveal ${head.visible ? "is-visible" : ""}`}
        >
          <span className="inline-block bg-primary-soft text-primary px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            💎 الباقات
          </span>
          <h2 className="font-display text-4xl lg:text-5xl mb-4">
            باقات مرنة <span className="text-gradient">تناسب كل عائلة</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            ابدأ مجانًا، وارقِ متى ما شئت. تستطيع الإلغاء بضغطة واحدة في أي وقت.
          </p>
        </div>

        <div
          ref={grid.ref}
          className={`grid md:grid-cols-3 gap-6 max-w-6xl mx-auto reveal-stagger ${grid.visible ? "is-visible" : ""}`}
        >
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative bg-card rounded-3xl p-8 transition-bounce hover:-translate-y-2 ${
                p.popular
                  ? "border-2 border-primary shadow-glow scale-105 lg:scale-110"
                  : "border border-border/50 shadow-soft hover:shadow-medium hover:border-primary/30"
              }`}
            >
              {p.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-fun-gradient text-white px-5 py-1.5 rounded-full text-sm font-bold flex items-center gap-1 shadow-pink animate-float-slow">
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

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-mint" /> دفع آمن ومشفّر</span>
          <span className="inline-flex items-center gap-2"><Check className="w-4 h-4 text-mint" /> إلغاء فوري في أي وقت</span>
          <span className="inline-flex items-center gap-2"><Check className="w-4 h-4 text-mint" /> ضمان استرجاع خلال 14 يوم</span>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
