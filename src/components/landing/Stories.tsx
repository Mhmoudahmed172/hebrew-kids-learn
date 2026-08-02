import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, FileText, Sparkles, Read, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StoryViewerModal, StoryItem } from "@/components/StoryViewerModal";

export default function Stories() {
  const [stories, setStories] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [activeStory, setActiveStory] = useState<StoryItem | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: stData }, { data: lvData }] = await Promise.all([
        supabase
          .from("stories")
          .select("*, levels(id, title)")
          .eq("published", true)
          .order("sort_order", { ascending: true }),
        supabase.from("levels").select("id, title").order("sort_order"),
      ]);

      setStories(stData || []);
      setLevels(lvData || []);
      setLoading(false);
    })();
  }, []);

  const filteredStories = selectedLevel === "all"
    ? stories
    : stories.filter((s) => s.level_id === selectedLevel);

  return (
    <section id="stories" className="py-20 bg-muted/30 relative overflow-hidden dir-rtl">
      {/* Dynamic background accents */}
      <div className="absolute top-10 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="secondary" className="mb-4 px-4 py-1.5 rounded-full text-sm font-bold gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> مَكْتَبَةُ القِصَصِ وَالرِّوَايَاتِ
          </Badge>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl mb-4 bg-gradient-to-r from-primary via-accent to-pink bg-clip-text text-transparent">
            عَالَمٌ سَاحِرٌ مِنَ القِصَصِ المُمْتِعَةِ
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            اقرأ وتفاعل مع أفضل القصص المصوّرة والتفاعلية المصممة بأسلوب جذاب لتطوير مهارات القراءة باللغة العبرية.
          </p>

          {/* Level Filter Pills */}
          {levels.length > 0 && (
            <div className="flex items-center justify-center gap-2 flex-wrap mt-8">
              <Button
                variant={selectedLevel === "all" ? "hero" : "outline"}
                size="sm"
                onClick={() => setSelectedLevel("all")}
                className="rounded-full px-5 text-sm"
              >
                الكل ({stories.length})
              </Button>
              {levels.map((lvl) => {
                const count = stories.filter((s) => s.level_id === lvl.id).length;
                return (
                  <Button
                    key={lvl.id}
                    variant={selectedLevel === lvl.id ? "hero" : "outline"}
                    size="sm"
                    onClick={() => setSelectedLevel(lvl.id)}
                    className="rounded-full px-4 text-sm"
                  >
                    {lvl.title} ({count})
                  </Button>
                );
              })}
            </div>
          )}
        </div>

        {/* Stories Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 rounded-3xl bg-card border-2 border-border/50 animate-pulse p-6 flex flex-col justify-between" />
            ))}
          </div>
        ) : filteredStories.length === 0 ? (
          <div className="text-center py-16 bg-card/60 rounded-3xl border-2 border-dashed border-border/70 max-w-md mx-auto">
            <BookOpen className="w-14 h-14 text-muted-foreground/40 mx-auto mb-3" />
            <p className="font-display text-xl mb-1">لا توجد قصص بعد</p>
            <p className="text-sm text-muted-foreground">سيتم إضافة المزيد من القصص الممتعة قريبًا!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStories.map((story) => {
              const isPdf = story.file_type?.toLowerCase() === "pdf";
              return (
                <div
                  key={story.id}
                  className="group bg-card rounded-3xl overflow-hidden border-2 border-border/70 hover:border-primary/40 shadow-soft hover:shadow-hero transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Cover or Header Visual */}
                    <div className="relative aspect-[16/9] bg-gradient-to-br from-primary/10 via-accent/15 to-pink/10 overflow-hidden flex items-center justify-center">
                      {story.cover_url ? (
                        <img
                          src={story.cover_url}
                          alt={story.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-6 text-center">
                          <div className="w-16 h-16 rounded-3xl bg-primary/20 flex items-center justify-center text-primary mb-2 group-hover:scale-110 transition-transform">
                            {isPdf ? <FileText className="w-8 h-8" /> : <BookOpen className="w-8 h-8" />}
                          </div>
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            {isPdf ? "كتاب PDF" : "قصة HTML تفاعلية"}
                          </span>
                        </div>
                      )}

                      {/* Type Badge */}
                      <Badge
                        variant={isPdf ? "default" : "secondary"}
                        className="absolute top-3 right-3 shadow-sm font-bold text-xs"
                      >
                        {isPdf ? "PDF" : "HTML تفاعلية"}
                      </Badge>

                      {/* Level Badge if available */}
                      {story.levels?.title && (
                        <Badge
                          variant="outline"
                          className="absolute top-3 left-3 bg-background/80 backdrop-blur-md text-xs border-border"
                        >
                          {story.levels.title}
                        </Badge>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="font-display text-xl mb-2 group-hover:text-primary transition-colors line-clamp-1">
                        {story.title}
                      </h3>
                      {story.description ? (
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {story.description}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">قصة مشوقة ومناسبة للتعلم والتسلية.</p>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="p-6 pt-0">
                    <Button
                      variant="hero"
                      size="lg"
                      onClick={() => setActiveStory(story)}
                      className="w-full rounded-2xl gap-2 font-bold group-hover:shadow-medium"
                    >
                      <BookOpen className="w-5 h-5" /> اقرأ القصة الآن <ChevronLeft className="w-4 h-4 mr-auto" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reader Modal */}
      <StoryViewerModal
        story={activeStory}
        open={!!activeStory}
        onClose={() => setActiveStory(null)}
      />
    </section>
  );
}
