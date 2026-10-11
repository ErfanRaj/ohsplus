import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, FileCheck2, Search } from "lucide-react";
import { useMemo, useState } from "react";

import isoBanner from "@/assets/iso-plus-banner.jpg.asset.json";
import { InteractiveGrid } from "@/components/layout/interactive-grid";
import { ProductCard } from "@/components/catalog/product-card";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Input } from "@/components/ui/input";
import { isoContentQuery } from "@/lib/catalog";
import { resolveImageUrl } from "@/lib/uploads";

const STANDARDS = ["همه", "ISO 45001", "ISO 14001", "ISO 9001", "IMS"];

export const Route = createFileRoute("/iso-plus")({
  head: () => ({
    meta: [
      { title: "ISO+ | استانداردهای ایزو — OHS Plus" },
      {
        name: "description",
        content: "فایل‌ها، فرم‌ها و مقالات تخصصی استانداردهای ISO 45001، ISO 14001، ISO 9001 و IMS.",
      },
      { property: "og:title", content: "ISO+ | استانداردهای ایزو — OHS Plus" },
      {
        property: "og:description",
        content: "منابع و مقالات تخصصی پیاده‌سازی و ممیزی استانداردهای ایزو.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: IsoPlusPage,
});

function IsoPlusPage() {
  const { data, isLoading } = useQuery(isoContentQuery());
  const [q, setQ] = useState("");
  const [std, setStd] = useState("همه");

  const match = (text: string) => {
    const t = text.toLowerCase();
    const okQ = !q.trim() || t.includes(q.trim().toLowerCase());
    const okS = std === "همه" || t.includes(std.toLowerCase());
    return okQ && okS;
  };
  const products = useMemo(
    () => (data?.products ?? []).filter((p) => match(`${p.title} ${p.subtitle ?? ""}`)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, q, std],
  );
  const articles = useMemo(
    () => (data?.articles ?? []).filter((a) => match(`${a.title} ${a.excerpt ?? ""}`)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, q, std],
  );

  return (
    <div className="min-h-screen relative isolate bg-iso-concrete text-iso-navy">
      <InteractiveGrid variant="iso" />
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          {/* desktop: the artwork sits behind the copy */}
          <img
            src={isoBanner.url}
            alt=""
            className="absolute inset-0 hidden size-full object-cover opacity-90 md:block"
          />
          <div className="absolute inset-0 hidden bg-gradient-to-l from-iso-concrete via-iso-concrete/70 to-transparent md:block" />
          {/* mobile: the artwork is a band above the copy so the ISO mark is never cropped */}
          <img
            src={isoBanner.url}
            alt=""
            className="h-36 w-full object-cover object-[18%_center] sm:h-44 md:hidden"
          />
          <div className="container-page relative py-10 md:py-28">
            <div className="mr-auto max-w-xl md:mr-0">
              <p className="text-sm font-bold tracking-widest text-iso-green">STANDARDS HUB</p>
              <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl">
                دنیای استانداردها با{" "}
                <span dir="ltr" className="text-iso-navy">
                  ISO<sup className="text-iso-green drop-shadow-[0_0_10px_var(--iso-green)]">+</sup>
                </span>
              </h1>
              <p className="mt-4 leading-8 text-iso-navy/80">
                فرم‌ها، روش‌های اجرایی، چک‌لیست‌های ممیزی و مقالات تخصصی برای پیاده‌سازی
                استانداردهای ایمنی، محیط‌زیست و کیفیت.
              </p>
              <div className="relative mt-6">
                <Search className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-iso-navy/60" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="جستجو در منابع ISO…"
                  className="h-12 border-iso-navy/20 bg-background/90 pr-10"
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {STANDARDS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStd(s)}
                    className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-all ${
                      std === s
                        ? "border-iso-green bg-iso-navy text-iso-concrete shadow-[0_0_14px_var(--iso-green)]"
                        : "border-iso-navy/20 bg-background/70 hover:border-iso-green"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="container-page pt-14">
          <div className="rounded-2xl border border-iso-navy/15 bg-background/80 p-6 backdrop-blur md:p-10">
            <h2 className="text-center text-2xl font-black tracking-tight sm:text-3xl">
              <span dir="ltr" className="font-[Orbitron] tracking-wide text-iso-navy">
                ISO<sup className="text-iso-green drop-shadow-[0_0_14px_var(--iso-green)]">+</sup>
              </span>{" "}
              چیست؟
            </h2>
            <span
              aria-hidden="true"
              className="mx-auto mt-4 block h-1 w-16 rounded-full bg-iso-green shadow-[0_0_14px_var(--iso-green)]"
            />
            <p className="mt-5 text-justify leading-9 text-iso-navy/85">
              بخش ISO+ با هدف عبور از فرآیندهای سنتی و کاغذبازی‌های خسته‌کننده شکل گرفته است؛ جایی که
              دسترسی مستقیم مدیران، ممیزان و کارشناسان HSE به کاربردی‌ترین روش‌های اجرایی، چک‌لیست‌های
              میدانی و الزامات سیستم‌های مدیریت یکپارچه (ISO 45001، ISO 14001 و ISO 9001) با بالاترین
              انطباق و در ساده‌ترین شکل ممکن فراهم شده است.
            </p>
          </div>
        </section>

        <section className="container-page py-14">
          <h2 className="flex items-center gap-2 text-2xl font-extrabold">
            <FileCheck2 className="size-6 text-iso-green" /> فایل‌ها و مستندات ISO
          </h2>
          {isLoading ? (
            <p className="mt-6 text-iso-navy/70">در حال بارگذاری…</p>
          ) : products.length ? (
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {products.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} size="cover" />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 rounded-xl border border-dashed border-iso-navy/20 bg-background/60 p-8 text-center text-iso-navy/70">
              به‌زودی فایل‌های این بخش منتشر می‌شوند.
            </p>
          )}
        </section>

        <section className="container-page pb-20">
          <h2 className="flex items-center gap-2 text-2xl font-extrabold">
            <BookOpen className="size-6 text-iso-green" /> مقالات و آموزش‌های ISO
          </h2>
          {articles.length ? (
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {articles.map((a) => {
                const cover = resolveImageUrl(a.cover_image_url);
                return (
                  <li key={a.id}>
                    <Link
                      to="/articles/$slug"
                      params={{ slug: a.slug }}
                      className="group block h-full overflow-hidden rounded-xl border border-iso-navy/15 bg-background transition-all hover:-translate-y-1 hover:border-iso-green hover:shadow-[0_12px_30px_-12px_var(--iso-green)]"
                    >
                      {cover ? (
                        <img
                          src={cover}
                          alt={a.title}
                          loading="lazy"
                          className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex aspect-[16/10] w-full items-center justify-center bg-iso-navy text-iso-green">
                          <BookOpen className="size-10" aria-hidden="true" />
                        </div>
                      )}
                      <div className="p-5">
                        <h3 className="font-bold leading-7 group-hover:text-iso-navy">{a.title}</h3>
                        {a.excerpt ? (
                          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{a.excerpt}</p>
                        ) : null}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-6 rounded-xl border border-dashed border-iso-navy/20 bg-background/60 p-8 text-center text-iso-navy/70">
              به‌زودی مقالات این بخش منتشر می‌شوند.
            </p>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
