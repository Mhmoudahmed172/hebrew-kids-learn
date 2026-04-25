import { useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard, Video, Users, FileText, ClipboardCheck, Music, Gamepad2,
  Upload, Search, Plus, Pencil, Trash2, Eye, MoreVertical, ArrowRight,
  TrendingUp, PlayCircle, UserCheck, Award, Filter, Download, Baby, UserCog, Crown,
  CheckCircle2, X, GripVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import mascot from "@/assets/mascot-owl.png";

type Section = "overview" | "videos" | "users" | "content" | "quizzes" | "songs" | "games";

const nav: { id: Section; label: string; icon: any; color: string }[] = [
  { id: "overview", label: "نظرة عامة", icon: LayoutDashboard, color: "text-primary" },
  { id: "videos", label: "الفيديوهات", icon: Video, color: "text-secondary" },
  { id: "users", label: "المستخدمون", icon: Users, color: "text-pink" },
  { id: "content", label: "المحتوى", icon: FileText, color: "text-mint" },
  { id: "quizzes", label: "الاختبارات", icon: ClipboardCheck, color: "text-accent-foreground" },
  { id: "songs", label: "الأغاني", icon: Music, color: "text-primary" },
  { id: "games", label: "الألعاب", icon: Gamepad2, color: "text-pink" },
];

const Admin = () => {
  const [active, setActive] = useState<Section>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div dir="rtl" className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 right-0 h-screen w-72 bg-card border-l border-border/60 z-40 transition-transform ${sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}`}>
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
          {nav.map(item => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActive(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-bounce ${
                  isActive
                    ? "bg-primary-gradient text-primary-foreground shadow-glow"
                    : "text-foreground/70 hover:bg-primary-soft hover:text-primary"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="absolute bottom-0 inset-x-0 p-4 border-t border-border/60">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-primary-soft">
            <div className="w-10 h-10 rounded-full bg-primary-gradient flex items-center justify-center text-primary-foreground font-bold">
              <Crown className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate">المدير</div>
              <div className="text-xs text-muted-foreground truncate">admin@hebrew.com</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/40">
          <div className="flex items-center justify-between gap-4 px-6 lg:px-10 h-20">
            <div className="flex items-center gap-4">
              <button className="lg:hidden p-2" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <LayoutDashboard className="w-5 h-5" />
              </button>
              <h1 className="text-xl lg:text-2xl font-display font-extrabold">
                {nav.find(n => n.id === active)?.label}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 bg-muted px-4 py-2 rounded-full w-72">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input className="bg-transparent outline-none text-sm flex-1" placeholder="بحث..." />
              </div>
              <Button asChild variant="soft" size="sm">
                <Link to="/"><ArrowRight className="ml-1 w-4 h-4" /> الموقع</Link>
              </Button>
            </div>
          </div>
        </header>

        <main className="p-6 lg:p-10 space-y-8">
          {active === "overview" && <Overview />}
          {active === "videos" && <VideosSection />}
          {active === "users" && <UsersSection />}
          {active === "content" && <ContentSection />}
          {active === "quizzes" && <QuizzesSection />}
          {active === "songs" && <SongsSection />}
          {active === "games" && <GamesSection />}
        </main>
      </div>
    </div>
  );
};

/* ---------------- Overview ---------------- */
const stats = [
  { label: "إجمالي الطلاب", value: "1,284", trend: "+12%", icon: Baby, color: "from-primary to-pink" },
  { label: "الفيديوهات", value: "186", trend: "+8", icon: PlayCircle, color: "from-secondary to-mint" },
  { label: "أولياء الأمور", value: "742", trend: "+5%", icon: UserCheck, color: "from-pink to-accent" },
  { label: "الشارات الممنوحة", value: "3,420", trend: "+18%", icon: Award, color: "from-accent to-primary" },
];

const Overview = () => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {stats.map(s => {
        const Icon = s.icon;
        return (
          <Card key={s.label} className="p-5 rounded-3xl border-2 border-border/60 hover:border-primary/30 transition-bounce hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-primary-foreground shadow-soft`}>
                <Icon className="w-6 h-6" />
              </div>
              <Badge className="bg-mint-soft text-mint border-0">{s.trend}</Badge>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-display font-extrabold">{s.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </div>
          </Card>
        );
      })}
    </div>

    <div className="grid lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 p-6 rounded-3xl border-2 border-border/60">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-display font-extrabold flex items-center gap-2"><TrendingUp className="text-primary" /> نشاط آخر 7 أيام</h3>
          <Button variant="soft" size="sm"><Download className="w-4 h-4 ml-1" /> تصدير</Button>
        </div>
        <div className="flex items-end gap-3 h-48">
          {[40, 65, 50, 80, 95, 70, 88].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full rounded-t-2xl bg-primary-gradient transition-bounce hover:opacity-80" style={{ height: `${h}%` }} />
              <span className="text-xs text-muted-foreground">{["س","أ","ث","ر","خ","ج","س"][i]}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-6 rounded-3xl border-2 border-border/60">
        <h3 className="text-lg font-display font-extrabold mb-4">الأنشطة الأخيرة</h3>
        <div className="space-y-4">
          {[
            { t: "تم رفع فيديو جديد", s: "حرف Aleph", time: "قبل 5 د" },
            { t: "مستخدم جديد", s: "والد طفل", time: "قبل 12 د" },
            { t: "اختبار مكتمل", s: "المستوى 2", time: "قبل 30 د" },
            { t: "أغنية جديدة", s: "الألوان", time: "قبل ساعة" },
          ].map((a, i) => (
            <div key={i} className="flex items-start gap-3 pb-3 border-b border-border/40 last:border-0">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold">{a.t}</div>
                <div className="text-xs text-muted-foreground">{a.s} • {a.time}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  </div>
);

/* ---------------- Videos ---------------- */
const initialVideos = [
  { id: 1, title: "تعرّف على حرف Aleph א", level: "الحروف العبرية", duration: "4:20", views: 1240, status: "منشور" },
  { id: 2, title: "حرف Bet ב بالحركات", level: "الحروف العبرية", duration: "3:45", views: 980, status: "منشور" },
  { id: 3, title: "كلمات الأسرة بالعبرية", level: "الكلمات الأولى", duration: "5:00", views: 624, status: "مسودة" },
  { id: 4, title: "كلمات الألوان", level: "الكلمات الأولى", duration: "4:15", views: 412, status: "منشور" },
];

const VideosSection = () => {
  const [videos, setVideos] = useState(initialVideos);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const remove = (id: number) => {
    setVideos(v => v.filter(x => x.id !== id));
    toast({ title: "تم الحذف", description: "تم حذف الفيديو بنجاح" });
  };

  const saveEdit = (updated: any) => {
    setVideos(vs => vs.map(v => v.id === updated.id ? updated : v));
    setEditing(null);
    toast({ title: "تم الحفظ", description: "تم تحديث بيانات الفيديو" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground">إدارة جميع الفيديوهات التعليمية — ارفع، عدّل، احذف</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" size="lg"><Plus /> رفع فيديو جديد</Button>
          </DialogTrigger>
          <UploadVideoDialog onDone={(v) => { setVideos(prev => [{ ...v, id: Date.now(), views: 0 }, ...prev]); setOpen(false); }} />
        </Dialog>
      </div>

      <Card className="rounded-3xl border-2 border-border/60 overflow-hidden">
        <div className="p-4 flex items-center gap-3 border-b border-border/40">
          <div className="flex items-center gap-2 bg-muted px-3 py-2 rounded-full flex-1 max-w-sm">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input className="bg-transparent outline-none text-sm flex-1" placeholder="بحث في الفيديوهات..." />
          </div>
          <Button variant="soft" size="sm"><Filter className="w-4 h-4 ml-1" /> فلترة</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">العنوان</TableHead>
              <TableHead className="text-right">المستوى</TableHead>
              <TableHead className="text-right">المدة</TableHead>
              <TableHead className="text-right">المشاهدات</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.map(v => (
              <TableRow key={v.id}>
                <TableCell className="font-bold">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary-soft flex items-center justify-center"><Video className="w-5 h-5 text-secondary" /></div>
                    {v.title}
                  </div>
                </TableCell>
                <TableCell>{v.level}</TableCell>
                <TableCell>{v.duration}</TableCell>
                <TableCell>{v.views.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge className={v.status === "منشور" ? "bg-mint-soft text-mint border-0" : "bg-accent-soft text-accent-foreground border-0"}>{v.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost"><Eye className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => setEditing(v)}><Pencil className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(v.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        {editing && <EditVideoDialog video={editing} onSave={saveEdit} />}
      </Dialog>
    </div>
  );
};

const EditVideoDialog = ({ video, onSave }: { video: any; onSave: (v: any) => void }) => {
  const [title, setTitle] = useState(video.title);
  const [level, setLevel] = useState(video.level);
  const [duration, setDuration] = useState(video.duration);
  const [status, setStatus] = useState(video.status);
  return (
    <DialogContent dir="rtl" className="sm:max-w-lg rounded-3xl">
      <DialogHeader><DialogTitle className="font-display text-2xl">تعديل الفيديو</DialogTitle></DialogHeader>
      <div className="space-y-4 py-2">
        <div className="space-y-2">
          <Label>عنوان الفيديو</Label>
          <Input value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>المستوى</Label>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="الحروف العبرية">الحروف العبرية</SelectItem>
                <SelectItem value="الكلمات الأولى">الكلمات الأولى</SelectItem>
                <SelectItem value="الجمل البسيطة">الجمل البسيطة</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>المدة</Label>
            <Input value={duration} onChange={e => setDuration(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>الحالة</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="منشور">منشور</SelectItem>
              <SelectItem value="مسودة">مسودة</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button variant="hero" onClick={() => onSave({ ...video, title, level, duration, status })}>حفظ التغييرات</Button>
      </DialogFooter>
    </DialogContent>
  );
};

const UploadVideoDialog = ({ onDone }: { onDone: (v: any) => void }) => {
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("الحروف العبرية");
  const [duration, setDuration] = useState("");
  return (
    <DialogContent dir="rtl" className="sm:max-w-lg rounded-3xl">
      <DialogHeader><DialogTitle className="font-display text-2xl">رفع فيديو جديد</DialogTitle></DialogHeader>
      <div className="space-y-4 py-2">
        <div className="border-2 border-dashed border-primary/30 rounded-2xl p-8 text-center bg-primary-soft/40 hover:bg-primary-soft transition-smooth cursor-pointer">
          <Upload className="w-10 h-10 mx-auto text-primary mb-2" />
          <p className="font-bold">اسحب الفيديو هنا أو انقر للاختيار</p>
          <p className="text-xs text-muted-foreground mt-1">MP4, MOV — حتى 500MB</p>
        </div>
        <div className="space-y-2">
          <Label>عنوان الفيديو</Label>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="مثال: حرف Aleph א" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>المستوى</Label>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="الحروف العبرية">الحروف العبرية</SelectItem>
                <SelectItem value="الكلمات الأولى">الكلمات الأولى</SelectItem>
                <SelectItem value="الجمل البسيطة">الجمل البسيطة</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>المدة</Label>
            <Input value={duration} onChange={e => setDuration(e.target.value)} placeholder="4:20" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>الوصف</Label>
          <Textarea placeholder="وصف مختصر للفيديو..." rows={3} />
        </div>
      </div>
      <DialogFooter>
        <Button variant="hero" onClick={() => onDone({ title: title || "فيديو جديد", level, duration: duration || "0:00", status: "مسودة" })}>رفع الفيديو</Button>
      </DialogFooter>
    </DialogContent>
  );
};

/* ---------------- Users ---------------- */
const initialUsers = [
  { id: 1, name: "أحمد علي", email: "ahmed@mail.com", role: "طفل", age: 7, parent: "محمد علي", status: "نشط" },
  { id: 2, name: "محمد علي", email: "m.ali@mail.com", role: "ولي أمر", age: 35, parent: "—", status: "نشط" },
  { id: 3, name: "سارة خالد", email: "sara@mail.com", role: "طفل", age: 9, parent: "خالد سارة", status: "نشط" },
  { id: 4, name: "ليلى حسن", email: "laila@mail.com", role: "ولي أمر", age: 32, parent: "—", status: "موقوف" },
  { id: 5, name: "يوسف عمر", email: "yousef@mail.com", role: "طفل", age: 6, parent: "عمر يوسف", status: "نشط" },
];

type UserRow = { id: number; name: string; email: string; role: string; age: number; parent: string; status: string };

const emptyUser: UserRow = { id: 0, name: "", email: "", role: "طفل", age: 7, parent: "", status: "نشط" };

const UsersSection = () => {
  const [users, setUsers] = useState<UserRow[]>(initialUsers);
  const [filter, setFilter] = useState<"all" | "child" | "parent">("all");
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [adding, setAdding] = useState(false);

  const filtered = users.filter(u => filter === "all" ? true : filter === "child" ? u.role === "طفل" : u.role === "ولي أمر");
  const remove = (id: number) => { setUsers(u => u.filter(x => x.id !== id)); toast({ title: "تم الحذف" }); };
  const saveEdit = (u: UserRow) => { setUsers(us => us.map(x => x.id === u.id ? u : x)); setEditing(null); toast({ title: "تم الحفظ", description: "تم تحديث بيانات المستخدم" }); };
  const addUser = (u: UserRow) => { setUsers(us => [{ ...u, id: Date.now() }, ...us]); setAdding(false); toast({ title: "تمت الإضافة", description: "تم إضافة المستخدم بنجاح" }); };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "كل المستخدمين", value: users.length, icon: Users, color: "from-primary to-pink", k: "all" as const },
          { label: "الأطفال", value: users.filter(u => u.role === "طفل").length, icon: Baby, color: "from-secondary to-mint", k: "child" as const },
          { label: "أولياء الأمور", value: users.filter(u => u.role === "ولي أمر").length, icon: UserCog, color: "from-pink to-accent", k: "parent" as const },
        ].map(s => {
          const Icon = s.icon;
          const active = filter === s.k;
          return (
            <button key={s.label} onClick={() => setFilter(s.k)} className={`text-right p-5 rounded-3xl border-2 transition-bounce ${active ? "border-primary bg-primary-soft" : "border-border/60 bg-card hover:border-primary/30"}`}>
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-primary-foreground`}><Icon className="w-6 h-6" /></div>
                <div className="text-3xl font-display font-extrabold">{s.value}</div>
              </div>
              <div className="text-sm text-muted-foreground mt-3">{s.label}</div>
            </button>
          );
        })}
      </div>

      <Card className="rounded-3xl border-2 border-border/60 overflow-hidden">
        <div className="p-4 flex items-center justify-between gap-3 border-b border-border/40">
          <div className="flex items-center gap-2 bg-muted px-3 py-2 rounded-full flex-1 max-w-sm">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input className="bg-transparent outline-none text-sm flex-1" placeholder="بحث عن مستخدم..." />
          </div>
          <Button variant="hero" size="sm" onClick={() => setAdding(true)}><Plus className="w-4 h-4 ml-1" /> إضافة مستخدم</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">الاسم</TableHead>
              <TableHead className="text-right">البريد</TableHead>
              <TableHead className="text-right">الدور</TableHead>
              <TableHead className="text-right">العمر</TableHead>
              <TableHead className="text-right">ولي الأمر</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(u => (
              <TableRow key={u.id}>
                <TableCell className="font-bold">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-primary-foreground ${u.role === "طفل" ? "bg-fun-gradient" : "bg-primary-gradient"}`}>
                      {u.role === "طفل" ? <Baby className="w-5 h-5" /> : <UserCog className="w-5 h-5" />}
                    </div>
                    {u.name}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                <TableCell>
                  <Badge className={u.role === "طفل" ? "bg-pink-soft text-pink border-0" : "bg-primary-soft text-primary border-0"}>{u.role}</Badge>
                </TableCell>
                <TableCell>{u.age}</TableCell>
                <TableCell className="text-muted-foreground">{u.parent}</TableCell>
                <TableCell>
                  <Badge className={u.status === "نشط" ? "bg-mint-soft text-mint border-0" : "bg-destructive/10 text-destructive border-0"}>{u.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" onClick={() => setEditing(u)}><Pencil className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(u.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        {editing && <UserDialog title="تعديل مستخدم" submitLabel="حفظ التغييرات" initial={editing} onSubmit={saveEdit} />}
      </Dialog>
      <Dialog open={adding} onOpenChange={setAdding}>
        {adding && <UserDialog title="إضافة مستخدم جديد" submitLabel="إضافة" initial={emptyUser} onSubmit={addUser} />}
      </Dialog>
    </div>
  );
};

const UserDialog = ({ title, submitLabel, initial, onSubmit }: { title: string; submitLabel: string; initial: UserRow; onSubmit: (u: UserRow) => void }) => {
  const [u, setU] = useState<UserRow>(initial);
  const upd = <K extends keyof UserRow>(k: K, v: UserRow[K]) => setU(prev => ({ ...prev, [k]: v }));
  return (
    <DialogContent dir="rtl" className="sm:max-w-lg rounded-3xl">
      <DialogHeader><DialogTitle className="font-display text-2xl">{title}</DialogTitle></DialogHeader>
      <div className="space-y-4 py-2">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>الاسم الكامل</Label>
            <Input value={u.name} onChange={e => upd("name", e.target.value)} placeholder="الاسم" />
          </div>
          <div className="space-y-2">
            <Label>البريد الإلكتروني</Label>
            <Input type="email" value={u.email} onChange={e => upd("email", e.target.value)} placeholder="user@mail.com" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>الدور</Label>
            <Select value={u.role} onValueChange={v => upd("role", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="طفل">طفل</SelectItem>
                <SelectItem value="ولي أمر">ولي أمر</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>العمر</Label>
            <Input type="number" value={u.age} onChange={e => upd("age", Number(e.target.value))} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>ولي الأمر</Label>
            <Input value={u.parent} onChange={e => upd("parent", e.target.value)} placeholder="— إن لم يوجد" />
          </div>
          <div className="space-y-2">
            <Label>الحالة</Label>
            <Select value={u.status} onValueChange={v => upd("status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="نشط">نشط</SelectItem>
                <SelectItem value="موقوف">موقوف</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="hero" onClick={() => {
          if (!u.name.trim() || !u.email.trim()) {
            toast({ title: "حقول ناقصة", description: "يرجى إدخال الاسم والبريد" });
            return;
          }
          onSubmit({ ...u, parent: u.parent || "—" });
        }}>{submitLabel}</Button>
      </DialogFooter>
    </DialogContent>
  );
};

/* ---------------- Content ---------------- */
type ContentItem = { id: number; title: string; type: string; lessons: number; status: string };
const initialContent: ContentItem[] = [
  { id: 1, title: "الحروف العبرية", type: "مستوى", lessons: 12, status: "منشور" },
  { id: 2, title: "الكلمات الأولى", type: "مستوى", lessons: 15, status: "منشور" },
  { id: 3, title: "الجمل البسيطة", type: "مستوى", lessons: 18, status: "منشور" },
  { id: 4, title: "المحادثات", type: "مستوى", lessons: 20, status: "مسودة" },
];

const ContentSection = () => {
  const [items, setItems] = useState<ContentItem[]>(initialContent);
  const [editing, setEditing] = useState<ContentItem | null>(null);
  const [adding, setAdding] = useState(false);

  const remove = (id: number) => { setItems(l => l.filter(x => x.id !== id)); toast({ title: "تم الحذف" }); };
  const save = (it: ContentItem) => { setItems(ls => ls.map(x => x.id === it.id ? it : x)); setEditing(null); toast({ title: "تم الحفظ", description: "تم تحديث المستوى" }); };
  const add = (it: ContentItem) => { setItems(ls => [{ ...it, id: Date.now() }, ...ls]); setAdding(false); toast({ title: "تمت الإضافة" }); };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground">عدّل المستويات والدروس وأعد ترتيب المحتوى</p>
        <Button variant="hero" size="lg" onClick={() => setAdding(true)}><Plus /> مستوى جديد</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {items.map(it => (
          <Card key={it.id} className="p-6 rounded-3xl border-2 border-border/60 hover:border-primary/30 hover:-translate-y-1 transition-bounce">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 min-w-0">
                <div className="w-14 h-14 rounded-2xl bg-primary-gradient flex items-center justify-center text-primary-foreground shadow-glow shrink-0">
                  <FileText className="w-7 h-7" />
                </div>
                <div className="min-w-0">
                  <div className="font-display font-extrabold text-lg">{it.title}</div>
                  <div className="text-sm text-muted-foreground mt-1">{it.lessons} درس • {it.type}</div>
                  <Badge className={`mt-3 ${it.status === "منشور" ? "bg-mint-soft text-mint" : "bg-accent-soft text-accent-foreground"} border-0`}>{it.status}</Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <Button variant="soft" size="sm" className="flex-1" onClick={() => setEditing(it)}><Pencil className="w-4 h-4 ml-1" /> تعديل</Button>
              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => remove(it.id)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        {editing && <ContentDialog title="تعديل المستوى" submitLabel="حفظ" initial={editing} onSubmit={save} />}
      </Dialog>
      <Dialog open={adding} onOpenChange={setAdding}>
        {adding && <ContentDialog title="مستوى جديد" submitLabel="إضافة" initial={{ id: 0, title: "", type: "مستوى", lessons: 0, status: "مسودة" }} onSubmit={add} />}
      </Dialog>
    </div>
  );
};

const ContentDialog = ({ title, submitLabel, initial, onSubmit }: { title: string; submitLabel: string; initial: ContentItem; onSubmit: (i: ContentItem) => void }) => {
  const [it, setIt] = useState<ContentItem>(initial);
  return (
    <DialogContent dir="rtl" className="sm:max-w-lg rounded-3xl">
      <DialogHeader><DialogTitle className="font-display text-2xl">{title}</DialogTitle></DialogHeader>
      <div className="space-y-4 py-2">
        <div className="space-y-2"><Label>اسم المستوى</Label><Input value={it.title} onChange={e => setIt({ ...it, title: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2"><Label>عدد الدروس</Label><Input type="number" value={it.lessons} onChange={e => setIt({ ...it, lessons: Number(e.target.value) })} /></div>
          <div className="space-y-2">
            <Label>الحالة</Label>
            <Select value={it.status} onValueChange={v => setIt({ ...it, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="منشور">منشور</SelectItem><SelectItem value="مسودة">مسودة</SelectItem></SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="hero" onClick={() => { if (!it.title.trim()) { toast({ title: "أدخل اسم المستوى" }); return; } onSubmit(it); }}>{submitLabel}</Button>
      </DialogFooter>
    </DialogContent>
  );
};

/* ---------------- Quizzes / Songs / Games ---------------- */
const SimpleListSection = ({
  emptyTitle, items, icon: Icon, color, addLabel, fields,
}: {
  emptyTitle: string;
  items: { id: number; title: string; meta: string; level: string }[];
  icon: any; color: string; addLabel: string;
  fields: { label: string; placeholder: string }[];
}) => {
  const [list, setList] = useState(items);
  const [open, setOpen] = useState(false);
  const remove = (id: number) => { setList(l => l.filter(x => x.id !== id)); toast({ title: "تم الحذف" }); };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground">{emptyTitle}</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button variant="hero" size="lg"><Plus /> {addLabel}</Button></DialogTrigger>
          <DialogContent dir="rtl" className="rounded-3xl">
            <DialogHeader><DialogTitle className="font-display text-2xl">{addLabel}</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div className="border-2 border-dashed border-primary/30 rounded-2xl p-6 text-center bg-primary-soft/40 cursor-pointer">
                <Upload className="w-8 h-8 mx-auto text-primary mb-2" />
                <p className="text-sm font-bold">اسحب الملف هنا أو انقر للاختيار</p>
              </div>
              {fields.map(f => (
                <div key={f.label} className="space-y-2">
                  <Label>{f.label}</Label>
                  <Input placeholder={f.placeholder} />
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="hero" onClick={() => { setList(p => [{ id: Date.now(), title: "عنصر جديد", meta: "—", level: "الحروف العبرية" }, ...p]); setOpen(false); toast({ title: "تمت الإضافة" }); }}>إضافة</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {list.map(it => (
          <Card key={it.id} className="p-5 rounded-3xl border-2 border-border/60 hover:border-primary/30 hover:-translate-y-1 transition-bounce">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-primary-foreground shadow-soft mb-4`}>
              <Icon className="w-7 h-7" />
            </div>
            <div className="font-display font-extrabold">{it.title}</div>
            <div className="text-sm text-muted-foreground mt-1">{it.meta}</div>
            <Badge className="mt-3 bg-primary-soft text-primary border-0">{it.level}</Badge>
            <div className="flex gap-2 mt-5">
              <Button variant="soft" size="sm" className="flex-1"><Pencil className="w-4 h-4 ml-1" /> تعديل</Button>
              <Button variant="ghost" size="sm" onClick={() => remove(it.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const QuizzesSection = () => (
  <SimpleListSection
    emptyTitle="ارفع وعدّل الاختبارات النهائية وأسئلة الدروس"
    addLabel="رفع اختبار جديد"
    icon={ClipboardCheck}
    color="from-mint to-secondary"
    fields={[
      { label: "اسم الاختبار", placeholder: "اختبار الحروف الأولى" },
      { label: "عدد الأسئلة", placeholder: "10" },
      { label: "نوع الاختبار", placeholder: "اختيار من متعدد / توصيل / استماع" },
    ]}
    items={[
      { id: 1, title: "اختبار الحروف الأولى", meta: "10 أسئلة • اختيار من متعدد", level: "الحروف العبرية" },
      { id: 2, title: "اختبار الاستماع", meta: "6 أسئلة • صوتي", level: "الحروف العبرية" },
      { id: 3, title: "اختبار المفردات", meta: "10 أسئلة • توصيل", level: "الكلمات الأولى" },
    ]}
  />
);

const SongsSection = () => (
  <SimpleListSection
    emptyTitle="ارفع الأغاني التعليمية بصيغ الصوت أو الفيديو"
    addLabel="رفع أغنية"
    icon={Music}
    color="from-accent to-pink"
    fields={[
      { label: "اسم الأغنية", placeholder: "أغنية الأبجدية" },
      { label: "المدة", placeholder: "2:50" },
    ]}
    items={[
      { id: 1, title: "أغنية الأبجدية", meta: "2:50 • صوت", level: "الحروف العبرية" },
      { id: 2, title: "أنشودة الحروف الملونة", meta: "3:10 • فيديو", level: "الحروف العبرية" },
      { id: 3, title: "أغنية الألوان", meta: "2:40 • صوت", level: "الكلمات الأولى" },
    ]}
  />
);

const GamesSection = () => (
  <SimpleListSection
    emptyTitle="أضف الألعاب التفاعلية واربطها بالمستويات"
    addLabel="إضافة لعبة"
    icon={Gamepad2}
    color="from-pink to-primary"
    fields={[
      { label: "اسم اللعبة", placeholder: "مطابقة الحروف" },
      { label: "نوع اللعبة", placeholder: "مطابقة / ذاكرة / ترتيب" },
    ]}
    items={[
      { id: 1, title: "مطابقة الحروف", meta: "لعبة مطابقة", level: "الحروف العبرية" },
      { id: 2, title: "لعبة الذاكرة", meta: "ذاكرة بصرية", level: "الحروف العبرية" },
      { id: 3, title: "بناء الجمل", meta: "ترتيب كلمات", level: "الجمل البسيطة" },
    ]}
  />
);

export default Admin;
