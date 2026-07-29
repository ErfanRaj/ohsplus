import { Link } from "@tanstack/react-router";
import { Menu, Search, ShieldCheck, ShoppingCart, User } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const NAV_ITEMS = [
  { label: "فروشگاه", href: "/" },
  { label: "ارزیابی ریسک", href: "/" },
  { label: "بهداشت حرفه‌ای", href: "/" },
  { label: "ارگونومی", href: "/" },
  { label: "مقالات", href: "/" },
  { label: "درباره ما", href: "/" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center gap-4 md:h-18">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="باز کردن منوی اصلی"
            >
              <Menu className="size-5" aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle className="text-right">منوی اصلی</SheetTitle>
            </SheetHeader>
            <nav aria-label="پیمایش موبایل" className="mt-2 flex flex-col px-4 pb-6">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-2 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <Link to="/" className="flex items-center gap-2" aria-label="OHS Hub، صفحه اصلی">
          <span className="flex size-9 items-center justify-center rounded-md bg-ink text-primary">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-base font-extrabold tracking-tight">OHS Hub</span>
            <span className="mt-1 text-[11px] text-muted-foreground">مرجع تخصصی ایمنی</span>
          </span>
        </Link>

        <nav aria-label="پیمایش اصلی" className="hidden flex-1 items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-1 md:ms-0">
          <Button variant="ghost" size="icon" aria-label="جستجو در منابع">
            <Search className="size-5" aria-hidden="true" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="سبد خرید">
            <ShoppingCart className="size-5" aria-hidden="true" />
          </Button>
          <Button variant="outline" className="hidden gap-2 font-semibold sm:inline-flex">
            <User className="size-4" aria-hidden="true" />
            ورود / ثبت‌نام
          </Button>
        </div>
      </div>
    </header>
  );
}
