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
    href: "/products",
    children: [
      {
        label: "ارزیابی ریسک",
        description: "JSA، FMEA، HAZOP و William Fine",
        href: "/products?category=risk-assessment",
      },
      {
        label: "بهداشت حرفه‌ای",
        description: "اندازه‌گیری عوامل زیان‌آور محیط کار",
        href: "/products?category=occupational-health",
      },
      {
        label: "ایمنی صنعتی",
        description: "چک‌لیست بازرسی و پرمیت کار",
        href: "/products?category=industrial-safety",
      },
      {
        label: "ارگونومی",
        description: "REBA، RULA، NIOSH و QEC",
        href: "/products?category=ergonomics",
      },
      {
        label: "تهویه صنعتی",
        description: "طراحی هود و محاسبات جریان هوا",
        href: "/products?category=ventilation",
      },
      {
        label: "آموزش و مستندات",
        description: "پاورپوینت، دستورالعمل و رویه‌ها",
        href: "/products?category=training",
      },
    ],
  },
  {
    label: "دانشنامه",
    href: "/articles",
    children: [
      { label: "آخرین مقالات", description: "تازه‌ترین محتوای تخصصی", href: "/articles" },
      {
        label: "ارزیابی ریسک",
        description: "راهنمای اجرای برنامه‌های ارزیابی ریسک",
        href: "/articles?category=risk-assessment",
      },
      {
        label: "بهداشت حرفه‌ای",
        description: "حدود مجاز مواجهه و پایش عوامل زیان‌آور",
        href: "/articles?category=occupational-health",
      },
    ],
  },
  { label: "دسته‌بندی‌ها", href: "/categories" },
];
