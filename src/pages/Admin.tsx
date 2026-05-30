import { useState, useEffect, useRef, createContext, useContext } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  LayoutDashboard, Video, Users, FileText, ClipboardCheck, Music, Gamepad2,
  Upload, Plus, Pencil, Trash2, ArrowRight, LogOut, Crown, X, CheckCircle2,
  MessageSquare, HelpCircle, KeyRound, Mail, Search, Shield, UserPlus,
  MoreHorizontal, AlertTriangle, UserCog, ChevronLeft, PlayCircle, FolderOpen,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger,
  DropdownMenuSubContent, DropdownMenuRadioGroup, DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import logo from "@/assets/logo.png";
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

// ============== شريط البحث + الفلترة ==============
type FilterOption = { label: string; value: string };
type FilterDef = {
  key: string;          // اسم الفلتر (مثلاً "level" / "status" / "role" / "published")
  label: string;        // النص المعروض
  options: FilterOption[]; // value === "" يعني "الكل"
};

const FilterBar = ({
  query, onQueryChange, searchPlaceholder = "بحث...",
  filters = [], values = {}, onValueChange,
}: {
  query: string;
  onQueryChange: (v: string) => void;
  searchPlaceholder?: string;
  filters?: FilterDef[];
  values?: Record<string, string>;
  onValueChange?: (key: string, value: string) => void;
}) => (
  <div className="flex flex-col sm:flex-row gap-3 mb-5 flex-wrap items-stretch">
    <div className="relative w-full sm:w-80 group">
      <div className="absolute -inset-0.5 rounded-full bg-primary-gradient opacity-0 group-focus-within:opacity-30 blur-md transition-opacity pointer-events-none" />
      <div className="relative flex items-center bg-card border-2 border-border rounded-full shadow-soft transition-smooth group-focus-within:border-primary group-focus-within:shadow-medium">
        <span className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-primary-soft text-primary">
          <Search className="w-4 h-4" />
        </span>
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="pr-12 pl-10 h-12 rounded-full border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm font-medium placeholder:text-muted-foreground/70"
        />
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange("")}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full bg-muted hover:bg-destructive hover:text-destructive-foreground text-muted-foreground transition-bounce active:scale-90"
            aria-label="مسح"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
    {filters.map((f) => (
      <Select key={f.key} value={values[f.key] ?? ""} onValueChange={(v) => onValueChange?.(f.key, v)}>
        <SelectTrigger className="w-full sm:w-48 h-12 rounded-full border-2 bg-card shadow-soft hover:border-primary/50 hover:shadow-medium transition-smooth font-medium px-5">
          <SelectValue placeholder={f.label} />
        </SelectTrigger>
        <SelectContent className="rounded-2xl">
          <SelectItem value="__all__">{f.label}: الكل</SelectItem>
          {f.options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
    ))}
  </div>
);

// مكوّن SearchBar البسيط (للتوافق العكسي)
const SearchBar = ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <FilterBar query={value} onQueryChange={onChange} searchPlaceholder={placeholder} />
);

// فلترة بحقل محدد فقط
const matchesQuery = (value: any, q: string): boolean => {
  if (value == null) return false;
  return String(value).toLowerCase().includes(q);
};

const applyFilters = <T extends Record<string, any>>(
  items: T[],
  query: string,
  searchFields: string[],          // الحقول التي يبحث فيها النص
  fieldFilters: Record<string, { value: string; getter: (item: T) => any }> = {},
): T[] => {
  const q = query.trim().toLowerCase();
  return items.filter((item) => {
    if (q && searchFields.length > 0) {
      const found = searchFields.some((f) => {
        // دعم المسارات مثل "levels.title"
        const parts = f.split(".");
        let v: any = item;
        for (const p of parts) v = v?.[p];
        return matchesQuery(v, q);
      });
      if (!found) return false;
    }
    for (const [, def] of Object.entries(fieldFilters)) {
      if (!def.value || def.value === "__all__") continue;
      const actual = def.getter(item);
      if (Array.isArray(actual)) {
        if (!actual.includes(def.value)) return false;
      } else {
        if (String(actual ?? "") !== def.value) return false;
      }
    }
    return true;
  });
};

// للتوافق العكسي مع استدعاءات سابقة
const filterByQuery = <T extends Record<string, any>>(items: T[], query: string): T[] => {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) => {
    for (const v of Object.values(item)) {
      if (v == null) continue;
      if (typeof v === "string" || typeof v === "number") {
        if (String(v).toLowerCase().includes(q)) return true;
      } else if (typeof v === "object" && !Array.isArray(v)) {
        for (const inner of Object.values(v as any)) {
          if ((typeof inner === "string" || typeof inner === "number") && String(inner).toLowerCase().includes(q)) return true;
        }
      }
    }
    return false;
  });
};

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

const SECTION_IDS: Section[] = ["overview", "videos", "users", "content", "quizzes", "songs", "games", "testimonials", "faqs"];

type SectionPerm = { can_view: boolean; can_edit: boolean; can_delete: boolean; can_add: boolean };
type SectionPermsMap = Record<string, SectionPerm> | null; // null = unrestricted

const FULL_PERM: SectionPerm = { can_view: true, can_edit: true, can_delete: true, can_add: true };

const SectionPermsContext = createContext<SectionPermsMap>(null);
export const useSectionPerm = (section: Section): SectionPerm => {
  const map = useContext(SectionPermsContext);
  if (!map) return FULL_PERM;
  return map[section] || { can_view: false, can_edit: false, can_delete: false, can_add: false };
};

const Admin = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sectionPerms, setSectionPerms] = useState<SectionPermsMap>(null);
  const [permsLoading, setPermsLoading] = useState(true);

  // Load this admin's per-section permissions. If no rows exist → full access.
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("user_permissions")
        .select("section,can_view,can_edit,can_delete,can_add")
        .eq("user_id", user.id)
        .in("section", SECTION_IDS as string[]);
      if (!data || data.length === 0) {
        setSectionPerms(null);
      } else {
        const map: Record<string, SectionPerm> = {
          overview: { can_view: true, can_edit: true, can_delete: true, can_add: true },
        };
        data.forEach((r: any) => {
          map[r.section] = {
            can_view: !!r.can_view,
            can_edit: !!r.can_edit,
            can_delete: !!r.can_delete,
            can_add: !!r.can_add,
          };
        });
        setSectionPerms(map);
      }
      setPermsLoading(false);
    })();
  }, [user]);

  const isAllowed = (id: Section) => !sectionPerms || (sectionPerms[id]?.can_view === true);
  const visibleNav = nav.filter((n) => isAllowed(n.id));

  const paramSection = searchParams.get("section") as Section | null;
  const requested: Section = paramSection && SECTION_IDS.includes(paramSection) ? paramSection : "overview";
  const active: Section = isAllowed(requested) ? requested : "overview";
  const setActive = (id: Section) => {
    if (!isAllowed(id)) return;
    const next = new URLSearchParams(searchParams);
    if (id === "overview") next.delete("section");
    else next.set("section", id);
    setSearchParams(next, { replace: false });
  };

  useEffect(() => {
    if (loading) return;
    if (!user) navigate("/login");
    else if (!isAdmin) {
      toast({ title: "غير مصرح", description: "يجب أن تكون مديراً للوصول.", variant: "destructive" });
      navigate("/");
    }
  }, [user, isAdmin, loading, navigate]);

  // If user navigates to a now-forbidden section, bounce them back to overview
  useEffect(() => {
    if (permsLoading) return;
    if (paramSection && !isAllowed(paramSection)) {
      const next = new URLSearchParams(searchParams);
      next.delete("section");
      setSearchParams(next, { replace: true });
    }
  }, [permsLoading, paramSection]);

  if (loading || !user || !isAdmin || permsLoading) {
    return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;
  }

  return (
    <div dir="rtl" className="min-h-screen bg-muted/30 flex">
      <aside className="sticky top-0 right-0 h-screen w-72 bg-card border-l border-border/60 hidden lg:block">
        <div className="p-6 border-b border-border/60">
          <Link to="/" className="flex items-center gap-3 font-display font-extrabold text-lg">
            <img src={logo} alt="عبري ببساطة" className="w-10 h-10 rounded-full ring-2 ring-accent/40 object-cover" />
            <div>
              <div className="text-gradient">لوحة الإدارة</div>
              <div className="text-xs font-normal text-muted-foreground">عبري ببساطة</div>
            </div>
          </Link>
        </div>
        <nav className="p-4 space-y-1">
          {visibleNav.map((item) => {
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
          {visibleNav.map((item) => (
            <button key={item.id} onClick={() => setActive(item.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold ${active === item.id ? "bg-primary text-primary-foreground" : "bg-card"}`}>
              {item.label}
            </button>
          ))}
        </div>

        <SectionPermsContext.Provider value={sectionPerms}>
          {active === "overview" && <Overview />}
          {active === "videos" && <VideosSection />}
          {active === "users" && <UsersSection />}
          {active === "content" && <LevelsSection />}
          {active === "quizzes" && <QuizzesSection />}
          {active === "songs" && <SimpleSection table="songs" titleLabel="الأغاني" />}
          {active === "games" && <GamesSection />}
          {active === "testimonials" && <TestimonialsSection />}
          {active === "faqs" && <FaqsSection />}
        </SectionPermsContext.Provider>
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

// ============== LEVELS GRID (reusable) ==============
const LEVEL_COLORS = [
  "from-primary to-secondary",
  "from-secondary to-mint",
  "from-pink to-accent",
  "from-accent to-primary",
  "from-mint to-primary",
];
const LevelsGrid = ({ levels, items, unitLabel, onSelect, highlightId }: {
  levels: any[]; items: any[]; unitLabel: string; onSelect: (lv: any) => void; highlightId?: string | null;
}) => {
  const grouped = items.reduce<Record<string, any[]>>((acc, it) => {
    const k = it.level_id || "_unassigned";
    (acc[k] = acc[k] || []).push(it); return acc;
  }, {});
  const highlightCls = (id: string) =>
    highlightId === id ? "border-primary ring-4 ring-primary/20 shadow-medium -translate-y-0.5" : "";
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {levels.map((lv, i) => {
        const count = grouped[lv.id]?.length || 0;
        return (
          <button key={lv.id} onClick={() => onSelect(lv)}
            className={`group relative overflow-hidden rounded-3xl border-2 border-border bg-card shadow-soft hover:shadow-medium hover:-translate-y-1 hover:border-primary transition-bounce text-right p-6 ${highlightCls(lv.id)}`}>
            <div className={`absolute -left-8 -top-8 w-32 h-32 rounded-full bg-gradient-to-br ${LEVEL_COLORS[i % LEVEL_COLORS.length]} opacity-20 group-hover:opacity-40 transition-opacity`} />
            {highlightId === lv.id && (
              <div className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">آخر زيارة</div>
            )}
            <div className="relative flex items-start justify-between">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${LEVEL_COLORS[i % LEVEL_COLORS.length]} flex items-center justify-center text-primary-foreground shadow-soft`}>
                <FolderOpen className="w-7 h-7" />
              </div>
              <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:-translate-x-1 transition-bounce" />
            </div>
            <h3 className="font-display text-xl mt-4">{lv.title}</h3>
            <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
              <PlayCircle className="w-4 h-4" />
              <span>{count} {unitLabel}</span>
            </div>
          </button>
        );
      })}
      {grouped["_unassigned"]?.length > 0 && (
        <button onClick={() => onSelect({ id: "_unassigned", title: "بدون مستوى" })}
          className={`group relative overflow-hidden rounded-3xl border-2 border-dashed border-border bg-muted/30 hover:border-primary hover:bg-card transition-bounce text-right p-6 ${highlightCls("_unassigned")}`}>
          {highlightId === "_unassigned" && (
            <div className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">آخر زيارة</div>
          )}
          <div className="flex items-start justify-between">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
              <FolderOpen className="w-7 h-7 text-muted-foreground" />
            </div>
            <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:-translate-x-1 transition-bounce" />
          </div>
          <h3 className="font-display text-xl mt-4">بدون مستوى</h3>
          <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
            <PlayCircle className="w-4 h-4" />
            <span>{grouped["_unassigned"].length} {unitLabel}</span>
          </div>
        </button>
      )}
    </div>
  );
};

const LevelBackHeader = ({ levelTitle, sectionLabel, onBack, action }: {
  levelTitle: string; sectionLabel: string; onBack: () => void; action: React.ReactNode;
}) => (
  <div className="mb-6 space-y-3">
    {/* Breadcrumb */}
    <nav aria-label="مسار التنقل" className="flex items-center gap-1.5 text-sm">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-soft text-primary font-bold hover:bg-primary hover:text-primary-foreground transition-bounce active:scale-95"
      >
        <FolderOpen className="w-4 h-4" />
        <span>{sectionLabel}</span>
      </button>
      <ChevronLeft className="w-4 h-4 text-muted-foreground rotate-180" />
      <span className="px-3 py-1.5 rounded-full bg-muted text-foreground font-bold truncate max-w-[60vw]">
        {levelTitle}
      </span>
    </nav>

    {/* Title row with prominent back button + action */}
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          className="gap-2 rounded-full border-2 hover:border-primary hover:bg-primary-soft"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>رجوع للمستويات</span>
        </Button>
        <h1 className="font-display text-2xl">{levelTitle}</h1>
      </div>
      {action}
    </div>
  </div>
);


// ============== VIDEOS ==============
const VideosSection = () => {
  const perm = useSectionPerm("videos");
  const [videos, setVideos] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [query, setQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<any | null>(null);
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({ status: "" });
  const setF = (k: string, v: string) => setFilters((s) => ({ ...s, [k]: v }));

  const load = async () => {
    const { data } = await supabase.from("videos").select("*, levels(title, slug)").order("sort_order");
    setVideos(data || []);
    const { data: lv } = await supabase.from("levels").select("*").order("sort_order");
    setLevels(lv || []);
  };
  useEffect(() => { load(); }, []);

  const remove = async (id: string, url: string) => {
    if (!confirm("حذف الفيديو؟")) return;
    const path = url.split("/videos/")[1];
    if (path) await supabase.storage.from("videos").remove([path]);
    await supabase.from("videos").delete().eq("id", id);
    toast({ title: "تم الحذف" });
    load();
  };

  // Group videos by level for counts
  const videosByLevel = videos.reduce<Record<string, any[]>>((acc, v) => {
    const key = v.level_id || "_unassigned";
    (acc[key] = acc[key] || []).push(v);
    return acc;
  }, {});

  const selectLevel = (lv: any) => { setSelectedLevel(lv); setLastSelectedId(lv.id); };

  // ===== Level not selected: show levels grid =====
  if (!selectedLevel) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="font-display text-3xl">الفيديوهات 🎬</h1>
            <p className="text-sm text-muted-foreground mt-1">اختر مستوى لإدارة فيديوهاته</p>
          </div>
          {perm.can_add && (
            <Button variant="hero" onClick={() => { setEditing(null); setOpen(true); }}>
              <Plus /> رفع فيديو جديد
            </Button>
          )}
        </div>

        <LevelsGrid levels={levels} items={videos} unitLabel="فيديو" onSelect={selectLevel} highlightId={lastSelectedId} />

        <VideoDialog open={open} onClose={() => setOpen(false)} editing={editing} levels={levels} onSaved={load} />
      </div>
    );
  }

  // ===== Level selected: show videos list =====
  const levelVideos = videosByLevel[selectedLevel.id] || [];
  const filtered = applyFilters(levelVideos, query, ["title"], {
    status: { value: filters.status, getter: (v) => String(v.published) },
  });

  return (
    <div>
      <LevelBackHeader
        levelTitle={`${selectedLevel.title} 🎬`}
        sectionLabel="الفيديوهات"
        onBack={() => { setSelectedLevel(null); setQuery(""); setFilters({ status: "" }); }}
        action={perm.can_add ? <Button variant="hero" onClick={() => { setEditing(null); setOpen(true); }}><Plus /> رفع فيديو جديد</Button> : null}
      />

      <FilterBar
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="ابحث بالعنوان..."
        values={filters}
        onValueChange={setF}
        filters={[
          { key: "status", label: "الحالة", options: [{ label: "منشور", value: "true" }, { label: "مخفي", value: "false" }] },
        ]}
      />

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">العنوان</TableHead>
              <TableHead className="text-right">الترتيب</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-10">{query ? "لا توجد نتائج مطابقة" : "لا توجد فيديوهات في هذا المستوى."}</TableCell></TableRow>
            ) : filtered.map((v) => (
              <TableRow key={v.id}>
                <TableCell className="font-bold flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-primary-soft flex items-center justify-center text-primary">
                    <PlayCircle className="w-5 h-5" />
                  </div>
                  {v.title}
                </TableCell>
                <TableCell>{v.sort_order}</TableCell>
                <TableCell><Badge variant={v.published ? "default" : "secondary"}>{v.published ? "منشور" : "مخفي"}</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {perm.can_edit && <Button size="icon" variant="ghost" onClick={() => { setEditing(v); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>}
                    {perm.can_delete && <Button size="icon" variant="ghost" onClick={() => remove(v.id, v.video_url)}><Trash2 className="w-4 h-4 text-destructive" /></Button>}
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
  const perm = useSectionPerm("users");
  const [users, setUsers] = useState<any[]>([]);
  const [credOpen, setCredOpen] = useState(false);
  const [credUser, setCredUser] = useState<any>(null);
  const [credEmail, setCredEmail] = useState("");
  const [credPassword, setCredPassword] = useState("");
  const [credSaving, setCredSaving] = useState(false);
  const [credCurrentEmail, setCredCurrentEmail] = useState<string>("");
  const [credLoadingEmail, setCredLoadingEmail] = useState(false);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({ role: "", status: "" });
  const setF = (k: string, v: string) => setFilters((s) => ({ ...s, [k]: v }));

  // Create user dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [createSaving, setCreateSaving] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newAge, setNewAge] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "kid">("kid");
  const [newStatus, setNewStatus] = useState<"active" | "inactive">("active");

  const resetCreate = () => {
    setNewName(""); setNewEmail(""); setNewPassword(""); setNewAge("");
    setNewRole("kid"); setNewStatus("active");
  };

  const submitCreate = async () => {
    if (!newEmail.trim() || !newPassword) {
      toast({ title: "⚠️ بيانات ناقصة", description: "الإيميل وكلمة المرور مطلوبان", variant: "destructive" });
      return;
    }
    setCreateSaving(true);
    const { data, error } = await supabase.functions.invoke("admin-create-user", {
      body: {
        email: newEmail.trim(),
        password: newPassword,
        full_name: newName.trim() || null,
        age: newAge ? Number(newAge) : null,
        role: newRole,
        status: newStatus,
      },
    });
    setCreateSaving(false);
    if (error || (data as any)?.error) {
      toast({
        title: "❌ فشل إنشاء المستخدم",
        description: (data as any)?.error || error?.message || "خطأ غير متوقع",
        variant: "destructive",
      });
      return;
    }
    toast({ title: "✅ تم إنشاء المستخدم بنجاح" });
    setCreateOpen(false);
    resetCreate();
    load();
  };

  const load = async () => {
    const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    const { data: rolesData } = await supabase.from("user_roles").select("*");
    const { data: emailsRes } = await supabase.functions.invoke("admin-update-user", { body: { action: "list" } });
    const emails: Record<string, string> = (emailsRes as any)?.emails || {};
    const merged = (profiles || []).map((p) => ({
      ...p,
      roles: (rolesData || []).filter((r) => r.user_id === p.id).map((r) => r.role),
      email: emails[p.id] || "",
    }));
    setUsers(merged);
  };
  useEffect(() => { load(); }, []);

  const setRole = async (userId: string, newRole: "admin" | "kid") => {
    await supabase.from("user_roles").delete().eq("user_id", userId);
    await supabase.from("user_roles").insert({ user_id: userId, role: newRole });
    toast({ title: "تم تحديث الدور" });
    load();
  };

  // Delete confirmation dialog
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleteSaving, setDeleteSaving] = useState(false);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteSaving(true);
    const { data, error } = await supabase.functions.invoke("admin-update-user", {
      body: { user_id: deleteTarget.id, action: "delete" },
    });
    setDeleteSaving(false);
    if (error || (data as any)?.error) {
      toast({ title: "فشل الحذف", description: (data as any)?.error || error?.message || "خطأ", variant: "destructive" });
      return;
    }
    toast({ title: "✅ تم حذف المستخدم" });
    setDeleteTarget(null);
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
      toast({ title: "⚠️ بيانات ناقصة", description: "أدخل إيميلاً جديداً أو كلمة مرور", variant: "destructive" });
      return;
    }
    setCredSaving(true);
    const payload: any = { user_id: credUser.id };
    if (credEmail.trim()) payload.email = credEmail.trim();
    if (credPassword) payload.password = credPassword;
    const { data, error } = await supabase.functions.invoke("admin-update-user", { body: payload });
    setCredSaving(false);
    if (error || (data as any)?.error) {
      toast({
        title: "❌ فشل التحديث",
        description: (data as any)?.error || error?.message || "حدث خطأ غير متوقع",
        variant: "destructive",
      });
      return;
    }
    const changes: string[] = [];
    if (credEmail.trim()) changes.push("الإيميل");
    if (credPassword) changes.push("كلمة المرور");
    toast({
      title: "✅ تم التحديث بنجاح",
      description: `تم تحديث ${changes.join(" و ")} للمستخدم ${credUser.full_name || ""}`,
    });

    // إعادة جلب الإيميل المحدث وتفريغ الحقول
    setCredEmail("");
    setCredPassword("");
    if (credEmail.trim()) {
      setCredLoadingEmail(true);
      const { data: refreshed } = await supabase.functions.invoke("admin-update-user", {
        body: { user_id: credUser.id, action: "get" },
      });
      setCredLoadingEmail(false);
      if ((refreshed as any)?.user?.email) setCredCurrentEmail((refreshed as any).user.email);
    }
  };

  const filteredUsers = applyFilters(users, query, ["full_name", "email"], {
    role: { value: filters.role, getter: (u) => u.roles },
    status: { value: filters.status, getter: (u) => u.status },
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <h1 className="font-display text-3xl">المستخدمون 👥</h1>
        {perm.can_add && (
          <Button variant="hero" onClick={() => { resetCreate(); setCreateOpen(true); }}>
            <UserPlus className="w-4 h-4" /> إضافة مستخدم
          </Button>
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={(o) => { setCreateOpen(o); if (!o) resetCreate(); }}>
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><UserPlus className="w-5 h-5 text-primary" /> إضافة مستخدم جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>الاسم الكامل</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="مثال: محمد أحمد" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>البريد الإلكتروني *</Label>
                <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="user@example.com" />
              </div>
              <div className="space-y-1.5">
                <Label>العمر</Label>
                <Input type="number" min={1} value={newAge} onChange={(e) => setNewAge(e.target.value)} placeholder="مثال: 8" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>كلمة المرور * <span className="text-xs text-muted-foreground">(6 أحرف على الأقل)</span></Label>
              <Input type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>الدور</Label>
                <Select value={newRole} onValueChange={(v: any) => setNewRole(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kid"><span className="inline-flex items-center gap-2">👶 طفل</span></SelectItem>
                    <SelectItem value="admin"><span className="inline-flex items-center gap-2">👑 مدير</span></SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>الحالة</Label>
                <Select value={newStatus} onValueChange={(v: any) => setNewStatus(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">✅ فعّال</SelectItem>
                    <SelectItem value="inactive">⛔ غير فعّال</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={createSaving}>إلغاء</Button>
            <Button variant="hero" onClick={submitCreate} disabled={createSaving}>
              {createSaving ? "جاري الإنشاء..." : <><UserPlus className="w-4 h-4" /> إنشاء</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <FilterBar
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="ابحث بالاسم أو البريد..."
        values={filters}
        onValueChange={setF}
        filters={[
          { key: "role", label: "الدور", options: [
            { label: "مدير", value: "admin" },
            { label: "طفل", value: "kid" },
          ]},
          { key: "status", label: "الحالة", options: Object.entries(STATUS_LABELS).map(([v, l]) => ({ value: v, label: l })) },
        ]}
      />
      <Card className="overflow-hidden">
        <Table>
          <TableHeader><TableRow>
            <TableHead className="text-right">المستخدم</TableHead>
            <TableHead className="text-right">البريد الإلكتروني</TableHead>
            <TableHead className="text-right">الدور</TableHead>
            <TableHead className="text-right">الحالة</TableHead>
            <TableHead className="text-right w-[80px]">إجراءات</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">{query ? "لا توجد نتائج مطابقة" : "لا يوجد مستخدمون"}</TableCell></TableRow>
              : filteredUsers.map((u) => {
                const initials = (u.full_name || "?").trim().split(/\s+/).map((s: string) => s[0]).slice(0, 2).join("").toUpperCase();
                const isAdmin = u.roles.includes("admin");
                return (
                <TableRow key={u.id} className="hover:bg-muted/40">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 shrink-0">
                        <AvatarFallback className={isAdmin ? "bg-primary-gradient text-primary-foreground font-bold" : "bg-pink-soft text-pink font-bold"}>
                          {initials || "؟"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-bold truncate">{u.full_name || "بدون اسم"}</p>
                        <p className="text-xs text-muted-foreground">
                          {u.age ? `${u.age} سنوات` : "—"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground break-all" dir="ltr">{u.email || "—"}</span>
                  </TableCell>
                  <TableCell>
                    {u.roles.length === 0 ? (
                      <Badge variant="outline" className="text-muted-foreground">بدون دور</Badge>
                    ) : (
                      u.roles.map((r: string) => (
                        <Badge key={r} className={`ml-1 ${r === "admin" ? "bg-primary-gradient text-primary-foreground" : "bg-pink-soft text-pink"}`}>
                          {r === "admin" ? "👑 مدير" : "👶 طفل"}
                        </Badge>
                      ))
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${STATUS_COLORS[u.status] || "bg-muted"}`}>
                      {STATUS_LABELS[u.status] || u.status || "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-9 w-9">
                          <MoreHorizontal className="w-4 h-4" />
                          <span className="sr-only">إجراءات</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel className="text-xs text-muted-foreground">{u.full_name || "المستخدم"}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {perm.can_edit && (
                          <DropdownMenuItem onClick={() => openCred(u)}>
                            <KeyRound className="w-4 h-4 ml-2" /> تعديل بيانات الدخول
                          </DropdownMenuItem>
                        )}
                        {perm.can_edit && (
                          <DropdownMenuItem asChild>
                            <Link to={`/admin/users/${u.id}/permissions`}>
                              <Shield className="w-4 h-4 ml-2" /> الصلاحيات
                            </Link>
                          </DropdownMenuItem>
                        )}
                        {perm.can_edit && (
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              <UserCog className="w-4 h-4 ml-2" /> تغيير الدور
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              <DropdownMenuRadioGroup value={u.roles[0] || ""} onValueChange={(v: any) => setRole(u.id, v)}>
                                <DropdownMenuRadioItem value="admin">👑 مدير</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="kid">👶 طفل</DropdownMenuRadioItem>
                              </DropdownMenuRadioGroup>
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                        )}
                        {perm.can_edit && (
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              <CheckCircle2 className="w-4 h-4 ml-2" /> تغيير الحالة
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              <DropdownMenuRadioGroup value={u.status || "active"} onValueChange={(v) => setStatus(u.id, v)}>
                                {Object.entries(STATUS_LABELS).map(([k, l]) => (
                                  <DropdownMenuRadioItem key={k} value={k}>{l}</DropdownMenuRadioItem>
                                ))}
                              </DropdownMenuRadioGroup>
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                        )}
                        {perm.can_delete && <DropdownMenuSeparator />}
                        {perm.can_delete && (
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            onClick={() => setDeleteTarget(u)}
                          >
                            <Trash2 className="w-4 h-4 ml-2" /> حذف المستخدم
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-center">حذف المستخدم نهائياً؟</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              سيتم حذف <span className="font-bold text-foreground">{deleteTarget?.full_name || "هذا المستخدم"}</span> وجميع بياناته بشكل نهائي.
              <br />
              لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={deleteSaving}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); confirmDelete(); }}
              disabled={deleteSaving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteSaving ? "جاري الحذف..." : <><Trash2 className="w-4 h-4 ml-1" /> نعم، احذف</>}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
  const perm = useSectionPerm("content");
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ slug: "", title: "", description: "", color: "mint", sort_order: 0, published: true });
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({ status: "" });
  const setF = (k: string, v: string) => setFilters((s) => ({ ...s, [k]: v }));

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
        {perm.can_add && <Button variant="hero" onClick={() => { setEditing(null); setOpen(true); }}><Plus /> إضافة مستوى</Button>}
      </div>
      <FilterBar
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="ابحث بالعنوان..."
        values={filters}
        onValueChange={setF}
        filters={[
          { key: "status", label: "الحالة", options: [{ label: "منشور", value: "true" }, { label: "مخفي", value: "false" }] },
        ]}
      />
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
            {(() => {
              const filtered = applyFilters(items, query, ["title", "slug"], {
                status: { value: filters.status, getter: (l) => String(l.published) },
              });
              if (filtered.length === 0) return <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">{query ? "لا توجد نتائج مطابقة" : "لا توجد مستويات"}</TableCell></TableRow>;
              return filtered.map((l) => (
              <TableRow key={l.id}>
                <TableCell className="font-bold">{l.title}</TableCell>
                <TableCell className="font-mono text-xs">{l.slug}</TableCell>
                <TableCell>{l.sort_order}</TableCell>
                <TableCell><Badge variant={l.published ? "default" : "secondary"}>{l.published ? "منشور" : "مخفي"}</Badge></TableCell>
                <TableCell>
                  {perm.can_edit && <Button size="icon" variant="ghost" onClick={() => { setEditing(l); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>}
                  {perm.can_delete && <Button size="icon" variant="ghost" onClick={() => remove(l.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>}
                </TableCell>
              </TableRow>
              ));
            })()}
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
              <div>
                <Label>اللون</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {[
                    { key: "mint", cls: "bg-mint" },
                    { key: "primary", cls: "bg-primary" },
                    { key: "secondary", cls: "bg-secondary" },
                    { key: "accent", cls: "bg-accent" },
                    { key: "pink", cls: "bg-pink" },
                    { key: "orange", cls: "bg-orange" },
                    { key: "teal", cls: "bg-teal" },
                  ].map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => setForm({ ...form, color: c.key })}
                      title={c.key}
                      className={`w-8 h-8 rounded-full ${c.cls} shadow-soft ring-offset-2 ring-offset-background transition-all ${form.color === c.key ? "ring-2 ring-foreground scale-110" : "hover:scale-105"}`}
                    />
                  ))}
                </div>
              </div>
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
  const perm = useSectionPerm("quizzes");
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [query, setQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<any | null>(null);
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const selectLevel = (lv: any) => { setSelectedLevel(lv); setLastSelectedId(lv.id); };
  const [filters, setFilters] = useState<Record<string, string>>({ status: "" });
  const setF = (k: string, v: string) => setFilters((s) => ({ ...s, [k]: v }));

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

  if (!selectedLevel) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="font-display text-3xl">الاختبارات ✅</h1>
            <p className="text-sm text-muted-foreground mt-1">اختر مستوى لإدارة اختباراته</p>
          </div>
          {perm.can_add && <Button variant="hero" onClick={() => { setEditing(null); setOpen(true); }}><Plus /> اختبار جديد</Button>}
        </div>
        <LevelsGrid levels={levels} items={quizzes} unitLabel="اختبار" onSelect={selectLevel} highlightId={lastSelectedId} />
        <QuizDialog open={open} onClose={() => setOpen(false)} editing={editing} levels={levels} onSaved={load} />
      </div>
    );
  }

  const levelItems = quizzes.filter((q) => (selectedLevel.id === "_unassigned" ? !q.level_id : q.level_id === selectedLevel.id));
  const filtered = applyFilters(levelItems, query, ["title", "description"], {
    status: { value: filters.status, getter: (q) => String(q.published) },
  });

  return (
    <div>
      <LevelBackHeader
        levelTitle={`${selectedLevel.title} ✅`}
        sectionLabel="الاختبارات"
        onBack={() => { setSelectedLevel(null); setQuery(""); setFilters({ status: "" }); }}
        action={perm.can_add ? <Button variant="hero" onClick={() => { setEditing(null); setOpen(true); }}><Plus /> اختبار جديد</Button> : null}
      />
      <FilterBar
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="ابحث بالعنوان..."
        values={filters}
        onValueChange={setF}
        filters={[
          { key: "status", label: "الحالة", options: [{ label: "منشور", value: "true" }, { label: "مخفي", value: "false" }] },
        ]}
      />
      <div className="grid lg:grid-cols-2 gap-4">
        {filtered.map((q) => (
          <Card key={q.id} className="p-5">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="font-bold text-lg">{q.title}</h3>
                <p className="text-xs text-muted-foreground">{q.quiz_questions?.length || 0} سؤال</p>
              </div>
              <div className="flex gap-1">
                {perm.can_edit && <Button size="icon" variant="ghost" onClick={() => { setEditing(q); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>}
                {perm.can_delete && <Button size="icon" variant="ghost" onClick={() => remove(q.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>}
              </div>
            </div>
            {q.description && <p className="text-sm text-muted-foreground">{q.description}</p>}
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground col-span-2 py-10">{query ? "لا توجد نتائج مطابقة" : "لا توجد اختبارات في هذا المستوى"}</p>}
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
  const perm = useSectionPerm(table as Section);
  const [items, setItems] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: "", url: "", description: "", level_id: "", published: true });
  const [query, setQuery] = useState("");



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

  const [selectedLevel, setSelectedLevel] = useState<any | null>(null);
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const selectLevel = (lv: any) => { setSelectedLevel(lv); setLastSelectedId(lv.id); };
  const unitLabel = table === "songs" ? "أغنية" : "لعبة";

  if (!selectedLevel) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="font-display text-3xl">{titleLabel}</h1>
            <p className="text-sm text-muted-foreground mt-1">اختر مستوى لإدارة محتواه</p>
          </div>
          {perm.can_add && <Button variant="hero" onClick={() => { setEditing(null); setOpen(true); }}><Plus /> إضافة</Button>}
        </div>
        <LevelsGrid levels={levels} items={items} unitLabel={unitLabel} onSelect={selectLevel} highlightId={lastSelectedId} />
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
                    <Textarea value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} dir="ltr" rows={4}
                      placeholder='<iframe src="https://wordwall.net/ar/embed/..." width="500" height="380" frameborder="0" allowfullscreen></iframe>' />
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
  }

  const levelItems = items.filter((it) => (selectedLevel.id === "_unassigned" ? !it.level_id : it.level_id === selectedLevel.id));
  const filtered = applyFilters(levelItems, query, ["title", "description"], {});

  return (
    <div>
      <LevelBackHeader
        levelTitle={`${selectedLevel.title} • ${titleLabel}`}
        sectionLabel={titleLabel}
        onBack={() => { setSelectedLevel(null); setQuery(""); }}
        action={perm.can_add ? <Button variant="hero" onClick={() => { setEditing(null); setForm((f) => ({ ...f, level_id: selectedLevel.id === "_unassigned" ? "" : selectedLevel.id })); setOpen(true); }}><Plus /> إضافة</Button> : null}
      />
      <FilterBar
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="ابحث بالعنوان..."
        values={{}}
        onValueChange={() => {}}
        filters={[]}
      />
      <Card className="overflow-hidden">
        <Table>
          <TableHeader><TableRow>
            <TableHead className="text-right">العنوان</TableHead>
            <TableHead className="text-right">الرابط</TableHead>
            <TableHead className="text-right">إجراءات</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={3} className="text-center py-10 text-muted-foreground">{query ? "لا توجد نتائج مطابقة" : "لا توجد عناصر في هذا المستوى"}</TableCell></TableRow>
            ) : filtered.map((it: any) => (
              <TableRow key={it.id}>
                <TableCell className="font-bold flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-primary-soft flex items-center justify-center text-primary">
                    <PlayCircle className="w-5 h-5" />
                  </div>
                  {it.title}
                </TableCell>
                <TableCell className="text-xs truncate max-w-xs">{it.url || "-"}</TableCell>
                <TableCell>
                  {perm.can_edit && <Button size="icon" variant="ghost" onClick={() => { setEditing(it); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>}
                  {perm.can_delete && <Button size="icon" variant="ghost" onClick={() => remove(it.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>}
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


// ============== GAMES (dedicated) ==============
const extractIframeSrc = (input: string): string => {
  if (!input) return "";
  const m = input.match(/<iframe[^>]*\ssrc=["']([^"']+)["']/i);
  if (m) return m[1];
  try {
    const u = new URL(input);
    if (u.hostname.includes("wordwall.net")) {
      const r = u.pathname.match(/\/(?:resource|play|embed)\/(\d+)/);
      if (r) return `https://wordwall.net/embed/${r[1]}?themeId=1&templateId=3&fontStackId=0`;
    }
    return input;
  } catch { return ""; }
};

const GamesSection = () => {
  const perm = useSectionPerm("games");
  const [items, setItems] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: "", url: "", description: "", level_id: "", published: true });
  const [query, setQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<any | null>(null);
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const [preview, setPreview] = useState<any | null>(null);

  const load = async () => {
    const { data } = await supabase.from("games").select("*, levels(title)").order("created_at", { ascending: false });
    setItems(data || []);
  };
  useEffect(() => {
    load();
    supabase.from("levels").select("id, title").order("sort_order").then(({ data }) => setLevels(data || []));
  }, []);

  useEffect(() => {
    if (editing) setForm({ title: editing.title, url: editing.url || "", description: editing.description || "", level_id: editing.level_id || "", published: editing.published });
    else setForm({ title: "", url: "", description: "", level_id: selectedLevel && selectedLevel.id !== "_unassigned" ? selectedLevel.id : "", published: true });
  }, [editing, open]);

  const save = async () => {
    if (!form.title.trim()) { toast({ title: "اسم اللعبة مطلوب", variant: "destructive" }); return; }
    if (!form.level_id) { toast({ title: "اختر المستوى", variant: "destructive" }); return; }
    if (!form.url.trim()) { toast({ title: "كود التضمين مطلوب", variant: "destructive" }); return; }
    if (!extractIframeSrc(form.url)) { toast({ title: "كود التضمين غير صحيح", description: "تأكد من لصق كود <iframe> كاملاً", variant: "destructive" }); return; }
    const payload = { title: form.title.trim(), url: form.url.trim(), description: form.description.trim(), level_id: form.level_id, published: form.published };
    const { error } = editing
      ? await supabase.from("games").update(payload).eq("id", editing.id)
      : await supabase.from("games").insert(payload);
    if (error) { toast({ title: "خطأ", description: error.message, variant: "destructive" }); return; }
    toast({ title: editing ? "تم تحديث اللعبة" : "تمت إضافة اللعبة" });
    setOpen(false); setEditing(null); load();
  };

  const remove = async (id: string) => {
    if (!confirm("حذف هذه اللعبة؟")) return;
    await supabase.from("games").delete().eq("id", id);
    toast({ title: "تم الحذف" }); load();
  };

  const togglePublish = async (g: any) => {
    await supabase.from("games").update({ published: !g.published }).eq("id", g.id);
    load();
  };

  const selectLevel = (lv: any) => { setSelectedLevel(lv); setLastSelectedId(lv.id); };

  // --- شاشة اختيار المستوى ---
  if (!selectedLevel) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-pink-soft text-pink flex items-center justify-center">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display text-3xl">الألعاب</h1>
              <p className="text-sm text-muted-foreground mt-1">اختر مستوى لإدارة ألعابه</p>
            </div>
          </div>
          {perm.can_add && (
            <Button variant="hero" onClick={() => { setEditing(null); setOpen(true); }}>
              <Plus /> إضافة لعبة
            </Button>
          )}
        </div>
        <LevelsGrid levels={levels} items={items} unitLabel="لعبة" onSelect={selectLevel} highlightId={lastSelectedId} />
        <GameDialog
          open={open} setOpen={setOpen} editing={editing} form={form} setForm={setForm}
          levels={levels} onSave={save}
        />
      </div>
    );
  }

  // --- شاشة ألعاب المستوى ---
  const levelItems = items.filter((it) => (selectedLevel.id === "_unassigned" ? !it.level_id : it.level_id === selectedLevel.id));
  const filtered = applyFilters(levelItems, query, ["title", "description"], {});

  return (
    <div>
      <LevelBackHeader
        levelTitle={`${selectedLevel.title} • الألعاب`}
        sectionLabel="الألعاب"
        onBack={() => { setSelectedLevel(null); setQuery(""); }}
        action={perm.can_add ? (
          <Button variant="hero" onClick={() => { setEditing(null); setOpen(true); }}>
            <Plus /> إضافة لعبة
          </Button>
        ) : null}
      />
      <FilterBar
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="ابحث باسم اللعبة..."
        values={{}}
        onValueChange={() => {}}
        filters={[]}
      />

      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-pink-soft text-pink mx-auto flex items-center justify-center mb-4">
            <Gamepad2 className="w-8 h-8" />
          </div>
          <p className="font-bold text-lg mb-2">{query ? "لا توجد نتائج مطابقة" : "لا توجد ألعاب في هذا المستوى"}</p>
          <p className="text-sm text-muted-foreground mb-6">{query ? "جرّب كلمات بحث أخرى" : "أضف أول لعبة بلصق كود iframe من Wordwall أو غيره"}</p>
          {!query && perm.can_add && (
            <Button variant="hero" onClick={() => { setEditing(null); setOpen(true); }}>
              <Plus /> إضافة لعبة
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((g: any) => {
            const src = extractIframeSrc(g.url || "");
            return (
              <Card key={g.id} className="overflow-hidden group hover:shadow-medium transition-bounce">
                <div className="relative aspect-video bg-muted overflow-hidden">
                  {src ? (
                    <iframe src={src} title={g.title} className="w-full h-full pointer-events-none" style={{ border: 0 }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Gamepad2 className="w-10 h-10" />
                    </div>
                  )}
                  <button
                    onClick={() => setPreview(g)}
                    className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-bounce"
                  >
                    <span className="bg-primary text-primary-foreground px-4 py-2 rounded-full font-bold flex items-center gap-2">
                      <PlayCircle className="w-5 h-5" /> معاينة
                    </span>
                  </button>
                  {!g.published && (
                    <Badge variant="secondary" className="absolute top-2 right-2">مخفية</Badge>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold truncate mb-1">{g.title}</h3>
                  {g.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{g.description}</p>}
                  <div className="flex items-center justify-between gap-1 pt-2 border-t">
                    <Button size="sm" variant="ghost" onClick={() => togglePublish(g)}>
                      {g.published ? "إخفاء" : "نشر"}
                    </Button>
                    <div className="flex items-center gap-1">
                      {perm.can_edit && (
                        <Button size="icon" variant="ghost" onClick={() => { setEditing(g); setOpen(true); }}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                      )}
                      {perm.can_delete && (
                        <Button size="icon" variant="ghost" onClick={() => remove(g.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <GameDialog
        open={open} setOpen={setOpen} editing={editing} form={form} setForm={setForm}
        levels={levels} onSave={save}
      />

      {/* معاينة كاملة */}
      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent dir="rtl" className="max-w-4xl">
          <DialogHeader><DialogTitle>{preview?.title}</DialogTitle></DialogHeader>
          {preview && (
            <div className="aspect-video bg-muted rounded-xl overflow-hidden">
              <iframe src={extractIframeSrc(preview.url || "")} title={preview.title} className="w-full h-full" style={{ border: 0 }} allow="fullscreen; autoplay" allowFullScreen />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const GameDialog = ({ open, setOpen, editing, form, setForm, levels, onSave }: any) => {
  const previewSrc = extractIframeSrc(form.url);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent dir="rtl" className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-pink" />
            {editing ? "تعديل اللعبة" : "إضافة لعبة جديدة"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>اسم اللعبة *</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="مثال: مطابقة الحروف" />
          </div>
          <div>
            <Label>المستوى *</Label>
            <Select value={form.level_id} onValueChange={(v) => setForm({ ...form, level_id: v })}>
              <SelectTrigger><SelectValue placeholder="اختر المستوى" /></SelectTrigger>
              <SelectContent>
                {levels.map((l: any) => <SelectItem key={l.id} value={l.id}>{l.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>كود التضمين (iframe) *</Label>
            <Textarea
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              dir="ltr"
              rows={4}
              placeholder='<iframe src="https://wordwall.net/ar/embed/..." width="500" height="380" frameborder="0" allowfullscreen></iframe>'
            />
            <p className="text-xs text-muted-foreground mt-1">
              الصق كود iframe كاملاً من Wordwall أو أي موقع ألعاب يدعم التضمين.
            </p>
          </div>
          {previewSrc && (
            <div>
              <Label className="flex items-center gap-2 mb-2"><PlayCircle className="w-4 h-4" /> معاينة مباشرة</Label>
              <div className="aspect-video bg-muted rounded-xl overflow-hidden border-2 border-primary/20">
                <iframe src={previewSrc} title="معاينة" className="w-full h-full" style={{ border: 0 }} />
              </div>
            </div>
          )}
          <div>
            <Label>الوصف (اختياري)</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="game-published"
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
              className="w-4 h-4"
            />
            <Label htmlFor="game-published" className="cursor-pointer">منشورة (تظهر للمستخدمين)</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
          <Button variant="hero" onClick={onSave}>{editing ? "حفظ التعديلات" : "إضافة"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


const TestimonialsSection = () => {
  const perm = useSectionPerm("testimonials");
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const empty = { name: "", role: "", text: "", rating: 5, avatar_color: "bg-primary-gradient", card_color: "bg-primary-soft", sort_order: 0, published: true };
  const [form, setForm] = useState<any>(empty);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({ rating: "", status: "" });
  const setF = (k: string, v: string) => setFilters((s) => ({ ...s, [k]: v }));

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
        {perm.can_add && <Button variant="hero" onClick={() => { setEditing(null); setOpen(true); }}><Plus /> إضافة رأي</Button>}
      </div>
      <FilterBar
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="ابحث بالاسم..."
        values={filters}
        onValueChange={setF}
        filters={[
          { key: "rating", label: "التقييم", options: [5,4,3,2,1].map((n) => ({ label: `⭐ ${n}`, value: String(n) })) },
          { key: "status", label: "الحالة", options: [{ label: "منشور", value: "true" }, { label: "مخفي", value: "false" }] },
        ]}
      />
      {(() => {
        const filtered = applyFilters(items, query, ["name", "role", "text"], {
          rating: { value: filters.rating, getter: (t) => String(t.rating) },
          status: { value: filters.status, getter: (t) => String(t.published) },
        });
        return (
      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((t) => (
          <Card key={t.id} className="p-5">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-bold">{t.name}</h3>
                <p className="text-xs text-muted-foreground">{t.role || "—"} • ⭐ {t.rating}</p>
              </div>
              <div className="flex gap-1">
                <Badge variant={t.published ? "default" : "secondary"}>{t.published ? "منشور" : "مخفي"}</Badge>
                {perm.can_edit && <Button size="icon" variant="ghost" onClick={() => { setEditing(t); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>}
                {perm.can_delete && <Button size="icon" variant="ghost" onClick={() => remove(t.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{t.text}</p>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground col-span-2 py-10">{query ? "لا توجد نتائج مطابقة" : "لا توجد آراء"}</p>}
      </div>
        );
      })()}

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
  const perm = useSectionPerm("faqs");
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const empty = { question: "", answer: "", category: "", sort_order: 0, published: true };
  const [form, setForm] = useState<any>(empty);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({ category: "", status: "" });
  const setF = (k: string, v: string) => setFilters((s) => ({ ...s, [k]: v }));
  const categories = Array.from(new Set(items.map((i) => i.category).filter(Boolean)));

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
        {perm.can_add && <Button variant="hero" onClick={() => { setEditing(null); setOpen(true); }}><Plus /> إضافة سؤال</Button>}
      </div>
      <FilterBar
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="ابحث في السؤال أو الجواب..."
        values={filters}
        onValueChange={setF}
        filters={[
          { key: "category", label: "التصنيف", options: categories.map((c) => ({ label: c, value: c })) },
          { key: "status", label: "الحالة", options: [{ label: "منشور", value: "true" }, { label: "مخفي", value: "false" }] },
        ]}
      />
      {(() => {
        const filtered = applyFilters(items, query, ["question", "answer"], {
          category: { value: filters.category, getter: (f) => f.category },
          status: { value: filters.status, getter: (f) => String(f.published) },
        });
        return (
      <div className="space-y-3">
        {filtered.map((f) => (
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
                {perm.can_edit && <Button size="icon" variant="ghost" onClick={() => { setEditing(f); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>}
                {perm.can_delete && <Button size="icon" variant="ghost" onClick={() => remove(f.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>}
              </div>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-10">{query ? "لا توجد نتائج مطابقة" : "لا توجد أسئلة"}</p>}
      </div>
        );
      })()}

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
