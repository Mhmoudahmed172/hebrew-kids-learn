import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, FileText, Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { getSignedStoryUrl } from "@/lib/storyUrl";
import PdfPageViewer from "@/components/PdfPageViewer";


export type StoryItem = {
  id: string;
  title: string;
  description?: string | null;
  cover_url?: string | null;
  file_url?: string | null;
  file_type?: "pdf" | "html" | string;
  content_kind?: "pdf" | "html" | string;
  html_code?: string | null;
  content_html?: string | null;
  level_id?: string | null;
};

interface StoryViewerModalProps {
  story: StoryItem | null;
  open: boolean;
  onClose: () => void;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({ story, open, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState<number>(18); // for HTML mode
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    setPdfUrl(null);
    if (!story || !open) return;
    const kind = ((story as any).file_type ?? (story as any).content_kind ?? "")?.toLowerCase();
    if (kind !== "pdf" || !story.file_url || story.file_url === "inline") return;
    getSignedStoryUrl(story.file_url).then(setPdfUrl);
  }, [story?.id, story?.file_url, story?.file_type, open]);

  if (!story) return null;

  const kind = ((story as any).file_type ?? (story as any).content_kind ?? "")?.toLowerCase();
  const isPdf = kind === "pdf";
  const isHtml = kind === "html";
  const viewUrl = pdfUrl || (isPdf && /^https?:\/\//i.test(story.file_url) ? story.file_url : null);

  const handleDownload = () => {
    const url = viewUrl || story.file_url;
    if (!url || url === "inline") return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `${story.title}.${isPdf ? "pdf" : "html"}`;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        dir="rtl"
        className={`flex flex-col bg-card border-2 border-border/80 shadow-hero p-0 overflow-hidden transition-all duration-300 ${
          isFullscreen
            ? "w-screen h-screen max-w-none rounded-none m-0"
            : "max-w-4xl w-[95vw] h-[85vh] rounded-3xl"
        }`}
      >
        {/* Header */}
        <DialogHeader className="p-4 sm:p-5 border-b border-border/60 bg-muted/40 flex flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground shrink-0 shadow-soft">
              {isPdf ? <FileText className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
            </div>
            <div className="overflow-hidden text-right">
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="font-display text-xl sm:text-2xl truncate">
                  {story.title}
                </DialogTitle>
                <Badge variant={isPdf ? "default" : "secondary"} className="text-xs">
                  {isPdf ? "PDF قصة" : "HTML تفاعلية"}
                </Badge>
              </div>
              {story.description && (
                <DialogDescription className="text-xs sm:text-sm text-muted-foreground truncate mt-0.5">
                  {story.description}
                </DialogDescription>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {isHtml && (
              <div className="hidden sm:flex items-center gap-1 bg-background rounded-full p-1 border border-border/60 ml-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7 rounded-full"
                  title="تصغير الخط"
                  onClick={() => setFontSize((s) => Math.max(14, s - 2))}
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </Button>
                <span className="text-xs font-bold px-1 min-w-[2rem] text-center">{fontSize}px</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7 rounded-full"
                  title="تكبير الخط"
                  onClick={() => setFontSize((s) => Math.min(32, s + 2))}
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7 rounded-full"
                  title="إعادة ضبط"
                  onClick={() => setFontSize(18)}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}




            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="rounded-full w-8 h-8 hidden sm:flex"
              title={isFullscreen ? "إنهاء ملء الشاشة" : "ملء الشاشة"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </DialogHeader>

        {/* Viewer Content Body */}
        <div className="flex-1 w-full h-full min-h-0 bg-muted/20 relative overflow-hidden flex flex-col">
          {isPdf ? (
            viewUrl ? (
              <PdfPageViewer url={viewUrl} title={story.title} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <FileText className="w-16 h-16 text-muted-foreground/50 mb-3 animate-pulse" />
                <p className="font-display text-lg">جاري تحضير القصة...</p>
              </div>
            )

          ) : isHtml ? (
            (story.content_html ?? (story as any).html_code) ? (
              <div
                className="w-full h-full overflow-y-auto p-6 sm:p-10 leading-relaxed font-sans text-foreground"
                style={{ fontSize: `${fontSize}px` }}
                dangerouslySetInnerHTML={{ __html: (story.content_html ?? (story as any).html_code) }}
              />
            ) : (
              <iframe
                src={story.file_url}
                className="w-full h-full border-0 rounded-b-3xl bg-white"
                title={story.title}
                sandbox="allow-scripts allow-same-origin"
              />
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <BookOpen className="w-16 h-16 text-muted-foreground/50 mb-3 animate-bounce" />
              <p className="font-display text-lg">صيغة القصة غير معروفة</p>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
};
