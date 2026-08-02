import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Clock } from "lucide-react";

import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { articleQuery, formatDateFa, toFa } from "@/lib/catalog";

export const Route = createFileRoute("/articles/$slug")({
  loader: async ({ context, params }) => {
    const article = await context.queryClient.ensureQueryData(articleQuery(params.slug));
    if (!article) throw notFound();
    return { title: article.title, description: article.excerpt ?? "" };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "مقاله یافت نشد | OHS Plus" }, { name: "robots", content: "noindex" }],
      };
    }
    const description = loaderData.description.slice(0, 155);
    return {
      meta: [
        { title: `${loaderData.title} | OHS Plus` },
        { name: "description", content: description },
        { property: "og:title", content: `${loaderData.title} | OHS Plus` },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  errorComponent: ({ error }) => (
    <div role="alert" className="container-page py-24 text-center text-destructive">
      خطا در بارگذاری مقاله: {error.message}
    </div>
  ),
  notFoundComponent: () => (
    <div className="container-page py-24 text-center">
      <p className="text-lg font-bold">این مقاله پیدا نشد.</p>
      <Link to="/articles" className="mt-4 inline-block text-accent underline-offset-4 hover:underline">
        بازگشت به دانشنامه
      </Link>
    </div>
  ),
  component: ArticleDetailPage,
});

function ArticleDetailPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(articleQuery(slug));
  const article = data!;

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        <div className="border-b border-border/70 bg-muted/40">
          <div className="container-page py-8">
            <PageBreadcrumb
              items={[{ label: "دانشنامه", href: "/articles" }, { label: article.title }]}
            />
          </div>
        </div>

        <article className="container-page max-w-3xl py-10">
          {article.categories ? (
            <Link
              to="/articles"
              search={{ q: "", category: article.categories.slug }}
              className="text-xs font-semibold text-accent underline-offset-4 hover:underline"
            >
              {article.categories.name}
            </Link>
          ) : null}
          <h1 className="mt-3 text-2xl leading-10 font-extrabold sm:text-3xl">{article.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="size-4" aria-hidden="true" />
              {toFa(article.reading_minutes)} دقیقه مطالعه
            </span>
            <span>{formatDateFa(article.published_at)}</span>
          </div>

          {article.excerpt ? (
            <p className="mt-6 rounded-lg border-s-4 border-primary bg-muted/50 p-4 text-sm leading-8">
              {article.excerpt}
            </p>
          ) : null}

          <div className="mt-8 space-y-5 text-sm leading-9 text-foreground/90">
            {(article.content ?? "متن این مقاله به‌زودی منتشر می‌شود.")
              .split("\n")
              .filter((line) => line.trim())
              .map((line, index) =>
                line.trim().startsWith("#") ? (
                  <h2 key={index} className="pt-4 text-lg font-extrabold">
                    {line.replace(/^#+\s*/, "")}
                  </h2>
                ) : (
                  <p key={index}>{line}</p>
                ),
              )}
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
