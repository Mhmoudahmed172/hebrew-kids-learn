import { Clock, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useParentalGuard } from "@/hooks/useParentalGuard";

/**
 * يلف المحتوى ويعرض شاشة قفل إذا تجاوز الطفل الحد اليومي.
 */
export const ParentalLimitGate = ({ children }: { children: React.ReactNode }) => {
  const { limitReached, usedMinutes, limitMinutes, loading } = useParentalGuard();
  if (loading) return <>{children}</>;
  if (!limitReached) return <>{children}</>;
  return (
    <main dir="rtl" className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md text-center bg-card border-2 border-border rounded-3xl p-10">
        <div className="w-20 h-20 mx-auto rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <Lock className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="font-display text-3xl mb-3">انتهى وقت اللعب اليوم 🌙</h1>
        <p className="text-muted-foreground mb-2">
          لقد استخدمت <span className="font-bold text-foreground">{usedMinutes} دقيقة</span> من أصل <span className="font-bold">{limitMinutes}</span>.
        </p>
        <p className="text-sm text-muted-foreground mb-6">عُد غداً لمواصلة التعلم! أو اطلب من والديك زيادة الحد.</p>
        <div className="flex items-center justify-center gap-2 text-sm text-primary mb-6">
          <Clock className="w-4 h-4" /> يُعاد الحد عند منتصف الليل
        </div>
        <Button variant="outline" asChild><Link to="/profile">مشاهدة شاراتي</Link></Button>
      </div>
    </main>
  );
};
