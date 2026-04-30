import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowRight, Gamepad2, ExternalLink } from "lucide-react";
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
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!gameId) return;
      const { data } = await supabase.from("games").select("*").eq("id", gameId).maybeSingle();
      setGame(data);
      setLoading(false);
    })();
  }, [gameId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;

  if (!game) return (
    <main dir="rtl" className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="font-display text-2xl mb-4">اللعبة غير موجودة</p>
        <Button onClick={() => navigate(-1)} variant="hero">رجوع</Button>
      </div>
    </main>
  );

  const embedSrc = toEmbedUrl(game.url || "");

  return (
    <main dir="rtl" className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <section className="container py-6 flex-1 flex flex-col">
        <Link to={`/level/${slug}`} className="inline-flex items-center gap-2 text-sm font-bold text-primary mb-4 hover:underline w-fit">
          <ArrowRight className="w-4 h-4 rotate-180" /> العودة للمستوى
        </Link>
        <div className="mb-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-mint to-secondary flex items-center justify-center text-primary-foreground">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h1 className="font-display text-2xl lg:text-3xl">{game.title}</h1>
            {game.description && <p className="text-sm text-muted-foreground">{game.description}</p>}
          </div>
        </div>

        {embedSrc ? (
          <div className="relative w-full bg-black rounded-3xl overflow-hidden border-2 border-border" style={{ aspectRatio: "16/9" }}>
            <iframe
              src={embedSrc}
              title={game.title}
              className="absolute inset-0 w-full h-full"
              allow="fullscreen; autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="p-10 text-center text-muted-foreground">لا يوجد رابط للعبة</div>
        )}

        {embedSrc && (
          <div className="mt-3 flex justify-end">
            <a href={embedSrc} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
              فتح في صفحة جديدة <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
};

export default GamePlayer;
