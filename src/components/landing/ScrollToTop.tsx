import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggle = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", toggle, { passive: true });
    return () => window.removeEventListener("scroll", toggle);
  }, []);

  const scrollUp = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollUp}
      className={`
        fixed bottom-6 left-6 z-50
        w-12 h-12 rounded-full
        bg-primary-gradient text-white
        shadow-glow
        flex items-center justify-center
        transition-all duration-300 ease-out
        hover:scale-110 hover:-translate-y-1
        active:scale-95
        ${visible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"}
      `}
      aria-label="العودة لأعلى الصفحة"
      title="العودة لأعلى الصفحة"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
};

export default ScrollToTop;
