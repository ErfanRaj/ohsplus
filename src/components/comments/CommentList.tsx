import { useQuery } from "@tanstack/react-query";

export function CommentList({ resourceType, resourceSlug }: { resourceType: "article" | "product"; resourceSlug: string; }) {
  const { data, isLoading, error } = useQuery([
    "comments",
    resourceType,
    resourceSlug,
  ],
  async () => {
    const res = await fetch(
      `/api/comments?resourceType=${encodeURIComponent(resourceType)}&resourceSlug=${encodeURIComponent(resourceSlug)}`,
      { credentials: 'same-origin' }
    );
    if (!res.ok) throw new Error("Failed to load comments");
    return res.json();
  }, { staleTime: 60_000 });

  if (isLoading) return <p className="text-sm text-muted-foreground">در حال بارگذاری نظرات…</p>;
  if (error) return <p className="text-sm text-destructive">خطا در بارگذاری نظرات</p>;

  return (
    <ul className="space-y-4">
      {(data || []).map((c: any) => (
        <li key={c.id} className="rounded-lg border border-border/70 p-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm">{c.full_name}</span>
            <time className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleString()}</time>
          </div>
          <p className="mt-2 text-sm leading-7 text-foreground/90">{c.body}</p>
        </li>
      ))}
    </ul>
  );
}
