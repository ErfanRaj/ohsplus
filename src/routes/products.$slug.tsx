@@
-import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
-import { createFileRoute, Link, notFound } from "@tanstack/react-router";
+import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
+import { createFileRoute, Link, notFound } from "@tanstack/react-router";
@@
-import {
-  formatDateFa,
-  formatToman,
-  productQuery,
-  relatedProductsQuery,
-  toFa,
-} from "@/lib/catalog";
+import {
+  formatDateFa,
+  formatToman,
+  productQuery,
+  relatedProductsQuery,
+  toFa,
+} from "@/lib/catalog";
+import { CommentList } from "@/components/comments/CommentList";
+import { CommentForm } from "@/components/comments/CommentForm";
@@
-            <Separator />
-
-            <section aria-labelledby="reviews-heading" className="space-y-4">
+            <Separator />
+
+            <section aria-labelledby="reviews-heading" className="space-y-4">
               <h2 id="reviews-heading" className="text-lg font-extrabold">
                 نظرات کاربران
               </h2>
@@
-            </section>
+            </section>
+
+            <section aria-labelledby="comments-heading" className="space-y-4">
+              <h2 id="comments-heading" className="text-lg font-extrabold">نظرات</h2>
+              <CommentList resourceType="product" resourceSlug={product.slug} />
+              <CommentForm resourceType="product" resourceSlug={product.slug} />
+            </section>
           </article>
@@
 export default ProductDetailPage
+