import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "سارة الأحمد",
    role: "أم لـ ليان (7 سنوات)",
    text: "ابنتي صارت تطلب بنفسها تفتح المنصة كل يوم! الطريقة الممتعة جذبتها وصارت تحفظ كلمات عبرية بسرعة مذهلة.",
    color: "bg-primary-soft",
    avatarColor: "bg-primary-gradient",
  },
  {
    name: "محمد العتيبي",
    role: "أب لـ يوسف (9 سنوات)",
    text: "تقارير التقدم رائعة وأقدر أتابع كل خطوة. الأسعار معقولة جداً مقارنة بالقيمة اللي يحصل عليها الطفل.",
    color: "bg-secondary-soft",
    avatarColor: "bg-sky-gradient",
  },
  {
    name: "نورة الخالدي",
    role: "أم لـ سلمى وأحمد",
    text: "أفضل استثمار لأطفالي! النظام التحفيزي خلاهم متحمسين دائماً، والمحتوى احترافي وآمن تماماً.",
    color: "bg-pink-soft",
    avatarColor: "bg-fun-gradient",
  },
];

const Testimonials = () => {
  return (
    <section className="py-24 relative">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block bg-mint-soft text-mint px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            ⭐ آراء العائلات
          </span>
          <h2 className="font-display text-4xl lg:text-5xl mb-4">
            عائلات سعيدة <span className="text-gradient">تتحدث عنا</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            انضم لآلاف العائلات اللي اختارت منصتنا لتعليم أطفالها العبرية.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="relative bg-card rounded-3xl p-8 border border-border/50 shadow-soft hover:shadow-medium transition-bounce hover:-translate-y-1"
            >
              <Quote className="absolute top-6 left-6 w-10 h-10 text-primary/10" />

              <div className="flex items-center gap-1 mb-4">
                {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-accent text-accent" />)}
              </div>

              <p className="text-foreground/90 leading-relaxed mb-6 relative z-10">"{t.text}"</p>

              <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                <div className={`w-12 h-12 rounded-full ${t.avatarColor} flex items-center justify-center text-white font-display text-lg`}>
                  {t.name[0]}
                </div>
                <div>
                  <p className="font-bold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
