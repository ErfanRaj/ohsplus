import { describe, expect, it } from "vitest";

import { airDensity, calculate, newHood, SAMPLE_INPUT, selectDiameter, TRANSPORT_EXAMPLES, velocityPressure } from "./ventilation";

describe("ventilation engine", () => {
  it("dry-dust presets use the reference range of 3000–3500 ft/min", () => {
    const dry = TRANSPORT_EXAMPLES.filter((x) => x.label.includes("گردوغبار خشک"));
    expect(dry.map((x) => x.v)).toEqual([15.24, 17.78]);
  });

  it("welding-dust presets use 1000–3000 ft/min, not welding-fume values", () => {
    const welding = TRANSPORT_EXAMPLES.filter((x) => x.label.includes("گردوغبار جوشکاری"));
    expect(welding.map((x) => x.v)).toEqual([5.08, 15.24]);
  });

  it("preserves source soldering and grinding examples", () => {
    expect(TRANSPORT_EXAMPLES.find((x) => x.label.includes("دود لحیم‌کاری"))?.v).toBe(10.16);
    expect(TRANSPORT_EXAMPLES.find((x) => x.label.includes("گردوغبار سنگ‌زنی"))?.v).toBe(25.4);
  });

  it("retains previous values with no equivalent in the reference", () => {
    expect(TRANSPORT_EXAMPLES.find((x) => x.label.startsWith("گازها"))?.v).toBe(10);
    expect(TRANSPORT_EXAMPLES.find((x) => x.label.startsWith("دود جوشکاری"))?.v).toBe(12.7);
  });
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
