import { MousePointerClick, Mic, Layers, BarChart3, ShieldCheck, Headphones } from "lucide-react";

const features = [
  {
    icon: MousePointerClick,
    title: "تمارين تفاعلية",
    desc: "السحب والإفلات، المطابقة، والاختيار المتعدد — تثبّت المعلومة بدون ملل.",
  },
  {
    icon: Mic,
    title: "نطق وتسجيل",
    desc: "استمع للنطق الأصلي وسجّل صوتك لمقارنة دقيقة وتحسين سريع.",
  },
  {
    icon: Layers,
    title: "مسارات حسب المستوى",
    desc: "محتوى متدرّج للأطفال واليافعين والكبار، تختار البداية المناسبة لك.",
  },
  {
    icon: BarChart3,
    title: "متابعة تقدّم واضحة",
    desc: "لوحة بسيطة تعرض الدروس المكتملة، الوقت، ونقاط القوة والضعف.",
  },
  {
    icon: ShieldCheck,
    title: "بيئة آمنة وبدون إعلانات",
    desc: "محتوى مراجَع، خصوصية محفوظة، وأدوات تحكّم للأهل.",
  },
  {
    icon: Headphones,
    title: "محتوى صوتي عالي الجودة",
    desc: "مقاطع مسجّلة من ناطقين أصليين بصوت طبيعي وواضح.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <span className="inline-block text-xs font-semibold tracking-wider uppercase text-primary bg-primary-soft px-3 py-1 rounded-full mb-4">
            المزايا
          </span>
          <h2 className="font-display text-3xl lg:text-5xl tracking-tight mb-4">
            كل ما تحتاجه لتتعلّم العبرية بثقة
          </h2>
          <p className="text-muted-foreground text-lg">
            أدوات مدروسة، واجهة هادئة، وتجربة تعليمية تركّز على الفهم لا التشتيت.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="group bg-white border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-medium transition-smooth"
            >
              <div className="w-11 h-11 rounded-xl bg-primary-soft text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-smooth">
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="font-display text-xl mb-2">{f.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
