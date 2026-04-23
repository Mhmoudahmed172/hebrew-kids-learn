import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowRight, Play, Lock, Star, Trophy, Sparkles, Gamepad2, Mic, Music, ClipboardCheck, Video, CheckCircle2, Crown, Flame, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { getLevelBySlug, type Lesson, type LessonType } from "@/data/levels";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const typeMeta: Record<LessonType, { icon: any; label: string; color: string; bg: string }> = {
  video: { icon: Video, label: "فيديو", color: "text-secondary", bg: "bg-secondary-soft" },
  game: { icon: Gamepad2, label: "لعبة", color: "text-pink", bg: "bg-pink-soft" },
  pronunciation: { icon: Mic, label: "نطق", color: "text-primary", bg: "bg-primary-soft" },
  song: { icon: Music, label: "أغنية", color: "text-accent-foreground", bg: "bg-accent-soft" },
  quiz: { icon: ClipboardCheck, label: "اختبار", color: "text-mint", bg: "bg-mint-soft" },
};

const LessonCard = ({ lesson }: { lesson: Lesson }) => {
  const meta = typeMeta[lesson.type];
  const Icon = meta.icon;
  return (
    <div
      className={`group relative bg-card rounded-3xl p-5 border-2 ${
        lesson.locked ? "border-border opacity-60" : "border-border/60 hover:border-primary/40 hover:-translate-y-1 hover:shadow-medium"
      } transition-bounce`}
    >
      <div className="flex items-start gap-4">
        <div className={`shrink-0 w-14 h-14 rounded-2xl ${meta.bg} flex items-center justify-center`}>
          {lesson.locked ? <Lock className={`w-6 h-6 ${meta.color}`} /> : <Icon className={`w-7 h-7 ${meta.color}`} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-bold ${meta.color}`}>{meta.label}</span>
            <span className="text-xs text-muted-foreground">• {lesson.duration}</span>
          </div>
          <h3 className="font-display text-base mb-1 truncate">{lesson.title}</h3>
          {lesson.description && <p className="text-xs text-muted-foreground line-clamp-2">{lesson.description}</p>}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3].map((i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i <= (lesson.stars || 0) ? "fill-accent text-accent" : "text-muted"}`}
                />
              ))}
            </div>
            {lesson.completed && !lesson.locked && (
              <CheckCircle2 className="w-5 h-5 text-mint" />
            )}
            {!lesson.completed && !lesson.locked && (
              <Button size="sm" variant="soft" className="h-8 px-3 text-xs">
                <Play className="w-3 h-3" /> ابدأ
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SectionEmpty = ({ label }: { label: string }) => (
  <div className="bg-card rounded-3xl p-10 border-2 border-dashed border-border text-center">
    <Sparkles className="w-10 h-10 mx-auto mb-3 text-primary/40" />
    <p className="font-display text-lg mb-1">قريباً!</p>
    <p className="text-sm text-muted-foreground">{label} لهذا المستوى ستكون متاحة قريباً.</p>
  </div>
);

const LevelDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const level = slug ? getLevelBySlug(slug) : undefined;

  if (!level) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="font-display text-2xl mb-4">المستوى غير موجود</p>
          <Button onClick={() => navigate("/")} variant="hero">العودة للرئيسية</Button>
        </div>
      </main>
    );
  }

  const sections: { key: string; label: string; icon: any; lessons: Lesson[]; emoji: string }[] = [
    { key: "videos", label: "فيديوهات", icon: Video, lessons: level.videos, emoji: "🎬" },
    { key: "games", label: "ألعاب", icon: Gamepad2, lessons: level.games, emoji: "🎮" },
    { key: "pronunciation", label: "النطق", icon: Mic, lessons: level.pronunciation, emoji: "🎤" },
    { key: "songs", label: "أغاني", icon: Music, lessons: level.songs, emoji: "🎵" },
    { key: "quizzes", label: "اختبارات", icon: ClipboardCheck, lessons: level.quizzes, emoji: "🧪" },
  ];

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-hero-gradient pt-28 pb-16 overflow-hidden">
        <div className="blob bg-primary/30 w-72 h-72 -top-10 -right-10" />
        <div className="blob bg-accent/30 w-72 h-72 bottom-0 -left-10" />

        <div className="container relative">
          <Link to="/#levels" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:gap-3 transition-all mb-6">
            <ArrowRight className="w-4 h-4" /> رجوع لكل المستويات
          </Link>

          <div className="grid lg:grid-cols-[auto,1fr,auto] gap-8 items-center">
            {/* Letter */}
            <div className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${level.color} flex items-center justify-center shadow-glow mx-auto lg:mx-0 animate-pop-in`}>
              <span className="font-display text-7xl text-white">{level.icon}</span>
            </div>

            {/* Info */}
            <div className="text-center lg:text-right">
              <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur px-4 py-1.5 rounded-full text-sm font-bold text-primary mb-3">
                <Crown className="w-4 h-4" /> المستوى {level.n}
              </div>
              <h1 className="font-display text-4xl lg:text-5xl mb-3">
                {level.title}
              </h1>
              <p className="text-lg text-muted-foreground mb-4 max-w-2xl">{level.subtitle}</p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <div className="flex items-center gap-1 bg-card px-3 py-1.5 rounded-full shadow-soft">
                  {[1, 2, 3].map((i) => (
                    <Star key={i} className={`w-4 h-4 ${i <= level.stars ? "fill-accent text-accent" : "text-muted"}`} />
                  ))}
                </div>
                <div className="flex items-center gap-2 bg-card px-3 py-1.5 rounded-full shadow-soft text-sm font-bold">
                  <Target className="w-4 h-4 text-secondary" /> {level.totalLessons} درس
                </div>
                <div className="flex items-center gap-2 bg-card px-3 py-1.5 rounded-full shadow-soft text-sm font-bold">
                  <Flame className="w-4 h-4 text-pink" /> {level.points} نقطة
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-3 mx-auto lg:mx-0">
              <Button variant="hero" size="lg" disabled={!level.unlocked}>
                <Play /> {level.unlocked ? "تابع التعلم" : "مغلق"}
              </Button>
              <Button variant="soft" size="lg">
                <Trophy /> عرض الإنجازات
              </Button>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-10 bg-card rounded-3xl p-6 shadow-soft border border-border/50">
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold">تقدّمك في هذا المستوى</p>
              <span className="font-display text-2xl text-gradient">{level.progress}%</span>
            </div>
            <Progress value={level.progress} className="h-3" />
            <div className="flex flex-wrap gap-3 mt-4">
              {level.badges.map((b, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 px-3 py-2 rounded-2xl border-2 ${
                    b.earned ? "border-accent bg-accent-soft" : "border-border bg-muted opacity-60"
                  }`}
                >
                  <span className="text-xl">{b.emoji}</span>
                  <span className="text-xs font-bold">{b.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container">
          <Tabs defaultValue="videos" className="w-full">
            <TabsList className="w-full h-auto flex-wrap justify-center bg-muted/50 p-2 rounded-2xl gap-2">
              {sections.map((s) => (
                <TabsTrigger
                  key={s.key}
                  value={s.key}
                  className="rounded-xl px-5 py-3 data-[state=active]:bg-card data-[state=active]:shadow-soft"
                >
                  <span className="text-lg ml-2">{s.emoji}</span>
                  <span className="font-bold">{s.label}</span>
                  <span className="text-xs text-muted-foreground mr-2">({s.lessons.length})</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {sections.map((s) => (
              <TabsContent key={s.key} value={s.key} className="mt-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-display text-2xl mb-1">
                      {s.emoji} {s.label}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {s.lessons.length > 0
                        ? `${s.lessons.length} درس • تعلّم بمرح وحماس`
                        : "محتوى قادم قريباً"}
                    </p>
                  </div>
                </div>

                {s.lessons.length === 0 ? (
                  <SectionEmpty label={s.label} />
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {s.lessons.map((lesson) => (
                      <LessonCard key={lesson.id} lesson={lesson} />
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>

          {/* Gamification banner */}
          <div className="mt-16 bg-fun-gradient rounded-3xl p-8 lg:p-10 text-white shadow-glow relative overflow-hidden">
            <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
            <div className="relative grid md:grid-cols-[1fr,auto] gap-6 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-bold mb-3">
                  <Sparkles className="w-3 h-3" /> نظام التحفيز
                </div>
                <h3 className="font-display text-2xl lg:text-3xl mb-2">
                  أكمل المستوى واحصل على الجائزة الكبرى! 🏆
                </h3>
                <p className="text-white/90">
                  اجمع النقاط، افتح الشارات، وارتقِ في رحلتك التعليمية. كل درس يقربك أكثر من إتقان العبرية.
                </p>
              </div>
              <Button variant="sun" size="xl" className="shrink-0">
                <Trophy /> ابدأ الاختبار النهائي
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default LevelDetail;
