import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight, Shield, Save, Eye, Pencil, Trash2,
  LayoutDashboard, Video, Users, FileText, ClipboardCheck,
  Music, Gamepad2, MessageSquare, HelpCircle, ChevronDown, BookOpen,
  Search, ChevronsDownUp, ChevronsUpDown, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Perm = { can_view: boolean; can_edit: boolean; can_delete: boolean };

const STAFF_SECTIONS: { id: string; label: string; icon: any; desc: string }[] = [
  { id: "overview", label: "نظرة عامة", icon: LayoutDashboard, desc: "الإحصائيات والتقارير" },
  { id: "videos", label: "الفيديوهات", icon: Video, desc: "إدارة الدروس المرئية" },
  { id: "users", label: "المستخدمون", icon: Users, desc: "إدارة الحسابات والأدوار" },
  { id: "content", label: "المستويات", icon: FileText, desc: "إنشاء وتنظيم المستويات" },
  { id: "quizzes", label: "الاختبارات", icon: ClipboardCheck, desc: "إدارة الاختبارات والأسئلة" },
  { id: "songs", label: "الأغاني", icon: Music, desc: "المحتوى الصوتي للأطفال" },
  { id: "games", label: "الألعاب", icon: Gamepad2, desc: "الألعاب التفاعلية" },
  { id: "testimonials", label: "آراء العملاء", icon: MessageSquare, desc: "شهادات الأهل" },
  { id: "faqs", label: "الأسئلة الشائعة", icon: HelpCircle, desc: "صفحة الأسئلة والأجوبة" },
];

const empty = (): Perm => ({ can_view: false, can_edit: false, can_delete: false });

type LevelData = {
  id: string; title: string; slug: string;
  videos: { id: string; title: string }[];
  songs: { id: string; title: string }[];
  quizzes: { id: string; title: string }[];
  games: { id: string; title: string }[];
};

export default function UserPermissions() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [perms, setPerms] = useState<Record<string, Perm>>({});
  const [levels, setLevels] = useState<LevelData[]>([]);
  const [openLevels, setOpenLevels] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "videos" | "songs" | "quizzes" | "games">("all");
  const [accessFilter, setAccessFilter] = useState<"all" | "enabled" | "disabled">("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const targetIsStaff = roles.includes("admin");

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate("/");
  }, [authLoading, isAdmin, navigate]);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      setLoading(true);
      const [{ data: p }, { data: r }, { data: pm }, { data: lv }, { data: vd }, { data: sg }, { data: qz }, { data: gm }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", userId),
        supabase.from("user_permissions").select("*").eq("user_id", userId),
        supabase.from("levels").select("id,title,slug,sort_order").order("sort_order"),
        supabase.from("videos").select("id,title,level_id,sort_order").order("sort_order"),
        supabase.from("songs").select("id,title,level_id,sort_order").order("sort_order"),
        supabase.from("quizzes").select("id,title,level_id").order("created_at"),
        supabase.from("games").select("id,title,level_id,sort_order").order("sort_order"),
      ]);

      setProfile(p);
      setRoles((r || []).map((x: any) => x.role));

      const map: Record<string, Perm> = {};
      (pm || []).forEach((row: any) => {
        map[row.section] = { can_view: row.can_view, can_edit: row.can_edit, can_delete: row.can_delete };
      });
      setPerms(map);

      const built: LevelData[] = (lv || []).map((L: any) => ({
        id: L.id, title: L.title, slug: L.slug,
        videos: (vd || []).filter((x: any) => x.level_id === L.id),
        songs: (sg || []).filter((x: any) => x.level_id === L.id),
        quizzes: (qz || []).filter((x: any) => x.level_id === L.id),
        games: (gm || []).filter((x: any) => x.level_id === L.id),
      }));
      setLevels(built);
      setLoading(false);
    })();
  }, [userId]);

  const toggle = (section: string, key: keyof Perm) => {
    setPerms((s) => {
      const cur = s[section] || empty();
      const next = { ...cur, [key]: !cur[key] };
      if ((key === "can_edit" || key === "can_delete") && next[key]) next.can_view = true;
      if (key === "can_view" && !next.can_view) { next.can_edit = false; next.can_delete = false; }
      return { ...s, [section]: next };
    });
  };

  const setAll = (section: string, value: boolean) => {
    setPerms((s) => ({ ...s, [section]: { can_view: value, can_edit: value, can_delete: value } }));
  };

  const setView = (section: string, value: boolean) => {
    setPerms((s) => {
      const cur = s[section] || empty();
      return { ...s, [section]: { ...cur, can_view: value, ...(value ? {} : { can_edit: false, can_delete: false }) } };
    });
  };

  // Bulk: enable/disable a whole level + all children (view only for kids)
  const setLevelAccess = (lvl: LevelData, value: boolean) => {
    setPerms((s) => {
      const next = { ...s };
      const ids = [
        `level:${lvl.id}`,
        ...lvl.videos.map(v => `video:${v.id}`),
        ...lvl.songs.map(v => `song:${v.id}`),
        ...lvl.quizzes.map(v => `quiz:${v.id}`),
        ...lvl.games.map(v => `game:${v.id}`),
      ];
      ids.forEach(id => {
        const cur = next[id] || empty();
        next[id] = { ...cur, can_view: value, ...(value ? {} : { can_edit: false, can_delete: false }) };
      });
      return next;
    });
  };

  const save = async () => {
    if (!userId) return;
    setSaving(true);
    let rows: any[];
    if (targetIsStaff) {
      rows = STAFF_SECTIONS.map((s) => ({ user_id: userId, section: s.id, ...(perms[s.id] || empty()) }));
    } else {
      // Persist all keys currently in perms map
      rows = Object.entries(perms).map(([section, v]) => ({ user_id: userId, section, ...v }));
    }
    if (rows.length === 0) { setSaving(false); toast({ title: "لا توجد صلاحيات للحفظ" }); return; }
    const { error } = await supabase
      .from("user_permissions")
      .upsert(rows, { onConflict: "user_id,section" });
    setSaving(false);
    if (error) {
      toast({ title: "❌ فشل الحفظ", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "✅ تم حفظ الصلاحيات بنجاح" });
  };

  if (loading || authLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">جاري التحميل...</div>;
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4" dir="rtl">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" asChild>
            <Link to="/admin?section=users"><ArrowRight className="w-4 h-4" /> رجوع للمستخدمين</Link>
          </Button>
          <Button variant="hero" onClick={save} disabled={saving}>
            <Save className="w-4 h-4" /> {saving ? "جاري الحفظ..." : "حفظ الصلاحيات"}
          </Button>
        </div>

        {/* User card */}
        <Card className="p-6 mb-6 bg-primary-gradient text-primary-foreground">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold">
              {(profile?.full_name?.[0] || "?").toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="font-display text-2xl mb-1">{profile?.full_name || "بدون اسم"}</h1>
              <div className="flex flex-wrap gap-2 text-sm opacity-90 items-center">
                {profile?.age && <span>العمر: {profile.age}</span>}
                <span>الحالة: {profile?.status || "—"}</span>
                {roles.map((r) => <Badge key={r} variant="secondary">{r}</Badge>)}
              </div>
              <p className="text-xs opacity-75 mt-2 font-mono">ID: {userId}</p>
            </div>
          </div>
        </Card>

        {targetIsStaff ? (
          /* ======== STAFF / ADMIN PERMISSIONS ======== */
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="font-display text-xl">صلاحيات الموظفين (لوحة التحكم)</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              حدّد ما يستطيع هذا المشرف فعله في كل قسم من لوحة التحكم.
            </p>

            <div className="space-y-3">
              {STAFF_SECTIONS.map((s) => {
                const Icon = s.icon;
                const p = perms[s.id] || empty();
                const allOn = p.can_view && p.can_edit && p.can_delete;
                return (
                  <div key={s.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/40 transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-primary-soft flex items-center justify-center text-primary shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold">{s.label}</h3>
                        <p className="text-xs text-muted-foreground truncate">{s.desc}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                      <PermBox label="عرض" icon={Eye} checked={p.can_view} onChange={() => toggle(s.id, "can_view")} />
                      <PermBox label="تعديل" icon={Pencil} checked={p.can_edit} onChange={() => toggle(s.id, "can_edit")} />
                      <PermBox label="حذف" icon={Trash2} checked={p.can_delete} onChange={() => toggle(s.id, "can_delete")} />
                      <Button size="sm" variant={allOn ? "outline" : "soft"} onClick={() => setAll(s.id, !allOn)}>
                        {allOn ? "إلغاء الكل" : "تحديد الكل"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        ) : (
          /* ======== KID / USER CONTENT ACCESS ======== */
          (() => {
            const q = search.trim().toLowerCase();
            const matchText = (s: string) => !q || s.toLowerCase().includes(q);
            const filterItems = (items: { id: string; title: string }[]) =>
              items.filter((it) => matchText(it.title));

            const filteredLevels = levels
              .map((lvl) => {
                const videos = filterType === "all" || filterType === "videos" ? filterItems(lvl.videos) : [];
                const songs = filterType === "all" || filterType === "songs" ? filterItems(lvl.songs) : [];
                const quizzes = filterType === "all" || filterType === "quizzes" ? filterItems(lvl.quizzes) : [];
                const games = filterType === "all" || filterType === "games" ? filterItems(lvl.games) : [];
                return { ...lvl, videos, songs, quizzes, games };
              })
              .filter((lvl) => {
                const lvlOn = perms[`level:${lvl.id}`]?.can_view ?? false;
                if (accessFilter === "enabled" && !lvlOn) return false;
                if (accessFilter === "disabled" && lvlOn) return false;
                const hasChildren = lvl.videos.length + lvl.songs.length + lvl.quizzes.length + lvl.games.length > 0;
                if (q || filterType !== "all") {
                  return matchText(lvl.title) || hasChildren;
                }
                return true;
              });

            const expandAll = () => setOpenLevels(new Set(filteredLevels.map((l) => l.id)));
            const collapseAll = () => setOpenLevels(new Set());

            return (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-5 h-5 text-primary" />
                <h2 className="font-display text-xl">صلاحيات المحتوى التعليمي</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                اختر المستويات المتاحة لهذا المستخدم، ثم حدّد المحتوى الذي يمكنه الوصول إليه داخل كل مستوى.
              </p>

              {/* Toolbar: search + filters + expand/collapse */}
              <div className="flex flex-col md:flex-row gap-2 mb-4 p-3 rounded-xl bg-muted/40 border border-border">
                <div className="relative flex-1 min-w-0">
                  <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ابحث عن مستوى أو فيديو أو أغنية..."
                    className="pr-9 pl-9"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label="مسح البحث"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
                  <SelectTrigger className="md:w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل الأنواع</SelectItem>
                    <SelectItem value="videos">الفيديوهات</SelectItem>
                    <SelectItem value="songs">الأغاني</SelectItem>
                    <SelectItem value="quizzes">الاختبارات</SelectItem>
                    <SelectItem value="games">الألعاب</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={accessFilter} onValueChange={(v: any) => setAccessFilter(v)}>
                  <SelectTrigger className="md:w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع المستويات</SelectItem>
                    <SelectItem value="enabled">المفعّلة فقط</SelectItem>
                    <SelectItem value="disabled">غير المفعّلة</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={expandAll} title="توسيع الكل">
                    <ChevronsUpDown className="w-4 h-4" /> توسيع
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={collapseAll} title="طي الكل">
                    <ChevronsDownUp className="w-4 h-4" /> طي
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {filteredLevels.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    {levels.length === 0 ? "لا توجد مستويات متاحة بعد." : "لا توجد نتائج مطابقة للبحث."}
                  </p>
                )}
                {filteredLevels.map((lvl, idx) => {
                  const levelKey = `level:${lvl.id}`;
                  const lvlOn = perms[levelKey]?.can_view ?? false;
                  const isOpen = openLevels.has(lvl.id) || !!q;
                  const childrenCount = lvl.videos.length + lvl.songs.length + lvl.quizzes.length + lvl.games.length;
                  const toggleOpen = () => {
                    setOpenLevels((s) => {
                      const n = new Set(s);
                      if (n.has(lvl.id)) n.delete(lvl.id); else n.add(lvl.id);
                      return n;
                    });
                  };
                  return (
                    <div key={lvl.id} className="rounded-xl border border-border overflow-hidden">
                      <div className={`flex items-center gap-3 p-4 ${lvlOn ? "bg-primary-soft/40" : "bg-background"}`}>
                        <div className="w-10 h-10 rounded-lg bg-primary-gradient text-primary-foreground flex items-center justify-center font-bold shrink-0">
                          {idx + 1}
                        </div>
                        <button onClick={toggleOpen} className="flex-1 text-right min-w-0">
                          <h3 className="font-bold truncate">{lvl.title}</h3>
                          <p className="text-xs text-muted-foreground">{childrenCount} عنصر • {lvl.videos.length} فيديو، {lvl.songs.length} أغنية، {lvl.quizzes.length} اختبار، {lvl.games.length} لعبة</p>
                        </button>
                        <div className="flex items-center gap-3 shrink-0">
                          <label className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">السماح بالمستوى</span>
                            <Switch checked={lvlOn} onCheckedChange={(v) => setLevelAccess(lvl, v)} />
                          </label>
                          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                        </div>
                      </div>

                      {isOpen && (
                        <div className="p-4 border-t border-border bg-muted/30 space-y-4">
                          {!lvlOn && (
                            <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 rounded-md p-2">
                              ⚠️ المستوى غير مفعّل — فعّله أعلاه ليتمكن المستخدم من الوصول لهذا المحتوى.
                            </p>
                          )}
                          <ContentGroup title="الفيديوهات" icon={Video} items={lvl.videos} prefix="video" perms={perms} setView={setView} />
                          <ContentGroup title="الأغاني" icon={Music} items={lvl.songs} prefix="song" perms={perms} setView={setView} />
                          <ContentGroup title="الاختبارات" icon={ClipboardCheck} items={lvl.quizzes} prefix="quiz" perms={perms} setView={setView} />
                          <ContentGroup title="الألعاب" icon={Gamepad2} items={lvl.games} prefix="game" perms={perms} setView={setView} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
            );
          })()
        )}
      </div>
    </div>
  );
}

const PermBox = ({ label, icon: Icon, checked, onChange }: { label: string; icon: any; checked: boolean; onChange: () => void }) => (
  <label className="flex items-center gap-2 cursor-pointer select-none">
    <Checkbox checked={checked} onCheckedChange={onChange} />
    <Icon className="w-4 h-4 text-muted-foreground" />
    <span className="text-sm font-medium">{label}</span>
  </label>
);

const ContentGroup = ({
  title, icon: Icon, items, prefix, perms, setView,
}: {
  title: string; icon: any; items: { id: string; title: string }[]; prefix: string;
  perms: Record<string, Perm>; setView: (section: string, value: boolean) => void;
}) => {
  if (items.length === 0) return null;
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-primary" />
        <h4 className="font-bold text-sm">{title} <span className="text-muted-foreground font-normal">({items.length})</span></h4>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map((it) => {
          const key = `${prefix}:${it.id}`;
          const on = perms[key]?.can_view ?? false;
          return (
            <label key={it.id} className="flex items-center gap-3 p-2 rounded-lg bg-background border border-border cursor-pointer hover:border-primary/40">
              <Switch checked={on} onCheckedChange={(v) => setView(key, v)} />
              <span className="text-sm flex-1 truncate">{it.title}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};
