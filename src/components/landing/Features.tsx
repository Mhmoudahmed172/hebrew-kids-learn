import { BookOpen, Video, Trophy, Users, Brain, Gamepad2 } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";

const features = [
  { icon: Video, title: "فيديوهات تعليمية ممتعة", desc: "محتوى مرئي عالي الجودة بأسلوب يحبّه الأطفال ويفهمونه بسهولة.", color: "primary", bg: "bg-primary-soft" },
  { icon: Gamepad2, title: "ألعاب وأنشطة تفاعلية", desc: "تعلّم باللعب — تمارين وألغاز تُثبّت المعلومة دون ملل.", color: "pink", bg: "bg-pink-soft" },
  { icon: Trophy, title: "نجوم وشارات تحفيزية", desc: "نظام مكافآت يجعل طفلك متحمّساً للعودة كل يوم.", color: "accent", bg: "bg-accent-soft" },
  { icon: Brain, title: "بطاقات حفظ ذكية", desc: "طريقة مُجرَّبة لتذكّر الكلمات والحروف العبرية بسرعة.", color: "secondary", bg: "bg-secondary-soft" },
  { icon: BookOpen, title: "منهج متدرّج آمن", desc: "من أول حرف إلى أول محادثة — خطوة بخطوة بإشراف تربوي.", color: "mint", bg: "bg-mint-soft" },
  { icon: Users, title: "تقارير واضحة للأهل", desc: "اعرف تقدّم طفلك لحظة بلحظة، بدون تعقيد.", color: "primary", bg: "bg-primary-soft" },
];

const Features = () => {
  const head = useReveal<HTMLDivElement>();
  const grid = useReveal<HTMLDivElement>();

  return (
    <section id="features" className="py-24 relative">
      <div className="container">
        <div
          ref={head.ref}
          className={`text-right max-w-3xl mb-16 reveal ${head.visible ? "is-visible" : ""}`}
        >
          <span className="inline-block bg-accent-soft text-accent-foreground px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            ✨ مميزاتنا
          </span>
          <h2 className="font-display text-4xl lg:text-5xl mb-4">
            <span className="heading-underline">كل ما يحتاجه طفلك في <span className="text-gradient">مكان واحد</span></span>
          </h2>
          <p className="text-lg text-muted-foreground">
            تجربة تعلّم متكاملة، ممتعة، وآمنة — مصمّمة بعناية ليثق بها كل أب وأم.
          </p>
        </div>

        <div
          ref={grid.ref}
          className={`grid sm:grid-cols-2 lg:grid-cols-3 gap-6 reveal-stagger ${grid.visible ? "is-visible" : ""}`}
        >
          {features.map((f, i) => (
            <div
              key={i}
              className="group bg-card-gradient rounded-3xl p-8 border border-border/50 shadow-soft hover:shadow-medium transition-bounce hover:-translate-y-1.5 hover:border-primary/30"
            >
              <div className={`w-16 h-16 rounded-2xl ${f.bg} flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-6 transition-bounce`}>
                <f.icon className={`w-8 h-8 text-${f.color}`} />
              </div>
              <h3 className="font-display text-xl mb-2">{f.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
