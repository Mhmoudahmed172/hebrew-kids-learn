import { Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

type Variant = "full" | "banner" | "inline";

interface Props {
  variant?: Variant;
  title?: string;
  message?: string;
  /** Optional admin email override (defaults to support mailto) */
  adminEmail?: string;
  /** Optional context appended to the email subject (e.g., content title) */
  contextLabel?: string;
}

const DEFAULT_EMAIL = "support@example.com";

const buildMailto = (email: string, contextLabel?: string) => {
  const subject = encodeURIComponent(
    contextLabel ? `طلب صلاحية وصول — ${contextLabel}` : "طلب صلاحية وصول للمحتوى"
  );
  const body = encodeURIComponent(
    `السلام عليكم،\n\nأرغب في الحصول على صلاحية للوصول إلى${contextLabel ? `: ${contextLabel}` : " المحتوى المقفل"}.\n\nشكراً لكم.`
  );
  return `mailto:${email}?subject=${subject}&body=${body}`;
};

const LockedContent = ({
  variant = "full",
  title = "المحتوى مقفل",
  message = "لا تملك صلاحية الوصول إلى هذا المحتوى. يمكنك التواصل مع المشرف لطلب الصلاحية.",
  adminEmail = DEFAULT_EMAIL,
  contextLabel,
}: Props) => {
  const href = buildMailto(adminEmail, contextLabel);

  if (variant === "banner") {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900 rounded-2xl px-4 py-3">
        <span className="inline-flex items-center gap-2 font-bold">
          <Lock className="w-4 h-4" /> {title}
        </span>
        <span className="text-amber-700/90 dark:text-amber-300/80">{message}</span>
        <Button asChild size="sm" variant="outline" className="shrink-0">
          <a href={href}><Mail className="w-4 h-4" /> تواصل مع المشرف</a>
        </Button>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
        <Lock className="w-3 h-3" />
        <span>{message}</span>
        <a href={href} className="text-primary font-bold hover:underline inline-flex items-center gap-1">
          <Mail className="w-3 h-3" /> تواصل
        </a>
      </div>
    );
  }

  // full
  return (
    <div className="w-full h-full min-h-[260px] flex flex-col items-center justify-center gap-4 text-center p-6 bg-gradient-to-b from-muted/40 to-muted/10">
      <div className="w-16 h-16 rounded-2xl bg-background border border-border flex items-center justify-center shadow-soft">
        <Lock className="w-8 h-8 text-muted-foreground" />
      </div>
      <div>
        <h3 className="font-display text-xl mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-md">{message}</p>
      </div>
      <Button asChild variant="hero">
        <a href={href}><Mail className="w-4 h-4" /> تواصل مع المشرف</a>
      </Button>
    </div>
  );
};

export default LockedContent;
