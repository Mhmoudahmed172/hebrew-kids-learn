import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Play, CheckCircle2, Star, Lock, Video as VideoIcon, ListVideo, Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getLevelBySlug, type Lesson } from "@/data/levels";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const SAMPLE_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

const VideoPlayer = () => {
  const { slug, videoId } = useParams();
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

  const videos: Lesson[] = level.videos;
  const currentIndex = videos.findIndex((v) => v.id === videoId);
  const current = videos[currentIndex];

  if (!current) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-32 text-center">
          <p className="font-display text-2xl mb-4">الفيديو غير موجود</p>
          <Button onClick={() => navigate(`/level/${slug}`)} variant="hero">العودة للمستوى</Button>
        </div>
      </main>
    );
  }

  const prev = currentIndex > 0 ? videos[currentIndex - 1] : null;
  const next = currentIndex < videos.length - 1 ? videos[currentIndex + 1] : null;
  const videoUrl = current.videoUrl || SAMPLE_VIDEO;

  const goTo = (lesson: Lesson | null) => {
    if (!lesson || lesson.locked) return;
    navigate(`/level/${slug}/video/${lesson.id}`);
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="bg-hero-gradient pt-28 pb-8 relative overflow-hidden">
        <div className="blob bg-primary/30 w-72 h-72 -top-10 -right-10" />
        <div className="container relative">
          <Link
            to={`/level/${slug}`}
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:gap-3 transition-all mb-4"
          >
            <ArrowRight className="w-4 h-4" /> رجوع للمستوى
          </Link>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="inline-flex items-center gap-2 bg-secondary-soft text-secondary px-3 py-1 rounded-full text-xs font-bold">
              <VideoIcon className="w-3 h-3" /> فيديو {currentIndex + 1} من {videos.length}
            </span>
            <span className="inline-flex items-center gap-2 bg-card px-3 py-1 rounded-full text-xs font-bold shadow-soft">
              {level.icon} {level.title}
            </span>
          </div>
          <h1 className="font-display text-3xl lg:text-4xl">{current.title}</h1>
          {current.description && (
            <p className="text-muted-foreground mt-2 max-w-2xl">{current.description}</p>
          )}
        </div>
      </section>

      {/* Player + Sidebar */}
      <section className="py-10">
        <div className="container grid lg:grid-cols-[1fr,360px] gap-8">
          {/* Player */}
          <div>
            <div className="rounded-3xl overflow-hidden bg-black shadow-glow border-4 border-card">
              <video
                key={current.id}
                src={videoUrl}
                controls
                autoPlay
                className="w-full aspect-video"
              />
            </div>

            {/* Prev / Next controls */}
            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              <button
                onClick={() => goTo(prev)}
                disabled={!prev || prev.locked}
                className={`group bg-card rounded-2xl p-4 border-2 text-right flex items-center gap-3 transition-bounce ${
                  !prev || prev.locked
                    ? "opacity-50 cursor-not-allowed border-border"
                    : "border-border/60 hover:border-primary/40 hover:-translate-y-1 hover:shadow-medium"
                }`}
              >
                <div className="shrink-0 w-12 h-12 rounded-xl bg-primary-soft flex items-center justify-center">
                  <ArrowRight className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-bold mb-0.5">الفيديو السابق</p>
                  <p className="font-display text-sm truncate">{prev?.title || "لا يوجد"}</p>
                </div>
              </button>

              <button
                onClick={() => goTo(next)}
                disabled={!next || next.locked}
                className={`group bg-card rounded-2xl p-4 border-2 text-right flex items-center gap-3 transition-bounce ${
                  !next || next.locked
                    ? "opacity-50 cursor-not-allowed border-border"
                    : "border-secondary/40 hover:border-secondary hover:-translate-y-1 hover:shadow-medium"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-bold mb-0.5">الفيديو التالي</p>
                  <p className="font-display text-sm truncate">{next?.title || "نهاية القائمة"}</p>
                </div>
                <div className="shrink-0 w-12 h-12 rounded-xl bg-secondary-soft flex items-center justify-center">
                  <ArrowLeft className="w-5 h-5 text-secondary" />
                </div>
              </button>
            </div>

            {/* Encouragement banner */}
            <div className="mt-8 bg-fun-gradient rounded-3xl p-6 text-white shadow-glow relative overflow-hidden">
              <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
              <div className="relative flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <p className="font-display text-lg mb-1">أحسنت! 🎉</p>
                  <p className="text-sm text-white/90">
                    أكمل مشاهدة الفيديو واحصل على ⭐⭐⭐ نجوم ونقاط جديدة!
                  </p>
                </div>
                {next && !next.locked && (
                  <Button variant="sun" size="lg" onClick={() => goTo(next)} className="shrink-0 hidden sm:flex">
                    التالي <ArrowLeft />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - all videos */}
          <aside className="lg:sticky lg:top-24 self-start">
            <div className="bg-card rounded-3xl p-5 border-2 border-border/60 shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-secondary-soft flex items-center justify-center">
                    <ListVideo className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-display text-base leading-none">قائمة الفيديوهات</p>
                    <p className="text-xs text-muted-foreground mt-1">{videos.length} درس مرئي</p>
                  </div>
                </div>
                <Trophy className="w-5 h-5 text-accent" />
              </div>

              <div className="mb-4">
                <Progress value={((currentIndex + 1) / videos.length) * 100} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  أنت في الفيديو {currentIndex + 1} من {videos.length}
                </p>
              </div>

              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {videos.map((v, i) => {
                  const active = v.id === current.id;
                  const disabled = v.locked;
                  return (
                    <button
                      key={v.id}
                      onClick={() => !disabled && goTo(v)}
                      disabled={disabled}
                      className={`w-full text-right flex items-center gap-3 p-3 rounded-2xl border-2 transition-bounce ${
                        active
                          ? "border-primary bg-primary-soft"
                          : disabled
                          ? "border-border opacity-50 cursor-not-allowed"
                          : "border-transparent hover:border-border hover:bg-muted/50"
                      }`}
                    >
                      <div
                        className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ${
                          active
                            ? "bg-primary text-primary-foreground"
                            : v.completed
                            ? "bg-mint-soft text-mint"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {disabled ? <Lock className="w-4 h-4" /> : v.completed ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold truncate ${active ? "text-primary" : ""}`}>
                          {v.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">{v.duration}</span>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3].map((s) => (
                              <Star
                                key={s}
                                className={`w-3 h-3 ${
                                  s <= (v.stars || 0) ? "fill-accent text-accent" : "text-muted"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      {active && <Play className="w-4 h-4 text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default VideoPlayer;
