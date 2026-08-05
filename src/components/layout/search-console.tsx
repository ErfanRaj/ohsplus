import { Link, useNavigate } from "@tanstack/react-router";
import { Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

const QUICK_TERMS = ["ارزیابی ریسک", "چک‌لیست بازرسی", "ارگونومی", "پرمیت کار", "صدا سنجی"];

/**
 * OHS Search Console — a blueprint-styled glass search panel with CAD corner ticks.
 */
export function SearchConsole() {
  const navigate = useNavigate();
  const [term, setTerm] = useState("");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    navigate({
      to: "/products",
      search: { q: term.trim(), category: "", sort: "newest" },
    });
  };

  return (
    <div className="search-console relative mt-10 max-w-xl rounded-xl border border-primary/30 bg-ink/55 p-4 shadow-soft backdrop-blur-md sm:p-5">
      {/* CAD corner accents */}
      <span className="pointer-events-none absolute -top-px -start-px size-4 border-s-2 border-t-2 border-primary" aria-hidden="true" />
      <span className="pointer-events-none absolute -top-px -end-px size-4 border-e-2 border-t-2 border-primary" aria-hidden="true" />
      <span className="pointer-events-none absolute -bottom-px -start-px size-4 border-b-2 border-s-2 border-primary" aria-hidden="true" />
      <span className="pointer-events-none absolute -bottom-px -end-px size-4 border-b-2 border-e-2 border-primary" aria-hidden="true" />

      <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-primary/90 uppercase" dir="ltr">
        <SlidersHorizontal className="size-3.5" aria-hidden="true" />
        <span>OHS SEARCH CONSOLE</span>
        <span className="h-px flex-1 bg-primary/25" aria-hidden="true" />
        <span className="text-ink-muted">v1.4</span>
      </div>

      <form onSubmit={submit} className="mt-3 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-primary"
            aria-hidden="true"
          />
          <input
            type="search"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            aria-label="جستجوی منابع تخصصی ایمنی و بهداشت حرفه‌ای"
            placeholder="جستجوی چک‌لیست، فرم ارزیابی ریسک، فایل اکسل…"
            className="h-12 w-full rounded-lg border border-ink-muted/25 bg-ink/60 ps-9 pe-3 text-sm text-ink-foreground placeholder:text-ink-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <Button type="submit" size="lg" className="h-12 gap-2 font-bold">
          <Search className="size-4" aria-hidden="true" />
          جستجو
        </Button>
      </form>

      <ul className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <li className="text-ink-muted">جستجوهای پرتکرار:</li>
        {QUICK_TERMS.map((quick) => (
          <li key={quick}>
            <Link
              to="/products"
              search={{ q: quick, category: "", sort: "newest" }}
              className="rounded-full border border-ink-muted/25 px-2.5 py-1 text-ink-muted transition-colors hover:border-primary hover:text-primary"
            >
              {quick}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
