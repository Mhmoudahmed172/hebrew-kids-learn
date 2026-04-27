import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trophy, Star, Award, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserPoints } from "@/hooks/useUserPoints";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const { points, level } = useUserPoints();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [allBadges, setAllBadges] = useState<any[]>([]);
  const [earnedIds, setEarnedIds] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState({ videos: 0, quizzes: 0, songs: 0, games: 0 });

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: p }, { data: badges }, { data: earned }, { data: progress }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("badges").select("*").order("sort_order"),
        supabase.from("user_badges").select("badge_id").eq("user_id", user.id),
        supabase.from("user_progress").select("content_type").eq("user_id", user.id),
      ]);
      setProfile(p);
      setAllBadges(badges || []);
      setEarnedIds(new Set((earned || []).map((b: any) => b.badge_id)));
      const s = { videos: 0, quizzes: 0, songs: 0, games: 0 };
      (progress || []).forEach((r: any) => { s[`${r.content_type}s` as keyof typeof s]++; });
      setStats(s);
    })();
  }, [user]);

  const nextLevelPoints = level * 100;
  const progressPct = Math.min(100, ((points % 100) / 100) * 100);

  return (
    <main dir="rtl" className="min-h-screen bg-background">
      <Navbar />
      <section className="container py-10 max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-primary mb-6 hover:underline">
          <ArrowRight className="w-4 h-4 rotate-180" /> العودة للرئيسية
        </Link>

        {/* بطاقة الملف الشخصي */}
        <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-pink/10 rounded-3xl p-8 mb-6 border-2 border-border/60">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground text-4xl font-bold">
              {(profile?.full_name?.[0] || user?.email?.[0] || "?").toUpperCase()}
            </div>
            <div className="flex-1 text-center md:text-right">
              <h1 className="font-display text-3xl mb-1">{profile?.full_name || "صديقنا الصغير"}</h1>
              <p className="text-muted-foreground">{user?.email}</p>
              <div className="flex items-center gap-2 justify-center md:justify-start mt-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="font-bold">المستوى {level}</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-display text-primary">{points}</div>
              <div className="text-sm text-muted-foreground">نقطة</div>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex justify-between text-xs mb-2">
              <span>التقدم نحو المستوى {level + 1}</span>
              <span>{points % 100} / 100</span>
            </div>
            <Progress value={progressPct} className="h-3" />
          </div>
        </div>

        {/* إحصائيات */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "فيديو", value: stats.videos, color: "bg-primary/10 text-primary" },
            { label: "اختبار", value: stats.quizzes, color: "bg-secondary/20 text-secondary" },
            { label: "أغنية", value: stats.songs, color: "bg-pink/10 text-pink" },
            { label: "لعبة", value: stats.games, color: "bg-mint/30 text-foreground" },
          ].map((s) => (
            <div key={s.label} className={`${s.color} rounded-2xl p-4 text-center`}>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs">{s.label}</div>
            </div>
          ))}
        </div>

        {/* الشارات */}
        <div className="bg-card rounded-3xl p-6 border-2 border-border/60">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-2xl flex items-center gap-2">
              <Award className="w-6 h-6 text-primary" /> شاراتي
            </h2>
            <span className="text-sm text-muted-foreground">{earnedIds.size} / {allBadges.length}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {allBadges.map((b) => {
              const earned = earnedIds.has(b.id);
              return (
                <div key={b.id} className={`rounded-2xl p-4 border-2 text-center transition-all ${
                  earned ? "border-primary/40 bg-primary-soft" : "border-border/60 bg-muted/30 opacity-50 grayscale"
                }`}>
                  <div className="text-4xl mb-2">{b.emoji}</div>
                  <div className="font-bold text-sm mb-1">{b.name}</div>
                  <div className="text-xs text-muted-foreground">{b.description}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 text-center">
          <Button variant="hero" size="lg" asChild>
            <Link to="/leaderboard"><Trophy className="ml-1" /> شاهد المتصدرين</Link>
          </Button>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default Profile;
