import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

/** Configurable baselines so the public counters never start from zero. */
export const STAT_BASELINES = {
  resources: 100,
  downloads: 400,
  articles: 20,
} as const;

export type SiteStats = {
  resources: number;
  downloads: number;
  articles: number;
};

export const siteStatsQuery = () =>
  queryOptions({
    queryKey: ["site-stats"],
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<SiteStats> => {
      const [products, articles] = await Promise.all([
        supabase
          .from("products")
          .select("download_count", { count: "exact" })
          .eq("status", "published")
          .is("deleted_at", null),
        supabase
          .from("articles")
          .select("id", { count: "exact", head: true })
          .eq("status", "published")
          .is("deleted_at", null),
      ]);

      if (products.error) throw products.error;
      if (articles.error) throw articles.error;

      const downloads = (products.data ?? []).reduce(
        (total, row) => total + (row.download_count ?? 0),
        0,
      );

      return {
        resources: STAT_BASELINES.resources + (products.count ?? 0),
        downloads: STAT_BASELINES.downloads + downloads,
        articles: STAT_BASELINES.articles + (articles.count ?? 0),
      };
    },
  });
