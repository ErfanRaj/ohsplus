import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  ClipboardCheck,
  Download,
  FileSpreadsheet,
  HardHat,
  Activity,
  ShieldCheck,
  Star,
  Wind,
  Users,
} from "lucide-react";

import heroImage from "@/assets/hero-hse.jpg";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OHS Hub | مرجع منابع تخصصی HSE و بهداشت حرفه‌ای" },
      {
        name: "description",
        content:
          "دانلود چک‌لیست، فرم ارزیابی ریسک، فایل‌های اکسل و مستندات تخصصی بهداشت حرفه‌ای، ایمنی و ارگونومی؛ آماده استفاده در صنعت.",
      },
      { property: "og:title", content: "OHS Hub | همه چیز برای یک کار ایمن" },
      {
        property: "og:description",
        content:
          "منابع دیجیتال حرفه‌ای برای کارشناسان HSE: ارزیابی ریسک، بهداشت حرفه‌ای، ارگونومی و آموزش ایمنی.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

const CATEGORIES = [
  {
    title: "ارزیابی ریسک",
    desc: "JSA، FMEA، HAZOP و William Fine",
    icon: ClipboardCheck,
    slug: "risk-assessment",
  },
  {
    title: "بهداشت حرفه‌ای",
    desc: "اندازه‌گیری عوامل زیان‌آور محیط کار",
    icon: Activity,
    slug: "occupational-health",
  },
  {
    title: "ایمنی صنعتی",
    desc: "چک‌لیست بازرسی و پرمیت کار",
    icon: HardHat,
    slug: "industrial-safety",
  },
  { title: "ارگونومی", desc: "REBA، RULA، NIOSH و QEC", icon: Users, slug: "ergonomics" },
  {
    title: "تهویه صنعتی",
    desc: "طراحی هود و محاسبات جریان هوا",
    icon: Wind,
    slug: "ventilation",
  },
  {
    title: "آموزش و مستندات",
    desc: "پاورپوینت، دستورالعمل و رویه‌ها",
    icon: BookOpen,
    slug: "training",
  },
];

const PRODUCTS = [
  {
    title: "پکیج کامل ارزیابی ریسک به روش William Fine",
    format: "Excel + PDF",
    price: "۲۹۰٬۰۰۰",
    rating: "۴٫۹",
    badge: "پرفروش",
    slug: "william-fine-risk-package",
  },
  {
    title: "مجموعه چک‌لیست‌های بازرسی ایمنی کارگاه",
    format: "۴۸ چک‌لیست Word",
    price: "۱۹۰٬۰۰۰",
    rating: "۴٫۸",
    badge: "به‌روزرسانی ۱۴۰۴",
    slug: "safety-inspection-checklists",
  },
  {
    title: "نرم‌افزار اکسل محاسبات ارگونومی REBA و RULA",
    format: "Excel خودکار",
    price: "۲۴۰٬۰۰۰",
    rating: "۵٫۰",
    badge: "جدید",
    slug: "reba-rula-excel-tool",
  },
];

const STATS = [
  { value: "۴۲۰+", label: "منبع تخصصی" },
  { value: "۱۸٬۰۰۰+", label: "دانلود موفق" },
  { value: "۹۶٪", label: "رضایت کاربران" },
  { value: "۲۴/۷", label: "دسترسی آنی" },
];

const ARTICLES = [
  {
    title: "راهنمای گام‌به‌گام تدوین برنامه ارزیابی ریسک در صنایع فرآیندی",
    category: "ارزیابی ریسک",
    read: "۹ دقیقه مطالعه",
    slug: "risk-assessment-program-guide",
  },
  {
    title: "حدود مجاز مواجهه شغلی؛ آنچه هر کارشناس بهداشت حرفه‌ای باید بداند",
    category: "بهداشت حرفه‌ای",
    read: "۷ دقیقه مطالعه",
    slug: "oel-guide",
  },
  {
    title: "کاهش اختلالات اسکلتی-عضلانی با مداخلات ارگونومیک کم‌هزینه",
    category: "ارگونومی",
    read: "۶ دقیقه مطالعه",
    slug: "msd-low-cost-interventions",
  },
];


function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-3 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        رفتن به محتوای اصلی
      </a>

      <div className="bg-ink text-ink-foreground">
        <div className="container-page flex h-10 items-center justify-center gap-2 text-xs sm:text-sm">
          <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
          به‌روزرسانی مستندات مطابق آخرین الزامات وزارت بهداشت — دانلود رایگان نسخه‌های جدید
        </div>
      </div>

      <SiteHeader />

      <main id="main" className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-ink text-ink-foreground">
          <img
            src={heroImage}
            alt="کارشناس ایمنی با کلاه ایمنی و جلیقه شبرنگ در محیط صنعتی"
            width={1600}
            height={1104}
            className="absolute inset-0 size-full object-cover object-left opacity-60"
          />
          <div
            className="absolute inset-0 bg-gradient-to-l from-ink via-ink/85 to-ink/20"
            aria-hidden="true"
          />
          <div className="container-page relative py-20 md:py-32">
            <div className="max-w-2xl">
              <Badge className="gap-1.5 bg-primary/15 text-primary hover:bg-primary/20">
                <ShieldCheck className="size-3.5" aria-hidden="true" />
                مرجع تخصصی HSE
              </Badge>
              <h1 className="mt-6 text-3xl leading-[1.5] font-extrabold sm:text-4xl md:text-5xl md:leading-[1.45]">
                همه چیز برای یک <span className="text-primary">کار ایمن</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-8 text-ink-muted sm:text-lg">
                مستندات، چک‌لیست‌ها و ابزارهای محاسباتی آماده برای کارشناسان بهداشت حرفه‌ای، ایمنی و
                ارگونومی. دانلود فوری، به‌روزرسانی دائمی، قابل استفاده در ممیزی و بازرسی.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" className="gap-2 font-bold" asChild>
                  <Link to="/products" search={{ q: "", category: "", sort: "newest" }}>
                    مشاهده منابع
                    <ArrowLeft className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
              <dl className="mt-12 grid max-w-lg grid-cols-2 gap-6 sm:grid-cols-4">
                {STATS.map((stat) => (
                  <div key={stat.label}>
                    <dt className="sr-only">{stat.label}</dt>
                    <dd className="font-display text-2xl font-extrabold text-primary">
                      {stat.value}
                    </dd>
                    <p className="mt-1 text-xs text-ink-muted">{stat.label}</p>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="container-page py-16 md:py-24" aria-labelledby="categories-heading">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="categories-heading" className="text-2xl font-extrabold sm:text-3xl">
                دسته‌بندی منابع
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                هر آنچه برای مستندسازی و اجرای برنامه‌های HSE نیاز دارید.
              </p>
            </div>
            <Link
              to="/categories"
              className="text-sm font-semibold text-accent underline-offset-4 hover:underline"
            >
              مشاهده همه دسته‌ها
            </Link>
          </div>

          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((cat) => (
              <li key={cat.title}>
                <Link
                  to="/products"
                  search={{ q: "", category: cat.slug, sort: "newest" }}
                  className="block h-full"
                >
                  <Card className="h-full border-border/70 shadow-none transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-soft">
                    <CardContent className="flex items-start gap-4">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-secondary text-accent">
                        <cat.icon className="size-5" aria-hidden="true" />
                      </span>
                      <div>
                        <h3 className="text-base font-bold">{cat.title}</h3>
                        <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{cat.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Products */}
        <section className="bg-secondary/60 py-16 md:py-24" aria-labelledby="products-heading">
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 id="products-heading" className="text-2xl font-extrabold sm:text-3xl">
                  محصولات منتخب
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  پرکاربردترین فایل‌های تخصصی میان کارشناسان ایمنی.
                </p>
              </div>
              <Link
                to="/products"
                search={{ q: "", category: "", sort: "newest" }}
                className="text-sm font-semibold text-accent underline-offset-4 hover:underline"
              >
                فروشگاه کامل
              </Link>
            </div>

            <ul className="mt-10 grid gap-6 md:grid-cols-3">
              {PRODUCTS.map((product) => (
                <li key={product.title}>
                  <Card className="h-full overflow-hidden border-border/70 shadow-soft">
                    <div className="mx-6 flex h-32 items-center justify-center rounded-md bg-ink">
                      <FileSpreadsheet className="size-10 text-primary" aria-hidden="true" />
                    </div>
                    <CardContent className="flex h-full flex-col">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="secondary" className="font-semibold">
                          {product.badge}
                        </Badge>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star
                            className="size-3.5 fill-primary text-primary"
                            aria-hidden="true"
                          />
                          {product.rating}
                        </span>
                      </div>
                      <h3 className="mt-3 text-base leading-7 font-bold">{product.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{product.format}</p>
                      <div className="mt-6 flex items-center justify-between gap-3">
                        <span className="font-display text-lg font-extrabold">
                          {product.price}
                          <span className="ms-1 text-xs font-medium text-muted-foreground">
                            تومان
                          </span>
                        </span>
                        <Button size="sm" className="gap-1.5 font-bold" asChild>
                          <Link to="/products/$slug" params={{ slug: product.slug }}>
                            <Download className="size-4" aria-hidden="true" />
                            خرید و دانلود
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Articles */}
        <section className="container-page py-16 md:py-24" aria-labelledby="articles-heading">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="articles-heading" className="text-2xl font-extrabold sm:text-3xl">
                تازه‌های دانشنامه
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                مقالات کاربردی، مبتنی بر استانداردها و تجربه میدانی.
              </p>
            </div>
            <Link
              to="/articles"
              search={{ q: "", category: "" }}
              className="text-sm font-semibold text-accent underline-offset-4 hover:underline"
            >
              همه مقالات
            </Link>
          </div>

          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {ARTICLES.map((article) => (
              <li key={article.title}>
                <Link
                  to="/articles/$slug"
                  params={{ slug: article.slug }}
                  className="group block h-full"
                >
                  <article className="flex h-full flex-col rounded-lg border border-border/70 bg-card p-6 transition-colors hover:border-primary">
                    <span className="text-xs font-bold text-accent">{article.category}</span>
                    <h3 className="mt-3 text-base leading-7 font-bold group-hover:text-accent">
                      {article.title}
                    </h3>
                    <p className="mt-auto pt-6 text-xs text-muted-foreground">{article.read}</p>
                  </article>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* CTA */}
        <section className="container-page pb-20" aria-labelledby="cta-heading">
          <div className="rounded-xl bg-ink px-6 py-12 text-center text-ink-foreground md:px-16 md:py-16">
            <h2 id="cta-heading" className="text-2xl font-extrabold sm:text-3xl">
              کتابخانه تخصصی خود را همین امروز کامل کنید
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-ink-muted sm:text-base">
              با ساخت حساب کاربری، به تاریخچه خرید، نسخه‌های به‌روزشده و دانلود همیشگی فایل‌ها
              دسترسی خواهید داشت.
            </p>
            <Button size="lg" className="mt-8 gap-2 font-bold" asChild>
              <Link to="/auth">
                ساخت حساب کاربری
                <ArrowLeft className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
