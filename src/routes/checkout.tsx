import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, CreditCard, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { supabase } from "@/integrations/supabase/client";
import { formatToman, toFa } from "@/lib/catalog";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "تکمیل سفارش | OHS Plus" },
      {
        name: "description",
        content: "تکمیل اطلاعات خریدار و ادامه به مرحله پرداخت منابع تخصصی OHS Plus.",
      },
      { property: "og:title", content: "تکمیل سفارش | OHS Plus" },
      { property: "og:description", content: "ثبت سفارش منابع دیجیتال ایمنی و بهداشت کار." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

const checkoutSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, { message: "نام و نام خانوادگی را کامل وارد کنید." })
    .max(120, { message: "نام واردشده بیش از حد طولانی است." }),
  phone: z
    .string()
    .trim()
    .regex(/^0?9\d{9}$/, { message: "شماره موبایل معتبر وارد کنید (مثال: ۰۹۱۲۱۲۳۴۵۶۷)." }),
  email: z
    .string()
    .trim()
    .email({ message: "ایمیل معتبر وارد کنید." })
    .max(255, { message: "ایمیل واردشده بیش از حد طولانی است." }),
  terms_accepted: z.literal(true, { message: "برای ادامه باید قوانین سایت را بپذیرید." }),
});

type FieldErrors = Partial<Record<keyof z.infer<typeof checkoutSchema>, string>>;

function toEnglishDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, subtotal, total, count, clear } = useCart();

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    terms_accepted: false,
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      email: prev.email || user.email || "",
      full_name: prev.full_name || String(user.user_metadata?.full_name ?? ""),
    }));
  }, [user]);

  useEffect(() => {
    if (!orderId && count === 0) {
      navigate({ to: "/cart", replace: true });
    }
  }, [count, orderId, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = checkoutSchema.safeParse({
      ...form,
      phone: toEnglishDigits(form.phone),
    });

    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});

    const lines = items.filter((item) => item.product);
    if (lines.length === 0) {
      toast.error("سبد خرید شما خالی است.");
      return;
    }

    setSubmitting(true);
    try {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user?.id ?? null,
          full_name: parsed.data.full_name,
          phone: parsed.data.phone,
          email: parsed.data.email,
          terms_accepted: true,
          subtotal_toman: subtotal,
          total_toman: total,
          status: "pending_payment",
        })
        .select("id")
        .single();
      if (orderError) throw orderError;

      const { error: itemsError } = await supabase.from("order_items").insert(
        lines.map((item) => ({
          order_id: order.id,
          product_id: item.productId,
          title: item.product!.title,
          unit_price_toman: item.product!.is_free ? 0 : item.product!.price_toman,
          quantity: item.quantity,
        })),
      );
      if (itemsError) throw itemsError;

      setOrderId(order.id);
      clear();
    } catch {
      toast.error("ثبت سفارش انجام نشد. لطفاً دوباره تلاش کنید.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        <div className="border-b border-border/70 bg-muted/40">
          <div className="container-page py-8">
            <PageBreadcrumb items={[{ label: "سبد خرید", href: "/cart" }, { label: "تکمیل سفارش" }]} />
            <h1 className="mt-3 text-2xl font-extrabold md:text-3xl">تکمیل سفارش</h1>
          </div>
        </div>

        {orderId ? (
          <div className="container-page flex justify-center py-20">
            <Card className="w-full max-w-lg border-border/70 shadow-none">
              <CardContent className="flex flex-col items-center justify-center gap-4 p-8 text-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CheckCircle2 className="size-7" aria-hidden="true" />
                </span>
                <h2 className="text-lg font-extrabold">سفارش شما ثبت شد</h2>
                <p className="text-sm leading-7 text-muted-foreground">
                  سفارش با وضعیت «در انتظار پرداخت» ذخیره شد. درگاه پرداخت آنلاین به‌زودی فعال
                  می‌شود و پس از آن می‌توانید پرداخت را از پیشخوان خود تکمیل کنید.
                </p>
                <p className="text-xs text-muted-foreground" dir="ltr">
                  #{orderId.slice(0, 8)}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Button asChild className="font-semibold">
                    <Link to="/products" search={{ q: "", category: "", sort: "newest" }}>
                      ادامه خرید
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="font-semibold">
                    <Link to="/dashboard">پیشخوان من</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_320px]"
          >
            <Card className="border-border/70 shadow-none">
              <CardContent className="space-y-5 p-6">
                <h2 className="text-base font-extrabold">اطلاعات خریدار</h2>

                <div className="grid gap-2">
                  <Label htmlFor="full_name">نام و نام خانوادگی</Label>
                  <Input
                    id="full_name"
                    value={form.full_name}
                    maxLength={120}
                    onChange={(event) => setForm({ ...form, full_name: event.target.value })}
                    aria-invalid={Boolean(errors.full_name)}
                  />
                  {errors.full_name ? (
                    <p className="text-xs text-destructive">{errors.full_name}</p>
                  ) : null}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone">شماره موبایل</Label>
                  <Input
                    id="phone"
                    dir="ltr"
                    inputMode="tel"
                    placeholder="09121234567"
                    value={form.phone}
                    maxLength={20}
                    onChange={(event) => setForm({ ...form, phone: event.target.value })}
                    aria-invalid={Boolean(errors.phone)}
                  />
                  {errors.phone ? <p className="text-xs text-destructive">{errors.phone}</p> : null}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">ایمیل</Label>
                  <Input
                    id="email"
                    dir="ltr"
                    type="email"
                    value={form.email}
                    maxLength={255}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    aria-invalid={Boolean(errors.email)}
                  />
                  {errors.email ? <p className="text-xs text-destructive">{errors.email}</p> : null}
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-border/70 p-4">
                  <Checkbox
                    id="terms"
                    checked={form.terms_accepted}
                    onCheckedChange={(checked) =>
                      setForm({ ...form, terms_accepted: checked === true })
                    }
                  />
                  <Label htmlFor="terms" className="text-xs leading-6 font-normal">
                    <span>
                      قوانین و مقررات سایت را مطالعه کرده‌ام و می‌پذیرم.{" "}
                      <Link to="/terms" className="text-accent underline-offset-4 hover:underline">
                        مشاهده قوانین
                      </Link>
                    </span>
                  </Label>
                </div>
                {errors.terms_accepted ? (
                  <p className="text-xs text-destructive">{errors.terms_accepted}</p>
                ) : null}
              </CardContent>
            </Card>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <Card className="border-border/70 shadow-none">
                <CardContent className="space-y-4 p-5">
                  <h2 className="text-base font-extrabold">خلاصه سفارش</h2>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    {items.map((item) => (
                      <li key={item.productId} className="flex items-start justify-between gap-3">
                        <span className="min-w-0 flex-1 truncate">
                          {item.product?.title ?? "—"}
                        </span>
                        <span className="shrink-0">× {toFa(item.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                  <Separator />
                  <div className="flex items-center justify-between text-sm font-extrabold">
                    <span>مبلغ قابل پرداخت</span>
                    <span className="text-primary">{formatToman(total, total === 0)}</span>
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full gap-2 font-bold"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <CreditCard className="size-4" aria-hidden="true" />
                    )}
                    ادامه به پرداخت
                  </Button>
                  <p className="text-[11px] leading-5 text-muted-foreground">
                    پرداخت آنلاین به‌زودی فعال می‌شود؛ فعلاً سفارش شما با وضعیت «در انتظار پرداخت»
                    ثبت می‌شود.
                  </p>
                </CardContent>
              </Card>
            </aside>
          </form>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
