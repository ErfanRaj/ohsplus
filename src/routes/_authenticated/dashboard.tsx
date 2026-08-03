import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Download,
  FileText,
  HardHat,
  Heart,
  Loader2,
  Microscope,
  Flame,
  ShieldCheck,
  ShoppingBag,
  Stethoscope,
  Trash2,
  UserCog,
  UserRound,
  Wrench,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { formatToman, toFa } from "@/lib/catalog";
import { useFavoriteProducts, useToggleFavorite } from "@/lib/favorites";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "پیشخوان من | OHS Plus" },
      { name: "description", content: "مدیریت حساب کاربری، علاقه‌مندی‌ها و دانلودهای شما در OHS Plus." },
      { property: "og:title", content: "پیشخوان من | OHS Plus" },
      { property: "og:description", content: "دسترسی سریع به علاقه‌مندی‌ها و اطلاعات حساب." },
      { property: "og:url", content: "/dashboard" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/dashboard" }],
  }),
  component: DashboardPage,
});

const ROLE_LABELS: Record<string, string> = {
  customer: "کاربر",
  editor: "نویسنده",
  support: "پشتیبانی",
  admin: "مدیر",
  super_admin: "مدیر ارشد",
};

const CHARACTERS = [
  { key: "helmet", label: "کارشناس ایمنی", icon: HardHat },
  { key: "hygiene", label: "بهداشت حرفه‌ای", icon: Stethoscope },
  { key: "lab", label: "کارشناس آزمایشگاه", icon: Microscope },
  { key: "fire", label: "آتش‌نشانی و اضطراری", icon: Flame },
  { key: "inspector", label: "بازرس فنی", icon: Wrench },
  { key: "hse", label: "مدیر HSE", icon: ShieldCheck },
  { key: "user", label: "کاربر عمومی", icon: UserRound },
];

function characterIcon(key: string | null | undefined) {
  return CHARACTERS.find((c) => c.key === key)?.icon ?? UserRound;
}

function DashboardPage() {
  const { user } = Route.useRouteContext();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-profile", user.id],
    queryFn: async () => {
      const [profile, roles] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name, company, job_title, bio, avatar_character")
          .eq("id", user.id)
          .maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", user.id),
      ]);
      if (profile.error) throw profile.error;
      if (roles.error) throw roles.error;
      return { profile: profile.data, roles: roles.data ?? [] };
    },
  });

  const [form, setForm] = useState({
    full_name: "",
    company: "",
    job_title: "",
    bio: "",
    avatar_character: "user",
  });

  useEffect(() => {
    if (!data?.profile) return;
    setForm({
      full_name: data.profile.full_name ?? "",
      company: data.profile.company ?? "",
      job_title: data.profile.job_title ?? "",
      bio: data.profile.bio ?? "",
      avatar_character: data.profile.avatar_character ?? "user",
    });
  }, [data?.profile]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: user.id, ...form }, { onConflict: "id" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-profile", user.id] });
      toast.success("اطلاعات حساب ذخیره شد");
    },
    onError: () => toast.error("ذخیره اطلاعات ناموفق بود"),
  });

  const favorites = useFavoriteProducts();
  const toggleFavorite = useToggleFavorite();

  const displayName =
    form.full_name || (user.user_metadata?.full_name as string) || user.email;
  const AvatarIcon = characterIcon(form.avatar_character);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="container-page flex-1 py-8 md:py-12">
        <PageBreadcrumb items={[{ label: "پیشخوان من" }]} />

        <header className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
              <AvatarIcon className="size-8" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-extrabold sm:text-3xl">سلام {displayName} 👋</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                اینجا اطلاعات حساب، علاقه‌مندی‌ها و دانلودهای شما جمع شده است.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {isLoading ? (
              <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden="true" />
            ) : data?.roles.length ? (
              data.roles.map((row) => (
                <Badge key={row.role} variant="secondary">
                  {ROLE_LABELS[row.role] ?? row.role}
                </Badge>
              ))
            ) : (
              <Badge variant="secondary">کاربر</Badge>
            )}
          </div>
        </header>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: ShoppingBag, title: "سفارش‌های من", value: "۰ سفارش" },
            { icon: Download, title: "دانلودهای فعال", value: "۰ فایل" },
            {
              icon: Heart,
              title: "علاقه‌مندی‌ها",
              value: `${toFa(favorites.data?.length ?? 0)} مورد`,
            },
            { icon: FileText, title: "نظرات ثبت‌شده", value: "۰ نظر" },
          ].map((card) => (
            <article key={card.title} className="rounded-xl border bg-card p-5 shadow-soft">
              <card.icon className="size-5 text-accent" aria-hidden="true" />
              <h2 className="mt-3 text-sm font-bold">{card.title}</h2>
              <p className="mt-1 text-lg font-extrabold">{card.value}</p>
            </article>
          ))}
        </div>

        {/* Favorites */}
        <section className="mt-8 rounded-xl border bg-card p-6 shadow-soft" aria-labelledby="fav-heading">
          <h2 id="fav-heading" className="flex items-center gap-2 text-base font-extrabold">
            <Heart className="size-4 fill-primary text-primary" aria-hidden="true" />
            علاقه‌مندی‌های من
          </h2>
          {favorites.isLoading ? (
            <Loader2 className="mt-4 size-5 animate-spin text-muted-foreground" aria-hidden="true" />
          ) : favorites.data?.length ? (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {favorites.data.map((product) => (
                <li
                  key={product.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border/70 p-4"
                >
                  <div className="min-w-0">
                    <Link
                      to="/products/$slug"
                      params={{ slug: product.slug }}
                      className="line-clamp-2 text-sm font-bold hover:text-primary"
                    >
                      {product.title}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {product.file_format ?? "فایل دیجیتال"} —{" "}
                      {formatToman(product.price_toman, product.is_free)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="حذف از علاقه‌مندی‌ها"
                    onClick={() =>
                      toggleFavorite.mutate({ productId: product.id, isFavorite: true })
                    }
                  >
                    <Trash2 className="size-4 text-muted-foreground" aria-hidden="true" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              هنوز موردی ذخیره نکرده‌اید. روی آیکن قلب هر فایل بزنید تا اینجا ذخیره شود.
            </p>
          )}
        </section>

        {/* Profile form */}
        <section className="mt-8 rounded-xl border bg-card p-6 shadow-soft" aria-labelledby="profile-heading">
          <h2 id="profile-heading" className="flex items-center gap-2 text-base font-extrabold">
            <UserCog className="size-4 text-accent" aria-hidden="true" />
            اطلاعات حساب
          </h2>

          <div className="mt-5">
            <p className="text-sm font-semibold">شخصیت پروفایل</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {CHARACTERS.map((character) => (
                <button
                  key={character.key}
                  type="button"
                  aria-pressed={form.avatar_character === character.key}
                  title={character.label}
                  onClick={() => setForm((prev) => ({ ...prev, avatar_character: character.key }))}
                  className={cn(
                    "flex size-14 items-center justify-center rounded-full border-2 transition-colors",
                    form.avatar_character === character.key
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50",
                  )}
                >
                  <character.icon className="size-6" aria-hidden="true" />
                  <span className="sr-only">{character.label}</span>
                </button>
              ))}
            </div>
          </div>

          <form
            className="mt-6 grid gap-4 sm:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              save.mutate();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="full_name">نام و نام خانوادگی</Label>
              <Input
                id="full_name"
                value={form.full_name}
                maxLength={100}
                onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">ایمیل</Label>
              <Input id="email" value={user.email ?? ""} dir="ltr" disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">سازمان / شرکت</Label>
              <Input
                id="company"
                value={form.company}
                maxLength={120}
                onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="job_title">سمت شغلی</Label>
              <Input
                id="job_title"
                value={form.job_title}
                maxLength={120}
                onChange={(e) => setForm((p) => ({ ...p, job_title: e.target.value }))}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="bio">درباره من</Label>
              <Textarea
                id="bio"
                rows={4}
                value={form.bio}
                maxLength={500}
                onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
              />
            </div>
            <div className="flex flex-wrap gap-3 sm:col-span-2">
              <Button type="submit" className="font-bold" disabled={save.isPending}>
                {save.isPending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : null}
                ذخیره تغییرات
              </Button>
              <Button asChild variant="outline" className="font-semibold">
                <Link to="/products" search={{ q: "", category: "", sort: "newest" }}>
                  مشاهده فروشگاه منابع
                </Link>
              </Button>
            </div>
          </form>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
