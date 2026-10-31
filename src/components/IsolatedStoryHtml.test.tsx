import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import IsolatedStoryHtml, { buildStoryDocument } from "./IsolatedStoryHtml";

describe("isolated story font updates", () => {
  it("updates font size without replacing the story document or resetting its local state", () => {
    const { container, rerender } = render(<IsolatedStoryHtml html="<p>story</p>" title="story" fontSize={18} />);
    const frame = container.querySelector("iframe");
    if (!frame?.contentWindow) throw new Error("missing story frame");
    const original = frame.srcdoc;
    const send = vi.spyOn(frame.contentWindow, "postMessage");
    rerender(<IsolatedStoryHtml html="<p>story</p>" title="story" fontSize={22} />);
    expect(frame.srcdoc).toBe(original);
    expect(send).toHaveBeenCalledWith({ type: "story-font-size", size: 22 }, "*");
  });

  it("preserves complete story scripts and existing document direction", () => {
    const html = '<html dir="ltr"><head><script>window.count=3</script></head><body><p>story</p></body></html>';
    const doc = new DOMParser().parseFromString(buildStoryDocument(html), "text/html");
    expect(doc.documentElement.dir).toBe("ltr");
    expect(Array.from(doc.scripts).some((script) => script.textContent === "window.count=3")).toBe(true);
  });
});