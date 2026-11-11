import { z } from "zod";

export const controlLevels = ["حذف/جایگزینی", "کنترل مهندسی", "کنترل مدیریتی", "تجهیزات حفاظت فردی"] as const;
export const hazardSchema = z.object({
  id: z.string().min(1), x: z.number().min(0).max(100), y: z.number().min(0).max(100), r: z.number().min(1).max(30),
  title: z.string().trim().min(1), category: z.enum(["mechanical", "electrical", "chemical", "fire", "ergonomic", "housekeeping"]),
  risk: z.enum(["high", "medium", "low"]), consequence: z.string().trim().min(1), hint: z.string(),
  controls: z.array(z.object({ level: z.enum(controlLevels), text: z.string().trim().min(1) })).min(1),
  standards: z.array(z.string().trim().min(1)),
});
export const scenarioSchema = z.object({
  title: z.string().trim().min(1), description: z.string(), image_url: z.string().min(1),
  is_active: z.boolean(), sort_order: z.number().int(), hazards: z.array(hazardSchema).min(1),
}).refine(s => new Set(s.hazards.map(h => h.id)).size === s.hazards.length, "شناسه خطرها تکراری است");