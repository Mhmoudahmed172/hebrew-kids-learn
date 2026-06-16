export type LessonType = "video" | "game" | "song" | "quiz";

export interface Lesson {
  id: string;
  type: LessonType;
  title: string;
  duration: string;
  completed?: boolean;
  locked?: boolean;
  stars?: number;
  description?: string;
  videoUrl?: string;
}

export interface Level {
  n: number;
  slug: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  unlocked: boolean;
  stars: number;
  totalLessons: number;
  progress: number;
  points: number;
  badges: { name: string; emoji: string; earned: boolean }[];
  videos: Lesson[];
  games: Lesson[];
  songs: Lesson[];
  quizzes: Lesson[];
}

const makeLessons = (
  type: LessonType,
  items: { title: string; duration: string; description?: string }[],
  completedCount = 0,
): Lesson[] =>
  items.map((it, i) => ({
    id: `${type}-${i}`,
    type,
    title: it.title,
    duration: it.duration,
    description: it.description,
    completed: i < completedCount,
    locked: false,
    stars: i < completedCount ? 3 : i === completedCount ? 1 : 0,
  }));

export const levels: Level[] = [
  {
    n: 1,
    slug: "hebrew-letters",
    title: "الحروف العبرية",
    subtitle: "تعرّف على حروف الأبجدية العبرية مع المرح",
    icon: "א",
    color: "from-mint to-secondary",
    unlocked: true,
    stars: 3,
    totalLessons: 12,
    progress: 75,
    points: 1240,
    badges: [
      { name: "المستكشف", emoji: "🧭", earned: true },
      { name: "نجم الحروف", emoji: "⭐", earned: true },
      { name: "بطل القراءة", emoji: "📖", earned: false },
      { name: "ملك العبرية", emoji: "👑", earned: false },
    ],
    videos: makeLessons("video", [
      { title: "تعرّف على حرف Aleph א", duration: "4:20", description: "أول حروف الأبجدية العبرية" },
      { title: "حرف Bet ב بالحركات", duration: "3:45" },
      { title: "حرف Gimel ג وقصته", duration: "5:10" },
      { title: "حرف Dalet ד مع أمثلة", duration: "4:30" },
      { title: "مراجعة الحروف الأربعة", duration: "6:00" },
    ], 3),
    games: makeLessons("game", [
      { title: "مطابقة الحروف", duration: "لعبة", description: "طابق الحرف العبري مع نطقه" },
      { title: "لعبة الذاكرة", duration: "لعبة", description: "اقلب البطاقات وتذكّر الحروف" },
      { title: "ترتيب الحروف", duration: "لعبة" },
      { title: "بناء الجمل البسيطة", duration: "لعبة" },
      { title: "اختر الكلمة الصحيحة", duration: "لعبة" },
      { title: "اسمع واختر الإجابة", duration: "لعبة" },
    ], 3),
    songs: makeLessons("song", [
      { title: "أغنية الأبجدية", duration: "2:50", description: "تعلّم الحروف بالغناء" },
      { title: "أنشودة الحروف الملونة", duration: "3:10" },
      { title: "أغنية الأرقام بالعبرية", duration: "2:30" },
    ], 2),
    quizzes: makeLessons("quiz", [
      { title: "اختبار الحروف الأولى", duration: "10 أسئلة", description: "اختر الإجابة الصحيحة" },
      { title: "اختبار التوصيل", duration: "8 أسئلة" },
      { title: "اختبار الاستماع", duration: "6 أسئلة" },
      { title: "الاختبار النهائي للمستوى", duration: "20 سؤال" },
    ], 2),
  },
  {
    n: 2,
    slug: "first-words",
    title: "الكلمات الأولى",
    subtitle: "أول كلمات عبرية يتعلمها طفلك بسهولة",
    icon: "ב",
    color: "from-secondary to-primary",
    unlocked: true,
    stars: 2,
    totalLessons: 15,
    progress: 40,
    points: 680,
    badges: [
      { name: "المبتدئ", emoji: "🌱", earned: true },
      { name: "كاسب الكلمات", emoji: "💬", earned: true },
      { name: "بطل المفردات", emoji: "🏆", earned: false },
      { name: "ملك المحادثة", emoji: "👑", earned: false },
    ],
    videos: makeLessons("video", [
      { title: "كلمات الأسرة بالعبرية", duration: "5:00" },
      { title: "كلمات الألوان", duration: "4:15" },
      { title: "كلمات الطعام", duration: "5:30" },
      { title: "كلمات الحيوانات", duration: "4:45" },
    ], 2),
    games: makeLessons("game", [
      { title: "مطابقة الصورة بالكلمة", duration: "لعبة" },
      { title: "ذاكرة المفردات", duration: "لعبة" },
      { title: "ترتيب أحرف الكلمة", duration: "لعبة" },
    ], 1),
    songs: makeLessons("song", [
      { title: "أغنية الألوان", duration: "2:40" },
      { title: "أغنية الطعام اللذيذ", duration: "3:00" },
    ], 1),
    quizzes: makeLessons("quiz", [
      { title: "اختبار المفردات", duration: "10 أسئلة" },
      { title: "اختبار المستوى النهائي", duration: "15 سؤال" },
    ], 0),
  },
  {
    n: 3,
    slug: "simple-sentences",
    title: "الجمل البسيطة",
    subtitle: "كوّن جملاً عبرية بسيطة وممتعة",
    icon: "ג",
    color: "from-primary to-pink",
    unlocked: true,
    stars: 1,
    totalLessons: 18,
    progress: 15,
    points: 220,
    badges: [
      { name: "بانٍ الجمل", emoji: "🧱", earned: true },
      { name: "نحوي صغير", emoji: "✍️", earned: false },
      { name: "محاور ماهر", emoji: "🗣️", earned: false },
      { name: "خبير الجمل", emoji: "👑", earned: false },
    ],
    videos: makeLessons("video", [
      { title: "تكوين جملة بسيطة", duration: "5:20" },
      { title: "السؤال والجواب", duration: "4:50" },
      { title: "ضمائر الملكية", duration: "6:00" },
    ], 1),
    games: makeLessons("game", [
      { title: "بناء الجمل", duration: "لعبة" },
      { title: "رتّب الكلمات", duration: "لعبة" },
    ], 0),
    songs: makeLessons("song", [
      { title: "أغنية الجمل اليومية", duration: "3:00" },
      { title: "أنشودة السؤال والجواب", duration: "2:45" },
    ], 0),
    quizzes: makeLessons("quiz", [
      { title: "اختبار الجمل", duration: "10 أسئلة" },
      { title: "الاختبار النهائي", duration: "15 سؤال" },
    ], 0),
  },
  {
    n: 4,
    slug: "conversations",
    title: "المحادثات",
    subtitle: "تحدّث بالعبرية في مواقف يومية",
    icon: "ד",
    color: "from-pink to-accent",
    unlocked: true,
    stars: 0,
    totalLessons: 20,
    progress: 0,
    points: 0,
    badges: [
      { name: "محاور مبتدئ", emoji: "💬", earned: false },
      { name: "متحدث واثق", emoji: "🎤", earned: false },
      { name: "خبير المحادثة", emoji: "🌟", earned: false },
      { name: "ملك العبرية", emoji: "👑", earned: false },
    ],
    videos: makeLessons("video", [
      { title: "التحية والسلام", duration: "4:30" },
      { title: "التعريف بالنفس", duration: "5:15" },
      { title: "في المطعم", duration: "6:00" },
      { title: "في السوق", duration: "5:40" },
    ], 0),
    games: makeLessons("game", [
      { title: "محادثة تفاعلية", duration: "لعبة" },
      { title: "اختر الرد المناسب", duration: "لعبة" },
    ], 0),
    songs: makeLessons("song", [
      { title: "أغنية التحية", duration: "2:30" },
      { title: "أنشودة الأصدقاء", duration: "3:10" },
    ], 0),
    quizzes: makeLessons("quiz", [
      { title: "اختبار المحادثة", duration: "12 سؤال" },
    ], 0),
  },
  {
    n: 5,
    slug: "reading",
    title: "القراءة",
    subtitle: "اقرأ نصوصاً عبرية كاملة",
    icon: "ה",
    color: "from-accent to-mint",
    unlocked: true,
    stars: 0,
    totalLessons: 22,
    progress: 0,
    points: 0,
    badges: [
      { name: "قارئ صغير", emoji: "📖", earned: false },
      { name: "قارئ متقدم", emoji: "📚", earned: false },
      { name: "خبير النصوص", emoji: "🎓", earned: false },
      { name: "أسطورة القراءة", emoji: "👑", earned: false },
    ],
    videos: makeLessons("video", [
      { title: "قراءة قصة قصيرة", duration: "6:20" },
      { title: "قراءة الأخبار البسيطة", duration: "7:00" },
      { title: "قصص الأطفال بالعبرية", duration: "8:15" },
    ], 0),
    games: makeLessons("game", [
      { title: "اقرأ واختر الصورة", duration: "لعبة" },
      { title: "أكمل النص", duration: "لعبة" },
    ], 0),
    songs: makeLessons("song", [
      { title: "أنشودة القارئ الصغير", duration: "3:00" },
    ], 0),
    quizzes: makeLessons("quiz", [
      { title: "اختبار الفهم القرائي", duration: "15 سؤال" },
      { title: "الاختبار الشامل", duration: "25 سؤال" },
    ], 0),
  },
  {
    n: 6,
    slug: "master-and-create",
    title: "أتقن وأبدع",
    subtitle: "أتقن اللغة العبرية وأبدع باستخدامها",
    icon: "ו",
    color: "from-mint to-primary",
    unlocked: false,
    stars: 0,
    totalLessons: 24,
    progress: 0,
    points: 0,
    badges: [
      { name: "متقن اللغة", emoji: "🏆", earned: false },
      { name: "مبدع العبرية", emoji: "💡", earned: false },
      { name: "خبير التعبير", emoji: "🎤", earned: false },
      { name: "ملك العبرية", emoji: "👑", earned: false },
    ],
    videos: makeLessons("video", [
      { title: "التعبير الكتابي المتقدم", duration: "7:00" },
      { title: "النحو العبري العميق", duration: "8:30" },
      { title: "أدب الأطفال بالعبرية", duration: "9:00" },
    ], 0),
    games: makeLessons("game", [
      { title: "ألغاز اللغة العبرية", duration: "لعبة" },
      { title: "بناء قصتك الخاصة", duration: "لعبة" },
    ], 0),
    songs: makeLessons("song", [
      { title: "أغنية الإبداع", duration: "3:30" },
      { title: "أنشودة التفوق", duration: "3:00" },
    ], 0),
    quizzes: makeLessons("quiz", [
      { title: "اختبار الإتقان", duration: "20 سؤال" },
      { title: "الاختبار النهائي للمستوى", duration: "30 سؤال" },
    ], 0),
  },
  {
    n: 7,
    slug: "hebrew-star",
    title: "نجم العبرية",
    subtitle: "كن نجم اللغة العبرية وتحدث بطلاقة",
    icon: "ז",
    color: "from-primary to-pink",
    unlocked: false,
    stars: 0,
    totalLessons: 26,
    progress: 0,
    points: 0,
    badges: [
      { name: "نجم العبرية", emoji: "🌟", earned: false },
      { name: "متحدث بطلاقة", emoji: "🗣️", earned: false },
      { name: "سفير اللغة", emoji: "🌍", earned: false },
      { name: "أسطورة العبرية", emoji: "👑", earned: false },
    ],
    videos: makeLessons("video", [
      { title: "محادثات متقدمة بالعبرية", duration: "8:00" },
      { title: "العبرية في الحياة اليومية", duration: "9:30" },
      { title: "الأدب والشعر العبري", duration: "10:00" },
    ], 0),
    games: makeLessons("game", [
      { title: "محاكاة الحياة اليومية", duration: "لعبة" },
      { title: "مسابقة نجم العبرية", duration: "لعبة" },
    ], 0),
    songs: makeLessons("song", [
      { title: "أغنية النجم", duration: "4:00" },
      { title: "أنشودة الطلاقة", duration: "3:30" },
    ], 0),
    quizzes: makeLessons("quiz", [
      { title: "اختبار الطلاقة", duration: "25 سؤال" },
      { title: "الاختبار النهائي الكبير", duration: "40 سؤال" },
    ], 0),
  },
];

export const getLevelBySlug = (slug: string) => levels.find((l) => l.slug === slug);
