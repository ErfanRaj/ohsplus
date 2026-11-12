// Revised NIOSH Lifting Equation (Waters et al. 1993; NIOSH Applications Manual 94-110), metric form.
export type Coupling = "good" | "fair" | "poor";
export type Duration = "short" | "moderate" | "long"; // ≤1h, 1–2h, 2–8h
export interface LiftInput { load: number; H: number; V: number; D: number; A: number; F: number; duration: Duration; coupling: Coupling; }
export const LC = 23;

const FREQS = [0.2, 0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
// [short V<75, short V>=75, moderate V<75, moderate V>=75, long V<75, long V>=75]
const FM_TABLE: number[][] = [
  [1, 1, .95, .95, .85, .85], [.97, .97, .92, .92, .81, .81], [.94, .94, .88, .88, .75, .75],
  [.91, .91, .84, .84, .65, .65], [.88, .88, .79, .79, .55, .55], [.84, .84, .72, .72, .45, .45],
  [.80, .80, .60, .60, .35, .35], [.75, .75, .50, .50, .27, .27], [.70, .70, .42, .42, .22, .22],
  [.60, .60, .35, .35, .18, .18], [.52, .52, .30, .30, 0, .15], [.45, .45, .26, .26, 0, .13],
  [.41, .41, 0, .23, 0, 0], [.37, .37, 0, .21, 0, 0], [0, .34, 0, 0, 0, 0], [0, .31, 0, 0, 0, 0], [0, .28, 0, 0, 0, 0],
];
export const FREQUENCY_OPTIONS = FREQS;

export const hm = (H: number) => (H <= 25 ? 1 : H > 63 ? 0 : 25 / H);
export const vm = (V: number) => (V < 0 || V > 175 ? 0 : 1 - 0.003 * Math.abs(V - 75));
export const dm = (D: number) => (D <= 25 ? 1 : D > 175 ? 0 : 0.82 + 4.5 / D);
export const am = (A: number) => (A > 135 ? 0 : 1 - 0.0032 * Math.max(0, A));
export function fm(F: number, duration: Duration, V: number) {
  if (F > 15) return 0;
  const idx = FREQS.findIndex((f) => F <= f);
  const col = { short: 0, moderate: 2, long: 4 }[duration] + (V >= 75 ? 1 : 0);
  return FM_TABLE[Math.max(0, idx)][col];
}
export function cm(c: Coupling, V: number) {
  if (c === "good") return 1;
  if (c === "poor") return 0.9;
  return V < 75 ? 0.95 : 1;
}
export type RiskLevel = "low" | "moderate" | "high";
export function calcLift(i: LiftInput) {
  const m = { HM: hm(i.H), VM: vm(i.V), DM: dm(i.D), AM: am(i.A), FM: fm(i.F, i.duration, i.V), CM: cm(i.coupling, i.V) };
  const RWL = LC * m.HM * m.VM * m.DM * m.AM * m.FM * m.CM;
  const LI = RWL > 0 ? i.load / RWL : Infinity;
  const risk: RiskLevel = LI <= 1 ? "low" : LI <= 3 ? "moderate" : "high";
  const worst = (Object.entries(m) as [keyof typeof m, number][]).sort((a, b) => a[1] - b[1])[0][0];
  return { multipliers: m, RWL, LI, risk, worst };
}
