import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import mascot from "@/assets/mascot-owl.png";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src={mascot} alt="" width={40} height={40} className="w-10 h-10" />
              <span className="font-display font-extrabold text-xl">منصة عبرية</span>
            </div>
            <p className="text-background/70 leading-relaxed text-sm">
              نجعل تعلم العبرية مغامرة ممتعة لكل طفل، بأسلوب آمن واحترافي.
            </p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-background/10 hover:bg-primary flex items-center justify-center transition-smooth">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {[
            { title: "المنصة", links: ["المميزات", "الأسعار", "المستويات", "كيف تعمل"] },
            { title: "الدعم", links: ["مركز المساعدة", "تواصل معنا", "الأسئلة الشائعة", "البريد"] },
            { title: "الشركة", links: ["من نحن", "المدونة", "الشروط", "الخصوصية"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-lg mb-4">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l}><a href="#" className="text-background/70 hover:text-primary text-sm transition-smooth">{l}</a></li>
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
