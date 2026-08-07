@@
 export default {
   async fetch(request: Request, env: unknown, ctx: unknown) {
     try {
       const handler = await getServerEntry();
       const response = await handler.fetch(request, env, ctx);
-      return await normalizeCatastrophicSsrResponse(response);
+      const normalized = await normalizeCatastrophicSsrResponse(response);
+      // Inject minimal security headers on server responses
+      const headers = new Headers(normalized.headers);
+      // CSP-lite: only allow same-origin for scripts/styles by default; adjust as needed
+      headers.set(
+        "Content-Security-Policy",
+        "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self';"
+      );
+      headers.set("X-Frame-Options", "DENY");
+      headers.set("X-Content-Type-Options", "nosniff");
+      headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
+      return new Response(await normalized.clone().arrayBuffer(), { status: normalized.status, headers });
     } catch (error) {
       console.error(error);
       return new Response(renderErrorPage(), {
         status: 500,
         headers: { "content-type": "text/html; charset=utf-8" },
       });
     }
   },
 };
