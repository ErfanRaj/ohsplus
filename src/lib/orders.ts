import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending_payment: "در انتظار پرداخت",
  paid: "پرداخت‌شده",
  cancelled: "لغو شده",
  failed: "ناموفق",
};

export type OrderItemRow = {
  id: string;
  product_id: string | null;
  title: string;
  unit_price_toman: number;
  quantity: number;
};

export type OrderRow = {
  id: string;
  user_id: string | null;
  full_name: string;
  phone: string;
  email: string;
  subtotal_toman: number;
  total_toman: number;
  status: string;
  payment_provider: string | null;
  payment_reference: string | null;
  notes: string | null;
  created_at: string;
  order_items: OrderItemRow[];
};

const ORDER_FIELDS =
  "id, user_id, full_name, phone, email, subtotal_toman, total_toman, status, payment_provider, payment_reference, notes, created_at, order_items(id, product_id, title, unit_price_toman, quantity)";

/** All orders — readable by staff only (RLS). */
export const adminOrdersQuery = () =>
  queryOptions({
    queryKey: ["admin", "orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(ORDER_FIELDS)
        .order("created_at", { ascending: false })
        .limit(300);
      if (error) throw error;
      return (data ?? []) as unknown as OrderRow[];
    },
  });

/** Orders of the signed-in buyer. */
export const myOrdersQuery = (userId: string) =>
  queryOptions({
    queryKey: ["my-orders", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(ORDER_FIELDS)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as unknown as OrderRow[];
    },
    enabled: Boolean(userId),
  });

/**
 * Download links the buyer is entitled to.
 * RLS only returns rows for products inside the buyer's paid orders.
 */
export const myDownloadsQuery = (userId: string) =>
  queryOptions({
    queryKey: ["my-downloads", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_files")
        .select("id, product_id, label, version, download_url, storage_path")
        .is("deleted_at", null);
      if (error) throw error;
      return (data ?? []) as {
        id: string;
        product_id: string;
        label: string;
        version: string;
        download_url: string | null;
        storage_path: string | null;
      }[];
    },
    enabled: Boolean(userId),
  });

export async function updateOrderStatus(id: string, status: string) {
  const { error } = await supabase
    .from("orders")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update({ status: status as any })
    .eq("id", id);
  if (error) throw error;
}
