import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Download, FileSpreadsheet, ShieldCheck, ShoppingCart, Star } from "lucide-react";

import { ProductCard } from "@/components/catalog/product-card";
import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  formatDateFa,
  formatToman,
  productQuery,
  relatedProductsQuery,
  toFa,
} from "@/lib/catalog";

export const Route = createFileRoute("/products/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(productQuery(params.slug));
    if (!data) throw notFound();
    return {
      title: data.product.title,
      description: data.product.subtitle ?? data.product.description ?? "",
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "محصول یافت نشد | OHS Plus" }, { name: "robots", content: "noindex" }],
      };
    }
    const description = loaderData.description.slice(0, 155);
    return {
      meta: [
        { title: `${loaderData.title} | OHS Plus` },
        { name: "description", content: description },
        { property: "og:title", content: `${loaderData.title} | OHS Plus` },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  errorComponent: ({ error }) => (
    <div role="alert" className="container-page py-24 text-center text-destructive">
      خطا در بارگذاری محصول: {error.message}
    </div>
  ),
  notFoundComponent: () => (
    <div className="container-page py-24 text-center">
      <p className="text-lg font-bold">این محصول پیدا نشد.</p>
      <Link to="/products" className="mt-4 inline-block text-accent underline-offset-4 hover:underline">
        بازگشت به فروشگاه
      </Link>
    </div>
  ),
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(productQuery(slug));
  const product = data!.product;
  const { data: related } = useQuery(
    relatedProductsQuery(product.categories?.slug ?? null, product.slug),
  );

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        <div className="border-b border-border/70 bg-muted/40">
          <div className="container-page py-8">
            <PageBreadcrumb
              items={[
                { label: "فروشگاه", href: "/products" },
                { label: product.title },
              ]}
            />
          </div>
        </div>

        <div className="container-page grid gap-10 py-10 lg:grid-cols-[1fr_340px]">
          <article className="space-y-8">
            <header className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {product.badge ? <Badge>{product.badge}</Badge> : null}
                {product.categories ? (
                  <Link
                    to="/products"
                    search={{ q: "", category: product.categories.slug, sort: "newest" }}
                    className="text-xs font-semibold text-accent underline-offset-4 hover:underline"
                  >
                    {product.categories.name}
                  </Link>
                ) : null}
              </div>
              <div className="flex items-start justify-between gap-3">
                <h1 className="text-2xl leading-10 font-extrabold sm:text-3xl">{product.title}</h1>
                <FavoriteButton productId={product.id} size="lg" className="mt-1" />
              </div>

              {product.subtitle ? (
                <p className="text-sm leading-8 text-muted-foreground">{product.subtitle}</p>
              ) : null}
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="size-4 fill-primary text-primary" aria-hidden="true" />
                  {toFa(product.rating_avg.toFixed(1).replace(".", "٫"))} از{" "}
                  {toFa(product.rating_count)} نظر
                </span>
                <span className="flex items-center gap-1">
                  <Download className="size-4" aria-hidden="true" />
                  {toFa(product.download_count)} دانلود
                </span>
                {product.published_at ? <span>{formatDateFa(product.published_at)}</span> : null}
              </div>
            </header>

            {data!.images.length > 0 ? (
              <ul className="grid gap-3 sm:grid-cols-2">
                {data!.images.map((image) => (
                  <li key={image.id}>
                    <img
                      src={image.url}
                      alt={image.alt ?? product.title}
                      loading="lazy"
                      className="w-full rounded-lg border border-border/70 object-cover"
                    />
                  </li>
                ))}
              </ul>
            ) : null}

            <section aria-labelledby="desc-heading" className="space-y-3">
              <h2 id="desc-heading" className="text-lg font-extrabold">
                توضیحات
              </h2>
              <div className="space-y-4 text-sm leading-8 text-muted-foreground">
                {(product.description ?? "توضیحات این منبع به‌زودی تکمیل می‌شود.")
                  .split("\n")
                  .filter(Boolean)
                  .map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
              </div>
            </section>

            <Separator />

            <section aria-labelledby="reviews-heading" className="space-y-4">
              <h2 id="reviews-heading" className="text-lg font-extrabold">
                نظرات کاربران
              </h2>
              {data!.reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  هنوز نظری برای این منبع ثبت نشده است.
                </p>
              ) : (
                <ul className="space-y-4">
                  {data!.reviews.map((review) => (
                    <li key={review.id} className="rounded-lg border border-border/70 p-4">
                      <div className="flex items-center gap-1 text-primary">
                        {Array.from({ length: review.rating }).map((_, index) => (
                          <Star key={index} className="size-3.5 fill-current" aria-hidden="true" />
                        ))}
                        <span className="sr-only">{toFa(review.rating)} از ۵</span>
                      </div>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">{review.body}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </article>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Card className="border-border/70 shadow-none">
              <CardContent className="space-y-4 p-5">
                <p className="font-display text-2xl font-extrabold text-primary">
                  {formatToman(product.price_toman, product.is_free)}
                </p>
                {product.compare_at_toman ? (
                  <p className="text-xs text-muted-foreground line-through">
                    {formatToman(product.compare_at_toman, false)}
                  </p>
                ) : null}
                <Button size="lg" className="w-full gap-2 font-bold">
                  <ShoppingCart className="size-4" aria-hidden="true" />
                  افزودن به سبد خرید
                </Button>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <FileSpreadsheet className="size-4 text-primary" aria-hidden="true" />
                    {product.file_format ?? "فایل دیجیتال"}
                  </li>
                  <li className="flex items-center gap-2">
                    <Download className="size-4 text-primary" aria-hidden="true" />
                    دانلود آنی پس از خرید
                  </li>
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
                    به‌روزرسانی رایگان نسخه‌های بعدی
                  </li>
                </ul>
              </CardContent>
            </Card>
          </aside>
        </div>

        {related && related.length > 0 ? (
          <section className="container-page pb-16" aria-labelledby="related-heading">
            <h2 id="related-heading" className="text-lg font-extrabold">
              منابع مرتبط
            </h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <li key={item.id}>
                  <ProductCard product={item} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}
