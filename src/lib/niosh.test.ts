import { describe, expect, it } from "vitest";
import { calcLift, fm, hm, vm, dm, am, cm } from "./niosh";
describe("NIOSH lifting equation", () => {
  it("ideal lift gives RWL = 23 kg", () => {
    const r = calcLift({ load: 23, H: 25, V: 75, D: 25, A: 0, F: 0.2, duration: "short", coupling: "good" });
    expect(r.RWL).toBeCloseTo(23, 5); expect(r.LI).toBeCloseTo(1, 5); expect(r.risk).toBe("low");
  });
  it("multipliers follow metric formulas", () => {
    expect(hm(50)).toBeCloseTo(0.5); expect(vm(0)).toBeCloseTo(0.775); expect(dm(100)).toBeCloseTo(0.865);
    expect(am(90)).toBeCloseTo(0.712); expect(hm(70)).toBe(0); expect(am(140)).toBe(0);
  });
  it("frequency table and coupling", () => {
    expect(fm(4, "long", 30)).toBe(0.45); expect(fm(9, "long", 30)).toBe(0); expect(fm(9, "long", 80)).toBe(0.15);
    expect(fm(16, "short", 80)).toBe(0); expect(cm("fair", 30)).toBe(0.95); expect(cm("fair", 100)).toBe(1); expect(cm("poor", 100)).toBe(0.9);
  });
  it("LI > 3 is high risk", () => {
    expect(calcLift({ load: 25, H: 55, V: 10, D: 120, A: 60, F: 5, duration: "long", coupling: "poor" }).risk).toBe("high");
  });
});
