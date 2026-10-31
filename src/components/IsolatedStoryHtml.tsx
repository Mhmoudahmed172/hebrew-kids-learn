import { useMemo, useRef } from "react";

// Content scripts stay in an opaque origin. The only parent-to-frame message
// carries a bounded font size; there is no storage or authenticated API bridge.
export function buildStoryDocument(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  if (!doc.documentElement.getAttribute("dir")) doc.documentElement.dir = "rtl";
  const style = doc.createElement("style");
  style.textContent = "body{margin:0;padding:24px;font-family:sans-serif;font-size:18px;line-height:1.625;overflow-wrap:break-word} @media(min-width:640px){body{padding:40px}}";
  doc.head.prepend(style);
  const script = doc.createElement("script");
  script.textContent = `window.addEventListener('message',function(event){
    if(event.source!==parent||!event.data||event.data.type!=='story-font-size')return;
    var size=event.data.size;
    if(typeof size==='number'&&Number.isFinite(size)&&size>=14&&size<=32)
      document.body.style.fontSize=size+'px';
  });`;
  doc.head.prepend(script);
  return "<!doctype html>" + doc.documentElement.outerHTML;
}

export default function IsolatedStoryHtml({ html, title, fontSize }: { html: string; title: string; fontSize: number }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const document = useMemo(() => buildStoryDocument(html), [html]);
  const updateFont = () => frame.current?.contentWindow?.postMessage({ type: "story-font-size", size: fontSize }, "*");
  // Callback refs run after each committed render, without changing srcDoc or
  // reloading the interactive story. onLoad handles the initial document load.
  return <iframe ref={(node) => { frame.current = node; updateFont(); }} srcDoc={document} title={title}
    sandbox="allow-scripts" className="w-full h-full border-0 bg-background text-foreground" onLoad={updateFont} />;
}