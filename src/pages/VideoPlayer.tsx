import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Play, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { recordProgress } from "@/hooks/useUserPoints";
import { toast } from "sonner";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const VideoPlayer = () => {
  const { slug, videoId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canPlay, loading: permsLoading } = usePermissions();
  const [level, setLevel] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // تسجيل المشاهدة عند فتح الفيديو
  useEffect(() => {
    if (!user || !videoId || !level) return;
    if (permsLoading) return;
    if (!canPlay("video", videoId, level.id)) return;
    recordProgress({
      userId: user.id,
      contentType: "video",
      contentId: videoId,
      levelId: level.id,
    }).then(({ error }) => { if (!error) toast.success("+10 نقاط 🎬"); });
  }, [user, videoId, level, permsLoading, canPlay]);

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
  if (!level) return <div className="min-h-screen flex items-center justify-center">المستوى غير موجود</div>;

  const idx = videos.findIndex((v) => v.id === videoId);
  const current = videos[idx];
  if (!current) return (
    <main dir="rtl" className="min-h-screen">
      <Navbar />
      <div className="container py-32 text-center">
        <p className="font-display text-2xl mb-4">الفيديو غير موجود</p>
        <Button variant="hero" onClick={() => navigate(`/level/${slug}`)}>العودة للمستوى</Button>
      </div>
    </main>
  );

  const prev = idx > 0 ? videos[idx - 1] : null;
  const next = idx < videos.length - 1 ? videos[idx + 1] : null;

  return (
    <main dir="rtl" className="min-h-screen bg-background">
      <Navbar />
      <section className="container py-8">
        <Link to={`/level/${slug}`} className="inline-flex items-center gap-2 text-sm font-bold text-primary mb-6 hover:underline">
          <ArrowRight className="w-4 h-4 rotate-180" /> العودة لـ {level.title}
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="rounded-3xl overflow-hidden bg-black aspect-video shadow-medium">
              <video key={current.id} src={current.video_url} controls autoPlay className="w-full h-full" />
            </div>
            <div className="mt-4">
              <h1 className="font-display text-2xl lg:text-3xl mb-2">{current.title}</h1>
              {current.description && <p className="text-muted-foreground">{current.description}</p>}
            </div>

            <div className="flex justify-between mt-6 gap-3">
              <Button variant="outline" disabled={!prev} onClick={() => prev && navigate(`/level/${slug}/video/${prev.id}`)}>
                <ArrowRight className="w-4 h-4" /> السابق
              </Button>
              <span className="text-sm text-muted-foreground self-center">{idx + 1} / {videos.length}</span>
              <Button variant="hero" disabled={!next} onClick={() => next && navigate(`/level/${slug}/video/${next.id}`)}>
                التالي <ArrowLeft className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <aside className="lg:col-span-1">
            <h3 className="font-display text-lg mb-3">قائمة الفيديوهات</h3>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {videos.map((v, i) => (
                <Link key={v.id} to={`/level/${slug}/video/${v.id}`}
                  className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-bounce ${
                    v.id === current.id ? "border-primary bg-primary-soft" : "border-border/60 hover:border-primary/40"
                  }`}>
                  <div className="w-10 h-10 rounded-xl bg-secondary-soft flex items-center justify-center text-secondary font-bold">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{v.title}</p>
                  </div>
                  {v.id === current.id && <Play className="w-4 h-4 text-primary" />}
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

export default VideoPlayer;
