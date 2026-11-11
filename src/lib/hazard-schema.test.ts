import { describe, it, expect } from "vitest";
import { scenarioSchema } from "./hazard-schema";
import { WORKSHOP_HAZARDS } from "./hazards";

const scenario = { title: "کارگاه", description: "", image_url: "/workshop.jpg", hazards: WORKSHOP_HAZARDS, is_active: true, sort_order: 0 };
describe("editable scenarios", () => {
  it("preserves the eight existing hazards", () => { expect(scenarioSchema.parse(scenario).hazards).toHaveLength(8); });
  it("requires hazard teaching content", () => { expect(scenarioSchema.safeParse({ ...scenario, hazards: [{ ...WORKSHOP_HAZARDS[0], controls: [] }] }).success).toBe(false); });
  it("rejects hotspots outside the image", () => { expect(scenarioSchema.safeParse({ ...scenario, hazards: [{ ...WORKSHOP_HAZARDS[0], x: 101 }] }).success).toBe(false); });
  it("rejects duplicate hazard identifiers", () => { expect(scenarioSchema.safeParse({ ...scenario, hazards: [WORKSHOP_HAZARDS[0], WORKSHOP_HAZARDS[0]] }).success).toBe(false); });
});