import { Link } from "@tanstack/react-router";
import { Download, FileSpreadsheet, Star } from "lucide-react";

import { FavoriteButton } from "@/components/catalog/favorite-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatToman, toFa, type ProductRow } from "@/lib/catalog";

export function ProductCard({ product }: { product: ProductRow }) {
  return (
    <Link to="/products/$slug" params={{ slug: product.slug }} className="block h-full">
      <Card className="h-full overflow-hidden border-border/70 shadow-none transition-all hover:-translate-y-0.5 hover:border-primary/60">
        <CardContent className="flex h-full flex-col gap-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileSpreadsheet className="size-5" aria-hidden="true" />
            </span>
            <div className="flex shrink-0 items-center gap-2">
              {product.badge ? <Badge variant="secondary">{product.badge}</Badge> : null}
              <FavoriteButton productId={product.id} />
            </div>
          </div>


          <div className="space-y-2">
            <h3 className="text-base leading-7 font-bold">{product.title}</h3>
            <p className="text-xs text-muted-foreground">
              {product.file_format ?? product.categories?.name ?? "فایل دیجیتال"}
            </p>
          </div>

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/70 pt-4">
            <span className="font-display text-base font-extrabold text-primary">
              {formatToman(product.price_toman, product.is_free)}
            </span>
            <span className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="size-3.5 fill-primary text-primary" aria-hidden="true" />
                {toFa(product.rating_avg.toFixed(1).replace(".", "٫"))}
              </span>
              <span className="flex items-center gap-1">
                <Download className="size-3.5" aria-hidden="true" />
                {toFa(product.download_count)}
              </span>
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
