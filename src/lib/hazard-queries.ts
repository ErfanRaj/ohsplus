import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { scenarioSchema } from "./hazard-schema";
import type { Hazard } from "./hazards";

export type Scenario = { id: string; title: string; description: string; image_url: string; hazards: Hazard[]; is_active: boolean; sort_order: number };
export const scenariosQuery = (admin = false) => queryOptions({
  queryKey: ["hazard-scenarios", admin],
  queryFn: async (): Promise<Scenario[]> => {
    let q = supabase.from("hazard_scenarios").select("id,title,description,image_url,hazards,is_active,sort_order").order("sort_order").order("created_at");
    if (!admin) q = q.eq("is_active", true);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []).map(row => ({ id: row.id, ...scenarioSchema.parse(row) }));
  },
});