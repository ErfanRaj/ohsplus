import { useNavigate } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useRef, useState } from "react";

import { useAuth } from "@/hooks/use-auth";
import { useFavoriteIds, useToggleFavorite } from "@/lib/favorites";
import { cn } from "@/lib/utils";

const SPARKS = [
  { x: "-14px", y: "-14px" },
  { x: "14px", y: "-14px" },
  { x: "-16px", y: "10px" },
  { x: "16px", y: "12px" },
  { x: "0px", y: "-20px" },
  { x: "0px", y: "18px" },
];

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
  const [burst, setBurst] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        setBurst((n) => n + 1);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setBurst(0), 700);
        toggle.mutate({ productId, isFavorite });
      }}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-full border border-border/70 bg-card transition-colors hover:border-primary/60",
        size === "lg" ? "size-10" : "size-8",
        className,
      )}
    >
      {burst > 0 ? (
        <>
          <span
            key={`ring-${burst}`}
            className="heart-burst pointer-events-none absolute inset-0 rounded-full border border-primary/70"
            aria-hidden="true"
          />
          {SPARKS.map((spark, index) => (
            <span
              key={`spark-${burst}-${index}`}
              className="heart-spark pointer-events-none absolute size-1 rounded-full bg-primary"
              style={
                { "--spark-x": spark.x, "--spark-y": spark.y } as React.CSSProperties
              }
              aria-hidden="true"
            />
          ))}
        </>
      ) : null}
      <Heart
        key={`heart-${burst}`}
        className={cn(
          size === "lg" ? "size-5" : "size-4",
          "relative transition-colors",
          burst > 0 && "heart-pop",
          isFavorite ? "fill-primary text-primary" : "text-muted-foreground",
        )}
        aria-hidden="true"
      />
    </button>
  );
}
