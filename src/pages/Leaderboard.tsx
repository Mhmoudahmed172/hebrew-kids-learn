import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trophy, Medal, ArrowRight, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const Leaderboard = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: pts } = await supabase
        .from("user_points")
        .select("user_id,total_points,current_level")
        .order("total_points", { ascending: false })
        .limit(50);
      const ids = (pts || []).map((r: any) => r.user_id);
      let names: Record<string, string> = {};
      if (ids.length) {
        const { data: profs } = await supabase.from("profiles").select("id,full_name").in("id", ids);
        (profs || []).forEach((p: any) => { names[p.id] = p.full_name || "متعلم"; });
      }
      setRows((pts || []).map((r: any) => ({ ...r, name: names[r.user_id] || "متعلم" })));
      setLoading(false);
    })();
  }, []);

  const medal = (i: number) => i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`;

  return (
    <main dir="rtl" className="min-h-screen bg-background">
      <Navbar />
      <section className="container py-10 max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-primary mb-6 hover:underline">
          <ArrowRight className="w-4 h-4 rotate-180" /> العودة للرئيسية
        </Link>

        <div className="text-center mb-8">
          <Crown className="w-16 h-16 mx-auto text-primary mb-3" />
          <h1 className="font-display text-4xl mb-2">قائمة المتصدرين</h1>
          <p className="text-muted-foreground">أفضل المتعلمين على المنصة</p>
        </div>

        {loading ? (
          <p className="text-center py-20 text-muted-foreground">جاري التحميل...</p>
        ) : rows.length === 0 ? (
          <p className="text-center py-20 text-muted-foreground">لا يوجد متعلمون بعد. كن أول من يجمع النقاط!</p>
        ) : (
          <div className="space-y-2">
            {rows.map((r, i) => {
              const isMe = r.user_id === user?.id;
              return (
                <div key={r.user_id} className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                  isMe ? "border-primary bg-primary-soft" : i < 3 ? "border-secondary/40 bg-secondary/10" : "border-border/60 bg-card"
                }`}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl bg-background">
                    {medal(i)}
                  </div>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground flex items-center justify-center font-bold">
                    {r.name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{r.name} {isMe && <span className="text-xs text-primary">(أنت)</span>}</p>
                    <p className="text-xs text-muted-foreground">المستوى {r.current_level}</p>
                  </div>
                  <div className="text-left">
                    <div className="font-display text-2xl text-primary">{r.total_points}</div>
                    <div className="text-xs text-muted-foreground">نقطة</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
};

export default Leaderboard;
