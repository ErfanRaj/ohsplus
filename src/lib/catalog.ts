import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toFa(value: number | string) {
  return String(value).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}

export function formatToman(price: number, isFree: boolean) {
  if (isFree || price === 0) return "رایگان";
  return `${toFa(price.toLocaleString("en-US").replace(/,/g, "٬"))} تومان`;
}

export type ProductRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  file_format: string | null;
  price_toman: number;
  compare_at_toman: number | null;
  is_free: boolean;
  badge: string | null;
  rating_avg: number;
  rating_count: number;
  download_count: number;
  cover_image_url: string | null;
  published_at: string | null;
  categories: { slug: string; name: string } | null;
};

const PRODUCT_FIELDS =
  "id, slug, title, subtitle, file_format, price_toman, compare_at_toman, is_free, badge, rating_avg, rating_count, download_count, cover_image_url, published_at, categories(slug, name)";

export type ProductFilters = {
  q: string;
  category: string;
  sort: string;
};

export const categoriesQuery = () =>
  queryOptions({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, slug, name, description, icon, sort_order")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60_000,
  });

export const categoryQuery = (slug: string) =>
  queryOptions({
    queryKey: ["category", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, slug, name, description, icon, seo_title, seo_description")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60_000,
  });

export const productsQuery = (filters: ProductFilters) =>
  queryOptions({
    queryKey: ["products", filters],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select(PRODUCT_FIELDS)
        .eq("status", "published")
        .is("deleted_at", null);

      if (filters.q.trim()) {
        const term = `%${filters.q.trim()}%`;
        query = query.or(`title.ilike.${term},subtitle.ilike.${term},description.ilike.${term}`);
      }

      switch (filters.sort) {
        case "price-asc":
          query = query.order("price_toman", { ascending: true });
          break;
        case "price-desc":
          query = query.order("price_toman", { ascending: false });
          break;
        case "popular":
          query = query.order("download_count", { ascending: false });
          break;
        case "rating":
          query = query.order("rating_avg", { ascending: false });
          break;
        default:
          query = query.order("published_at", { ascending: false, nullsFirst: false });
      }

      const { data, error } = await query.limit(48);
      if (error) throw error;
      const rows = (data ?? []) as unknown as ProductRow[];
      if (!filters.category) return rows;
      return rows.filter((row) => row.categories?.slug === filters.category);
    },
  });

export const productQuery = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`${PRODUCT_FIELDS}, description, seo_title, seo_description`)
        .eq("slug", slug)
        .eq("status", "published")
        .is("deleted_at", null)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;

      const product = data as unknown as ProductRow & {
        description: string | null;
        seo_title: string | null;
        seo_description: string | null;
      };

      const [images, reviews] = await Promise.all([
        supabase
          .from("product_images")
          .select("id, url, alt, sort_order")
          .eq("product_id", product.id)
          .order("sort_order", { ascending: true }),
        supabase
          .from("reviews")
          .select("id, rating, body, created_at")
          .eq("product_id", product.id)
          .eq("is_approved", true)
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      return {
        product,
        images: images.data ?? [],
        reviews: reviews.data ?? [],
      };
    },
  });

export const relatedProductsQuery = (categorySlug: string | null, excludeSlug: string) =>
  queryOptions({
    queryKey: ["related-products", categorySlug, excludeSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(PRODUCT_FIELDS)
        .eq("status", "published")
        .is("deleted_at", null)
        .neq("slug", excludeSlug)
        .limit(6);
      if (error) throw error;
      const rows = (data ?? []) as unknown as ProductRow[];
      if (!categorySlug) return rows.slice(0, 3);
      const sameCategory = rows.filter((row) => row.categories?.slug === categorySlug);
      return (sameCategory.length ? sameCategory : rows).slice(0, 3);
    },
  });

export type ArticleRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  reading_minutes: number;
  published_at: string | null;
  categories: { slug: string; name: string } | null;
};

const ARTICLE_FIELDS =
  "id, slug, title, excerpt, cover_image_url, reading_minutes, published_at, categories(slug, name)";

export const articlesQuery = (filters: { q: string; category: string }) =>
  queryOptions({
    queryKey: ["articles", filters],
    queryFn: async () => {
      let query = supabase
        .from("articles")
        .select(ARTICLE_FIELDS)
        .eq("status", "published")
        .is("deleted_at", null)
        .order("published_at", { ascending: false, nullsFirst: false });

      if (filters.q.trim()) {
        const term = `%${filters.q.trim()}%`;
        query = query.or(`title.ilike.${term},excerpt.ilike.${term}`);
      }

      const { data, error } = await query.limit(48);
      if (error) throw error;
      const rows = (data ?? []) as unknown as ArticleRow[];
      if (!filters.category) return rows;
      return rows.filter((row) => row.categories?.slug === filters.category);
    },
  });

export const articleQuery = (slug: string) =>
  queryOptions({
    queryKey: ["article", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select(`${ARTICLE_FIELDS}, content, seo_title, seo_description`)
        .eq("slug", slug)
        .eq("status", "published")
        .is("deleted_at", null)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as (ArticleRow & {
        content: string | null;
        seo_title: string | null;
        seo_description: string | null;
      }) | null);
    },
  });

export function formatDateFa(value: string | null) {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(new Date(value));
  } catch {
    return "";
  }
}
