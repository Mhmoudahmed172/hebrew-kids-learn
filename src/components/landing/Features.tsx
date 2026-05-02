import { Mic, Hand, Trophy, Sparkles, Music, Puzzle } from "lucide-react";

const games = [
  { icon: Hand, title: "اسحب وأفلت", emoji: "🎯", desc: "طابق الكلمة مع صورتها", bg: "bg-pink", shadow: "shadow-pink", rotate: "-rotate-2" },
  { icon: Mic, title: "تكلّم وردّد", emoji: "🎤", desc: "سجّل صوتك واسمع نفسك", bg: "bg-mint", shadow: "shadow-soft", rotate: "rotate-2" },
  { icon: Puzzle, title: "ركّب الأحجية", emoji: "🧩", desc: "اجمع الحروف لتكوّن كلمة", bg: "bg-accent", shadow: "shadow-glow", rotate: "-rotate-1" },
  { icon: Music, title: "غنّي معنا", emoji: "🎵", desc: "أغاني عبرية بإيقاع ممتع", bg: "bg-primary", shadow: "shadow-medium", rotate: "rotate-1" },
  { icon: Trophy, title: "تحديات يومية", emoji: "🏆", desc: "اربح كؤوس كل يوم", bg: "bg-orange", shadow: "shadow-yellow", rotate: "-rotate-2" },
  { icon: Sparkles, title: "مكافآت مفاجئة", emoji: "🎁", desc: "صناديق هدايا في كل مستوى", bg: "bg-pink", shadow: "shadow-pink", rotate: "rotate-2" },
];

const Features = () => {
  return (
    <section id="features" className="py-24 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="blob bg-primary w-[400px] h-[400px] -top-20 -left-20" />
      <div className="blob bg-accent w-[400px] h-[400px] bottom-0 -right-20" />

      <div className="container relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block bg-pink text-white px-5 py-2 rounded-full text-sm font-extrabold mb-4 shadow-pink animate-wiggle">
            🎮 ألعاب صغيرة
          </span>
          <h2 className="font-display text-4xl lg:text-6xl mb-4">
            كل درس <span className="text-gradient-fun">لعبة جديدة!</span>
          </h2>
          <p className="text-lg text-foreground/70 font-medium">
            بدل الكتاب المملّ، عندنا 6 أنواع ألعاب تخلي طفلك يطلب يكمّل!
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((g, i) => (
            <div
              key={i}
              className={`group relative bg-white rounded-3xl p-7 border-4 border-foreground/5 shadow-medium hover:-translate-y-2 hover:rotate-0 transition-bounce cursor-pointer ${g.rotate}`}
            >
              {/* Big emoji */}
              <div className="text-6xl mb-3 group-hover:scale-125 group-hover:animate-wiggle transition-bounce origin-bottom-left inline-block">
                {g.emoji}
              </div>

              {/* Tag */}
              <div className={`inline-flex items-center gap-2 ${g.bg} text-white px-3 py-1 rounded-full text-xs font-extrabold mb-3 ${g.shadow}`}>
                <g.icon className="w-3.5 h-3.5" />
                لعبة
              </div>

              <h3 className="font-display text-2xl mb-1">{g.title}</h3>
              <p className="text-foreground/60 font-medium">{g.desc}</p>

              {/* Play button on hover */}
              <div className="absolute top-5 left-5 w-10 h-10 rounded-full bg-foreground/5 group-hover:bg-accent group-hover:text-white flex items-center justify-center font-extrabold transition-bounce opacity-0 group-hover:opacity-100">
                ▶
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
