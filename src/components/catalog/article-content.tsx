import DOMPurify from "dompurify";
import { useMemo } from "react";

import { IMAGE_BUCKET, resolveImageUrl } from "@/lib/uploads";

/** Renders admin-authored article HTML after sanitising it. */
export function ArticleContent({ html }: { html: string }) {
  const clean = useMemo(() => {
    const sanitized = DOMPurify.sanitize(html, {
      USE_PROFILES: { html: true },
      ADD_ATTR: ["target", "rel", "colspan", "rowspan", "style"],
    });
    // Rewrite stored bucket links (including expired signed URLs) onto the media route.
    return sanitized.replace(
      new RegExp(`https?://[^"'\\s]*/${IMAGE_BUCKET}/[^"'\\s]+`, "g"),
      (match) => resolveImageUrl(match) ?? match,
    );
  }, [html]);


  return (
    <div
      className="article-content text-sm leading-8 text-muted-foreground"
      // Sanitised above with DOMPurify.
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}

export function KeyTakeaways({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <aside
      aria-labelledby="takeaways-heading"
      className="rounded-xl border border-primary/30 bg-primary/5 p-5"
    >
      <h2 id="takeaways-heading" className="text-base font-extrabold text-primary">
        نکات کلیدی
      </h2>
      <ul className="mt-3 space-y-2 text-sm leading-7">
        {items.map((item, index) => (
          <li key={index} className="flex gap-2">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
