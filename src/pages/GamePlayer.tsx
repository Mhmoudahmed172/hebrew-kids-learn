import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Gamepad2, ExternalLink, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

// استخراج src من كود iframe، أو تحويل رابط Wordwall العادي إلى رابط embed
const toEmbedUrl = (input: string): string => {
  if (!input) return "";
  const iframeMatch = input.match(/<iframe[^>]*\ssrc=["']([^"']+)["']/i);
  if (iframeMatch) return iframeMatch[1];
  try {
    const u = new URL(input);
    if (u.hostname.includes("wordwall.net")) {
      const m = u.pathname.match(/\/(?:resource|play|embed)\/(\d+)/);
      if (m) return `https://wordwall.net/embed/${m[1]}?themeId=1&templateId=3&fontStackId=0`;
    }
  } catch {}
  return input;
};

const GamePlayer = () => {
  const { slug, gameId } = useParams();
  const navigate = useNavigate();
  const [level, setLevel] = useState<any>(null);
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;
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
  const embedSrc = toEmbedUrl(current.url || "");
  const others = games.filter((g) => g.id !== current.id);

  return (
    <main dir="rtl" className="min-h-screen bg-background">
      <Navbar />
      <section className="container py-8">
        <Link to={`/level/${slug}`} className="inline-flex items-center gap-2 text-sm font-bold text-primary mb-6 hover:underline">
          <ArrowRight className="w-4 h-4 rotate-180" /> العودة لـ {level.title}
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-mint to-secondary flex items-center justify-center text-primary-foreground">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h1 className="font-display text-2xl lg:text-3xl">{current.title}</h1>
            {current.description && <p className="text-sm text-muted-foreground">{current.description}</p>}
          </div>
        </div>

        {embedSrc ? (
          <div className="w-full max-w-2xl mx-auto">
            <div className="relative w-full bg-black rounded-3xl overflow-hidden border-2 border-border shadow-medium" style={{ aspectRatio: "4 / 3" }}>
              <iframe
                key={current.id}
                src={embedSrc}
                title={current.title}
                className="absolute inset-0 w-full h-full block"
                style={{ border: 0 }}
                allow="fullscreen; autoplay; encrypted-media"
                allowFullScreen
              />
            </div>
          </div>
        ) : (
          <div className="p-10 text-center text-muted-foreground border-2 border-dashed rounded-3xl">لا يوجد كود تضمين للعبة</div>
        )}

        <div className="flex justify-between mt-6 gap-3">
          <Button variant="outline" disabled={!prev} onClick={() => prev && navigate(`/level/${slug}/game/${prev.id}`)}>
            <ArrowRight className="w-4 h-4" /> السابق
          </Button>
          <span className="text-sm text-muted-foreground self-center">{idx + 1} / {games.length}</span>
          <Button variant="hero" disabled={!next} onClick={() => next && navigate(`/level/${slug}/game/${next.id}`)}>
            التالي <ArrowLeft className="w-4 h-4" />
          </Button>
        </div>

        {embedSrc && (
          <div className="mt-2 flex justify-end">
            <a href={embedSrc} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
              فتح في صفحة جديدة <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {others.length > 0 && (
          <div className="mt-12">
            <h2 className="font-display text-2xl mb-5 flex items-center gap-2">
              <Gamepad2 className="w-6 h-6 text-primary" /> ألعاب أخرى في {level.title}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {others.map((g) => (
                <Link
                  key={g.id}
                  to={`/level/${slug}/game/${g.id}`}
                  className="group bg-card rounded-3xl p-5 border-2 border-border/60 hover:border-primary/40 hover:-translate-y-1 hover:shadow-medium transition-bounce"
                >
                  <div className="aspect-video rounded-2xl bg-gradient-to-br from-mint to-secondary flex items-center justify-center mb-4">
                    <Gamepad2 className="w-14 h-14 text-primary-foreground" />
                  </div>
                  <h3 className="font-display text-lg mb-1 flex items-center gap-2">
                    {g.title} <Play className="w-4 h-4" />
                  </h3>
                  {g.description && <p className="text-sm text-muted-foreground line-clamp-2">{g.description}</p>}
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
};

export default GamePlayer;
