import { Button } from "@/components/ui/button";
import { Sparkles, Gift } from "lucide-react";
import kidsLearning from "@/assets/kids-learning.webp";

const FinalCTA = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container">
        <div className="relative bg-fun-gradient rounded-[3rem] p-10 lg:p-16 overflow-hidden shadow-glow">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="absolute top-10 left-10 text-6xl text-white/20 font-display animate-float-slow">א</div>
          <div className="absolute bottom-10 right-1/3 text-5xl text-white/20 font-display animate-float-fast">ש</div>

          <div className="relative grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white text-center lg:text-right space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full">
                <Gift className="w-4 h-4" />
                <span className="text-sm font-bold">هديتك: 14 يوم مجاناً بالكامل</span>
              </div>
              <h2 className="font-display text-4xl lg:text-6xl text-white leading-tight">
                لا تُضيعي العام الدراسي — ابدئي اليوم
              </h2>
              <p className="text-lg text-white/90 max-w-lg mx-auto lg:mx-0">
                انضمّي إلى +12,000 عائلة عربية اختارت أن يبدأ أطفالها رحلة العبرية بثقة ومتعة.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                <Button variant="sun" size="xl">
                  <Sparkles /> 🎁 ابدئي الآن مجاناً
                </Button>

              </div>
              <p className="text-sm text-white/80 pt-1">
                 بدون بطاقة ائتمان · إلغاء فوري    
              </p>
            </div>

            <div className="relative hidden lg:block">
              <img src={kidsLearning} alt="" width={1024} height={768} loading="lazy" className="w-full h-auto drop-shadow-2xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
