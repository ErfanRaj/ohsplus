import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, FolderTree, MessageSquare, Package, Users } from "lucide-react";

import { AdminShell } from "@/components/admin/admin-shell";
import { adminStatsQuery } from "@/lib/admin";
import { toFa } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "پنل مدیریت | OHS Plus" },
      { name: "description", content: "مدیریت محصولات، مقالات، دسته‌بندی‌ها و دیدگاه‌های OHS Plus." },
      { property: "og:title", content: "پنل مدیریت | OHS Plus" },
      { property: "og:description", content: "مدیریت کامل محتوای پلتفرم OHS Plus." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminOverview,
});

function AdminOverview() {
  const { data } = useQuery(adminStatsQuery());

  const cards = [
    { href: "/admin/products", label: "محصولات", value: data?.products, icon: Package, hint: `${toFa(data?.publishedProducts ?? 0)} منتشر شده` },
    { href: "/admin/articles", label: "مقالات", value: data?.articles, icon: BookOpen, hint: "دانشنامه" },
    { href: "/admin/categories", label: "دسته‌بندی‌ها", value: data?.categories, icon: FolderTree, hint: "ساختار سایت" },
    { href: "/admin/reviews", label: "دیدگاه‌ها", value: data?.reviews, icon: MessageSquare, hint: `${toFa(data?.pendingReviews ?? 0)} در انتظار تایید` },
    { href: "/admin/users", label: "کاربران", value: data?.users, icon: Users, hint: "حساب‌های ثبت‌شده" },
  ] as const;

  return (
    <AdminShell title="پنل مدیریت" description="نمای کلی محتوای پلتفرم و دسترسی سریع به بخش‌ها.">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            to={card.href}
            className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">{card.label}</span>
              <card.icon className="size-5 text-primary" aria-hidden="true" />
            </div>
            <p className="mt-3 text-3xl font-extrabold">{toFa(card.value ?? 0)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
