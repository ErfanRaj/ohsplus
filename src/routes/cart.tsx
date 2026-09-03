import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MAX_QUANTITY, useCart } from "@/hooks/use-cart";
import { formatToman, toFa } from "@/lib/catalog";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "سبد خرید | OHS Plus" },
      {
        name: "description",
        content: "بررسی منابع انتخاب‌شده، تغییر تعداد و ادامه به مرحله پرداخت در OHS Plus.",
      },
      { property: "og:title", content: "سبد خرید | OHS Plus" },
      { property: "og:description", content: "مدیریت منابع انتخاب‌شده پیش از پرداخت." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, subtotal, total, count, setQuantity, remove, clear } = useCart();

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        <div className="border-b border-border/70 bg-muted/40">
          <div className="container-page py-8">
            <PageBreadcrumb items={[{ label: "سبد خرید" }]} />
            <h1 className="mt-3 text-2xl font-extrabold md:text-3xl">سبد خرید</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {count > 0
                ? `${toFa(count)} مورد در سبد شما قرار دارد.`
                : "هنوز موردی به سبد اضافه نکرده‌اید."}
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="container-page flex flex-col items-center justify-center gap-4 py-24 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShoppingCart className="size-7" aria-hidden="true" />
            </span>
            <p className="text-sm text-muted-foreground">سبد خرید شما خالی است.</p>
            <Button asChild className="font-semibold">
              <Link to="/products" search={{ q: "", category: "", sort: "newest" }}>
                مشاهده فروشگاه
              </Link>
            </Button>
          </div>
        ) : (
          <div className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_320px]">
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.productId}>
                  <Card className="border-border/70 shadow-none">
                    <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                      <div className="size-20 shrink-0 overflow-hidden rounded-lg border border-border/70 bg-muted/50">
                        {item.product?.cover_image_url ? (
                          <img
                            src={item.product.cover_image_url}
                            alt={item.product.title}
                            loading="lazy"
                            className="size-full object-cover"
                          />
                        ) : null}
                      </div>

                      <div className="min-w-0 flex-1">
                        {item.product ? (
                          <Link
                            to="/products/$slug"
                            params={{ slug: item.product.slug }}
                            className="text-sm font-bold underline-offset-4 hover:underline"
                          >
                            {item.product.title}
                          </Link>
                        ) : (
                          <span className="text-sm font-bold text-muted-foreground">
                            این منبع دیگر در دسترس نیست
                          </span>
                        )}
                        <p className="mt-1 text-xs text-muted-foreground">
                          {item.product?.file_format ?? "فایل دیجیتال"}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 rounded-lg border border-border/70 p-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8"
                          aria-label="کاهش تعداد"
                          disabled={item.quantity <= 1}
                          onClick={() => setQuantity(item.productId, item.quantity - 1)}
                        >
                          <Minus className="size-4" aria-hidden="true" />
                        </Button>
                        <span className="w-8 text-center text-sm font-bold">
                          {toFa(item.quantity)}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8"
                          aria-label="افزایش تعداد"
                          disabled={item.quantity >= MAX_QUANTITY}
                          onClick={() => setQuantity(item.productId, item.quantity + 1)}
                        >
                          <Plus className="size-4" aria-hidden="true" />
                        </Button>
                      </div>

                      <span className="min-w-28 text-sm font-extrabold text-primary sm:text-left">
                        {item.product
                          ? formatToman(
                              item.product.price_toman * item.quantity,
                              item.product.is_free,
                            )
                          : "—"}
                      </span>

                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="حذف از سبد"
                        onClick={() => remove(item.productId)}
                      >
                        <Trash2 className="size-4 text-destructive" aria-hidden="true" />
                      </Button>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <Card className="border-border/70 shadow-none">
                <CardContent className="space-y-4 p-5">
                  <h2 className="text-base font-extrabold">خلاصه سفارش</h2>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>جمع اقلام</span>
                    <span>{formatToman(subtotal, subtotal === 0)}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-sm font-extrabold">
                    <span>مبلغ قابل پرداخت</span>
                    <span className="text-primary">{formatToman(total, total === 0)}</span>
                  </div>
                  <Button asChild size="lg" className="w-full font-bold">
                    <Link to="/checkout">ادامه به پرداخت</Link>
                  </Button>
                  <Button variant="ghost" className="w-full text-xs" onClick={clear}>
                    خالی کردن سبد
                  </Button>
                </CardContent>
              </Card>
            </aside>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
