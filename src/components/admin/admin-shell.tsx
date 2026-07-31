import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const ADMIN_NAV = [
  { href: "/admin", label: "نمای کلی" },
  { href: "/admin/products", label: "محصولات" },
  { href: "/admin/articles", label: "مقالات" },
  { href: "/admin/categories", label: "دسته‌بندی‌ها" },
  { href: "/admin/tags", label: "برچسب‌ها" },
  { href: "/admin/reviews", label: "دیدگاه‌ها" },
  { href: "/admin/users", label: "کاربران" },
] as const;

export function AdminShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="container-page py-8">
      <nav
        aria-label="بخش‌های پنل مدیریت"
        className="mb-6 flex flex-wrap gap-2 rounded-xl border border-border bg-card p-2"
      >
        {ADMIN_NAV.map((item) => {
          const active =
            item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">{title}</h1>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions}
      </div>

      {children}
    </div>
  );
}
