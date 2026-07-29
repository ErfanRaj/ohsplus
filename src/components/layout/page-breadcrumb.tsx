import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { Fragment } from "react";

export type Crumb = { label: string; href?: string };

export function PageBreadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="مسیر صفحه" className="text-sm">
      <ol className="flex flex-wrap items-center gap-1.5 text-muted-foreground">
        <li>
          <Link to="/" className="transition-colors hover:text-foreground">
            خانه
          </Link>
        </li>
        {items.map((item, index) => (
          <Fragment key={item.label}>
            <li aria-hidden="true">
              <ChevronLeft className="size-3.5" />
            </li>
            <li>
              {item.href && index < items.length - 1 ? (
                <Link to={item.href} className="transition-colors hover:text-foreground">
                  {item.label}
                </Link>
              ) : (
                <span className="font-semibold text-foreground" aria-current="page">
                  {item.label}
                </span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
