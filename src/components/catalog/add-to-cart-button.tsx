import { Check, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";

export function AddToCartButton({
  productId,
  size = "lg",
  className,
}: {
  productId: string;
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  const { add, has } = useCart();
  const inCart = has(productId);

  return (
    <Button
      size={size}
      variant={inCart ? "outline" : "default"}
      className={cn("gap-2 font-bold", className)}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        add(productId);
      }}
    >
      {inCart ? (
        <Check className="size-4" aria-hidden="true" />
      ) : (
        <ShoppingCart className="size-4" aria-hidden="true" />
      )}
      {inCart ? "در سبد خرید" : "افزودن به سبد خرید"}
    </Button>
  );
}
