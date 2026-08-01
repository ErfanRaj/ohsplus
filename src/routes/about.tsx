import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, BookOpen, ShieldCheck, Users } from "lucide-react";

import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "درباره OHS Hub | مرجع تخصصی منابع HSE" },
      {
        name: "description",
        content:
          "با OHS Hub آشنا شوید؛ پلتفرم تخصصی منابع دیجیتال بهداشت حرفه‌ای، ایمنی صنعتی، ارزیابی ریسک و ارگونومی برای کارشناسان HSE.",
      },
      { property: "og:title", content: "درباره OHS Hub" },
      { property: "og:description", content: "مأموریت، ارزش‌ها و تیم پشت مرجع تخصصی OHS Hub." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

const VALUES = [
  {
    icon: ShieldCheck,
    title: "استانداردمحور",
    body: "تمام منابع بر پایه استانداردهای ملی و بین‌المللی مانند ISO 45001، OSHA و ACGIH تهیه می‌شوند.",
  },
  {
    icon: BookOpen,
    title: "کاربردی و آماده استفاده",
    body: "فایل‌ها قابل ویرایش‌اند و برای اجرای فوری در محیط کار طراحی شده‌اند؛ نه صرفاً تئوری.",
  },
  {
    icon: Users,
    title: "ساخته‌شده توسط کارشناسان",
    body: "محتوا توسط کارشناسان بهداشت حرفه‌ای و ایمنی با تجربه میدانی تدوین و بازبینی می‌شود.",
  },
  {
    icon: Award,
    title: "به‌روزرسانی مستمر",
    body: "با تغییر مقررات و استانداردها، نسخه‌های جدید فایل‌ها بدون هزینه اضافه در اختیار شماست.",
  },
];

function AboutPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container-page py-8">
          <PageBreadcrumb items={[{ label: "درباره ما" }]} />

          <header className="mt-6 max-w-3xl">
            <h1 className="font-display text-3xl font-extrabold sm:text-4xl">درباره OHS Hub</h1>
            <p className="mt-4 text-base leading-8 text-muted-foreground">
              OHS Hub با یک هدف ساده ساخته شد: کارشناس ایمنی نباید ساعت‌ها وقت خود را صرف ساختن
              چک‌لیست، فرم ارزیابی ریسک یا محاسبه‌گر از صفر کند. ما منابع دیجیتال دقیق، استاندارد و
              آماده‌ی استفاده را در یک جا جمع کرده‌ایم تا تمرکز شما روی چیزی بماند که واقعاً اهمیت
              دارد: بازگشت ایمن همکاران به خانه.
            </p>
          </header>

          <section aria-labelledby="values" className="mt-12">
            <h2 id="values" className="text-xl font-extrabold">
              ارزش‌های ما
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {VALUES.map((value) => (
                <article key={value.title} className="rounded-xl border bg-card p-6 shadow-soft">
                  <span className="flex size-10 items-center justify-center rounded-md bg-primary/15 text-primary">
                    <value.icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-base font-bold">{value.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{value.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-12 rounded-xl border bg-secondary/50 p-8 text-center">
            <h2 className="text-xl font-extrabold">سوالی دارید یا به منبع خاصی نیاز دارید؟</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
              تیم ما آماده است تا در انتخاب منابع مناسب سازمان شما کمک کند یا فایل اختصاصی تهیه کند.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild className="font-bold">
                <Link to="/contact">تماس با ما</Link>
              </Button>
              <Button asChild variant="outline" className="font-semibold">
                <Link to="/products">مشاهده فروشگاه</Link>
              </Button>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
