import { createFileRoute } from "@tanstack/react-router";

/**
 * Public image proxy for the private `product-images` bucket.
 * Images are meant to be publicly visible, but the bucket cannot be public in
 * this workspace, so the object is streamed here instead of relying on signed
 * URLs that eventually expire.
 */
export const Route = createFileRoute("/api/public/media/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = decodeURIComponent(String((params as { _splat?: string })._splat ?? ""));
        if (!path || path.includes("..")) {
          return new Response("Not found", { status: 404 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage.from("product-images").download(path);
        if (error || !data) {
          return new Response("Not found", { status: 404 });
        }

        return new Response(await data.arrayBuffer(), {
          headers: {
            "content-type": data.type || "application/octet-stream",
            "cache-control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
