import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export type FavoriteProduct = {
  id: string;
  slug: string;
  title: string;
  price_toman: number;
  is_free: boolean;
  file_format: string | null;
};

export function useFavoriteIds() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["favorite-ids", user?.id ?? null],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase.from("favorites").select("product_id");
      if (error) throw error;
      return new Set((data ?? []).map((row) => row.product_id));
    },
  });
}

export function useFavoriteProducts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["favorite-products", user?.id ?? null],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("favorites")
        .select(
          "product_id, created_at, products(id, slug, title, price_toman, is_free, file_format)",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? [])
        .map((row) => row.products as FavoriteProduct | null)
        .filter((p): p is FavoriteProduct => Boolean(p));
    },
  });
}

export function useToggleFavorite() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, isFavorite }: { productId: string; isFavorite: boolean }) => {
      if (!user) throw new Error("auth");
      if (isFavorite) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("product_id", productId)
          .eq("user_id", user.id);
        if (error) throw error;
        return false;
      }
      const { error } = await supabase
        .from("favorites")
        .insert({ product_id: productId, user_id: user.id });
      if (error) throw error;
      return true;
    },
    onSuccess: (added) => {
      queryClient.invalidateQueries({ queryKey: ["favorite-ids"] });
      queryClient.invalidateQueries({ queryKey: ["favorite-products"] });
      toast.success(added ? "به علاقه‌مندی‌ها اضافه شد" : "از علاقه‌مندی‌ها حذف شد");
    },
    onError: (error) => {
      toast.error(
        error.message === "auth"
          ? "برای افزودن به علاقه‌مندی‌ها وارد شوید"
          : "ثبت علاقه‌مندی ناموفق بود",
      );
    },
  });
}
