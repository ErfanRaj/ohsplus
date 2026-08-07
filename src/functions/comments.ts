import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { fetchComments, createComment } from "@/integrations/supabase/comments.server";

// Simple in-memory rate limiter per userId (replace with Redis for production)
const recentPosts = new Map<string, number[]>();

export default async function handler(req: Request) {
  try {
    if (req.method === "GET") {
      const url = new URL(req.url);
      const resourceType = (url.searchParams.get("resourceType") || "article") as
        | "article"
        | "product";
      const resourceSlug = url.searchParams.get("resourceSlug") || "";
      const data = await fetchComments(resourceType, resourceSlug);
      // only return moderated comments to public
      return new Response(JSON.stringify((data || []).filter((c: any) => c.moderated)), {
        headers: { "content-type": "application/json; charset=utf-8" },
      });
    }

    if (req.method === "POST") {
      return await requireSupabaseAuth.server(async ({ context }) => {
        const body = await req.json().catch(() => ({}));
        const resourceType = body.resourceType as "article" | "product";
        const resourceSlug = body.resourceSlug as string;
        const commentBody = String(body.body || "").slice(0, 2000).trim();
        if (!resourceSlug || !commentBody) {
          return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
        }

        // rate-limit by userId
        const userId = context.userId;
        const now = Date.now();
        const window = 60_000; // 1 minute
        const maxPerWindow = 5;
        const arr = recentPosts.get(userId) || [];
        const filtered = arr.filter((t) => t > now - window);
        if (filtered.length >= maxPerWindow) {
          return new Response(JSON.stringify({ error: "Rate limit" }), { status: 429 });
        }
        filtered.push(now);
        recentPosts.set(userId, filtered);

        // minimal sanitization
        const sanitized = commentBody.replace(/[^\S\r\n\t\p{L}\p{N}\p{P}\p{Z}]+/gu, " ").trim();

        const displayName = (context.claims?.name || context.claims?.full_name || "کاربر") as string;
        const data = await createComment(resourceType, resourceSlug, userId, displayName, sanitized);
        return new Response(JSON.stringify({ success: true, comment: data?.[0] ?? null }), {
          headers: { "content-type": "application/json; charset=utf-8" },
        });
      })({} as any);
    }

    return new Response(null, { status: 405 });
  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message || String(err) }), { status: 500 });
  }
}
