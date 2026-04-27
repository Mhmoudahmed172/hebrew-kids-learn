import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowRight, Play, Video as VideoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const LevelDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [level, setLevel] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!slug) return;
      const { data: lv } = await supabase.from("levels").select("*").eq("slug", slug).maybeSingle();
      setLevel(lv);
      if (lv) {
        const { data: vids } = await supabase.from("videos").select("*").eq("level_id", lv.id).eq("published", true).order("sort_order");
        setVideos(vids || []);
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {videos.length === 0 ? (
            <p className="col-span-full text-center text-muted-foreground py-20">لا توجد فيديوهات في هذا المستوى بعد.</p>
          ) : videos.map((v) => (
            <Link key={v.id} to={`/level/${slug}/video/${v.id}`}
              className="group bg-card rounded-3xl p-5 border-2 border-border/60 hover:border-primary/40 hover:-translate-y-1 hover:shadow-medium transition-bounce">
              <div className="relative aspect-video bg-muted rounded-2xl overflow-hidden mb-4 flex items-center justify-center">
                {v.thumbnail_url
                  ? <img src={v.thumbnail_url} alt={v.title} className="w-full h-full object-cover" />
                  : <VideoIcon className="w-12 h-12 text-muted-foreground" />}
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
      </section>
      <Footer />
    </main>
  );
};

export default LevelDetail;
