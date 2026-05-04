import { Button } from "@/components/ui/button";
import { Sparkles, PlayCircle, Star, Trophy, Zap, ShieldCheck, Heart } from "lucide-react";
import heroCharacters from "@/assets/hero-characters.png";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-hero-gradient pt-12 pb-24 lg:pt-20 lg:pb-32">
      {/* Decorative blobs */}
      <div className="blob bg-primary w-[500px] h-[500px] -top-40 -right-40" />
      <div className="blob bg-accent w-[400px] h-[400px] top-40 -left-40" />
      <div className="blob bg-secondary w-[300px] h-[300px] bottom-0 right-1/3" />

      {/* Floating Hebrew letters */}
      <div className="absolute top-32 right-[15%] text-5xl font-display text-primary/30 animate-float-slow hidden md:block">א</div>
      <div className="absolute top-1/2 left-[10%] text-6xl font-display text-pink/40 animate-float-fast hidden md:block">ב</div>
      <div className="absolute bottom-32 right-1/4 text-4xl font-display text-accent/50 animate-wiggle hidden md:block">ג</div>

      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text */}
          <div className="text-center lg:text-right space-y-7 animate-pop-in">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full border border-primary/10 shadow-soft">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-bold text-foreground/80">منصة #1 لتعليم العبرية للأطفال</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.15]">
              طفلك يتقن العبرية{" "}
              <span className="text-gradient-fun">بطريقة يحبّها</span>{" "}
              — وأنت ترى النتيجة
            </h1>

            <p className="text-lg lg:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
              منهج تفاعلي على شكل لعبة: دروس قصيرة، فيديوهات ممتعة، ونظام نقاط وشارات يجعل طفلك يعود كل يوم بحماس — مصمَّم خصيصاً لأعمار 5 إلى 10 سنوات.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button variant="hero" size="xl" className="animate-glow-pulse shine-on-hover">
                <Sparkles /> ابدأ مجاناً 7 أيام
              </Button>
              <Button variant="outline" size="xl">
                <PlayCircle /> شاهد كيف تعمل
              </Button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1">
              <div className="inline-flex items-center gap-1.5 bg-mint-soft text-mint px-3 py-1.5 rounded-full text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5" /> آمن للأطفال
              </div>
              <div className="inline-flex items-center gap-1.5 bg-primary-soft text-primary px-3 py-1.5 rounded-full text-xs font-bold">
                <Heart className="w-3.5 h-3.5" /> بإشراف تربوي
              </div>
              <div className="inline-flex items-center gap-1.5 bg-accent-soft text-accent px-3 py-1.5 rounded-full text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" /> بدون إعلانات
              </div>
            </div>

            {/* Social proof */}
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
                  <p className="text-xs text-muted-foreground font-medium">+10,000 طفل سعيد</p>
                </div>
              </div>
            </div>
          </div>

          {/* Hero image - 3D characters */}
          <div className="relative animate-pop-in">
            <div className="relative">
              {/* Soft radial glow behind characters */}
              <div className="absolute inset-0 bg-sun-gradient rounded-full blur-3xl opacity-30 scale-75 translate-y-10" />
              <div className="absolute inset-0 bg-primary-gradient rounded-full blur-3xl opacity-20 scale-90" />

              {/* Characters with depth shadow */}
              <div className="relative" style={{ filter: 'drop-shadow(0 25px 35px hsl(var(--primary) / 0.35)) drop-shadow(0 10px 15px hsl(var(--accent) / 0.25))' }}>
                <img
                  src={heroCharacters}
                  alt="معلمة وأطفال يتعلمون العبرية بمتعة"
                  width={1400}
                  height={800}
                  className="w-full h-auto relative z-10"
                />
              </div>

              {/* Soft ground shadow ellipse */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-6 bg-primary/30 blur-2xl rounded-full" />

              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-medium p-4 flex items-center gap-3 animate-float-slow z-20">
                <div className="w-12 h-12 rounded-xl bg-sun-gradient flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-display font-extrabold text-lg leading-none">+50</p>
                  <p className="text-xs text-muted-foreground">نجمة اليوم</p>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-medium p-4 flex items-center gap-3 animate-float-fast z-20">
                <div className="w-12 h-12 rounded-xl bg-sky-gradient flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-display font-extrabold text-lg leading-none">7 أيام</p>
                  <p className="text-xs text-muted-foreground">سلسلة متواصلة</p>
                </div>
              </div>

              <div className="absolute top-1/4 -left-6 bg-pink rounded-2xl shadow-pink p-3 animate-wiggle z-20">
                <span className="font-display font-extrabold text-2xl text-white">שלום</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
