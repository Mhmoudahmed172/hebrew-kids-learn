import PageLoader from "@/components/PageLoader";
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Play } from "lucide-react";
import LockedContent from "@/components/LockedContent";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { recordProgress } from "@/hooks/useUserPoints";
import { getSignedVideoUrl } from "@/lib/videoUrl";
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
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  // تسجيل المشاهدة عند فتح الفيديو (مرة واحدة فقط لكل فيديو)
  useEffect(() => {
    if (!user || !videoId || !level) return;
    if (permsLoading) return;
    if (!canPlay("video", videoId, level.id)) return;
    (async () => {
      const { data: existing } = await supabase
        .from("user_progress")
        .select("id")
        .eq("user_id", user.id)
        .eq("content_type", "video")
        .eq("content_id", videoId)
        .maybeSingle();
      if (existing) return; // سبق وشاهد هذا الفيديو
      const { error } = await recordProgress({
        userId: user.id,
        contentType: "video",
        contentId: videoId,
        levelId: level.id,
      });
      if (!error) toast.success("+10 نقاط 🎬");
    })();
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

  // بث الفيديو عبر Edge Function آمنة (لا يظهر رابط التخزين أبداً)
  useEffect(() => {
    setSignedUrl(null);
    if (!videoId || !user || permsLoading || !level) return;
    if (!canPlay("video", videoId, level.id)) return;
    const v = videos.find((x) => x.id === videoId);
    if (!v?.video_url) return;

    // فيديوهات خارجية (يوتيوب…) لا تمرّ بالدالة
    if (v.video_url.startsWith("http") && !v.video_url.includes("/object/")) {
      setSignedUrl(v.video_url);
      return;
    }

    let revoke: string | null = null;
    let aborted = false;
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) return;
        const base = (import.meta.env.VITE_SUPABASE_URL as string).replace(/\/$/, "");
        const res = await fetch(`${base}/functions/v1/stream-video?id=${videoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok || !res.body) {
          toast.error("تعذّر تشغيل الفيديو");
          return;
        }
        const blob = await res.blob();
        if (aborted) return;
        const url = URL.createObjectURL(blob);
        revoke = url;
        setSignedUrl(url);
      } catch {
        toast.error("تعذّر تشغيل الفيديو");
      }
    })();
    return () => {
      aborted = true;
      if (revoke) URL.revokeObjectURL(revoke);
    };
  }, [videoId, videos, user, permsLoading, level, canPlay]);

  if (loading) return <PageLoader />;
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
            <div
              className="rounded-3xl overflow-hidden aspect-video shadow-medium relative bg-muted select-none"
              onContextMenu={(e) => e.preventDefault()}
            >
              {!permsLoading && !canPlay("video", current.id, level.id) ? (
                <LockedContent
                  title="الفيديو مقفل"
                  message="لا تملك صلاحية تشغيل هذا الفيديو. يمكنك تصفّح القائمة فقط."
                  contextLabel={current.title}
                />
              ) : signedUrl ? (
                <>
                  <video
                    key={current.id}
                    src={signedUrl}
                    controls
                    autoPlay
                    controlsList="nodownload noremoteplayback noplaybackrate"
                    disablePictureInPicture
                    onContextMenu={(e) => e.preventDefault()}
                    className="w-full h-full bg-black pointer-events-auto"
                  />
                  {/* علامة مائية: تردع المشاركة لأن اسم المشاهد يظهر في أي تسجيل شاشة */}
                  <div className="absolute inset-0 pointer-events-none select-none z-10">
                    <div className="absolute top-3 left-3 text-[11px] font-bold text-white/70 bg-black/30 px-2 py-0.5 rounded">
                      {user?.email}
                    </div>
                    <div className="absolute bottom-3 right-3 text-[11px] font-bold text-white/70 bg-black/30 px-2 py-0.5 rounded">
                      عبري ببساطة • {user?.email}
                    </div>
                  </div>
                </>
                <div className="w-full h-full flex flex-col items-center justify-center gap-5 bg-gradient-to-br from-primary/5 via-background to-accent/10">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-primary/30 blur-2xl animate-pulse" />
                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl animate-bounce">
                      <svg className="w-9 h-9 text-white mr-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <p className="font-display text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-bold">
                      جاري تحضير الفيديو لك
                    </p>
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
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
