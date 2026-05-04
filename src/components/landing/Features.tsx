import { BookOpen, Video, Trophy, Users, Brain, Gamepad2 } from "lucide-react";

const features = [
  { icon: Video, title: "فيديوهات يحبّها الأطفال", desc: "دروس مرئية قصيرة بشخصيات مرحة تجعل الحرف العبري سهلاً ومحبَّباً.", color: "primary", bg: "bg-primary-soft" },
  { icon: Gamepad2, title: "ألعاب تعلّم بدون ملل", desc: "تمارين تفاعلية وألغاز ممتعة — طفلك يلعب، وفي نفس الوقت يحفظ ويفهم.", color: "pink", bg: "bg-pink-soft" },
  { icon: Trophy, title: "نقاط وشارات تحفّز يومياً", desc: "نظام مكافآت ذكي يجعل طفلك متشوّقاً للعودة وإكمال السلسلة كل يوم.", color: "accent", bg: "bg-accent-soft" },
  { icon: Brain, title: "بطاقات حفظ تثبّت المعلومة", desc: "مراجعة ذكية بنظام التكرار المتباعد لتذكُّر سريع وعميق للكلمات.", color: "secondary", bg: "bg-secondary-soft" },
  { icon: BookOpen, title: "منهج متدرّج من الصفر", desc: "من أول حرف عبري حتى محادثة كاملة — خطوة بخطوة بدون قفزات صعبة.", color: "mint", bg: "bg-mint-soft" },
  { icon: Users, title: "تقارير واضحة للأهل", desc: "اعرف بالضبط أين وصل طفلك، وأين يحتاج دعماً — بدون تعقيد.", color: "primary", bg: "bg-primary-soft" },
];

const Features = () => {
  return (
    <section id="features" className="py-24 relative">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block bg-accent-soft text-accent-foreground px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            ✨ مميزاتنا
          </span>
          <h2 className="font-display text-4xl lg:text-5xl mb-4">
            كل ما يحتاجه طفلك في <span className="text-gradient">مكان واحد</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            مصمم بعناية ليجعل رحلة تعلم العبرية تجربة ممتعة وفعّالة من البداية للنهاية.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="group bg-card-gradient rounded-3xl p-8 border border-border/50 shadow-soft hover:shadow-medium transition-bounce hover:-translate-y-1"
            >
              <div className={`w-16 h-16 rounded-2xl ${f.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-bounce`}>
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
