import { BookOpen, Users, Star, Heart, Target, Globe, ShieldCheck } from "lucide-react";

const stats = [
  { icon: Users, value: "+10,000", label: "طفل يتعلم معنا" },
  { icon: BookOpen, value: "+200", label: "درس تفاعلي" },
  { icon: Star, value: "+50", label: "لعبة تعليمية" },
  { icon: Heart, value: "99%", label: "رضا الأهل" },
];

const values = [
  {
    icon: Target,
    title: "التعلم بمتعة",
    desc: "نعتقد إن التعلم الأفضل بصير من خلال اللعب والمغامرة، مش من خلال الحفظ الجاف.",
  },
  {
    icon: ShieldCheck,
    title: "بيئة آمنة",
    desc: "منصة خالية من الإعلانات والمحتوى غير المناسب — مصممة خصيصاً لعالم طفلك.",
  },
  {
    icon: Globe,
    title: "ثقافة عربية أصيلة",
    desc: "محتوى مبني من الصفر للأطفال العرب، بأسلوب يناسب عقليتهم وبيئتهم الثقافية.",
  },
];

const AboutUs = () => {
  return (
    <section className="py-20 lg:py-28 bg-background relative overflow-hidden" id="about">
      {/* Decorative blobs */}
      <div className="blob bg-mint w-[400px] h-[400px] -top-40 -right-40 opacity-15" />
      <div className="blob bg-pink w-[350px] h-[350px] bottom-0 -left-32 opacity-10" />

      <div className="container relative">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 bg-primary-soft text-primary px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            <Heart className="w-4 h-4" />
            من نحن
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl mb-5">
            قصتنا بدأت من <span className="text-gradient-fun">حلم بسيط</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            حلمنا نسوي تعلم العبرية متاح وممتع لكل طفل عربي. مش بس دروس — رحلة كاملة من الاكتشاف والإنجاز.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-16">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-card-gradient border border-border/50 rounded-3xl p-6 text-center card-lift shadow-soft"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary-gradient flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <p className="font-display text-3xl font-extrabold text-gradient mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Story text */}
        <div className="bg-card-gradient border border-border/50 rounded-3xl p-8 lg:p-12 shadow-medium mb-16">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <h3 className="font-display text-2xl lg:text-3xl">
                منصة <span className="text-gradient-fun">عبري ببساطة</span> — أكثر من مجرد دروس
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                انطلقنا عام 2024 بهدف واحد: نساعد الأطفال العرب يتعلموا العبرية بأسلوب طبيعي وممتع. 
                مش من خلال الحفظ الميكانيكي، بل من خلال فيديوهات قصصية، ألعاب ذكية، واختبارات تحفيزية.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                كل درس بناه فريق من المتخصصين باللغة العبرية وعلوم التربية والتعلم الإلكتروني. 
                والنتيجة؟ أطفال يستنّون درسهم بفضول، وأهل مطمئنين على جودة المحتوى.
              </p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-primary rounded-3xl blur-3xl opacity-10 scale-90" />
              <div className="grid grid-cols-2 gap-4 relative">
                <div className="bg-primary-soft rounded-2xl p-5 border border-primary/10">
                  <BookOpen className="w-8 h-8 text-primary mb-3" />
                  <p className="font-display font-bold text-lg">5 مستويات</p>
                  <p className="text-sm text-muted-foreground">متدرجة من الحروف للمحادثة</p>
                </div>
                <div className="bg-secondary-soft rounded-2xl p-5 border border-secondary/10">
                  <Star className="w-8 h-8 text-secondary mb-3" />
                  <p className="font-display font-bold text-lg">نظام نقاط</p>
                  <p className="text-sm text-muted-foreground">يحفز الطفل يكمل رحلته</p>
                </div>
                <div className="bg-mint-soft rounded-2xl p-5 border border-mint/10">
                  <Users className="w-8 h-8 text-mint mb-3" />
                  <p className="font-display font-bold text-lg">مجتمع حي</p>
                  <p className="text-sm text-muted-foreground">لوحة المتصدرين والتحديات</p>
                </div>
                <div className="bg-pink-soft rounded-2xl p-5 border border-pink/10">
                  <Heart className="w-8 h-8 text-pink mb-3" />
                  <p className="font-display font-bold text-lg">بدون إعلانات</p>
                  <p className="text-sm text-muted-foreground">بيئة آمنة ونظيفة للطفل</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default AboutUs;
