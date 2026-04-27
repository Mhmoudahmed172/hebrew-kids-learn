import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Users, Plus, Clock, Trash2, Copy, Trophy, Star, BookOpen, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

interface KidRow {
  kid_id: string;
  full_name: string;
  total_points: number;
  level: number;
  videos_count: number;
  quizzes_count: number;
  badges_count: number;
  used_today: number;
  limit_minutes: number;
  restrictions_enabled: boolean;
}

const ParentDashboard = () => {
  const { user, isParent, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [kids, setKids] = useState<KidRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCode, setNewCode] = useState<string | null>(null);
  const [editing, setEditing] = useState<KidRow | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  const loadKids = async () => {
    if (!user) return;
    setLoading(true);
    const { data: links } = await supabase
      .from("parent_kid_links")
      .select("kid_id")
      .eq("parent_id", user.id);
    const ids = (links || []).map((l: any) => l.kid_id);

    if (ids.length === 0) { setKids([]); setLoading(false); return; }

    const [{ data: profs }, { data: pts }, { data: prog }, { data: ub }, { data: settings }] = await Promise.all([
      supabase.from("profiles").select("id,full_name").in("id", ids),
      supabase.from("user_points").select("user_id,total_points,current_level").in("user_id", ids),
      supabase.from("user_progress").select("user_id,content_type").in("user_id", ids),
      supabase.from("user_badges").select("user_id").in("user_id", ids),
      supabase.from("parental_settings").select("*").in("kid_id", ids),
    ]);

    const rows: KidRow[] = await Promise.all(ids.map(async (kid_id) => {
      const profile = profs?.find((p: any) => p.id === kid_id);
      const point = pts?.find((p: any) => p.user_id === kid_id);
      const setting = settings?.find((s: any) => s.kid_id === kid_id);
      const videos = (prog || []).filter((p: any) => p.user_id === kid_id && p.content_type === "video").length;
      const quizzes = (prog || []).filter((p: any) => p.user_id === kid_id && p.content_type === "quiz").length;
      const badges = (ub || []).filter((b: any) => b.user_id === kid_id).length;
      const { data: usedMin } = await supabase.rpc("get_kid_today_minutes", { p_kid_id: kid_id });
      return {
        kid_id,
        full_name: profile?.full_name || "طفل",
        total_points: point?.total_points || 0,
        level: point?.current_level || 1,
        videos_count: videos,
        quizzes_count: quizzes,
        badges_count: badges,
        used_today: typeof usedMin === "number" ? usedMin : 0,
        limit_minutes: setting?.daily_limit_minutes ?? 60,
        restrictions_enabled: setting?.restrictions_enabled ?? true,
      };
    }));
    setKids(rows);
    setLoading(false);
  };

  useEffect(() => { if (user) loadKids(); }, [user]);

  const generateCode = async () => {
    const { data, error } = await supabase.rpc("create_kid_invite_code");
    if (error) { toast.error("تعذّر إنشاء الكود: " + error.message); return; }
    setNewCode(data as string);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("تم النسخ ✓");
  };

  const unlink = async (kid_id: string) => {
    if (!confirm("إزالة الطفل من قائمتك؟")) return;
    await supabase.from("parent_kid_links").delete().eq("parent_id", user!.id).eq("kid_id", kid_id);
    toast.success("تمت الإزالة");
    loadKids();
  };

  const saveSettings = async (kid: KidRow, limit: number, enabled: boolean) => {
    const { error } = await supabase.from("parental_settings").upsert({
      kid_id: kid.kid_id,
      daily_limit_minutes: limit,
      restrictions_enabled: enabled,
      updated_by: user!.id,
      updated_at: new Date().toISOString(),
    });
    if (error) { toast.error("خطأ: " + error.message); return; }
    toast.success("تم الحفظ ✓");
    setEditing(null);
    loadKids();
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;
  if (!isParent && !isAdmin) {
    return (
      <main dir="rtl" className="min-h-screen">
        <Navbar />
        <div className="container py-32 text-center">
          <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="font-display text-3xl mb-2">لوحة الأهل</h1>
          <p className="text-muted-foreground mb-6">هذه الصفحة مخصصة للأهل فقط.</p>
          <Button variant="hero" asChild><Link to="/">العودة للرئيسية</Link></Button>
        </div>
      </main>
    );
  }

  return (
    <main dir="rtl" className="min-h-screen bg-background">
      <Navbar />
      <section className="container py-10 max-w-5xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-primary mb-6 hover:underline">
          <ArrowRight className="w-4 h-4 rotate-180" /> العودة للرئيسية
        </Link>

        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-display text-4xl mb-1">لوحة الأهل 👨‍👩‍👧</h1>
            <p className="text-muted-foreground">تابع تقدم أطفالك وتحكم بوقت اللعب اليومي</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="hero" size="lg" onClick={generateCode}>
                <Plus className="ml-1" /> ربط طفل جديد
              </Button>
            </DialogTrigger>
            <DialogContent dir="rtl">
              <DialogHeader>
                <DialogTitle>كود ربط الطفل</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-muted-foreground mb-4">اطلب من طفلك تسجيل الدخول ثم إدخال هذا الكود في صفحة "ربط بالأهل":</p>
                {newCode ? (
                  <div className="bg-primary-soft border-2 border-primary rounded-2xl p-6 text-center">
                    <div className="font-mono text-4xl font-bold text-primary tracking-widest mb-3">{newCode}</div>
                    <Button variant="outline" size="sm" onClick={() => copyCode(newCode)}>
                      <Copy className="w-4 h-4 ml-1" /> نسخ
                    </Button>
                    <p className="text-xs text-muted-foreground mt-3">صالح لمدة 7 أيام</p>
                  </div>
                ) : <p>جاري إنشاء الكود...</p>}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <p className="text-center py-20 text-muted-foreground">جاري تحميل بيانات الأطفال...</p>
        ) : kids.length === 0 ? (
          <div className="text-center py-20 bg-muted/30 rounded-3xl border-2 border-dashed border-border">
            <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="font-display text-xl mb-2">لا يوجد أطفال مربوطون بحسابك</p>
            <p className="text-muted-foreground mb-6">اضغط "ربط طفل جديد" لإنشاء كود وأعطه لطفلك</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {kids.map((kid) => {
              const usedPct = kid.limit_minutes ? Math.min(100, (kid.used_today / kid.limit_minutes) * 100) : 0;
              return (
                <div key={kid.kid_id} className="bg-card border-2 border-border/60 rounded-3xl p-6">
                  <div className="flex items-start gap-4 mb-4 flex-wrap">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                      {kid.full_name[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <h2 className="font-display text-2xl">{kid.full_name}</h2>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><Star className="w-4 h-4 text-primary" /> {kid.total_points} نقطة</span>
                        <span>المستوى {kid.level}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditing(kid)}>
                        <SettingsIcon className="w-4 h-4 ml-1" /> الإعدادات
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => unlink(kid.kid_id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <div className="bg-primary-soft rounded-2xl p-3 text-center">
                      <BookOpen className="w-5 h-5 mx-auto text-primary mb-1" />
                      <div className="font-bold">{kid.videos_count}</div>
                      <div className="text-xs text-muted-foreground">فيديو</div>
                    </div>
                    <div className="bg-secondary/20 rounded-2xl p-3 text-center">
                      <Trophy className="w-5 h-5 mx-auto text-secondary mb-1" />
                      <div className="font-bold">{kid.quizzes_count}</div>
                      <div className="text-xs text-muted-foreground">اختبار</div>
                    </div>
                    <div className="bg-pink/10 rounded-2xl p-3 text-center">
                      <Star className="w-5 h-5 mx-auto text-pink mb-1" />
                      <div className="font-bold">{kid.badges_count}</div>
                      <div className="text-xs text-muted-foreground">شارة</div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> وقت اللعب اليوم</span>
                      <span className={kid.used_today >= kid.limit_minutes ? "text-destructive font-bold" : "font-bold"}>
                        {kid.used_today} / {kid.limit_minutes} دقيقة
                      </span>
                    </div>
                    <Progress value={usedPct} className="h-3" />
                    {!kid.restrictions_enabled && <p className="text-xs text-muted-foreground mt-2">⚠️ القيود معطّلة</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Dialog إعدادات الطفل */}
        <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
          <DialogContent dir="rtl">
            <DialogHeader><DialogTitle>إعدادات {editing?.full_name}</DialogTitle></DialogHeader>
            {editing && (
              <EditSettingsForm
                kid={editing}
                onSave={(limit, enabled) => saveSettings(editing, limit, enabled)}
              />
            )}
          </DialogContent>
        </Dialog>
      </section>
      <Footer />
    </main>
  );
};

const EditSettingsForm = ({ kid, onSave }: { kid: KidRow; onSave: (limit: number, enabled: boolean) => void }) => {
  const [limit, setLimit] = useState(kid.limit_minutes);
  const [enabled, setEnabled] = useState(kid.restrictions_enabled);
  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="restrictions">تفعيل القيود الزمنية</Label>
        <Switch id="restrictions" checked={enabled} onCheckedChange={setEnabled} />
      </div>
      <div>
        <Label className="mb-3 block">الحد اليومي: <span className="text-primary font-bold">{limit} دقيقة</span></Label>
        <Slider min={10} max={240} step={5} value={[limit]} onValueChange={(v) => setLimit(v[0])} disabled={!enabled} />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>10 د</span><span>2 ساعة</span><span>4 ساعات</span>
        </div>
      </div>
      <Button variant="hero" className="w-full" onClick={() => onSave(limit, enabled)}>حفظ الإعدادات</Button>
    </div>
  );
};

export default ParentDashboard;
