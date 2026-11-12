import type { LiftInput } from "./niosh";
import { calcLift } from "./niosh";

const HEX: Record<string, string> = {
  "var(--eg-bg)": "#15122b", "var(--eg-cyan)": "#3fd3d6", "var(--eg-pink)": "#ff4fa3", "var(--eg-ink)": "#ece9f5",
  "var(--eg-ok)": "#3ddc84", "var(--hz-amber)": "#f5b82e", "var(--hz-red)": "#e5484d",
};
const fix = (s: string) => Object.entries(HEX).reduce((a, [k, v]) => a.split(k).join(v), s);
const n = (x: number, d = 2) => (Number.isFinite(x) ? x.toFixed(d) : "∞");

/** Builds the downloadable report as an SVG string (pure, testable). */
export function buildReportSvg(mannequin: SVGSVGElement, input: LiftInput, date = new Date()) {
  const r = calcLift(input);
  const risk = { low: ["LOW RISK", "#3ddc84"], moderate: ["INCREASED RISK", "#f5b82e"], high: ["HIGH RISK", "#e5484d"] }[r.risk];
  const inner = fix(mannequin.innerHTML).replace(/class="[^"]*"/g, "");
  const rows: [string, string][] = [
    ["Load (kg)", n(input.load, 1)], ["H — horizontal (cm)", String(input.H)], ["V — vertical (cm)", String(input.V)],
    ["D — travel (cm)", String(input.D)], ["A — asymmetry (°)", String(input.A)], ["F — lifts/min", String(input.F)],
    ["Duration", { short: "≤ 1 h", moderate: "1–2 h", long: "2–8 h" }[input.duration]], ["Coupling", input.coupling],
  ];
  const mult = Object.entries(r.multipliers);
  const t = (x: number, y: number, s: string, size = 18, fill = "#ece9f5", w = "normal") =>
    `<text x="${x}" y="${y}" font-family="Times New Roman, serif" font-size="${size}" fill="${fill}" font-weight="${w}">${s}</text>`;
  const body = [
    `<rect width="1200" height="720" fill="#15122b"/>`,
    `<rect x="0" y="0" width="1200" height="8" fill="${risk[1]}"/>`,
    t(40, 64, "ERGO+  ·  NIOSH Lifting Equation Report", 34, "#3fd3d6", "bold"),
    t(40, 94, `OHS Plus  ·  ${date.toISOString().slice(0, 10)}`, 16, "#a9a3c4"),
    `<svg x="40" y="120" width="480" height="544" viewBox="0 0 300 340">${inner}</svg>`,
    t(570, 150, "INPUTS", 20, "#ff4fa3", "bold"),
    ...rows.map(([k, v], i) => t(570, 182 + i * 28, k, 17) + t(820, 182 + i * 28, v, 17, "#3fd3d6", "bold")),
    t(570, 430, "MULTIPLIERS", 20, "#ff4fa3", "bold"),
    ...mult.map(([k, v], i) => {
      const x = 570 + (i % 3) * 200, y = 462 + Math.floor(i / 3) * 34;
      return t(x, y, `${k} = ${n(v, 3)}`, 18, k === r.worst ? risk[1] : "#ece9f5", k === r.worst ? "bold" : "normal");
    }),
    `<rect x="570" y="545" width="590" height="125" rx="14" fill="none" stroke="${risk[1]}" stroke-width="3"/>`,
    t(595, 590, `RWL = ${n(r.RWL)} kg`, 28, "#ece9f5", "bold"), t(900, 590, `LI = ${n(r.LI)}`, 28, risk[1], "bold"),
    t(595, 640, `${risk[0]}  ·  limiting factor: ${r.worst}`, 20, risk[1], "bold"),
    t(40, 700, "Preliminary screening per NIOSH Pub. 94-110. Expert review required.", 13, "#a9a3c4"),
  ].join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720">${body}</svg>`;
}

export async function svgToPng(svg: string): Promise<Blob> {
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
  try {
    const img = new Image(); img.src = url; await img.decode();
    const c = document.createElement("canvas"); c.width = 2400; c.height = 1440;
    c.getContext("2d")!.drawImage(img, 0, 0, 2400, 1440);
    return await new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("png"))), "image/png"));
  } finally { URL.revokeObjectURL(url); }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
