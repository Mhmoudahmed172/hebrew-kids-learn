import { BookOpen, Users, Star, Heart, Target, Globe } from "lucide-react";

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

// Need to import ShieldCheck for values - let me add it properly
import { ShieldCheck } from "lucide-react";

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
            قصتنا بدأت من{