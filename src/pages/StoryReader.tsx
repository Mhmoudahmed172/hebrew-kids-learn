import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, BookOpen, FileText, ExternalLink, Maximize2 } from "lucide-react";
import LockedContent from "@/components/LockedContent";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { usePermissions } from "@/hooks/usePermissions";
import { getSignedStoryUrl } from "@/lib/storyUrl";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const StoryReader = () => {
  const { slug, storyId } = useParams();
  const navigate = useNavigate();
  const { canView, loading: permsLoading } = usePermissions();
  const [level, setLevel] = useState<any>(null);
  const [stories, setStories] = useState<any[]>([]);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!slug) return;
      const { data: lv } = await supabase.from("levels").select("*").eq("slug", slug).maybeSingle();
      setLevel(lv);
      if (lv) {
        const { data } = await supabase
          .from("stories").select("*")
          .eq("level_id", lv.id).eq("published", true)
          .order("sort_order");
        setStories(data || []);
      }
      setLoading(false);
    })();
  }, [slug]);

  const current = stories.find((s) => s.id === storyId);

  useEffect(() => {
    setFileUrl(null);
    (async () => {
      if (current?.content_kind === "pdf" && current?.file_url) {
        setFileUrl(await getSignedStoryUrl(current.file_url));
      }
    })();
  }, [current?.id, current?.file_url, current?.content_kind]);

  if (loading) {
    return (
      <main dir="rtl" className="min-h-screen bg-background">
        <Navbar />
        <section className="container py-8">
          <Skeleton className="h-5 w-40 mb-6" />
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Skeleton className="w-full h-[60vh] rounded-3xl" />
              <Skeleton className="h-8 w-2/3 mt-4" />
            </div>
            <aside className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
            </aside>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  if (!level) return <div className="min-h-screen flex items-center justify-center">المستوى غير موجود</div>;

  if (!current) return (
    <main dir="rtl" className="min-h-screen">
      <Navbar />
      <div className="container py-32 text-center">
        <p className="font-display text-2xl mb-4">القصة غير موجودة</p>
        <Button variant="hero" onClick={() => navigate(`/level/${slug}`)}>العودة للمستوى</Button>
      </div>
    </main>
  );

  const idx = stories.findIndex((s) => s.id === current.id);
  const prev = idx > 0 ? stories[idx - 1] : null;
  const next = idx < stories.length - 1 ? stories[idx + 1] : null;
  const allowed = !permsLoading && canView(`level:${level.id}`);
  const isHtml = current.content_kind === "html";

  return (
    <main dir="rtl" className="min-h-screen bg-background">
      <Navbar />
      <section className="container py-6 sm:py-8">
        <Link to={`/level/${slug}`} className="inline-flex items-center gap-2 text-sm font-bold text-primary mb-5 hover:underline">
          <ArrowRight className="w-4 h-4 rotate-180" /> العودة لـ {level.title}
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 min-w-0">
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-muted shadow-medium border-2 sm:border-4 border-primary/10 h-[65vh] sm:h-[75vh]">
              {!allowed ? (
                <LockedContent
                  title="القصة مقفلة"
                  message="لا تملك صلاحية قراءة قصص هذا المستوى."
                  contextLabel={current.title}
                />
              ) : isHtml && current.html_code ? (
                <iframe
                  key={current.id}
                  srcDoc={current.html_code}
                  title={current.title}
                  sandbox="allow-scripts allow-popups allow-forms allow-modals"
                  className="w-full h-full block bg-white"
                  style={{ border: 0 }}
                />
              ) : fileUrl ? (
                <iframe
                  key={current.id}
                  src={`${fileUrl}#view=FitH&toolbar=1`}
                  title={current.title}
                  className="w-full h-full block bg-white"
                  style={{ border: 0 }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
                  <FileText className="w-10 h-10" />
                  <p className="text-sm">جاري تحضير القصة...</p>
                </div>
              )}
            </div>

            {allowed && fileUrl && (
              <div className="flex flex-wrap gap-2 mt-3">
                <Button variant="outline" size="sm" asChild>
                  <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                    <Maximize2 className="w-4 h-4" /> فتح بملء الشاشة
                  </a>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" /> إذا لم يظهر الملف اضغط هنا
                  </a>
                </Button>
              </div>
            )}

            <div className="mt-4">
              <h1 className="font-display text-2xl lg:text-3xl mb-2">{current.title}</h1>
              {current.description && <p className="text-muted-foreground">{current.description}</p>}
            </div>

            <div className="flex justify-between mt-6 gap-3">
              <Button variant="outline" disabled={!prev} onClick={() => prev && navigate(`/level/${slug}/story/${prev.id}`)}>
                <ArrowRight className="w-4 h-4" /> السابق
              </Button>
              <span className="text-sm text-muted-foreground self-center">{idx + 1} / {stories.length}</span>
              <Button variant="hero" disabled={!next} onClick={() => next && navigate(`/level/${slug}/story/${next.id}`)}>
                التالي <ArrowLeft className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <aside className="lg:col-span-1">
            <h2 className="font-display text-lg mb-3">قائمة القصص</h2>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {stories.map((s, i) => (
                <Link key={s.id} to={`/level/${slug}/story/${s.id}`}
                  className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-bounce ${
                    s.id === current.id ? "border-primary bg-primary-soft" : "border-border/60 hover:border-primary/40"
                  }`}>
                  <div className="w-10 h-10 rounded-xl bg-accent-soft flex items-center justify-center text-accent font-bold">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{s.title}</p>
                  </div>
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
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

export default StoryReader;
