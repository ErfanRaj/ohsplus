import { useNavigate } from "@tanstack/react-router";
import { Heart } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { useFavoriteIds, useToggleFavorite } from "@/lib/favorites";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  productId,
  className,
  size = "sm",
}: {
  productId: string;
  className?: string;
  size?: "sm" | "lg";
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: ids } = useFavoriteIds();
  const toggle = useToggleFavorite();
  const isFavorite = ids?.has(productId) ?? false;

  return (
    <button
      type="button"
      aria-pressed={isFavorite}
      aria-label={isFavorite ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
      title={isFavorite ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!user) {
          navigate({ to: "/auth", search: { redirect: window.location.pathname } });
          return;
        }
        toggle.mutate({ productId, isFavorite });
      }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border border-border/70 bg-card transition-colors hover:border-primary/60",
        size === "lg" ? "size-10" : "size-8",
        className,
      )}
    >
      <Heart
        className={cn(
          size === "lg" ? "size-5" : "size-4",
          "transition-colors",
          isFavorite ? "fill-primary text-primary" : "text-muted-foreground",
        )}
        aria-hidden="true"
      />
    </button>
  );
}
