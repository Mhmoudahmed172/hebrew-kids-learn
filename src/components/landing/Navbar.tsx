import { Button } from "@/components/ui/button";
import { Sparkles, Menu, X, LayoutDashboard, LogOut, User, Trophy, Star } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserPoints } from "@/hooks/useUserPoints";
import logo from "@/assets/logo.webp";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const { points } = useUserPoints();
  const navigate = useNavigate();
  const links = [
    { label: "​الرئيسية", href: "/#features" },
    { label: "كيف تعمل", href: "/#how" },
    { label: "المستويات", href: "/#levels" },
    { label: "الأسعار", href: "/#pricing" },
    { label: "الأسئلة", href: "/#faq" },
  ];

  const handleLogout = async () => { await signOut(); navigate("/"); };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-background/70 border-b border-border/40">
      <div className="container flex items-center justify-between h-20">
        <Link to="/" className="flex items-center gap-2 font-display font-extrabold text-xl">
          <img src={logo} alt="عبري ببساطة" width={44} height={44} className="w-11 h-11 rounded-full ring-2 ring-accent/40 object-cover" />
          <span className="text-gradient">عبري ببساطة</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-8">
          {links.map(l => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-foreground hover:text-primary transition-smooth">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <>
              <Link to="/profile" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-soft text-primary text-sm font-bold hover:bg-primary/20 transition-colors">
                <Star className="w-4 h-4 fill-primary" /> {points}
              </Link>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/leaderboard"><Trophy className="ml-1 w-4 h-4" /> المتصدرون</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/profile"><User className="ml-1 w-4 h-4" /> ملفي</Link>
              </Button>
              {isAdmin && (
                <Button variant="soft" size="lg" asChild>
                  <Link to="/admin"><LayoutDashboard className="ml-1" /> لوحة التحكم</Link>
                </Button>
              )}
              <Button variant="ghost" size="lg" onClick={handleLogout}>
                <LogOut className="ml-1" /> خروج
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="lg" asChild><Link to="/login">تسجيل الدخول</Link></Button>
              <Button variant="hero" size="lg" asChild>
                <Link to="/signup"><Sparkles className="ml-1" /> ابدأ الآن مجانًا</Link>
              </Button>
            </>
          )}
        </div>
        <button className="lg:hidden p-2" onClick={() => setOpen(!open)} aria-label="القائمة">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden border-t border-border/40 bg-background animate-pop-in">
          <div className="container py-6 flex flex-col gap-4">
            {links.map(l => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-base font-medium py-2">
                {l.label}
              </a>
            ))}
            {user ? (
              <>
                <Button variant="soft" size="lg" asChild><Link to="/profile" onClick={() => setOpen(false)}><Star className="ml-1 w-4 h-4 fill-primary-foreground" /> ملفي ({points} نقطة)</Link></Button>
                <Button variant="outline" size="lg" asChild><Link to="/leaderboard" onClick={() => setOpen(false)}><Trophy className="ml-1 w-4 h-4" /> المتصدرون</Link></Button>
                {isAdmin && <Button variant="soft" size="lg" asChild><Link to="/admin" onClick={() => setOpen(false)}>لوحة التحكم</Link></Button>}
                <Button variant="outline" size="lg" onClick={() => { setOpen(false); handleLogout(); }}>خروج</Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="lg" asChild><Link to="/login" onClick={() => setOpen(false)}>تسجيل الدخول</Link></Button>
                <Button variant="hero" size="lg" asChild><Link to="/signup" onClick={() => setOpen(false)}>ابدأ الآن مجانًا</Link></Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
