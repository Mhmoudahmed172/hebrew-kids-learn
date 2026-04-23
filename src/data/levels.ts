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
  unlockedCount = 99,
): Lesson[] =>
  items.map((it, i) => ({
    id: `${type}-${i}`,
    type,
    title: it.title,
    duration: it.duration,
    description: it.description,
    completed: i < Math.max(0, unlockedCount - 2),
    locked: i >= unlockedCount,
    stars: i < unlockedCount - 2 ? 3 : i === unlockedCount - 2 ? 2 : 0,
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
    ], 4),
    games: makeLessons("game", [
      { title: "مطابقة الحروف", duration: "لعبة", description: "طابق الحرف العبري مع نطقه" },
      { title: "لعبة الذاكرة", duration: "لعبة", description: "اقلب البطاقات وتذكّر الحروف" },
      { title: "ترتيب الحروف", duration: "لعبة" },
      { title: "بناء الجمل البسيطة", duration: "لعبة" },
      { title: "اختر الكلمة الصحيحة", duration: "لعبة" },
      { title: "اسمع واختر الإجابة", duration: "لعبة" },
    ], 4),
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
    ], 2),
    games: makeLessons("game", [
      { title: "مطابقة الصورة بالكلمة", duration: "لعبة" },
      { title: "ذاكرة المفردات", duration: "لعبة" },
      { title: "ترتيب أحرف الكلمة", duration: "لعبة" },
    ], 2),
    songs: makeLessons("song", [
      { title: "أغنية الألوان", duration: "2:40" },
      { title: "أغنية الطعام اللذيذ", duration: "3:00" },
    ], 1),
    quizzes: makeLessons("quiz", [
      { title: "اختبار المفردات", duration: "10 أسئلة" },
      { title: "اختبار المستوى النهائي", duration: "15 سؤال" },
    ], 1),
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
    ], 1),
    games: makeLessons("game", [{ title: "بناء الجمل", duration: "لعبة" }], 1),
    
    songs: makeLessons("song", [{ title: "أغنية الجمل اليومية", duration: "3:00" }], 1),
    quizzes: makeLessons("quiz", [{ title: "اختبار الجمل", duration: "10 أسئلة" }], 1),
  },
  {
    n: 4,
    slug: "conversations",
    title: "المحادثات",
    subtitle: "تحدّث بالعبرية في مواقف يومية",
    icon: "ד",
    color: "from-pink to-accent",
    unlocked: false,
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
    videos: [],
    games: [],
    songs: [],
    quizzes: [],
  },
  {
    n: 5,
    slug: "reading",
    title: "القراءة",
    subtitle: "اقرأ نصوصاً عبرية كاملة",
    icon: "ה",
    color: "from-accent to-mint",
    unlocked: false,
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
    videos: [],
    games: [],
    songs: [],
    quizzes: [],
  },
];

export const getLevelBySlug = (slug: string) => levels.find((l) => l.slug === slug);
