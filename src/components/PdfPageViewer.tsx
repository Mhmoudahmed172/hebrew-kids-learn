import { useEffect, useRef, useState } from "react";
import { FileText, ZoomIn, ZoomOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Renders a PDF as canvas pages (no native PDF toolbar => no download / print / save).
 */
const PdfPageViewer = ({ url, title }: { url: string; title?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;
    if (!container) return;

    setLoading(true);
    setError(false);
    container.innerHTML = "";

    (async () => {
      try {
        const pdfjs: any = await import("pdfjs-dist");
        const worker = await import("pdfjs-dist/build/pdf.worker.mjs?url");
        pdfjs.GlobalWorkerOptions.workerSrc = worker.default;

        const pdf = await pdfjs.getDocument({ url }).promise;
        if (cancelled) return;

        const width = container.clientWidth || 800;
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          if (cancelled) return;
          const base = page.getViewport({ scale: 1 });
          const fit = ((width - 24) / base.width) * scale;
          const viewport = page.getViewport({ scale: fit * (window.devicePixelRatio || 1) });

          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = "100%";
          canvas.style.height = "auto";
          canvas.style.display = "block";
          canvas.style.borderRadius = "12px";
          canvas.style.marginBottom = "16px";
          canvas.style.boxShadow = "0 2px 12px rgba(0,0,0,0.08)";
          canvas.setAttribute("draggable", "false");
          container.appendChild(canvas);

          await page.render({ canvasContext: canvas.getContext("2d")!, viewport }).promise;
          if (cancelled) return;
          if (i === 1) setLoading(false);
        }
        setLoading(false);
      } catch (e) {
        if (!cancelled) {
          console.error("pdf render error", e);
          setError(true);
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url, scale]);

  return (
    <div className="relative w-full h-full flex flex-col min-h-0">
      <div className="flex items-center justify-center gap-1 py-2 bg-muted/40 border-b border-border/60 shrink-0">
        <Button variant="ghost" size="icon" className="w-7 h-7 rounded-full" title="تصغير"
          onClick={() => setScale((s) => Math.max(0.6, +(s - 0.2).toFixed(1)))}>
          <ZoomOut className="w-3.5 h-3.5" />
        </Button>
        <span className="text-xs font-bold min-w-[3rem] text-center">{Math.round(scale * 100)}%</span>
        <Button variant="ghost" size="icon" className="w-7 h-7 rounded-full" title="تكبير"
          onClick={() => setScale((s) => Math.min(2.4, +(s + 0.2).toFixed(1)))}>
          <ZoomIn className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div
        ref={containerRef}
        onContextMenu={(e) => e.preventDefault()}
        className="flex-1 min-h-0 overflow-y-auto p-3 select-none"
      />

      {(loading || error) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/85 text-muted-foreground">
          {error ? (
            <>
              <FileText className="w-12 h-12 opacity-50" />
              <p className="text-sm font-bold">تعذّر عرض القصة، حاول تحديث الصفحة</p>
            </>
          ) : (
            <>
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm">جاري تحضير {title || "القصة"}...</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PdfPageViewer;
