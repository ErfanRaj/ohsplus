import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export type AdminTable =
  | "products"
  | "articles"
  | "categories"
  | "tags"
  | "reviews"
  | "profiles"
  | "user_roles";

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export const isStaffQuery = (userId: string) =>
  queryOptions({
    queryKey: ["is-staff", userId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("is_staff", { _user_id: userId });
      if (error) throw error;
      return Boolean(data);
    },
    staleTime: 5 * 60_000,
  });

export const isAdminQuery = (userId: string) =>
  queryOptions({
    queryKey: ["is-admin", userId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("is_admin", { _user_id: userId });
      if (error) throw error;
      return Boolean(data);
    },
    staleTime: 5 * 60_000,
  });

/** Generic list query used by the admin CRUD pages. */
export const adminListQuery = (table: AdminTable, select: string, orderBy = "created_at") =>
  queryOptions({
    queryKey: ["admin", table, select, orderBy],
    queryFn: async () => {
      const { data, error } = await supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .from(table as any)
        .select(select)
        .order(orderBy, { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as unknown as Record<string, unknown>[];
    },
  });

export const adminStatsQuery = () =>
  queryOptions({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const count = (table: AdminTable, apply?: (q: never) => unknown) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let q: any = supabase.from(table as any).select("id", { count: "exact", head: true });
        if (apply) q = apply(q as never);
        return q;
      };

      const [products, published, articles, categories, reviews, pending, users] =
        await Promise.all([
          count("products"),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          count("products", (q) => (q as any).eq("status", "published")),
          count("articles"),
          count("categories"),
          count("reviews"),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          count("reviews", (q) => (q as any).eq("is_approved", false)),
          count("profiles"),
        ]);

      return {
        products: products.count ?? 0,
        publishedProducts: published.count ?? 0,
        articles: articles.count ?? 0,
        categories: categories.count ?? 0,
        reviews: reviews.count ?? 0,
        pendingReviews: pending.count ?? 0,
        users: users.count ?? 0,
      };
    },
  });

export async function upsertRow(
  table: AdminTable,
  values: Record<string, unknown>,
  id?: string | null,
) {
  if (id) {
    const { error } = await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from(table as any)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update(values as any)
      .eq("id", id);
    if (error) throw error;
    return;
  }
  const { error } = await supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from(table as any)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert(values as any);
  if (error) throw error;
}

export async function deleteRow(table: AdminTable, id: string, soft: boolean) {
  if (soft) {
    const { error } = await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from(table as any)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update({ deleted_at: new Date().toISOString() } as any)
      .eq("id", id);
    if (error) throw error;
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await supabase.from(table as any).delete().eq("id", id);
  if (error) throw error;
}

export const STATUS_LABELS: Record<string, string> = {
  draft: "پیش‌نویس",
  published: "منتشر شده",
  archived: "بایگانی",
};

export const ROLE_LABELS: Record<string, string> = {
  customer: "کاربر",
  editor: "نویسنده",
  support: "پشتیبانی",
  admin: "مدیر",
  super_admin: "مدیر ارشد",
};
