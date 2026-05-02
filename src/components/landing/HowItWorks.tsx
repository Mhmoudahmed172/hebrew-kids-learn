import { UserPlus, Target, TrendingUp, Shield, ArrowLeft } from "lucide-react";

const steps = [
  {
    n: "01",
    icon: UserPlus,
    title: "أنشئ حسابك",
    desc: "تسجيل سريع واختيار مستواك الحالي — مبتدئ، متوسط، أو متقدّم.",
  },
  {
    n: "02",
    icon: Target,
    title: "تابع المسار",
    desc: "دروس قصيرة (5–10 دقائق) مع تمارين تفاعلية بعد كل وحدة.",
  },
  {
    n: "03",
    icon: TrendingUp,
    title: "راقب تقدّمك",
    desc: "لوحة واضحة تعرض إنجازاتك، نقاطك، والمهارات التي تحتاج مراجعة.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how" className="py-24 bg-muted/40 border-y border-border">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <span className="inline-block text-xs font-semibold tracking-wider uppercase text-accent bg-accent-soft px-3 py-1 rounded-full mb-4">
            كيف تعمل
          </span>
          <h2 className="font-display text-3xl lg:text-5xl tracking-tight mb-4">
            ثلاث خطوات بسيطة للبدء
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5 mb-16">
          {steps.map((s) => (
            <div
              key={s.n}
              className="relative bg-white border border-border rounded-2xl p-6 hover:shadow-medium transition-smooth"
            >
              <div className="flex items-start justify-between mb-5">
                <div className="w-11 h-11 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
                  <s.icon className="w-5 h-5" />
                </div>
                <span className="font-display text-2xl text-muted-foreground/40">{s.n}</span>
              </div>
              <h3 className="font-display text-xl mb-2">{s.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Parents section — calm, professional */}
        <div className="max-w-4xl mx-auto bg-primary-dark text-primary-dark-foreground rounded-2xl p-8 lg:p-10">
          <div className="grid md:grid-cols-[auto_1fr_auto] gap-6 items-center">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 mx-auto md:mx-0">
              <Shield className="w-5 h-5" />
            </div>
            <div className="text-center md:text-right">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-1">
                للأهل
              </p>
              <h3 className="font-display text-2xl mb-1.5">تابع تقدّم أبنائك بكل وضوح</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                تقارير دورية، أدوات للحدّ من وقت الاستخدام، ومحتوى مفلتر ومراجَع.
              </p>
            </div>
            <button className="inline-flex items-center gap-2 bg-white text-primary-dark hover:bg-white/90 font-semibold px-5 py-2.5 rounded-lg text-sm transition-smooth">
              لوحة الأهل <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
