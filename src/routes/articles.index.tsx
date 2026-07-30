import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Clock, Search } from "lucide-react";

import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { articlesQuery, categoriesQuery, formatDateFa, toFa } from "@/lib/catalog";

type ArticleSearch = { q: string; category: string };

export const Route = createFileRoute("/articles/")({
  validateSearch: (search: Record<string, unknown>): ArticleSearch => ({
    q: typeof search.q === "string" ? search.q : "",
    category: typeof search.category === "string" ? search.category : "",
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => {
    context.queryClient.ensureQueryData(categoriesQuery());
    context.queryClient.ensureQueryData(articlesQuery(deps));
  },
  head: () => ({
    meta: [
      { title: "دانشنامه HSE | OHS Hub" },
      {
        name: "description",
        content:
          "مقالات کاربردی ایمنی، بهداشت حرفه‌ای و ارگونومی؛ راهنماهای گام‌به‌گام برای کارشناسان HSE.",
      },
      { property: "og:title", content: "دانشنامه HSE | OHS Hub" },
      {
        property: "og:description",
        content: "مقالات و راهنماهای تخصصی ایمنی و بهداشت حرفه‌ای.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  errorComponent: ({ error }) => (
    <div role="alert" className="container-page py-24 text-center text-destructive">
      خطا در بارگذاری مقالات: {error.message}
    </div>
  ),
  notFoundComponent: () => <div className="container-page py-24 text-center">مقاله‌ای یافت نشد.</div>,
  component: ArticlesPage,
});

function ArticlesPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { data: categories } = useQuery(categoriesQuery());
  const { data: articles } = useSuspenseQuery(articlesQuery(search));

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        <div className="border-b border-border/70 bg-muted/40">
          <div className="container-page py-8">
            <PageBreadcrumb items={[{ label: "دانشنامه" }]} />
            <h1 className="mt-4 text-2xl font-extrabold sm:text-3xl">دانشنامه HSE</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
              راهنماهای عملی، تفسیر استانداردها و تجربه‌های میدانی برای کارشناسان ایمنی و بهداشت
              حرفه‌ای.
            </p>
          </div>
        </div>

        <div className="container-page space-y-6 py-10">
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
                    search: (prev: ArticleSearch) => ({ ...prev, q: event.target.value }),
                    replace: true,
                  })
                }
                placeholder="جستجو در مقالات…"
                aria-label="جستجو در مقالات"
                className="pe-9"
              />
            </div>
            <Badge variant="secondary">{toFa(articles.length)} مقاله</Badge>
          </div>

          <ul className="flex flex-wrap gap-2">
            <li>
              <Link
                to="/articles"
                search={(prev: ArticleSearch) => ({ ...prev, category: "" })}
                className={`rounded-full border border-border/70 px-3 py-1.5 text-xs transition-colors hover:bg-muted ${
                  search.category === "" ? "border-primary bg-primary/10 font-bold text-primary" : ""
                }`}
              >
                همه موضوعات
              </Link>
            </li>
            {(categories ?? []).map((cat) => (
              <li key={cat.id}>
                <Link
                  to="/articles"
                  search={(prev: ArticleSearch) => ({ ...prev, category: cat.slug })}
                  className={`rounded-full border border-border/70 px-3 py-1.5 text-xs transition-colors hover:bg-muted ${
                    search.category === cat.slug
                      ? "border-primary bg-primary/10 font-bold text-primary"
                      : ""
                  }`}
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>

          {articles.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              مقاله‌ای با این فیلترها پیدا نشد.
            </p>
          ) : (
            <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <li key={article.id}>
                  <Link to="/articles/$slug" params={{ slug: article.slug }} className="block h-full">
                    <Card className="h-full border-border/70 shadow-none transition-all hover:-translate-y-0.5 hover:border-primary/60">
                      <CardContent className="flex h-full flex-col gap-3 p-5">
                        {article.categories ? (
                          <span className="text-xs font-semibold text-accent">
                            {article.categories.name}
                          </span>
                        ) : null}
                        <h2 className="text-base leading-7 font-bold">{article.title}</h2>
                        <p className="line-clamp-3 text-sm leading-7 text-muted-foreground">
                          {article.excerpt}
                        </p>
                        <div className="mt-auto flex items-center justify-between pt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="size-3.5" aria-hidden="true" />
                            {toFa(article.reading_minutes)} دقیقه مطالعه
                          </span>
                          <span>{formatDateFa(article.published_at)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
