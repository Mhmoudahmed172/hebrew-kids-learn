import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight, Shield, Save, Eye, Pencil, Trash2,
  LayoutDashboard, Video, Users, FileText, ClipboardCheck,
  Music, Gamepad2, MessageSquare, HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Perm = { can_view: boolean; can_edit: boolean; can_delete: boolean };

const SECTIONS: { id: string; label: string; icon: any; desc: string }[] = [
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

export default function UserPermissions() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [perms, setPerms] = useState<Record<string, Perm>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate("/");
  }, [authLoading, isAdmin, navigate]);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      setLoading(true);
      const [{ data: p }, { data: r }, { data: pm }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", userId),
        supabase.from("user_permissions").select("*").eq("user_id", userId),
      ]);
      setProfile(p);
      setRoles((r || []).map((x: any) => x.role));
      const map: Record<string, Perm> = {};
      SECTIONS.forEach((s) => { map[s.id] = empty(); });
      (pm || []).forEach((row: any) => {
        map[row.section] = {
          can_view: row.can_view, can_edit: row.can_edit, can_delete: row.can_delete,
        };
      });
      setPerms(map);
      setLoading(false);
    })();
  }, [userId]);

  const toggle = (section: string, key: keyof Perm) => {
    setPerms((s) => {
      const cur = s[section] || empty();
      const next = { ...cur, [key]: !cur[key] };
      // إذا فُعّل تعديل/حذف، فعّل العرض تلقائياً
      if ((key === "can_edit" || key === "can_delete") && next[key]) next.can_view = true;
      // إذا أُلغي العرض، ألغِ الباقي
      if (key === "can_view" && !next.can_view) { next.can_edit = false; next.can_delete = false; }
      return { ...s, [section]: next };
    });
  };

  const setAll = (section: string, value: boolean) => {
    setPerms((s) => ({ ...s, [section]: { can_view: value, can_edit: value, can_delete: value } }));
  };

  const save = async () => {
    if (!userId) return;
    setSaving(true);
    const rows = SECTIONS.map((s) => ({
      user_id: userId,
      section: s.id,
      ...(perms[s.id] || empty()),
    }));
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
              <div className="flex flex-wrap gap-2 text-sm opacity-90">
                {profile?.age && <span>العمر: {profile.age}</span>}
                <span>الحالة: {profile?.status || "—"}</span>
                {roles.map((r) => <Badge key={r} variant="secondary">{r}</Badge>)}
              </div>
              <p className="text-xs opacity-75 mt-2 font-mono">ID: {userId}</p>
            </div>
          </div>
        </Card>

        {/* Permissions */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl">الصلاحيات حسب الأقسام</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            حدّد ما يستطيع هذا المستخدم فعله في كل قسم من لوحة التحكم.
          </p>

          <div className="space-y-3">
            {SECTIONS.map((s) => {
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
