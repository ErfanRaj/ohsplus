export type NavChild = {
  label: string;
  description: string;
  href: string;
};

export type NavGroup = {
  label: string;
  href: string;
  children?: NavChild[];
};

/** Single source of truth for header, mega menu, mobile nav and search. */
export const NAVIGATION: NavGroup[] = [
  {
    label: "فروشگاه",
    href: "/",
    children: [
      {
        label: "ارزیابی ریسک",
        description: "JSA، FMEA، HAZOP و William Fine",
        href: "/",
      },
      {
        label: "بهداشت حرفه‌ای",
        description: "اندازه‌گیری عوامل زیان‌آور محیط کار",
        href: "/",
      },
      { label: "ایمنی صنعتی", description: "چک‌لیست بازرسی و پرمیت کار", href: "/" },
      { label: "ارگونومی", description: "REBA، RULA، NIOSH و QEC", href: "/" },
      { label: "تهویه صنعتی", description: "طراحی هود و محاسبات جریان هوا", href: "/" },
      { label: "آموزش و مستندات", description: "پاورپوینت، دستورالعمل و رویه‌ها", href: "/" },
    ],
  },
  {
    label: "دانشنامه",
    href: "/",
    children: [
      { label: "آخرین مقالات", description: "تازه‌ترین محتوای تخصصی", href: "/" },
      { label: "استانداردها", description: "مرور الزامات ملی و بین‌المللی", href: "/" },
      { label: "راهنماهای کاربردی", description: "آموزش گام‌به‌گام اجرای الزامات", href: "/" },
    ],
  },
  { label: "درباره ما", href: "/" },
  { label: "تماس", href: "/" },
];
