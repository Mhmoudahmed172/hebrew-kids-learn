import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Video, Users, FileText, ClipboardCheck, Music, Gamepad2,
  Upload, Plus, Pencil, Trash2, ArrowRight, LogOut, Crown, X, CheckCircle2,
  MessageSquare, HelpCircle, KeyRound, Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import mascot from "@/assets/mascot-owl.png";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, Cell, PieChart, Pie, Legend, AreaChart, Area,
} from "recharts";

type Section = "overview" | "videos" | "users" | "content" | "quizzes" | "songs" | "games" | "testimonials" | "faqs";

const nav: { id: Section; label: string; icon: any }[] = [
  { id: "overview", label: "نظرة عامة", icon: LayoutDashboard },
  { id: "videos", label: "الفيديوهات", icon: Video },
  { id: "users", label: "المستخدمون", icon: Users },
  { id: "content", label: "المستويات", icon: FileText },
  { id: "quizzes", label: "الاختبارات", icon: ClipboardCheck },
  { id: "songs", label: "الأغاني", icon: Music },
  { id: "games", label: "الألعاب", icon: Gamepad2 },
  { id: "testimonials", label: "آراء العملاء", icon: MessageSquare },
  { id: "faqs", label: "الأسئلة الشائعة", icon: HelpCircle },
];

const STATUS_LABELS: Record<string, string> = {
  active: "فعّال",
  inactive: "غير فعّال",
  pending_payment: "بانتظار الدفع",
  frozen: "مجمّد",
  banned: "محظور",
};
const STATUS_COLORS: Record<string, string> = {
  active: "bg-mint text-white",
  inactive: "bg-muted text-foreground",
  pending_payment: "bg-accent text-accent-foreground",
  frozen: "bg-secondary text-secondary-foreground",
  banned: "bg-destructive text-destructive-foreground",
};

const Admin = () => {
  const [active, setActive] = useState<Section>("overview");
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate("/login");
    else if (!isAdmin) {
      toast({ title: "غير مصرح", description: "يجب أن تكون مديراً للوصول.", variant: "destructive" });
      navigate("/");
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading || !user || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;
  }

  return (
    <div dir="rtl" className="min-h-screen bg-muted/30 flex">
      <aside className="sticky top-0 right-0 h-screen w-72 bg-card border-l border-border/60 hidden lg:block">
        <div className="p-6 border-b border-border/60">
          <Link to="/" className="flex items-center gap-3 font-display font-extrabold text-lg">
            <img src={mascot} alt="" className="w-10 h-10" />
            <div>
              <div className="text-gradient">لوحة الإدارة</div>
              <div className="text-xs font-normal text-muted-foreground">منصة عبرية</div>
            </div>
          </Link>
        </div>
        <nav className="p-4 space-y-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button key={item.id} onClick={() => setActive(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-bounce ${
                  isActive ? "bg-primary-gradient text-primary-foreground shadow-glow" : "text-foreground/70 hover:bg-primary-soft hover:text-primary"
                }`}>
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="absolute bottom-0 inset-x-0 p-4 border-t border-border/60 space-y-2">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-primary-soft">
            <div className="w-10 h-10 rounded-full bg-primary-gradient flex items-center justify-center text-primary-foreground">
              <Crown className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate">المدير</div>
              <div className="text-xs text-muted-foreground truncate">{user.email}</div>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={() => signOut().then(() => navigate("/"))}>
            <LogOut className="w-4 h-4" /> تسجيل الخروج
          </Button>
        </div>
      </aside>

      <main className="flex-1 p-6 lg:p-10 overflow-x-hidden">
        <div className="lg:hidden mb-6 flex gap-2 overflow-x-auto">
          {nav.map((item) => (
            <button key={item.id} onClick={() => setActive(item.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold ${active === item.id ? "bg-primary text-primary-foreground" : "bg-card"}`}>
              {item.label}
            </button>
          ))}
        </div>

        {active === "overview" && <Overview />}
        {active === "videos" && <VideosSection />}
        {active === "users" && <UsersSection />}
        {active === "content" && <LevelsSection />}
        {active === "quizzes" && <QuizzesSection />}
        {active === "songs" && <SimpleSection table="songs" titleLabel="الأغاني" />}
        {active === "games" && <SimpleSection table="games" titleLabel="الألعاب" hasDescription />}
        {active === "testimonials" && <TestimonialsSection />}
        {active === "faqs" && <FaqsSection />}
      </main>
    </div>
  );
};

// ============== OVERVIEW ==============
const CHART_COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--pink))", "hsl(var(--mint))"];

const Overview = () => {
  const [stats, setStats] = useState({ videos: 0, users: 0, levels: 0, quizzes: 0, songs: 0, games: 0 });
  const [contentData, setContentData] = useState<{ name: string; value: number }[]>([]);
  const [statusData, setStatusData] = useState<{ name: string; value: number }[]>([]);
  const [topUsers, setTopUsers] = useState<{ name: string; points: number }[]>([]);
  const [activity, setActivity] = useState<{ day: string; count: number }[]>([]);

  useEffect(() => {
    (async () => {
      const [v, u, l, q, s, g] = await Promise.all([
        supabase.from("videos").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("levels").select("*", { count: "exact", head: true }),
        supabase.from("quizzes").select("*", { count: "exact", head: true }),
        supabase.from("songs").select("*", { count: "exact", head: true }),
        supabase.from("games").select("*", { count: "exact", head: true }),
      ]);
      const counts = {
        videos: v.count || 0, users: u.count || 0, levels: l.count || 0,
        quizzes: q.count || 0, songs: s.count || 0, games: g.count || 0,
      };
      setStats(counts);
      setContentData([
        { name: "فيديوهات", value: counts.videos },
        { name: "أغاني", value: counts.songs },
        { name: "ألعاب", value: counts.games },
        { name: "اختبارات", value: counts.quizzes },
        { name: "مستويات", value: counts.levels },
      ]);

      // user statuses
      const { data: profs } = await supabase.from("profiles").select("status, full_name, id");
      const grouped: Record<string, number> = {};
      (profs || []).forEach((p: any) => { grouped[p.status] = (grouped[p.status] || 0) + 1; });
      setStatusData(Object.entries(grouped).map(([k, v]) => ({ name: STATUS_LABELS[k] || k, value: v })));

      // top users by points
      const { data: pts } = await supabase
        .from("user_points").select("user_id, total_points")
        .order("total_points", { ascending: false }).limit(5);
      const nameById: Record<string, string> = {};
      (profs || []).forEach((p: any) => { nameById[p.id] = p.full_name || "بدون اسم"; });
      setTopUsers((pts || []).map((p: any) => ({
        name: nameById[p.user_id] || "مستخدم", points: p.total_points,
      })));

      // last 7 days progress
      const since = new Date(); since.setDate(since.getDate() - 6);
      const { data: prog } = await supabase
        .from("user_progress").select("completed_at")
        .gte("completed_at", since.toISOString());
      const days: { day: string; count: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        const label = d.toLocaleDateString("ar-EG", { weekday: "short" });
        const count = (prog || []).filter((r: any) => r.completed_at.slice(0, 10) === key).length;
        days.push({ day: label, count });
      }
      setActivity(days);
    })();
  }, []);

  const cards = [
    { label: "الفيديوهات", val: stats.videos, icon: Video, color: "bg-secondary-soft text-secondary" },
    { label: "المستخدمون", val: stats.users, icon: Users, color: "bg-pink-soft text-pink" },
    { label: "المستويات", val: stats.levels, icon: FileText, color: "bg-mint-soft text-mint" },
    { label: "الاختبارات", val: stats.quizzes, icon: ClipboardCheck, color: "bg-accent-soft text-accent-foreground" },
    { label: "الأغاني", val: stats.songs, icon: Music, color: "bg-primary-soft text-primary" },
    { label: "الألعاب", val: stats.games, icon: Gamepad2, color: "bg-pink-soft text-pink" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">نظرة عامة 📊</h1>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.label} className="p-5">
              <div className={`w-11 h-11 rounded-2xl ${c.color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="font-display text-2xl">{c.val}</div>
              <div className="text-xs text-muted-foreground">{c.label}</div>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <h3 className="font-display text-lg mb-1">المحتوى حسب النوع</h3>
          <p className="text-xs text-muted-foreground mb-4">إجمالي العناصر المتاحة في المنصة</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={contentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
              <RTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {contentData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="font-display text-lg mb-1">حالات المستخدمين</h3>
          <p className="text-xs text-muted-foreground mb-4">توزيع المستخدمين حسب الحالة</p>
          {statusData.length === 0 ? (
            <div className="h-[260px] flex items-center justify-center text-muted-foreground">لا بيانات</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {statusData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <RTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-display text-lg mb-1">نشاط آخر 7 أيام</h3>
          <p className="text-xs text-muted-foreground mb-4">عدد الإنجازات اليومية للمستخدمين</p>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={activity}>
              <defs>
                <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
              <RTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
              <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#actGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="font-display text-lg mb-1">أعلى 5 مستخدمين بالنقاط</h3>
          <p className="text-xs text-muted-foreground mb-4">المتصدرون في المنصة</p>
          {topUsers.length === 0 ? (
            <div className="h-[260px] flex items-center justify-center text-muted-foreground">لا بيانات</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topUsers} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} width={90} />
                <RTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                <Bar dataKey="points" radius={[0, 8, 8, 0]} fill="hsl(var(--accent))" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  );
};

// ============== VIDEOS ==============
const VideosSection = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const load = async () => {
    const { data } = await supabase.from("videos").select("*, levels(title, slug)").order("sort_order");
    setVideos(data || []);
    const { data: lv } = await supabase.from("levels").select("*").order("sort_order");
    setLevels(lv || []);
  };
  useEffect(() => { load(); }, []);

  const remove = async (id: string, url: string) => {
    if (!confirm("حذف الفيديو؟")) return;
    // delete file from storage
    const path = url.split("/videos/")[1];
    if (path) await supabase.storage.from("videos").remove([path]);
    await supabase.from("videos").delete().eq("id", id);
    toast({ title: "تم الحذف" });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl">الفيديوهات 🎬</h1>
        <Button variant="hero" onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus /> رفع فيديو جديد
        </Button>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">العنوان</TableHead>
              <TableHead className="text-right">المستوى</TableHead>
              <TableHead className="text-right">الترتيب</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-10">لا توجد فيديوهات. ابدأ بالرفع.</TableCell></TableRow>
            ) : videos.map((v) => (
              <TableRow key={v.id}>
                <TableCell className="font-bold">{v.title}</TableCell>
                <TableCell>{v.levels?.title || "-"}</TableCell>
                <TableCell>{v.sort_order}</TableCell>
                <TableCell><Badge variant={v.published ? "default" : "secondary"}>{v.published ? "منشور" : "مخفي"}</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => { setEditing(v); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(v.id, v.video_url)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <VideoDialog open={open} onClose={() => setOpen(false)} editing={editing} levels={levels} onSaved={load} />
    </div>
  );
};

const VideoDialog = ({ open, onClose, editing, levels, onSaved }: any) => {
  const [form, setForm] = useState({ title: "", description: "", level_id: "", sort_order: 0, published: true });
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) setForm({
      title: editing.title, description: editing.description || "",
      level_id: editing.level_id || "", sort_order: editing.sort_order || 0, published: editing.published,
    });
    else setForm({ title: "", description: "", level_id: "", sort_order: 0, published: true });
    setFile(null); setProgress(0);
  }, [editing, open]);

  const save = async () => {
    if (!form.title) { toast({ title: "العنوان مطلوب", variant: "destructive" }); return; }
    if (!editing && !file) { toast({ title: "اختر ملف فيديو", variant: "destructive" }); return; }

    setUploading(true);
    try {
      let video_url = editing?.video_url || "";
      if (file) {
        const ext = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        // simulated progress (Supabase JS doesn't expose progress for standard upload)
        const progInterval = setInterval(() => setProgress((p) => Math.min(p + 5, 90)), 500);
        const { error: upErr } = await supabase.storage.from("videos").upload(fileName, file, {
          contentType: file.type, upsert: false,
        });
        clearInterval(progInterval);
        if (upErr) throw upErr;
        setProgress(100);
        const { data: pub } = supabase.storage.from("videos").getPublicUrl(fileName);
        video_url = pub.publicUrl;

        // delete old file if replacing
        if (editing?.video_url) {
          const oldPath = editing.video_url.split("/videos/")[1];
          if (oldPath) await supabase.storage.from("videos").remove([oldPath]);
        }
      }

      const payload = { ...form, video_url, level_id: form.level_id || null };
      const { error } = editing
        ? await supabase.from("videos").update(payload).eq("id", editing.id)
        : await supabase.from("videos").insert(payload);
      if (error) throw error;
      toast({ title: editing ? "تم التحديث" : "تم رفع الفيديو 🎉" });
      onSaved(); onClose();
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent dir="rtl" className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{editing ? "تعديل الفيديو" : "رفع فيديو جديد"}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label>العنوان *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div><Label>الوصف</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>المستوى</Label>
              <Select value={form.level_id} onValueChange={(v) => setForm({ ...form, level_id: v })}>
                <SelectTrigger><SelectValue placeholder="اختر مستوى" /></SelectTrigger>
                <SelectContent>{levels.map((l: any) => <SelectItem key={l.id} value={l.id}>{l.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>الترتيب</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: +e.target.value })} /></div>
          </div>
          <div>
            <Label>{editing ? "استبدال الفيديو (اختياري)" : "ملف الفيديو *"}</Label>
            <input ref={fileRef} type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm border rounded-xl p-2 mt-1" />
            {file && <p className="text-xs text-muted-foreground mt-1">{file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)</p>}
            {uploading && progress > 0 && <Progress value={progress} className="mt-2" />}
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="pub" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
            <Label htmlFor="pub">منشور</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={uploading}>إلغاء</Button>
          <Button variant="hero" onClick={save} disabled={uploading}>
            {uploading ? "جاري الرفع..." : <><Upload className="w-4 h-4" /> حفظ</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ============== USERS ==============
const UsersSection = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [credOpen, setCredOpen] = useState(false);
  const [credUser, setCredUser] = useState<any>(null);
  const [credEmail, setCredEmail] = useState("");
  const [credPassword, setCredPassword] = useState("");
  const [credSaving, setCredSaving] = useState(false);
  const [credCurrentEmail, setCredCurrentEmail] = useState<string>("");
  const [credLoadingEmail, setCredLoadingEmail] = useState(false);

  const load = async () => {
    const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    const { data: rolesData } = await supabase.from("user_roles").select("*");
    const merged = (profiles || []).map((p) => ({
      ...p, roles: (rolesData || []).filter((r) => r.user_id === p.id).map((r) => r.role),
    }));
    setUsers(merged);
  };
  useEffect(() => { load(); }, []);

  const setRole = async (userId: string, newRole: "admin" | "parent" | "kid") => {
    await supabase.from("user_roles").delete().eq("user_id", userId);
    await supabase.from("user_roles").insert({ user_id: userId, role: newRole });
    toast({ title: "تم تحديث الدور" });
    load();
  };

  const setStatus = async (userId: string, status: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ status: status as any, status_updated_at: new Date().toISOString() })
      .eq("id", userId);
    if (error) { toast({ title: "خطأ", description: error.message, variant: "destructive" }); return; }
    toast({ title: "تم تحديث الحالة" });
    load();
  };

  const openCred = async (u: any) => {
    setCredUser(u);
    setCredEmail("");
    setCredPassword("");
    setCredCurrentEmail("");
    setCredOpen(true);
    setCredLoadingEmail(true);
    const { data, error } = await supabase.functions.invoke("admin-update-user", {
      body: { user_id: u.id, action: "get" },
    });
    setCredLoadingEmail(false);
    if (!error && (data as any)?.user?.email) setCredCurrentEmail((data as any).user.email);
  };

  const saveCred = async () => {
    if (!credUser) return;
    if (!credEmail.trim() && !credPassword) {
      toast({ title: "أدخل إيميلاً جديداً أو كلمة مرور", variant: "destructive" });
      return;
    }
    setCredSaving(true);
    const payload: any = { user_id: credUser.id };
    if (credEmail.trim()) payload.email = credEmail.trim();
    if (credPassword) payload.password = credPassword;
    const { data, error } = await supabase.functions.invoke("admin-update-user", { body: payload });
    setCredSaving(false);
    if (error || (data as any)?.error) {
      toast({ title: "خطأ", description: (data as any)?.error || error?.message, variant: "destructive" });
      return;
    }
    toast({ title: "تم تحديث بيانات الدخول" });
    setCredOpen(false);
  };

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">المستخدمون 👥</h1>
      <Card className="overflow-hidden">
        <Table>
          <TableHeader><TableRow>
            <TableHead className="text-right">الاسم</TableHead>
            <TableHead className="text-right">العمر</TableHead>
            <TableHead className="text-right">الدور</TableHead>
            <TableHead className="text-right">الحالة</TableHead>
            <TableHead className="text-right">تغيير الدور</TableHead>
            <TableHead className="text-right">تغيير الحالة</TableHead>
            <TableHead className="text-right">بيانات الدخول</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {users.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">لا يوجد مستخدمون</TableCell></TableRow>
              : users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-bold">{u.full_name || "-"}</TableCell>
                  <TableCell>{u.age || "-"}</TableCell>
                  <TableCell>{u.roles.map((r: string) => <Badge key={r} className="ml-1">{r}</Badge>)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${STATUS_COLORS[u.status] || "bg-muted"}`}>
                      {STATUS_LABELS[u.status] || u.status || "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Select value={u.roles[0] || ""} onValueChange={(v: any) => setRole(u.id, v)}>
                      <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">مدير</SelectItem>
                        <SelectItem value="parent">ولي أمر</SelectItem>
                        <SelectItem value="kid">طفل</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select value={u.status || "active"} onValueChange={(v) => setStatus(u.id, v)}>
                      <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_LABELS).map(([k, l]) => (
                          <SelectItem key={k} value={k}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => openCred(u)}>
                      <KeyRound className="w-4 h-4" /> تعديل
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={credOpen} onOpenChange={setCredOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل بيانات دخول: {credUser?.full_name || "—"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-xl bg-muted/50 p-3 border border-border">
              <p className="text-xs text-muted-foreground mb-1">الإيميل الحالي</p>
              <p className="font-bold text-sm break-all">
                {credLoadingEmail ? "جاري التحميل..." : (credCurrentEmail || "غير متاح")}
              </p>
            </div>
            <div>
              <Label className="flex items-center gap-2 mb-2"><Mail className="w-4 h-4" /> إيميل جديد (اختياري)</Label>
              <Input type="email" value={credEmail} onChange={(e) => setCredEmail(e.target.value)} placeholder={credCurrentEmail || "new@example.com"} />
            </div>
            <div>
              <Label className="flex items-center gap-2 mb-2"><KeyRound className="w-4 h-4" /> كلمة مرور جديدة (اختياري)</Label>
              <Input type="text" value={credPassword} onChange={(e) => setCredPassword(e.target.value)} placeholder="6 أحرف على الأقل" />
            </div>
            <p className="text-xs text-muted-foreground">اترك الحقل فارغاً إذا لم ترغب بتغييره. يجب ملء حقل واحد على الأقل.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCredOpen(false)} disabled={credSaving}>إلغاء</Button>
            <Button variant="hero" onClick={saveCred} disabled={credSaving}>
              {credSaving ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ============== LEVELS ==============
const LevelsSection = () => {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ slug: "", title: "", description: "", color: "mint", sort_order: 0, published: true });

  const load = async () => {
    const { data } = await supabase.from("levels").select("*").order("sort_order");
    setItems(data || []);
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (editing) setForm(editing);
    else setForm({ slug: "", title: "", description: "", color: "mint", sort_order: 0, published: true });
  }, [editing, open]);

  const save = async () => {
    if (!form.title || !form.slug) { toast({ title: "العنوان والاسم المختصر مطلوبان", variant: "destructive" }); return; }
    const { error } = editing
      ? await supabase.from("levels").update(form).eq("id", editing.id)
      : await supabase.from("levels").insert(form);
    if (error) { toast({ title: "خطأ", description: error.message, variant: "destructive" }); return; }
    toast({ title: editing ? "تم التحديث" : "تمت الإضافة" });
    setOpen(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm("حذف المستوى وجميع محتوياته؟")) return;
    await supabase.from("levels").delete().eq("id", id);
    toast({ title: "تم الحذف" }); load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl">المستويات 📚</h1>
        <Button variant="hero" onClick={() => { setEditing(null); setOpen(true); }}><Plus /> إضافة مستوى</Button>
      </div>
      <Card className="overflow-hidden">
        <Table>
          <TableHeader><TableRow>
            <TableHead className="text-right">العنوان</TableHead>
            <TableHead className="text-right">المعرّف</TableHead>
            <TableHead className="text-right">الترتيب</TableHead>
            <TableHead className="text-right">الحالة</TableHead>
            <TableHead className="text-right">إجراءات</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {items.map((l) => (
              <TableRow key={l.id}>
                <TableCell className="font-bold">{l.title}</TableCell>
                <TableCell className="font-mono text-xs">{l.slug}</TableCell>
                <TableCell>{l.sort_order}</TableCell>
                <TableCell><Badge variant={l.published ? "default" : "secondary"}>{l.published ? "منشور" : "مخفي"}</Badge></TableCell>
                <TableCell>
                  <Button size="icon" variant="ghost" onClick={() => { setEditing(l); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(l.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle>{editing ? "تعديل" : "إضافة"} مستوى</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>العنوان</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>المعرّف (إنجليزي بدون مسافات)</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
            <div><Label>الوصف</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>اللون</Label><Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} /></div>
              <div><Label>الترتيب</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: +e.target.value })} /></div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="lpub" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
              <Label htmlFor="lpub">منشور</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
            <Button variant="hero" onClick={save}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ============== QUIZZES ==============
const QuizzesSection = () => {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const load = async () => {
    const { data } = await supabase.from("quizzes").select("*, quiz_questions(*), levels(title)").order("created_at", { ascending: false });
    setQuizzes(data || []);
    const { data: lv } = await supabase.from("levels").select("*").order("sort_order");
    setLevels(lv || []);
  };
  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    if (!confirm("حذف الاختبار؟")) return;
    await supabase.from("quizzes").delete().eq("id", id);
    toast({ title: "تم الحذف" }); load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl">الاختبارات ✅</h1>
        <Button variant="hero" onClick={() => { setEditing(null); setOpen(true); }}><Plus /> اختبار جديد</Button>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        {quizzes.map((q) => (
          <Card key={q.id} className="p-5">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="font-bold text-lg">{q.title}</h3>
                <p className="text-xs text-muted-foreground">{q.levels?.title} • {q.quiz_questions?.length || 0} سؤال</p>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => { setEditing(q); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => remove(q.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </div>
            </div>
            {q.description && <p className="text-sm text-muted-foreground">{q.description}</p>}
          </Card>
        ))}
        {quizzes.length === 0 && <p className="text-center text-muted-foreground col-span-2 py-10">لا توجد اختبارات</p>}
      </div>

      <QuizDialog open={open} onClose={() => setOpen(false)} editing={editing} levels={levels} onSaved={load} />
    </div>
  );
};

const QuizDialog = ({ open, onClose, editing, levels, onSaved }: any) => {
  const [form, setForm] = useState({ title: "", description: "", level_id: "", published: true });
  const [questions, setQuestions] = useState<any[]>([{ question: "", options: ["", ""], correct_index: 0 }]);

  useEffect(() => {
    if (editing) {
      setForm({ title: editing.title, description: editing.description || "", level_id: editing.level_id || "", published: editing.published });
      setQuestions(editing.quiz_questions?.length ? editing.quiz_questions.map((q: any) => ({
        question: q.question, options: q.options, correct_index: q.correct_index,
      })) : [{ question: "", options: ["", ""], correct_index: 0 }]);
    } else {
      setForm({ title: "", description: "", level_id: "", published: true });
      setQuestions([{ question: "", options: ["", ""], correct_index: 0 }]);
    }
  }, [editing, open]);

  const updateQ = (i: number, patch: any) => setQuestions(qs => qs.map((q, idx) => idx === i ? { ...q, ...patch } : q));
  const addOption = (i: number) => updateQ(i, { options: [...questions[i].options, ""] });
  const removeOption = (i: number, oi: number) => {
    const opts = questions[i].options.filter((_: any, x: number) => x !== oi);
    updateQ(i, { options: opts, correct_index: Math.min(questions[i].correct_index, opts.length - 1) });
  };
  const setOption = (i: number, oi: number, val: string) => {
    const opts = [...questions[i].options]; opts[oi] = val; updateQ(i, { options: opts });
  };

  const save = async () => {
    if (!form.title) { toast({ title: "العنوان مطلوب", variant: "destructive" }); return; }
    for (const q of questions) {
      if (!q.question.trim() || q.options.some((o: string) => !o.trim())) {
        toast({ title: "املأ جميع الأسئلة والخيارات", variant: "destructive" }); return;
      }
    }
    let quizId = editing?.id;
    if (editing) {
      await supabase.from("quizzes").update({ ...form, level_id: form.level_id || null }).eq("id", editing.id);
      await supabase.from("quiz_questions").delete().eq("quiz_id", editing.id);
    } else {
      const { data, error } = await supabase.from("quizzes").insert({ ...form, level_id: form.level_id || null }).select().single();
      if (error) { toast({ title: "خطأ", description: error.message, variant: "destructive" }); return; }
      quizId = data.id;
    }
    await supabase.from("quiz_questions").insert(
      questions.map((q, idx) => ({ quiz_id: quizId, question: q.question, options: q.options, correct_index: q.correct_index, sort_order: idx }))
    );
    toast({ title: "تم الحفظ ✨" });
    onSaved(); onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent dir="rtl" className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{editing ? "تعديل" : "إنشاء"} اختبار</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label>عنوان الاختبار *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div><Label>الوصف</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div>
            <Label>المستوى</Label>
            <Select value={form.level_id} onValueChange={(v) => setForm({ ...form, level_id: v })}>
              <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
              <SelectContent>{levels.map((l: any) => <SelectItem key={l.id} value={l.id}>{l.title}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">الأسئلة ({questions.length})</h3>
              <Button size="sm" variant="soft" onClick={() => setQuestions([...questions, { question: "", options: ["", ""], correct_index: 0 }])}>
                <Plus className="w-4 h-4" /> سؤال
              </Button>
            </div>
            {questions.map((q, i) => (
              <Card key={i} className="p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-primary">{i + 1}.</span>
                  <Input placeholder="نص السؤال" value={q.question} onChange={(e) => updateQ(i, { question: e.target.value })} />
                  {questions.length > 1 && <Button size="icon" variant="ghost" onClick={() => setQuestions(questions.filter((_, x) => x !== i))}><X className="w-4 h-4" /></Button>}
                </div>
                <div className="space-y-2 pr-6">
                  {q.options.map((opt: string, oi: number) => (
                    <div key={oi} className="flex items-center gap-2">
                      <button type="button" onClick={() => updateQ(i, { correct_index: oi })}
                        className={`w-7 h-7 rounded-full flex items-center justify-center ${q.correct_index === oi ? "bg-mint text-white" : "bg-muted"}`}>
                        {q.correct_index === oi ? <CheckCircle2 className="w-4 h-4" /> : oi + 1}
                      </button>
                      <Input placeholder={`الخيار ${oi + 1}`} value={opt} onChange={(e) => setOption(i, oi, e.target.value)}
                        className={q.correct_index === oi ? "bg-mint-soft" : ""} />
                      {q.options.length > 2 && <Button size="icon" variant="ghost" onClick={() => removeOption(i, oi)}><X className="w-4 h-4" /></Button>}
                    </div>
                  ))}
                  {q.options.length < 6 && <Button size="sm" variant="ghost" onClick={() => addOption(i)}><Plus className="w-3 h-3" /> خيار</Button>}
                </div>
              </Card>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>إلغاء</Button>
          <Button variant="hero" onClick={save}>حفظ الاختبار</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ============== SIMPLE (songs/games) ==============
const SimpleSection = ({ table, titleLabel, hasDescription }: { table: "songs" | "games"; titleLabel: string; hasDescription?: boolean }) => {
  const [items, setItems] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: "", url: "", description: "", level_id: "", published: true });

  const load = async () => {
    const { data } = await (supabase.from(table) as any).select("*, levels(title)").order("created_at", { ascending: false });
    setItems(data || []);
  };
  useEffect(() => {
    load();
    supabase.from("levels").select("id, title").order("sort_order").then(({ data }) => setLevels(data || []));
  }, [table]);

  useEffect(() => {
    if (editing) setForm({ title: editing.title, url: editing.url || "", description: editing.description || "", level_id: editing.level_id || "", published: editing.published });
    else setForm({ title: "", url: "", description: "", level_id: "", published: true });
  }, [editing, open]);

  const save = async () => {
    if (!form.title) { toast({ title: "العنوان مطلوب", variant: "destructive" }); return; }
    if (!form.level_id) { toast({ title: "يجب اختيار المستوى", variant: "destructive" }); return; }
    const payload: any = { title: form.title, url: form.url, level_id: form.level_id, published: form.published };
    if (hasDescription) payload.description = form.description;
    const { error } = editing
      ? await (supabase.from(table) as any).update(payload).eq("id", editing.id)
      : await (supabase.from(table) as any).insert(payload);
    if (error) { toast({ title: "خطأ", description: error.message, variant: "destructive" }); return; }
    toast({ title: "تم الحفظ" });
    setOpen(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm("حذف؟")) return;
    await (supabase.from(table) as any).delete().eq("id", id);
    toast({ title: "تم الحذف" }); load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl">{titleLabel}</h1>
        <Button variant="hero" onClick={() => { setEditing(null); setOpen(true); }}><Plus /> إضافة</Button>
      </div>
      <Card className="overflow-hidden">
        <Table>
          <TableHeader><TableRow>
            <TableHead className="text-right">العنوان</TableHead>
            <TableHead className="text-right">المستوى</TableHead>
            <TableHead className="text-right">الرابط</TableHead>
            <TableHead className="text-right">إجراءات</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {items.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground">لا توجد عناصر</TableCell></TableRow>
              : items.map((it: any) => (
                <TableRow key={it.id}>
                  <TableCell className="font-bold">{it.title}</TableCell>
                  <TableCell><Badge variant="secondary">{it.levels?.title || "—"}</Badge></TableCell>
                  <TableCell className="text-xs truncate max-w-xs">{it.url || "-"}</TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost" onClick={() => { setEditing(it); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(it.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle>{editing ? "تعديل" : "إضافة"} {titleLabel}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>العنوان</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div>
              <Label>المستوى *</Label>
              <Select value={form.level_id} onValueChange={(v) => setForm({ ...form, level_id: v })}>
                <SelectTrigger><SelectValue placeholder="اختر المستوى" /></SelectTrigger>
                <SelectContent>
                  {levels.map((l) => <SelectItem key={l.id} value={l.id}>{l.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{table === "games" ? "كود التضمين (iframe)" : "الرابط"}</Label>
              {table === "games" ? (
                <>
                  <Textarea
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                    dir="ltr"
                    rows={4}
                    placeholder='<iframe src="https://wordwall.net/ar/embed/..." width="500" height="380" frameborder="0" allowfullscreen></iframe>'
                  />
                  <p className="text-xs text-muted-foreground mt-1">الصق كود iframe كاملاً كما هو من Wordwall.</p>
                </>
              ) : (
                <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} dir="ltr" />
              )}
            </div>
            {hasDescription && <div><Label>الوصف</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
            <Button variant="hero" onClick={save}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};


// ============== TESTIMONIALS ==============
const TestimonialsSection = () => {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const empty = { name: "", role: "", text: "", rating: 5, avatar_color: "bg-primary-gradient", card_color: "bg-primary-soft", sort_order: 0, published: true };
  const [form, setForm] = useState<any>(empty);

  const load = async () => {
    const { data } = await supabase.from("testimonials").select("*").order("sort_order");
    setItems(data || []);
  };
  useEffect(() => { load(); }, []);
  useEffect(() => { setForm(editing ? { ...editing } : empty); }, [editing, open]);

  const save = async () => {
    if (!form.name || !form.text) { toast({ title: "الاسم والنص مطلوبان", variant: "destructive" }); return; }
    const payload = { ...form };
    delete payload.id; delete payload.created_at;
    const { error } = editing
      ? await supabase.from("testimonials").update(payload).eq("id", editing.id)
      : await supabase.from("testimonials").insert(payload);
    if (error) { toast({ title: "خطأ", description: error.message, variant: "destructive" }); return; }
    toast({ title: "تم الحفظ" });
    setOpen(false); load();
  };
  const remove = async (id: string) => {
    if (!confirm("حذف الرأي؟")) return;
    await supabase.from("testimonials").delete().eq("id", id);
    toast({ title: "تم الحذف" }); load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl">آراء العملاء 💬</h1>
        <Button variant="hero" onClick={() => { setEditing(null); setOpen(true); }}><Plus /> إضافة رأي</Button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {items.map((t) => (
          <Card key={t.id} className="p-5">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-bold">{t.name}</h3>
                <p className="text-xs text-muted-foreground">{t.role || "—"} • ⭐ {t.rating}</p>
              </div>
              <div className="flex gap-1">
                <Badge variant={t.published ? "default" : "secondary"}>{t.published ? "منشور" : "مخفي"}</Badge>
                <Button size="icon" variant="ghost" onClick={() => { setEditing(t); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => remove(t.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{t.text}</p>
          </Card>
        ))}
        {items.length === 0 && <p className="text-center text-muted-foreground col-span-2 py-10">لا توجد آراء</p>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl" className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "تعديل" : "إضافة"} رأي</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>الاسم *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>الصفة (مثلاً: أم لـ ليان)</Label><Input value={form.role || ""} onChange={(e) => setForm({ ...form, role: e.target.value })} /></div>
            <div><Label>نص الرأي *</Label><Textarea value={form.text} rows={4} onChange={(e) => setForm({ ...form, text: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>التقييم (1-5)</Label><Input type="number" min={1} max={5} value={form.rating} onChange={(e) => setForm({ ...form, rating: +e.target.value })} /></div>
              <div><Label>الترتيب</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: +e.target.value })} /></div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="tpub" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
              <Label htmlFor="tpub">منشور</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
            <Button variant="hero" onClick={save}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ============== FAQS ==============
const FaqsSection = () => {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const empty = { question: "", answer: "", category: "", sort_order: 0, published: true };
  const [form, setForm] = useState<any>(empty);

  const load = async () => {
    const { data } = await supabase.from("faqs").select("*").order("sort_order");
    setItems(data || []);
  };
  useEffect(() => { load(); }, []);
  useEffect(() => { setForm(editing ? { ...editing } : empty); }, [editing, open]);

  const save = async () => {
    if (!form.question || !form.answer) { toast({ title: "السؤال والجواب مطلوبان", variant: "destructive" }); return; }
    const payload = { ...form };
    delete payload.id; delete payload.created_at;
    const { error } = editing
      ? await supabase.from("faqs").update(payload).eq("id", editing.id)
      : await supabase.from("faqs").insert(payload);
    if (error) { toast({ title: "خطأ", description: error.message, variant: "destructive" }); return; }
    toast({ title: "تم الحفظ" });
    setOpen(false); load();
  };
  const remove = async (id: string) => {
    if (!confirm("حذف السؤال؟")) return;
    await supabase.from("faqs").delete().eq("id", id);
    toast({ title: "تم الحذف" }); load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl">الأسئلة الشائعة ❓</h1>
        <Button variant="hero" onClick={() => { setEditing(null); setOpen(true); }}><Plus /> إضافة سؤال</Button>
      </div>
      <div className="space-y-3">
        {items.map((f) => (
          <Card key={f.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold">{f.question}</h3>
                  {f.category && <Badge variant="secondary">{f.category}</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{f.answer}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Badge variant={f.published ? "default" : "secondary"}>{f.published ? "منشور" : "مخفي"}</Badge>
                <Button size="icon" variant="ghost" onClick={() => { setEditing(f); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => remove(f.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </div>
            </div>
          </Card>
        ))}
        {items.length === 0 && <p className="text-center text-muted-foreground py-10">لا توجد أسئلة</p>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl" className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "تعديل" : "إضافة"} سؤال</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>السؤال *</Label><Input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} /></div>
            <div><Label>الجواب *</Label><Textarea value={form.answer} rows={4} onChange={(e) => setForm({ ...form, answer: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>التصنيف</Label><Input value={form.category || ""} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
              <div><Label>الترتيب</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: +e.target.value })} /></div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="fpub" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
              <Label htmlFor="fpub">منشور</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
            <Button variant="hero" onClick={save}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
