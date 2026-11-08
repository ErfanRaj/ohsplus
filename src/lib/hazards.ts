export type HazardCategory = "mechanical" | "electrical" | "chemical" | "fire" | "ergonomic" | "housekeeping";
export type Risk = "high" | "medium" | "low";

export interface Hazard {
  id: string;
  x: number; // percent from left
  y: number; // percent from top
  r: number; // hit radius, percent of width
  title: string;
  category: HazardCategory;
  risk: Risk;
  consequence: string;
  hint: string;
  controls: { level: "حذف/جایگزینی" | "کنترل مهندسی" | "کنترل مدیریتی" | "تجهیزات حفاظت فردی"; text: string }[];
  standards: string[];
}

export const CATEGORY_LABEL: Record<HazardCategory, string> = {
  mechanical: "مکانیکی", electrical: "الکتریکی", chemical: "شیمیایی/بهداشتی",
  fire: "حریق", ergonomic: "ارگونومیک", housekeeping: "خانه‌داری صنعتی",
};
export const RISK_LABEL: Record<Risk, string> = { high: "ریسک بالا", medium: "ریسک متوسط", low: "ریسک پایین" };

export const WORKSHOP_HAZARDS: Hazard[] = [
  {
    id: "welding", x: 7, y: 25, r: 7, title: "جوشکاری بدون شیلد صورت و تهویه موضعی",
    category: "chemical", risk: "high",
    consequence: "استنشاق فیوم فلزات (منگنز، کروم شش‌ظرفیتی)، تب فیوم فلزی، سوختگی قرنیه و پوست بر اثر پرتو UV.",
    hint: "به نور آبی و دود سمت چپ کارگاه دقت کنید.",
    controls: [
      { level: "کنترل مهندسی", text: "نصب هود و بازوی مکش موضعی نزدیک نقطه جوش (Ventilation+ برای محاسبه)." },
      { level: "کنترل مهندسی", text: "پرده یا پارتیشن جوشکاری برای محافظت افراد مجاور." },
      { level: "کنترل مدیریتی", text: "پایش دوره‌ای فیوم در منطقه تنفسی و معاینات شغلی." },
      { level: "تجهیزات حفاظت فردی", text: "ماسک جوشکاری با فیلتر مناسب شدت جریان، دستکش و پیش‌بند چرمی، رسپیراتور در صورت نیاز." },
    ],
    standards: ["OSHA 29 CFR 1910.252", "OSHA 29 CFR 1910.133", "ANSI Z49.1", "آیین‌نامه حفاظتی جوشکاری — وزارت کار"],
  },
  {
    id: "cylinders", x: 32, y: 35, r: 6, title: "سیلندرهای گاز بدون زنجیر مهار و کلاهک",
    category: "fire", risk: "high",
    consequence: "سقوط سیلندر، شکستن شیر و تبدیل آن به پرتابه؛ نشت اکسیژن/استیلن و انفجار در کنار جرقه جوشکاری.",
    hint: "دو سیلندر سبز و قرمز نزدیک ستون را ببینید.",
    controls: [
      { level: "کنترل مهندسی", text: "مهار سیلندرها با زنجیر یا بست در دو سوم ارتفاع، روی رک مخصوص." },
      { level: "کنترل مهندسی", text: "جداسازی اکسیژن و گاز سوختنی حداقل 6 متر یا دیوار مقاوم به حریق." },
      { level: "کنترل مدیریتی", text: "نصب کلاهک هنگام عدم استفاده، شیر یکطرفه (فلاش‌بک ارستر) و بازرسی نشتی." },
    ],
    standards: ["OSHA 29 CFR 1910.253(b)", "OSHA 29 CFR 1910.101", "CGA P-1"],
  },
  {
    id: "grinder", x: 53, y: 30, r: 6, title: "سنگ رومیزی بدون حفاظ چشمی و تکیه‌گاه تنظیم‌شده",
    category: "mechanical", risk: "high",
    consequence: "پرتاب ذرات و شکستن سنگ، آسیب شدید چشم، گیر کردن انگشت بین سنگ و تکیه‌گاه.",
    hint: "دستگاه دو سنگه وسط تصویر را بررسی کنید.",
    controls: [
      { level: "کنترل مهندسی", text: "نصب حفاظ شفاف چشمی و حفاظ جانبی سنگ." },
      { level: "کنترل مهندسی", text: "فاصله تکیه‌گاه تا سنگ حداکثر 3 میلی‌متر و فاصله زبانه بالایی حداکثر 6 میلی‌متر." },
      { level: "کنترل مدیریتی", text: "تست صدا (Ring test) قبل از نصب سنگ و رعایت دور مجاز." },
      { level: "تجهیزات حفاظت فردی", text: "عینک ایمنی یا شیلد صورت." },
    ],
    standards: ["OSHA 29 CFR 1910.215", "ANSI B7.1"],
  },
  {
    id: "lifting", x: 77, y: 30, r: 6, title: "حمل دستی بار سنگین با کمر خمیده",
    category: "ergonomic", risk: "medium",
    consequence: "کمردرد، فتق دیسک و اختلالات اسکلتی-عضلانی تجمعی.",
    hint: "کارگری که در عمق کارگاه خم شده است.",
    controls: [
      { level: "حذف/جایگزینی", text: "استفاده از جرثقیل سقفی، بالابر یا ترولی برای قطعات سنگین." },
      { level: "کنترل مهندسی", text: "قرار دادن قطعات روی میز هم‌سطح کمر." },
      { level: "کنترل مدیریتی", text: "آموزش روش صحیح حمل و ارزیابی با NIOSH Lifting Equation." },
    ],
    standards: ["NIOSH Revised Lifting Equation", "ISO 11228-1"],
  },
  {
    id: "cable", x: 70, y: 73, r: 6, title: "کابل برق زخمی در مسیر تردد",
    category: "electrical", risk: "high",
    consequence: "برق‌گرفتگی، اتصال کوتاه و حریق؛ گیر کردن پا و لغزش.",
    hint: "روکش کابل روی زمین آسیب دیده است.",
    controls: [
      { level: "حذف/جایگزینی", text: "تعویض کابل آسیب‌دیده؛ وصله‌کاری با چسب ممنوع است." },
      { level: "کنترل مهندسی", text: "عبور کابل از کانال یا کاور محافظ کف و استفاده از کلید محافظ جان (RCD)." },
      { level: "کنترل مدیریتی", text: "بازرسی دوره‌ای تجهیزات برقی سیار با برچسب تاریخ." },
    ],
    standards: ["OSHA 29 CFR 1910.334", "OSHA 29 CFR 1910.305(g)", "آیین‌نامه حفاظتی تأسیسات الکتریکی"],
  },
  {
    id: "extinguisher", x: 91, y: 57, r: 6, title: "دسترسی مسدود به خاموش‌کننده آتش",
    category: "fire", risk: "medium",
    consequence: "تأخیر در اطفای حریق اولیه و گسترش آتش.",
    hint: "کپسول قرمز سمت راست پشت کارتن‌ها.",
    controls: [
      { level: "کنترل مهندسی", text: "نصب روی دیوار با ارتفاع مناسب و علامت‌گذاری محدوده آزاد جلوی آن." },
      { level: "کنترل مدیریتی", text: "بازرسی ماهانه، برچسب شارژ و آموزش استفاده (PASS)." },
      { level: "کنترل مدیریتی", text: "ممنوعیت انبارش مواد در مسیر تجهیزات اضطراری." },
    ],
    standards: ["OSHA 29 CFR 1910.157", "NFPA 10"],
  },
  {
    id: "oil", x: 47, y: 87, r: 7, title: "نشت روغن روی کف کارگاه",
    category: "housekeeping", risk: "medium",
    consequence: "لغزش و سقوط هم‌سطح؛ افزایش بار حریق.",
    hint: "لکه تیره و براق روی زمین جلوی تصویر.",
    controls: [
      { level: "حذف/جایگزینی", text: "رفع نشتی منبع (ماشین یا ظرف)." },
      { level: "کنترل مهندسی", text: "سینی نشت‌گیر زیر تجهیزات و کفپوش ضدلغزش." },
      { level: "کنترل مدیریتی", text: "کیت جاذب نشت در دسترس و برنامه 5S." },
    ],
    standards: ["OSHA 29 CFR 1910.22", "OSHA 29 CFR 1910.106"],
  },
  {
    id: "chips", x: 22, y: 84, r: 6, title: "تجمع براده و قطعات تیز فلزی روی زمین",
    category: "housekeeping", risk: "low",
    consequence: "بریدگی، سوراخ شدن کف کفش و گیر کردن پا.",
    hint: "پایین سمت چپ، کنار قطعات فلزی.",
    controls: [
      { level: "کنترل مهندسی", text: "ظروف جمع‌آوری براده کنار ماشین‌ها." },
      { level: "کنترل مدیریتی", text: "نظافت پایان هر شیفت با جاروی مغناطیسی؛ هرگز با دست یا هوای فشرده." },
      { level: "تجهیزات حفاظت فردی", text: "کفش ایمنی با کفی ضدنفوذ و دستکش ضدبرش." },
    ],
    standards: ["OSHA 29 CFR 1910.22(a)", "OSHA 29 CFR 1910.242(b)"],
  },
];
