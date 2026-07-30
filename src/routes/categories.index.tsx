import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Card, CardContent } from "@/components/ui/card";
import { categoriesQuery } from "@/lib/catalog";

export const Route = createFileRoute("/categories/")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(categoriesQuery());
  },
  head: () => ({
    meta: [
      { title: "دسته‌بندی منابع HSE | OHS Hub" },
      {
        name: "description",
        content:
          "همه دسته‌بندی‌های منابع ایمنی و بهداشت حرفه‌ای: ارزیابی ریسک، ارگونومی، تهویه صنعتی و آموزش.",
      },
      { property: "og:title", content: "دسته‌بندی منابع HSE | OHS Hub" },
      { property: "og:description", content: "مرور دسته‌بندی‌های تخصصی منابع HSE." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  errorComponent: ({ error }) => (
    <div role="alert" className="container-page py-24 text-center text-destructive">
      خطا در بارگذاری دسته‌بندی‌ها: {error.message}
    </div>
  ),
  notFoundComponent: () => (
    <div className="container-page py-24 text-center">دسته‌بندی‌ای یافت نشد.</div>
  ),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { data: categories } = useSuspenseQuery(categoriesQuery());

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        <div className="border-b border-border/70 bg-muted/40">
          <div className="container-page py-8">
            <PageBreadcrumb items={[{ label: "دسته‌بندی‌ها" }]} />
            <h1 className="mt-4 text-2xl font-extrabold sm:text-3xl">دسته‌بندی منابع</h1>
          </div>
        </div>

        <ul className="container-page grid gap-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link
                to="/products"
                search={{ q: "", category: cat.slug, sort: "newest" }}
                className="block h-full"
              >
                <Card className="h-full border-border/70 shadow-none transition-all hover:-translate-y-0.5 hover:border-primary/60">
                  <CardContent className="space-y-2 p-5">
                    <h2 className="text-base font-bold">{cat.name}</h2>
                    <p className="text-sm leading-7 text-muted-foreground">{cat.description}</p>
                    <span className="inline-flex items-center gap-1 pt-2 text-xs font-semibold text-accent">
                      مشاهده منابع
                      <ArrowLeft className="size-3.5" aria-hidden="true" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </div>
  );
}
