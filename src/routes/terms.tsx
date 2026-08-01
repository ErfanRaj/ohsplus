import { createFileRoute, Link } from "@tanstack/react-router";

import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

const SECTIONS = [
  {
    title: "۱. پذیرش قوانین",
    body: "استفاده از وب‌سایت OHS Hub و خرید منابع دیجیتال آن به معنای پذیرش کامل این قوانین است. در صورت عدم موافقت، لطفاً از خدمات سایت استفاده نکنید.",
  },
  {
    title: "۲. حساب کاربری",
    body: "مسئولیت حفظ محرمانگی رمز عبور و فعالیت‌های انجام‌شده با حساب کاربری بر عهده کاربر است. اطلاعات ثبت‌شده باید صحیح و به‌روز باشد.",
  },
  {
    title: "۳. مالکیت فکری و مجوز استفاده",
    body: "تمامی فایل‌ها، متون و طرح‌های سایت متعلق به OHS Hub یا پدیدآورندگان همکار است. خرید هر محصول یک مجوز استفاده داخلی و غیرقابل انتقال ایجاد می‌کند؛ بازفروش، انتشار عمومی یا اشتراک‌گذاری فایل‌ها ممنوع است.",
  },
  {
    title: "۴. پرداخت و تحویل",
    body: "قیمت‌ها به تومان و شامل مالیات اعلام‌شده است. تحویل محصولات به‌صورت دیجیتال و بلافاصله پس از تأیید پرداخت در پیشخوان کاربر انجام می‌شود.",
  },
  {
    title: "۵. بازگشت وجه",
    body: "به دلیل ماهیت دیجیتال محصولات، بازگشت وجه تنها در صورت نقص فنی فایل و حداکثر تا ۷ روز پس از خرید امکان‌پذیر است.",
  },
  {
    title: "۶. سلب مسئولیت حرفه‌ای",
    body: "منابع ارائه‌شده ابزار کمکی برای کارشناسان ایمنی هستند و جایگزین قضاوت حرفه‌ای، الزامات قانونی یا بازرسی‌های رسمی نیستند. مسئولیت تطبیق محتوا با شرایط محیط کار بر عهده کاربر است.",
  },
  {
    title: "۷. حریم خصوصی",
    body: "اطلاعات کاربران تنها برای ارائه خدمات، پشتیبانی و بهبود تجربه کاربری استفاده می‌شود و در اختیار اشخاص ثالث قرار نمی‌گیرد، مگر بر اساس الزام قانونی.",
  },
  {
    title: "۸. تغییر قوانین",
    body: "OHS Hub می‌تواند این قوانین را به‌روزرسانی کند. نسخه معتبر همواره آخرین نسخه منتشرشده در همین صفحه است.",
  },
];

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "قوانین و مقررات | OHS Hub" },
      {
        name: "description",
        content:
          "قوانین استفاده، مجوز محصولات دیجیتال، شرایط پرداخت، بازگشت وجه و حریم خصوصی در OHS Hub.",
      },
      { property: "og:title", content: "قوانین و مقررات | OHS Hub" },
      { property: "og:description", content: "شرایط استفاده از خدمات و منابع دیجیتال OHS Hub." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container-page py-8">
          <PageBreadcrumb items={[{ label: "قوانین و مقررات" }]} />
          <header className="mt-6 max-w-2xl">
            <h1 className="font-display text-3xl font-extrabold sm:text-4xl">قوانین و مقررات</h1>
            <p className="mt-3 text-sm leading-8 text-muted-foreground">
              شرایط استفاده از وب‌سایت و منابع دیجیتال OHS Hub.
            </p>
          </header>

          <div className="mt-8 max-w-3xl space-y-6">
            {SECTIONS.map((section) => (
              <section key={section.title}>
                <h2 className="text-base font-extrabold">{section.title}</h2>
                <p className="mt-2 text-sm leading-8 text-muted-foreground">{section.body}</p>
              </section>
            ))}
          </div>

          <p className="mt-10 text-sm text-muted-foreground">
            پرسشی درباره این شرایط دارید؟{" "}
            <Link to="/contact" className="font-bold text-primary hover:underline">
              با پشتیبانی در تماس باشید
            </Link>
            .
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
