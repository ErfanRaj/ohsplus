import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search, SlidersHorizontal } from "lucide-react";

import { ProductCard } from "@/components/catalog/product-card";
import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categoriesQuery, productsQuery, toFa } from "@/lib/catalog";

type ProductSearch = { q: string; category: string; sort: string };

export const Route = createFileRoute("/products/")({
  validateSearch: (search: Record<string, unknown>): ProductSearch => ({
    q: typeof search.q === "string" ? search.q : "",
    category: typeof search.category === "string" ? search.category : "",
    sort: typeof search.sort === "string" ? search.sort : "newest",
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => {
    context.queryClient.ensureQueryData(categoriesQuery());
    context.queryClient.ensureQueryData(productsQuery(deps));
  },
  head: () => ({
    meta: [
      { title: "فروشگاه منابع HSE | OHS Hub" },
      {
        name: "description",
        content:
          "خرید و دانلود چک‌لیست، فرم ارزیابی ریسک، فایل اکسل محاسباتی و مستندات تخصصی ایمنی و بهداشت حرفه‌ای.",
      },
      { property: "og:title", content: "فروشگاه منابع HSE | OHS Hub" },
      {
        property: "og:description",
        content: "مجموعه کامل منابع دیجیتال آماده استفاده برای کارشناسان HSE.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/products" }],
  }),
  errorComponent: ({ error }) => (
    <div role="alert" className="container-page py-24 text-center text-destructive">
      خطا در بارگذاری محصولات: {error.message}
    </div>
  ),
  notFoundComponent: () => (
    <div className="container-page py-24 text-center">محصولی یافت نشد.</div>
  ),
  component: ProductsPage,
});

const SORTS = [
  { value: "newest", label: "جدیدترین" },
  { value: "popular", label: "پرفروش‌ترین" },
  { value: "rating", label: "بیشترین امتیاز" },
  { value: "price-asc", label: "ارزان‌ترین" },
  { value: "price-desc", label: "گران‌ترین" },
];

function ProductsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { data: categories } = useQuery(categoriesQuery());
  const { data: products } = useSuspenseQuery(productsQuery(search));

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        <div className="border-b border-border/70 bg-muted/40">
          <div className="container-page py-8">
            <PageBreadcrumb items={[{ label: "فروشگاه" }]} />
            <h1 className="mt-4 text-2xl font-extrabold sm:text-3xl">فروشگاه منابع HSE</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
              مستندات، چک‌لیست‌ها و ابزارهای محاسباتی آماده دانلود؛ فیلتر کنید و فایل مناسب کارتان را
              پیدا کنید.
            </p>
          </div>
        </div>

        <div className="container-page grid gap-8 py-10 lg:grid-cols-[240px_1fr]">
          <aside className="space-y-4" aria-label="فیلتر دسته‌بندی">
            <h2 className="flex items-center gap-2 text-sm font-bold">
              <SlidersHorizontal className="size-4" aria-hidden="true" />
              دسته‌بندی‌ها
            </h2>
            <ul className="space-y-1 text-sm">
              <li>
                <Link
                  to="/products"
                  search={(prev: ProductSearch) => ({ ...prev, category: "" })}
                  className={`block rounded-md px-3 py-2 transition-colors hover:bg-muted ${
                    search.category === "" ? "bg-primary/10 font-bold text-primary" : ""
                  }`}
                >
                  همه منابع
                </Link>
              </li>
              {(categories ?? []).map((cat) => (
                <li key={cat.id}>
                  <Link
                    to="/products"
                    search={(prev: ProductSearch) => ({ ...prev, category: cat.slug })}
                    className={`block rounded-md px-3 py-2 transition-colors hover:bg-muted ${
                      search.category === cat.slug ? "bg-primary/10 font-bold text-primary" : ""
                    }`}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>

          <section aria-label="نتایج">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-56 flex-1">
                <Search
                  className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  value={search.q}
                  onChange={(event) =>
                    navigate({
                      search: (prev: ProductSearch) => ({ ...prev, q: event.target.value }),
                      replace: true,
                    })
                  }
                  placeholder="جستجو در منابع…"
                  aria-label="جستجو در منابع"
                  className="pe-9"
                />
              </div>
              <Select
                value={search.sort}
                onValueChange={(value) =>
                  navigate({ search: (prev: ProductSearch) => ({ ...prev, sort: value }) })
                }
              >
                <SelectTrigger className="w-44" aria-label="ترتیب نمایش">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORTS.map((sort) => (
                    <SelectItem key={sort.value} value={sort.value}>
                      {sort.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge variant="secondary">{toFa(products.length)} نتیجه</Badge>
            </div>

            {products.length === 0 ? (
              <p className="mt-16 text-center text-sm text-muted-foreground">
                نتیجه‌ای مطابق فیلترهای شما پیدا نشد.
              </p>
            ) : (
              <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <li key={product.id}>
                    <ProductCard product={product} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
