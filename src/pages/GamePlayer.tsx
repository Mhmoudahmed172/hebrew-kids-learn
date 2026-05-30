import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Play, Gamepad2, Loader2 } from "lucide-react";
import LockedContent from "@/components/LockedContent";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { usePermissions } from "@/hooks/usePermissions";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

// نخزّن الآن كود HTML كامل للعبة. نعرضه عبر srcDoc داخل iframe sandbox آمن.
// نحافظ على التوافق مع الألعاب القديمة المخزّنة كرابط/كود iframe قديم.
const isHtml = (s: string) => /<\s*[a-zA-Z][^>]*>/.test(s || "");
const legacyEmbedUrl = (input: string): string => {
  if (!input) return "";
  const iframeMatch = input.match(/<iframe[^>]*\ssrc=["']([^"']+)["']/i);
  if (iframeMatch) return iframeMatch[1];
  try {
    const u = new URL(input);
    if (u.hostname.includes("wordwall.net")) {
      const m = u.pathname.match(/\/(?:resource|play|embed)\/(\d+)/);
      if (m) return `https://wordwall.net/embed/${m[1]}?themeId=1&templateId=3&fontStackId=0`;
    }
    return input;
  } catch { return ""; }
};

const GamePlayer = () => {
  const { slug, gameId } = useParams();
  const navigate = useNavigate();
  const { canPlay, loading: permsLoading } = usePermissions();
  const [level, setLevel] = useState<any>(null);
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [iframeLoading, setIframeLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!slug) return;
      const { data: lv } = await supabase.from("levels").select("*").eq("slug", slug).maybeSingle();
      setLevel(lv);
      if (lv) {
        const { data: gs } = await supabase.from("games").select("*").eq("level_id", lv.id).eq("published", true).order("sort_order");
        setGames(gs || []);
      }
      setLoading(false);
    })();
  }, [slug]);

  // إعادة تفعيل تحميل الـ iframe عند تغيير اللعبة
  useEffect(() => {
    setIframeLoading(true);
  }, [gameId]);

  if (loading) {
    return (
      <main dir="rtl" className="min-h-screen bg-background">
        <Navbar />
        <section className="container py-8">
          <Skeleton className="h-5 w-40 mb-6" />
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Skeleton className="w-full rounded-3xl" style={{ aspectRatio: "4 / 3" }} />
              <Skeleton className="h-8 w-2/3 mt-4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
              <div className="flex justify-between mt-6 gap-3">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
            <aside className="lg:col-span-1">
              <Skeleton className="h-6 w-32 mb-3" />
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-2xl" />
                ))}
              </div>
            </aside>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  if (!level) return <div className="min-h-screen flex items-center justify-center">المستوى غير موجود</div>;

  const idx = games.findIndex((g) => g.id === gameId);
  const current = games[idx];
  if (!current) return (
    <main dir="rtl" className="min-h-screen">
      <Navbar />
      <div className="container py-32 text-center">
        <p className="font-display text-2xl mb-4">اللعبة غير موجودة</p>
        <Button variant="hero" onClick={() => navigate(`/level/${slug}`)}>العودة للمستوى</Button>
      </div>
    </main>
  );

  const prev = idx > 0 ? games[idx - 1] : null;
  const next = idx < games.length - 1 ? games[idx + 1] : null;
  const raw = current.url || "";
  // إن كان HTML كاملاً (يحتوي على <html> أو وسوم body/script أو iframe كامل) نستخدم srcDoc.
  // غير ذلك نعتبره رابطاً (توافق رجعي).
  const useSrcDoc = isHtml(raw) && !/^https?:\/\//i.test(raw.trim());
  const legacySrc = useSrcDoc ? "" : legacyEmbedUrl(raw);
  const allowed = !permsLoading && canPlay("game", current.id, level.id);

  return (
    <main dir="rtl" className="min-h-screen bg-background">
      <Navbar />
      <section className="container py-8">
        <Link to={`/level/${slug}`} className="inline-flex items-center gap-2 text-sm font-bold text-primary mb-6 hover:underline">
          <ArrowRight className="w-4 h-4 rotate-180" /> العودة لـ {level.title}
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="relative rounded-3xl overflow-hidden bg-muted shadow-medium border-4 border-primary/10" style={{ aspectRatio: "4 / 3" }}>
              {!allowed ? (
                <LockedContent
                  title="اللعبة مقفلة"
                  message="لا تملك صلاحية تشغيل هذه اللعبة."
                  contextLabel={current.title}
                />
              ) : (useSrcDoc || legacySrc) ? (
                <>
                  <iframe
                    key={current.id}
                    {...(useSrcDoc ? { srcDoc: raw } : { src: legacySrc })}
                    title={current.title}
                    onLoad={() => setIframeLoading(false)}
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
                    className="w-full h-full block bg-white"
                    style={{ border: 0 }}
                    allow="fullscreen; autoplay; encrypted-media"
                    allowFullScreen
                  />
                  {iframeLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 backdrop-blur-sm text-white">
                      <Loader2 className="w-10 h-10 animate-spin text-primary" />
                      <p className="text-sm font-bold">جاري تحميل اللعبة...</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/70">لا يوجد كود للعبة</div>
              )}
            </div>
            <div className="mt-4">
              <h1 className="font-display text-2xl lg:text-3xl mb-2">{current.title}</h1>
              {current.description && <p className="text-muted-foreground">{current.description}</p>}
            </div>

            <div className="flex justify-between mt-6 gap-3">
              <Button variant="outline" disabled={!prev} onClick={() => prev && navigate(`/level/${slug}/game/${prev.id}`)}>
                <ArrowRight className="w-4 h-4" /> السابق
              </Button>
              <span className="text-sm text-muted-foreground self-center">{idx + 1} / {games.length}</span>
              <Button variant="hero" disabled={!next} onClick={() => next && navigate(`/level/${slug}/game/${next.id}`)}>
                التالي <ArrowLeft className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <aside className="lg:col-span-1">
            <h3 className="font-display text-lg mb-3">قائمة الألعاب</h3>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {games.map((g, i) => (
                <Link key={g.id} to={`/level/${slug}/game/${g.id}`}
                  className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-bounce ${
                    g.id === current.id ? "border-primary bg-primary-soft" : "border-border/60 hover:border-primary/40"
                  }`}>
                  <div className="w-10 h-10 rounded-xl bg-secondary-soft flex items-center justify-center text-secondary font-bold">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{g.title}</p>
                  </div>
                  {g.id === current.id ? <Play className="w-4 h-4 text-primary" /> : <Gamepad2 className="w-4 h-4 text-muted-foreground" />}
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default GamePlayer;
