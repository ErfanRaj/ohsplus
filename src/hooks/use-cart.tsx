import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "ohs-plus-cart";
export const MAX_QUANTITY = 99;

export type CartLine = { productId: string; quantity: number };

export type CartProduct = {
  id: string;
  slug: string;
  title: string;
  price_toman: number;
  is_free: boolean;
  file_format: string | null;
  cover_image_url: string | null;
};

export type CartItem = CartLine & { product: CartProduct | null };

type CartContextValue = {
  lines: CartLine[];
  items: CartItem[];
  count: number;
  subtotal: number;
  total: number;
  isLoading: boolean;
  add: (productId: string, quantity?: number) => void;
  remove: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  has: (productId: string) => boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

function readLocal(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((line) => typeof line?.productId === "string")
      .map((line) => ({
        productId: line.productId,
        quantity: Math.min(MAX_QUANTITY, Math.max(1, Number(line.quantity) || 1)),
      }));
  } catch {
    return [];
  }
}

function writeLocal(lines: CartLine[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    /* storage unavailable — cart stays in memory */
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const syncedFor = useRef<string | null>(null);

  useEffect(() => {
    setLines(readLocal());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) writeLocal(lines);
  }, [lines, hydrated]);

  /** On sign-in: merge the guest cart into the stored cart, then adopt the server state. */
  useEffect(() => {
    if (!hydrated || loading) return;
    if (!user) {
      syncedFor.current = null;
      return;
    }
    if (syncedFor.current === user.id) return;
    syncedFor.current = user.id;

    let active = true;
    (async () => {
      const { data, error } = await supabase.from("cart_items").select("product_id, quantity");
      if (error || !active) return;

      const server = new Map<string, number>(
        (data ?? []).map((row) => [row.product_id, row.quantity]),
      );
      const local = readLocal();
      const merged = new Map(server);
      for (const line of local) {
        merged.set(line.productId, Math.min(MAX_QUANTITY, Math.max(server.get(line.productId) ?? 0, line.quantity)));
      }

      const toUpsert = [...merged.entries()]
        .filter(([id, qty]) => server.get(id) !== qty)
        .map(([product_id, quantity]) => ({ user_id: user.id, product_id, quantity }));

      if (toUpsert.length) {
        await supabase.from("cart_items").upsert(toUpsert, { onConflict: "user_id,product_id" });
      }

      if (!active) return;
      setLines([...merged.entries()].map(([productId, quantity]) => ({ productId, quantity })));
    })();

    return () => {
      active = false;
    };
  }, [user, hydrated, loading]);

  const persist = useCallback(
    async (productId: string, quantity: number | null) => {
      if (!user) return;
      if (quantity === null) {
        await supabase.from("cart_items").delete().eq("product_id", productId).eq("user_id", user.id);
        return;
      }
      await supabase
        .from("cart_items")
        .upsert({ user_id: user.id, product_id: productId, quantity }, { onConflict: "user_id,product_id" });
    },
    [user],
  );

  const add = useCallback(
    (productId: string, quantity = 1) => {
      let next = quantity;
      setLines((prev) => {
        const existing = prev.find((line) => line.productId === productId);
        next = Math.min(MAX_QUANTITY, (existing?.quantity ?? 0) + quantity);
        if (existing) {
          return prev.map((line) => (line.productId === productId ? { ...line, quantity: next } : line));
        }
        return [...prev, { productId, quantity: next }];
      });
      void persist(productId, next);
      toast.success("به سبد خرید اضافه شد");
    },
    [persist],
  );

  const setQuantity = useCallback(
    (productId: string, quantity: number) => {
      const safe = Math.min(MAX_QUANTITY, Math.max(1, Math.trunc(quantity) || 1));
      setLines((prev) =>
        prev.map((line) => (line.productId === productId ? { ...line, quantity: safe } : line)),
      );
      void persist(productId, safe);
    },
    [persist],
  );

  const remove = useCallback(
    (productId: string) => {
      setLines((prev) => prev.filter((line) => line.productId !== productId));
      void persist(productId, null);
    },
    [persist],
  );

  const clear = useCallback(() => {
    setLines([]);
    writeLocal([]);
    if (user) void supabase.from("cart_items").delete().eq("user_id", user.id);
  }, [user]);

  const ids = useMemo(() => lines.map((line) => line.productId).sort(), [lines]);

  const { data: products, isLoading } = useQuery({
    queryKey: ["cart-products", ids],
    enabled: ids.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, slug, title, price_toman, is_free, file_format, cover_image_url")
        .in("id", ids);
      if (error) throw error;
      return (data ?? []) as CartProduct[];
    },
    staleTime: 60_000,
  });

  useEffect(() => {
    if (ids.length === 0) queryClient.removeQueries({ queryKey: ["cart-products"] });
  }, [ids.length, queryClient]);

  const value = useMemo<CartContextValue>(() => {
    const byId = new Map((products ?? []).map((product) => [product.id, product]));
    const items: CartItem[] = lines.map((line) => ({
      ...line,
      product: byId.get(line.productId) ?? null,
    }));
    const subtotal = items.reduce((sum, item) => {
      if (!item.product || item.product.is_free) return sum;
      return sum + item.product.price_toman * item.quantity;
    }, 0);

    return {
      lines,
      items,
      count: lines.reduce((sum, line) => sum + line.quantity, 0),
      subtotal,
      total: subtotal,
      isLoading: ids.length > 0 && isLoading,
      add,
      remove,
      setQuantity,
      clear,
      has: (productId: string) => lines.some((line) => line.productId === productId),
    };
  }, [lines, products, isLoading, ids.length, add, remove, setQuantity, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
