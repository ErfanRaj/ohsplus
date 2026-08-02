import { Link } from "@tanstack/react-router";
import { Mail, Phone } from "lucide-react";

import logoAsset from "@/assets/ohs-plus-logo.png.asset.json";


const FOOTER_LINKS: { title: string; items: { label: string; href: string }[] }[] = [
  {
    title: "منابع",
    items: [
      { label: "ارزیابی ریسک", href: "/products?category=risk-assessment" },
      { label: "بهداشت حرفه‌ای", href: "/products?category=occupational-health" },
      { label: "ارگونومی", href: "/products?category=ergonomics" },
      { label: "آموزش ایمنی", href: "/products?category=training" },
    ],
  },
  {
    title: "پشتیبانی",
    items: [
      { label: "درباره ما", href: "/about" },
      { label: "سوالات متداول", href: "/faq" },
      { label: "قوانین و مقررات", href: "/terms" },
      { label: "تماس با ما", href: "/contact" },
    ],
  },
];


export function SiteFooter() {
  return (
    <footer className="bg-ink text-ink-foreground">
      <div aria-hidden="true" className="hazard-stripes h-2 w-full" />
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center rounded-md bg-white px-3 py-2">
              <img
                src={logoAsset.url}
                alt="لوگوی OHS Plus"
                width={132}
                height={40}
                loading="lazy"
                className="h-8 w-auto object-contain"
              />
            </span>
            <span className="text-sm font-semibold text-primary" dir="ltr">
              Where OHS Professionals Connect
            </span>
          </div>
          <p className="mt-4 max-w-md text-sm leading-7 text-ink-muted">
            همه چیز برای یک کار ایمن؛ مرجع دیجیتال منابع تخصصی بهداشت حرفه‌ای، ایمنی، ارزیابی ریسک و
            ارگونومی برای کارشناسان HSE ایران.
          </p>

          <div className="mt-6 flex flex-col gap-2 text-sm text-ink-muted">
            <a href="mailto:erfann.rag@gmail.com" className="flex items-center gap-2 hover:text-primary">
              <Mail className="size-4" aria-hidden="true" />
              erfann.rag@gmail.com
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
                <li key={item.label}>
                  <Link to={item.href} className="transition-colors hover:text-primary">
                    {item.label}
                  </Link>
                </li>
              ))}

            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container-page py-6 text-xs text-ink-muted">
          © {new Date().getFullYear()} OHS Plus — تمامی حقوق محفوظ است.
        </div>
      </div>
    </footer>
  );
}
