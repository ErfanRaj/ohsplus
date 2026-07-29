import { Link } from "@tanstack/react-router";
import { Mail, Phone, ShieldCheck } from "lucide-react";

const FOOTER_LINKS: { title: string; items: string[] }[] = [
  {
    title: "منابع",
    items: ["ارزیابی ریسک", "بهداشت حرفه‌ای", "ارگونومی", "آموزش ایمنی"],
  },
  {
    title: "پشتیبانی",
    items: ["راهنمای خرید", "سوالات متداول", "قوانین و مقررات", "تماس با ما"],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-ink text-ink-foreground">
      <div aria-hidden="true" className="hazard-stripes h-2 w-full" />
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </span>
            <span className="font-display text-lg font-extrabold">OHS Hub</span>
          </div>
          <p className="mt-4 max-w-md text-sm leading-7 text-ink-muted">
            همه چیز برای یک کار ایمن؛ مرجع دیجیتال منابع تخصصی بهداشت حرفه‌ای، ایمنی، ارزیابی ریسک و
            ارگونومی برای کارشناسان HSE ایران.
          </p>
          <div className="mt-6 flex flex-col gap-2 text-sm text-ink-muted">
            <a href="mailto:info@ohshub.ir" className="flex items-center gap-2 hover:text-primary">
              <Mail className="size-4" aria-hidden="true" />
              info@ohshub.ir
            </a>
            <a href="tel:+982100000000" className="flex items-center gap-2 hover:text-primary">
              <Phone className="size-4" aria-hidden="true" />
              ۰۲۱-۰۰۰۰۰۰۰۰
            </a>
          </div>
        </div>

        {FOOTER_LINKS.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2 className="text-sm font-bold text-ink-foreground">{group.title}</h2>
            <ul className="mt-4 space-y-3 text-sm text-ink-muted">
              {group.items.map((item) => (
                <li key={item}>
                  <Link to="/" className="transition-colors hover:text-primary">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container-page py-6 text-xs text-ink-muted">
          © {new Date().getFullYear()} OHS Hub — تمامی حقوق محفوظ است.
        </div>
      </div>
    </footer>
  );
}
