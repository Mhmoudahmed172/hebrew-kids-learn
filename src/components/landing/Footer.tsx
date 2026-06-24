import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import logo from "@/assets/logo.webp";
import { Link } from "react-router-dom";

const Footer = () => {
  const sections = [
    { title: "المنصة", links: [
      { label: "الرئيسية", href: "#home" },
      { label: "من نحن", href: "#about" },
      { label: "مميزاتنا", href: "#features" },
    ]},
    { title: "التعلم", links: [
      { label: "للأهل", href: "#how" },
      { label: "خريطة المغامرة", href: "#levels" },
      { label: "الباقات", href: "#pricing" },
    ]},
    { title: "المجتمع", links: [
      { label: "آراء العائلات", href: "#testimonials" },
      { label: "الأسئلة الشائعة", href: "#faq" },
      { label: "المتصدرون", href: "/leaderboard" },
    ]},
  ];

  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src={logo} alt="عبري ببساطة" width={44} height={44} className="w-11 h-11 rounded-full ring-2 ring-accent/40 object-cover bg-white" />
              <span className="font-display font-extrabold text-xl">عبري ببساطة</span>
            </div>
            <p className="text-background/70 leading-relaxed text-sm">
              نجعل تعلم العبرية مغامرة ممتعة لكل طفل، بأسلوب آمن واحترافي.
            </p>
            <div className="flex gap-3">
              {[
                { Icon: Facebook, label: "Facebook" },
                { Icon: Instagram, label: "Instagram" },
                { Icon: Twitter, label: "Twitter" },
                { Icon: Youtube, label: "YouTube" },
              ].map(({ Icon, label }) => (
                <a key={label} href="#" aria-label={label} className="w-11 h-11 rounded-full bg-background/10 hover:bg-primary flex items-center justify-center transition-smooth">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {sections.map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-lg mb-4">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.href.startsWith("/") ? (
                      <Link to={l.href} className="text-background/70 hover:text-primary text-sm transition-smooth">{l.label}</Link>
                    ) : (
                      <a href={l.href} className="text-background/70 hover:text-primary text-sm transition-smooth">{l.label}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-background/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-background/60">
          <p>© 2025 منصة تعلم العبرية. جميع الحقوق محفوظة.</p>
          <p>صُنع بـ ❤️ للأطفال العرب</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
