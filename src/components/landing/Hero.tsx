import { Button } from "@/components/ui/button";
import { Sparkles, PlayCircle, Star, Trophy, Zap, ShieldCheck } from "lucide-react";
import heroCharacters from "@/assets/hero-characters.png";

const Hero = () => {
  return (
    <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32" style={{ background: 'linear-gradient(180deg, hsl(var(--primary-soft)) 0%, hsl(var(--background)) 100%)' }}>
      {/* Single soft purple blob behind the image for subtle depth */}
      <div className="blob bg-primary w-[520px] h-[520px] top-20 -left-32 opacity-30" />

      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text */}
          <div className="text-center lg:text-right space-y-7 animate-pop-in">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full border border-primary/10 shadow-soft">
              <ShieldCheck className="w-4 h-4 text-mint" />
              <span className="text-sm font-bold text-foreground/80">منصة آمنة ومعتمدة لتعليم العبرية للأطفال</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.15]">
              طفلك يتعلم العبرية{" "}
              <span className="text-gradient-fun">بثقة ومتعة</span>{" "}
              من أول درس
            </h1>

            <p className="text-lg lg:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
              منهج متدرّج، فيديوهات مشوّقة، وألعاب تفاعلية مصمّمة للأطفال من 5 إلى 10 سنوات — في بيئة آمنة بدون إعلانات، مع تقارير واضحة لك كأب أو أم.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button variant="hero" size="xl">
                <Sparkles /> ابدأ الآن مجانًا
              </Button>
              <Button variant="outline" size="xl">
                <PlayCircle /> شاهد كيف تعمل
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-2">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2 space-x-reverse">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`w-9 h-9 rounded-full border-2 border-background ${
                      ['bg-primary','bg-accent','bg-secondary','bg-pink'][i-1]
                    }`} />
                  ))}
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-accent text-accent" />)}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">+10,000 عائلة تثق بنا</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-mint" />
                <span>بدون إعلانات · بدون بطاقة ائتمان</span>
              </div>
            </div>
          </div>

          {/* Hero image - 3D characters */}
          <div className="relative animate-pop-in">
            <div className="relative">
              <div className="absolute inset-0 bg-primary rounded-full blur-3xl opacity-15 scale-90" />

              <div className="relative" style={{ filter: 'drop-shadow(0 25px 35px hsl(var(--primary) / 0.30))' }}>
                <img
                  src={heroCharacters}
                  alt="معلمة وأطفال يتعلمون العبرية بمتعة"
                  width={1400}
                  height={800}
                  className="w-full h-auto relative z-10"
                />
              </div>

              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-6 bg-primary/20 blur-2xl rounded-full" />

              {/* Unified purple badges */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-medium p-4 flex items-center gap-3 z-20 border border-primary/10">
                <div className="w-12 h-12 rounded-xl bg-primary-gradient flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-display font-extrabold text-lg leading-none">+50</p>
                  <p className="text-xs text-muted-foreground">نجمة اليوم</p>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-medium p-4 flex items-center gap-3 z-20 border border-primary/10">
                <div className="w-12 h-12 rounded-xl bg-primary-gradient flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-display font-extrabold text-lg leading-none">7 أيام</p>
                  <p className="text-xs text-muted-foreground">سلسلة متواصلة</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
