import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowRight, Play, Video as VideoIcon, Music, Gamepad2, ClipboardCheck, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

// استخراج src من كود iframe الكامل، أو تحويل رابط Wordwall عادي إلى رابط embed
const toEmbedUrl = (input: string): string => {
  if (!input) return "";
  // إذا كان كود iframe، استخرج قيمة src
  const iframeMatch = input.match(/<iframe[^>]*\ssrc=["']([^"']+)["']/i);
  if (iframeMatch) return iframeMatch[1];
  // وإلا حاول تحويل رابط Wordwall عادي
  try {
    const u = new URL(input);
    if (u.hostname.includes("wordwall.net")) {
      const m = u.pathname.match(/\/(?:resource|play|embed)\/(\d+)/);
      if (m) return `https://wordwall.net/embed/${m[1]}?themeId=1&templateId=3&fontStackId=0`;
    }
  } catch {}
  return input;
};

const LevelDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [level, setLevel] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [songs, setSongs] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGame, setActiveGame] = useState<any>(null);

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

  if (loading) return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;

  if (!level) return (
    <main dir="rtl" className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="font-display text-2xl mb-4">المستوى غير موجود</p>
        <Button onClick={() => navigate("/")} variant="hero">العودة للرئيسية</Button>
      </div>
    </main>
  );

  const cardBase = "group bg-card rounded-3xl p-5 border-2 border-border/60 hover:border-primary/40 hover:-translate-y-1 hover:shadow-medium transition-bounce";

  return (
    <main dir="rtl" className="min-h-screen bg-background">
      <Navbar />
      <section className="container py-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-primary mb-6 hover:underline">
          <ArrowRight className="w-4 h-4 rotate-180" /> العودة للرئيسية
        </Link>
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <h1 className="font-display text-4xl lg:text-5xl mb-4">{level.title}</h1>
          {level.description && <p className="text-lg text-muted-foreground">{level.description}</p>}
        </div>

        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto mb-8 h-auto">
            <TabsTrigger value="videos" className="gap-2 py-3"><VideoIcon className="w-4 h-4" /> فيديوهات ({videos.length})</TabsTrigger>
            <TabsTrigger value="songs" className="gap-2 py-3"><Music className="w-4 h-4" /> أغاني ({songs.length})</TabsTrigger>
            <TabsTrigger value="games" className="gap-2 py-3"><Gamepad2 className="w-4 h-4" /> ألعاب ({games.length})</TabsTrigger>
            <TabsTrigger value="quizzes" className="gap-2 py-3"><ClipboardCheck className="w-4 h-4" /> اختبارات ({quizzes.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="videos">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {videos.length === 0 ? <p className="col-span-full text-center text-muted-foreground py-20">لا توجد فيديوهات بعد.</p> :
                videos.map((v) => (
                  <Link key={v.id} to={`/level/${slug}/video/${v.id}`} className={cardBase}>
                    <div className="relative aspect-video bg-muted rounded-2xl overflow-hidden mb-4 flex items-center justify-center">
                      {v.thumbnail_url ? <img src={v.thumbnail_url} alt={v.title} className="w-full h-full object-cover" /> : <VideoIcon className="w-12 h-12 text-muted-foreground" />}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                        <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-6 h-6 mr-1" />
                        </div>
                      </div>
                    </div>
                    <h3 className="font-display text-lg mb-1">{v.title}</h3>
                    {v.description && <p className="text-sm text-muted-foreground line-clamp-2">{v.description}</p>}
                  </Link>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="songs">
            <div className="grid md:grid-cols-2 gap-5">
              {songs.length === 0 ? <p className="col-span-full text-center text-muted-foreground py-20">لا توجد أغاني بعد.</p> :
                songs.map((s) => (
                  <div key={s.id} className={cardBase}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink to-primary flex items-center justify-center text-primary-foreground">
                        <Music className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display text-lg">{s.title}</h3>
                        {s.description && <p className="text-sm text-muted-foreground">{s.description}</p>}
                      </div>
                    </div>
                    {s.url && <audio controls src={s.url} className="w-full mt-2" />}
                  </div>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="games">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {games.length === 0 ? <p className="col-span-full text-center text-muted-foreground py-20">لا توجد ألعاب بعد.</p> :
                games.map((g) => (
                  <button key={g.id} type="button" onClick={() => setActiveGame(g)} className={`${cardBase} text-right w-full`}>
                    <div className="aspect-video rounded-2xl bg-gradient-to-br from-mint to-secondary flex items-center justify-center mb-4">
                      <Gamepad2 className="w-16 h-16 text-primary-foreground" />
                    </div>
                    <h3 className="font-display text-lg mb-1 flex items-center gap-2">{g.title} <Play className="w-4 h-4" /></h3>
                    {g.description && <p className="text-sm text-muted-foreground line-clamp-2">{g.description}</p>}
                  </button>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="quizzes">
            <div className="grid md:grid-cols-2 gap-5">
              {quizzes.length === 0 ? <p className="col-span-full text-center text-muted-foreground py-20">لا توجد اختبارات بعد.</p> :
                quizzes.map((q) => {
                  const count = q.quiz_questions?.[0]?.count ?? 0;
                  return (
                    <Link key={q.id} to={`/quiz/${q.id}`} className={cardBase}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center text-primary-foreground">
                          <ClipboardCheck className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-display text-lg">{q.title}</h3>
                          <p className="text-sm text-muted-foreground">{count} {count === 1 ? "سؤال" : "أسئلة"}</p>
                        </div>
                      </div>
                      {q.description && <p className="text-sm text-muted-foreground">{q.description}</p>}
                      <Button variant="hero" size="sm" className="mt-3 w-full">ابدأ الاختبار</Button>
                    </Link>
                  );
                })}
            </div>
          </TabsContent>
        </Tabs>
      </section>

      <Dialog open={!!activeGame} onOpenChange={(o) => !o && setActiveGame(null)}>
        <DialogContent className="max-w-5xl w-[95vw] p-0 overflow-hidden" dir="rtl">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="flex items-center gap-2"><Gamepad2 className="w-5 h-5 text-primary" /> {activeGame?.title}</DialogTitle>
          </DialogHeader>
          {activeGame?.url ? (
            <div className="relative w-full bg-black" style={{ aspectRatio: "16/9" }}>
              <iframe
                src={toEmbedUrl(activeGame.url)}
                title={activeGame.title}
                className="absolute inset-0 w-full h-full"
                allow="fullscreen; autoplay; encrypted-media"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="p-10 text-center text-muted-foreground">لا يوجد رابط للعبة</div>
          )}
          {activeGame?.url && (
            <div className="p-3 border-t flex justify-end">
              <a href={activeGame.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                فتح في صفحة جديدة <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  );
};

export default LevelDetail;
