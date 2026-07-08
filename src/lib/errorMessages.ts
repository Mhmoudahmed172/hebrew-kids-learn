// Translates common backend/auth error messages to Arabic.
// Falls back to a generic Arabic message if no match is found.

const MAP: { pattern: RegExp; ar: string }[] = [
  // Auth - password strength
  { pattern: /password is known to be weak|weak.*password|pwned/i, ar: "كلمة المرور ضعيفة أو مسرّبة، اختاري كلمة مرور أقوى." },
  { pattern: /password should be at least/i, ar: "كلمة المرور قصيرة جداً، يجب أن تكون 6 أحرف على الأقل." },
  { pattern: /password.*at least.*characters/i, ar: "كلمة المرور قصيرة جداً." },
  { pattern: /new password should be different/i, ar: "كلمة المرور الجديدة يجب أن تكون مختلفة عن القديمة." },

  // Auth - credentials
  { pattern: /invalid login credentials|invalid.*credentials/i, ar: "البريد الإلكتروني أو كلمة المرور غير صحيحة." },
  { pattern: /email not confirmed/i, ar: "لم يتم تفعيل البريد الإلكتروني بعد، افحصي بريدك." },
  { pattern: /user not found/i, ar: "لا يوجد حساب مرتبط بهذا البريد." },
  { pattern: /user already registered|already registered|already been registered/i, ar: "هذا البريد مسجّل مسبقاً." },
  { pattern: /email address.*invalid|invalid email/i, ar: "البريد الإلكتروني غير صالح." },
  { pattern: /signup.*disabled|signups.*disabled/i, ar: "التسجيل مغلق حالياً." },

  // Tokens / OTP
  { pattern: /token has expired|otp.*expired|expired.*token/i, ar: "انتهت صلاحية الرابط، اطلبي رابطاً جديداً." },
  { pattern: /invalid.*token|token.*invalid/i, ar: "الرابط غير صالح، اطلبي رابطاً جديداً." },
  { pattern: /otp.*invalid|invalid.*otp/i, ar: "رمز التحقق غير صحيح." },

  // Rate limiting
  { pattern: /rate limit|too many requests|for security purposes/i, ar: "محاولات كثيرة، الرجاء المحاولة بعد قليل." },

  // Network
  { pattern: /network|failed to fetch|networkerror/i, ar: "مشكلة في الاتصال بالإنترنت، حاولي مرة أخرى." },

  // Permissions / RLS
  { pattern: /row.level security|rls|permission denied|not authorized|unauthorized/i, ar: "ليس لديكِ صلاحية لتنفيذ هذا الإجراء." },
  { pattern: /jwt.*expired|session.*expired/i, ar: "انتهت الجلسة، سجّلي الدخول من جديد." },

  // DB constraints
  { pattern: /duplicate key|already exists|unique constraint/i, ar: "هذا العنصر موجود مسبقاً." },
  { pattern: /violates foreign key/i, ar: "لا يمكن تنفيذ العملية بسبب ارتباط بعناصر أخرى." },
  { pattern: /not null|null value/i, ar: "بعض الحقول المطلوبة فارغة." },
  { pattern: /not found/i, ar: "العنصر المطلوب غير موجود." },

  // Storage
  { pattern: /payload too large|file.*too large/i, ar: "حجم الملف كبير جداً." },
  { pattern: /invalid.*mime|unsupported.*type/i, ar: "نوع الملف غير مدعوم." },
];

export function translateError(err: unknown, fallback = "حدث خطأ غير متوقع، حاولي مرة أخرى."): string {
  const raw = (() => {
    if (!err) return "";
    if (typeof err === "string") return err;
    if (typeof err === "object") {
      const anyErr = err as any;
      return anyErr.message || anyErr.error_description || anyErr.msg || anyErr.details || "";
    }
    return String(err);
  })();

  if (!raw) return fallback;
  for (const { pattern, ar } of MAP) {
    if (pattern.test(raw)) return ar;
  }
  // If the message is already Arabic, keep it
  if (/[\u0600-\u06FF]/.test(raw)) return raw;
  return fallback;
}
