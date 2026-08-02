import { createFileRoute, Link } from "@tanstack/react-router";

import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    q: "فایل‌ها بعد از خرید چگونه تحویل داده می‌شوند؟",
    a: "بلافاصله پس از تکمیل خرید، فایل در بخش «پیشخوان من» و در فهرست دانلودهای شما قرار می‌گیرد و می‌توانید بدون محدودیت زمانی آن را دریافت کنید.",
  },
  {
    q: "فرمت فایل‌ها چیست و آیا قابل ویرایش هستند؟",
    a: "بیشتر منابع در قالب Excel، Word یا PowerPoint ارائه می‌شوند و کاملاً قابل ویرایش‌اند تا با نام و فرایندهای سازمان شما تطبیق پیدا کنند. فرمت هر محصول در صفحه آن ذکر شده است.",
  },
  {
    q: "آیا نسخه‌های به‌روزرسانی‌شده رایگان است؟",
    a: "بله. با انتشار نسخه جدید یک محصول خریداری‌شده، همان فایل به‌صورت رایگان در پیشخوان شما به‌روزرسانی می‌شود.",
  },
  {
    q: "امکان استفاده سازمانی و چند کاربره وجود دارد؟",
    a: "برای استفاده در سطح سازمان یا آموزش تیمی، لطفاً از طریق صفحه تماس با ما درخواست لایسنس سازمانی ثبت کنید.",
  },
  {
    q: "آیا نمونه رایگان برای بررسی کیفیت وجود دارد؟",
    a: "بله، برای بخشی از محصولات نسخه نمایشی رایگان در نظر گرفته شده است که در صفحه محصول قابل دریافت است.",
  },
  {
    q: "اگر فایل مشکل داشت چه می‌شود؟",
    a: "در صورت وجود نقص فنی در فایل، تا ۷ روز پس از خرید مشکل رفع می‌شود یا مبلغ پرداختی بازگردانده خواهد شد.",
  },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "سوالات متداول | OHS Plus" },
      {
        name: "description",
        content:
          "پاسخ پرسش‌های رایج درباره خرید، تحویل، فرمت و به‌روزرسانی منابع دیجیتال HSE در OHS Plus.",
      },
      { property: "og:title", content: "سوالات متداول | OHS Plus" },
      { property: "og:description", content: "راهنمای خرید و پشتیبانی منابع تخصصی ایمنی." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }),
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container-page py-8">
          <PageBreadcrumb items={[{ label: "سوالات متداول" }]} />
          <header className="mt-6 max-w-2xl">
            <h1 className="font-display text-3xl font-extrabold sm:text-4xl">سوالات متداول</h1>
            <p className="mt-3 text-sm leading-8 text-muted-foreground">
              پاسخ رایج‌ترین پرسش‌ها درباره خرید و استفاده از منابع OHS Plus.
            </p>
          </header>

          <Accordion type="single" collapsible className="mt-8 max-w-3xl" dir="rtl">
            {FAQS.map((item) => (
              <AccordionItem key={item.q} value={item.q}>
                <AccordionTrigger className="text-right text-sm font-bold">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-7 text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <p className="mt-10 text-sm text-muted-foreground">
            پاسخ خود را پیدا نکردید؟{" "}
            <Link to="/contact" className="font-bold text-primary hover:underline">
              با ما تماس بگیرید
            </Link>
            .
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
