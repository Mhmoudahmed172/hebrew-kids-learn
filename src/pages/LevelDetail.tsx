import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowRight, Play, Video as VideoIcon, Music, Gamepad2, ClipboardCheck, Lock, Sparkles, Star, Trophy } from "lucide-react";
import LockedContent from "@/components/LockedContent";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { usePermissions } from "@/hooks/usePermissions";
import { toast } from "sonner";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const LevelDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { canPlay, canView, loading: permsLoading } = usePermissions();
  const [level, setLevel] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [songs, setSongs] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("videos");

  useEffect(() => {
    (async () => {
      if (!slug) return;
      const { data: lv } = await supabase.from("levels").select("*").eq("slug", slug).maybeSingle();
      setLevel(lv);
      if (lv) {
        const [v, s, g, q] = await Promise.all([
          supabase.from("videos").select("*").eq("level_id", lv.id).eq("published", true).order("sort_order"),
          supabase.from("songs").select("*").eq("level_id", lv.id).eq("published", true).order("sort_order"),
          supabase.from("games").select("*").eq("level_id", lv.id).eq("published", true).order("sort_order"),
          supabase.from("quizzes").select("*, quiz_questions(count)").eq("level_id", lv.id).eq("published", true),
        ]);
        setVideos(v.data || []);
        setSongs(s.data || []);
        setGames(g.data || []);
        setQuizzes(q.data || []);
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="text-6xl animate-bounce mb-3">🎈</div>
        <p className="font-display text-xl text-muted-foreground">جاري تحضير المغامرة...</p>
      </div>
    </div>
  );

  if (!level) return (
    <main dir="rtl" className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-7xl mb-4">🤔</div>
        <p className="font-display text-2xl mb-4">المستوى غير موجود</p>
        <Button onClick={() => navigate("/")} variant="hero">العودة للرئيسية</Button>
      </div>
    </main>
  );

  const levelLocked = !permsLoading && !canView(`level:${level.id}`);
  const blockIfLocked = (e: React.MouseEvent, allowed: boolean) => {
    if (allowed) return;
    e.preventDefault();
    toast.error("🔒 لا تملك صلاحية الوصول لهذا المحتوى. تواصل مع المشرف.");
  };

  const totalItems = videos.length + songs.length + games.length + quizzes.length;

  const tabs = [
    { value: "videos", label: "فيديوهات", icon: VideoIcon, count: videos.length, emoji: "🎬", grad: "from-secondary to-primary" },
    { value: "songs", label: "أغاني", icon: Music, count: songs.length, emoji: "🎵", grad: "from-pink to-accent" },
    { value: "games", label: "ألعاب", icon: Gamepad2, count: games.length, emoji: "🎮", grad: "from-mint to-secondary" },
    { value: "quizzes", label: "اختبارات", icon: ClipboardCheck, count: quizzes.length, emoji: "🏆", grad: "from-accent to-pink" },
  ];

  const LockBadge = () => (
    <span className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 text-xs font-bold bg-background/90 backdrop-blur text-muted-foreground border-2 border-border rounded-full px-3 py-1 shadow-soft">
      <Lock className="w-3 h-3" /> مقفل
    </span>
  );

  const cardBase = "group relative bg-card rounded-3xl p-5 border-2 border-border/60 hover:border-primary/60 hover:-translate-y-2 hover:rotate-[-1deg] hover:shadow-glow transition-bounce cursor-pointer overflow-hidden";
  const lockedCard = "group relative bg-card rounded-3xl p-5 border-2 border-dashed border-border/60 opacity-80 cursor-not-allowed overflow-hidden";

  return (
    <main dir="rtl" className="min-h-screen bg-background">
      <Navbar />

      {/* Playful Hero Banner */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-soft via-pink-soft to-secondary-soft opacity-60" />
        <div className="absolute top-10 right-10 text-6xl animate-bounce" style={{ animationDelay: "0.2s" }}>⭐</div>
        <div className="absolute top-20 left-16 text-5xl animate-bounce" style={{ animationDelay: "0.5s" }}>🎈</div>
        <div className="absolute bottom-10 right-1/3 text-4xl animate-bounce" style={{ animationDelay: "0.8s" }}>✨</div>
        <div className="absolute bottom-16 left-10 text-5xl animate-bounce" style={{ animationDelay: "0.3s" }}>🌈</div>

        <div className="container relative py-10 lg:py-14">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-primary mb-6 hover:gap-3 transition-all bg-card/80 backdrop-blur px-4 py-2 rounded-full shadow-soft">
            <ArrowRight className="w-4 h-4 rotate-180" /> العودة للرئيسية
          </Link>

          <div className="flex flex-col lg:flex-row items-center gap-8 max-w-5xl mx-auto">
            {/* Big level icon */}
            <div className="relative">
              <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-[2rem] bg-fun-gradient shadow-glow flex items-center justify-center text-7xl lg:text-8xl text-primary-foreground transform hover:rotate-6 hover:scale-105 transition-bounce">
                {level.icon || "🌟"}
              </div>
              <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-sun-gradient shadow-yellow flex items-center justify-center animate-pulse">
                <Sparkles className="w-6 h-6 text-accent-foreground" />
              </div>
            </div>

            <div className="flex-1 text-center lg:text-right">
              <span className="inline-block bg-card text-primary px-4 py-1.5 rounded-full text-sm font-bold mb-3 shadow-soft border-2 border-primary/20">
                🚀 مغامرتك الجديدة
              </span>
              <h1 className="font-display text-4xl lg:text-6xl mb-3 inline-flex items-center gap-3 flex-wrap justify-center lg:justify-start">
                {level.title}
                {levelLocked && <Lock className="w-7 h-7 text-muted-foreground" />}
              </h1>
              {level.description && <p className="text-lg text-muted-foreground max-w-2xl">{level.description}</p>}

              {/* Quick stats */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 mt-5">
                <div className="bg-card rounded-2xl px-4 py-2 border-2 border-secondary/30 shadow-soft flex items-center gap-2">
                  <Star className="w-5 h-5 text-sun" />
                  <span className="font-bold text-sm">{totalItems} نشاط</span>
                </div>
                <div className="bg-card rounded-2xl px-4 py-2 border-2 border-pink/30 shadow-soft flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-pink" />
                  <span className="font-bold text-sm">اجمع النجوم</span>
                </div>
                <div className="bg-card rounded-2xl px-4 py-2 border-2 border-mint/30 shadow-soft flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-mint" />
                  <span className="font-bold text-sm">تعلّم وامرح</span>
                </div>
              </div>
            </div>
          </div>

          {levelLocked && (
            <div className="mt-8 max-w-3xl mx-auto">
              <LockedContent
                variant="banner"
                title="هذا المستوى مقفل"
                message="يمكنك تصفّح المحتوى دون تشغيله. اطلب الصلاحية من المشرف."
                contextLabel={level.title}
              />
            </div>
          )}
        </div>
      </section>

      <section className="container py-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Big colorful tabs */}
          <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full max-w-4xl mx-auto mb-10 h-auto bg-transparent gap-3 p-0">
            {tabs.map((t) => {
              const isActive = activeTab === t.value;
              return (
                <TabsTrigger
                  key={t.value}
                  value={t.value}
                  className={`relative flex flex-col items-center gap-1 py-5 rounded-3xl border-2 font-display text-base transition-bounce data-[state=active]:scale-105 data-[state=active]:shadow-glow data-[state=active]:border-primary data-[state=active]:text-primary-foreground ${
                    isActive ? `bg-gradient-to-br ${t.grad} text-primary-foreground border-primary` : "bg-card border-border hover:border-primary/40 hover:-translate-y-1"
                  }`}
                >
                  <span className="text-3xl">{t.emoji}</span>
                  <span className="font-bold">{t.label}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${isActive ? "bg-white/30" : "bg-muted text-muted-foreground"}`}>
                    {t.count}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="videos">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {videos.length === 0 ? (
                <div className="col-span-full text-center py-16">
                  <div className="text-7xl mb-4">🎬</div>
                  <p className="font-display text-xl text-muted-foreground">قريباً... فيديوهات ممتعة في الطريق!</p>
                </div>
              ) : videos.map((v, i) => {
                const allowed = !permsLoading && canPlay("video", v.id, level.id);
                return (
                  <Link
                    key={v.id}
                    to={`/level/${slug}/video/${v.id}`}
                    onClick={(e) => blockIfLocked(e, allowed)}
                    className={allowed ? cardBase : lockedCard}
                    aria-disabled={!allowed}
                  >
                    {!allowed && <LockBadge />}
                    <span className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-secondary text-secondary-foreground font-bold flex items-center justify-center shadow-soft">
                      {i + 1}
                    </span>
                    <div className="relative aspect-video bg-gradient-to-br from-secondary-soft to-primary-soft rounded-2xl overflow-hidden mb-4 flex items-center justify-center">
                      {v.thumbnail_url ? <img src={v.thumbnail_url} alt={v.title} className="w-full h-full object-cover" /> : <span className="text-6xl">🎥</span>}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors">
                        <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center scale-0 group-hover:scale-100 transition-bounce shadow-glow">
                          {allowed ? <Play className="w-7 h-7 mr-1 fill-current" /> : <Lock className="w-7 h-7" />}
                        </div>
                      </div>
                    </div>
                    <h3 className="font-display text-lg mb-1">{v.title}</h3>
                    {v.description && <p className="text-sm text-muted-foreground line-clamp-2">{v.description}</p>}
                  </Link>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="songs">
            <div className="grid md:grid-cols-2 gap-5">
              {songs.length === 0 ? (
                <div className="col-span-full text-center py-16">
                  <div className="text-7xl mb-4">🎵</div>
                  <p className="font-display text-xl text-muted-foreground">قريباً... أغاني جميلة!</p>
                </div>
              ) : songs.map((s) => {
                const allowed = !permsLoading && canPlay("song", s.id, level.id);
                return (
                  <div key={s.id} className={allowed ? cardBase : lockedCard}>
                    {!allowed && <LockBadge />}
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink to-accent flex items-center justify-center text-primary-foreground shadow-pink group-hover:rotate-12 transition-bounce text-3xl">
                        🎶
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display text-lg">{s.title}</h3>
                        {s.description && <p className="text-sm text-muted-foreground">{s.description}</p>}
                      </div>
                    </div>
                    {s.url && allowed && (
                      <div className="bg-pink-soft rounded-2xl p-2">
                        <audio controls src={s.url} className="w-full" />
                      </div>
                    )}
                    {!allowed && (
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> الاستماع غير متاح — تواصل مع المشرف.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="games">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {games.length === 0 ? (
                <div className="col-span-full text-center py-16">
                  <div className="text-7xl mb-4">🎮</div>
                  <p className="font-display text-xl text-muted-foreground">قريباً... ألعاب رائعة بانتظارك!</p>
                </div>
              ) : games.map((g) => {
                const allowed = !permsLoading && canPlay("game", g.id, level.id);
                return (
                  <Link
                    key={g.id}
                    to={`/level/${slug}/game/${g.id}`}
                    onClick={(e) => blockIfLocked(e, allowed)}
                    className={allowed ? cardBase : lockedCard}
                    aria-disabled={!allowed}
                  >
                    {!allowed && <LockBadge />}
                    <div className="relative aspect-video rounded-2xl bg-gradient-to-br from-mint to-secondary flex items-center justify-center mb-4 overflow-hidden">
                      <span className="text-7xl group-hover:scale-125 group-hover:rotate-12 transition-bounce">
                        {allowed ? "🎯" : "🔒"}
                      </span>
                      <div className="absolute top-2 left-2 bg-card/90 backdrop-blur rounded-full px-3 py-1 text-xs font-bold text-primary">
                        لعبة
                      </div>
                    </div>
                    <h3 className="font-display text-lg mb-1 flex items-center gap-2">
                      {g.title}
                      {allowed && <span className="text-sm">🚀</span>}
                    </h3>
                    {g.description && <p className="text-sm text-muted-foreground line-clamp-2">{g.description}</p>}
                  </Link>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="quizzes">
            <div className="grid md:grid-cols-2 gap-5">
              {quizzes.length === 0 ? (
                <div className="col-span-full text-center py-16">
                  <div className="text-7xl mb-4">🏆</div>
                  <p className="font-display text-xl text-muted-foreground">قريباً... اختبارات شيّقة!</p>
                </div>
              ) : quizzes.map((q) => {
                const count = q.quiz_questions?.[0]?.count ?? 0;
                const allowed = !permsLoading && canPlay("quiz", q.id, level.id);
                return (
                  <Link
                    key={q.id}
                    to={`/quiz/${q.id}`}
                    onClick={(e) => blockIfLocked(e, allowed)}
                    className={allowed ? cardBase : lockedCard}
                    aria-disabled={!allowed}
                  >
                    {!allowed && <LockBadge />}
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-pink flex items-center justify-center text-primary-foreground shadow-yellow group-hover:rotate-12 transition-bounce text-3xl">
                        🏅
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display text-lg">{q.title}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <ClipboardCheck className="w-4 h-4" />
                          {count} {count === 1 ? "سؤال" : "أسئلة"}
                        </p>
                      </div>
                    </div>
                    {q.description && <p className="text-sm text-muted-foreground mb-3">{q.description}</p>}
                    <Button variant="hero" size="sm" className="w-full" disabled={!allowed}>
                      {allowed ? <>🚀 ابدأ التحدي</> : <><Lock className="w-4 h-4" /> مقفل</>}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </section>

      <Footer />
    </main>
  );
};

export default LevelDetail;
