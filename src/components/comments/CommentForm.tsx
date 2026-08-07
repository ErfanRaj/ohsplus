import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";

export function CommentForm({ resourceType, resourceSlug }: { resourceType: "article" | "product"; resourceSlug: string; }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  if (!user) {
    return (
      <p className="text-sm text-muted-foreground">
        برای ثبت نظر <a className="text-accent underline" href="/auth">وارد شوید</a>.
      </p>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;
    setBusy(true);
    try {
      const token = await (window as any).__supabase_access_token__ || "";
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "content-type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ resourceType, resourceSlug, body: trimmed }),
      });
      if (!res.ok) throw new Error("Failed");
      setBody("");
      qc.invalidateQueries(["comments", resourceType, resourceSlug]);
    } catch (err) {
      console.error(err);
      alert("خطا در ارسال نظر");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <label className="sr-only">نظر شما</label>
      <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} className="w-full rounded-md border p-2" placeholder="نظر خود را بنویسید…" required maxLength={2000} />
      <div className="flex items-center gap-2">
        <button disabled={busy} className="btn btn-primary">
          {busy ? "در حال ارسال…" : "ارسال نظر"}
        </button>
        <span className="text-xs text-muted-foreground">نظرها پس از بررسی نمایش داده می‌شوند</span>
      </div>
    </form>
  );
}
