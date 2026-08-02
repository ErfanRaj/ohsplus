import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, FileText, Loader2, ShoppingBag, UserCog } from "lucide-react";

import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "پیشخوان من | OHS Plus" },
      { name: "description", content: "مدیریت حساب کاربری، خریدها و دانلودهای شما در OHS Plus." },
      { property: "og:title", content: "پیشخوان من | OHS Plus" },
      { property: "og:description", content: "دسترسی سریع به خریدها و فایل‌های دانلودی." },
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

function DashboardPage() {
  const { user } = Route.useRouteContext();

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-profile", user.id],
    queryFn: async () => {
      const [profile, roles] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name, company, job_title")
          .eq("id", user.id)
          .maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", user.id),
      ]);
      if (profile.error) throw profile.error;
      if (roles.error) throw roles.error;
      return { profile: profile.data, roles: roles.data ?? [] };
    },
  });

  const displayName =
    data?.profile?.full_name || (user.user_metadata?.full_name as string) || user.email;

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="container-page flex-1 py-8 md:py-12">
        <PageBreadcrumb items={[{ label: "پیشخوان من" }]} />

        <header className="mt-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-extrabold sm:text-3xl">
              سلام {displayName} 👋
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              اینجا خریدها، دانلودها و اطلاعات حساب شما جمع شده است.
            </p>
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
            { icon: FileText, title: "نظرات ثبت‌شده", value: "۰ نظر" },
          ].map((card) => (
            <article key={card.title} className="rounded-xl border bg-card p-5 shadow-soft">
              <card.icon className="size-5 text-accent" aria-hidden="true" />
              <h2 className="mt-3 text-sm font-bold">{card.title}</h2>
              <p className="mt-1 text-lg font-extrabold">{card.value}</p>
            </article>
          ))}
        </div>

        <section className="mt-8 rounded-xl border bg-card p-6 shadow-soft">
          <h2 className="flex items-center gap-2 text-base font-extrabold">
            <UserCog className="size-4 text-accent" aria-hidden="true" />
            اطلاعات حساب
          </h2>
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">ایمیل</dt>
              <dd className="mt-1 font-semibold" dir="ltr">
                {user.email}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">سازمان</dt>
              <dd className="mt-1 font-semibold">{data?.profile?.company || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">سمت شغلی</dt>
              <dd className="mt-1 font-semibold">{data?.profile?.job_title || "—"}</dd>
            </div>
          </dl>
          <Button asChild variant="outline" className="mt-6 font-semibold">
            <Link to="/">مشاهده فروشگاه منابع</Link>
          </Button>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
