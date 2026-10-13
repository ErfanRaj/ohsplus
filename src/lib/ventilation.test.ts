import { describe, expect, it } from "vitest";

import { airDensity, calculate, newHood, SAMPLE_INPUT, selectDiameter, velocityPressure } from "./ventilation";

describe("ventilation engine", () => {
  it("air density at sea level and 20 °C is about 1.204 kg/m³", () => {
    expect(airDensity(20, 0).density).toBeCloseTo(1.204, 2);
  });

  it("velocity pressure uses VP = 0.5·ρ·V²", () => {
    expect(velocityPressure(1.2, 20)).toBeCloseTo(240, 6);
  });

  it("selected duct keeps velocity at or above the minimum transport velocity", () => {
    const { diameterMm } = selectDiameter(0.5, 18);
    const v = 0.5 / ((Math.PI * (diameterMm / 1000) ** 2) / 4);
    expect(v).toBeGreaterThanOrEqual(18);
  });

  it("branch with >20% lower pressure is flagged for redesign", () => {
    const r = calculate({
      ...SAMPLE_INPUT,
      hoods: [newHood({ length: 60, branchEntryK: 0 }), newHood({ length: 1, elbows: 0 })],
    });
    expect(r.hoods[1].status).toBe("redesign");
  });

  it("fan static pressure = SP inlet + SP outlet − VP inlet", () => {
    const r = calculate(SAMPLE_INPUT);
    expect(r.fsp).toBeCloseTo(r.spInlet + r.spOutlet - r.main.vp, 6);
  });
});
