import { forwardRef } from "react";
import type { LiftInput, RiskLevel } from "@/lib/niosh";

export const RISK_COLOR: Record<RiskLevel, string> = { low: "var(--eg-ok)", moderate: "var(--hz-amber)", high: "var(--hz-red)" };
const S = 1.6, G = 320, ANKLE = 80;

/** Side-view schematic whose posture follows H, V, D and A. */
export const Mannequin = forwardRef<SVGSVGElement, { input: LiftInput; risk: RiskLevel }>(({ input, risk }, ref) => {
  const c = RISK_COLOR[risk];
  const V = Math.min(Math.max(input.V, 0), 175), H = Math.min(Math.max(input.H, 0), 80);
  const hand = { x: ANKLE + H * S, y: G - V * S };
  const squat = Math.max(0, 50 - V) * 0.9;
  const hip = { x: ANKLE - 6 - squat * 0.3, y: G - 150 + squat };
  const knee = { x: ANKLE + 14 + squat * 0.6, y: (G + hip.y) / 2 + squat * 0.2 };
  const lean = Math.min(85, Math.max(0, (95 - V) * 0.75 + Math.max(0, H - 30) * 0.6)) * (Math.PI / 180);
  const sh = { x: hip.x + 85 * Math.sin(lean), y: hip.y - 85 * Math.cos(lean) };
  const head = { x: sh.x + 22 * Math.sin(lean), y: sh.y - 22 * Math.cos(lean) };
  const dx = hand.x - sh.x, dy = hand.y - sh.y, dist = Math.hypot(dx, dy), half = 58;
  const reach = dist >= 2 * half;
  const off = reach ? 0 : Math.sqrt(half * half - (dist / 2) ** 2);
  const elbow = { x: (sh.x + hand.x) / 2 - (dy / dist) * off * -1, y: (sh.y + hand.y) / 2 + (dx / dist) * off };
  const lumbar = { x: hip.x + 14 * Math.sin(lean), y: hip.y - 14 * Math.cos(lean) };
  const destY = G - Math.min(175, V + input.D) * S;
  return (
    <svg ref={ref} viewBox="0 0 300 340" className="h-full w-full" role="img" aria-label="آدمک شماتیک وضعیت بلند کردن بار">
      <rect width="300" height="340" fill="var(--eg-bg)" />
      <line x1="10" y1={G} x2="290" y2={G} stroke="var(--eg-cyan)" strokeOpacity=".5" strokeWidth="2" />
      {/* D travel */}
      <line x1={hand.x + 26} y1={hand.y} x2={hand.x + 26} y2={destY} stroke="var(--eg-pink)" strokeDasharray="4 4" strokeWidth="1.5" />
      <text x={hand.x + 30} y={(hand.y + destY) / 2} fill="var(--eg-pink)" fontSize="10" fontFamily="Times New Roman">D {input.D}</text>
      {/* H & V */}
      <line x1={ANKLE} y1={G + 10} x2={hand.x} y2={G + 10} stroke="var(--eg-cyan)" strokeWidth="1.5" />
      <text x={(ANKLE + hand.x) / 2 - 12} y={G + 20} fill="var(--eg-cyan)" fontSize="10" fontFamily="Times New Roman">H {input.H}</text>
      <line x1="20" y1={G} x2="20" y2={hand.y} stroke="var(--eg-cyan)" strokeWidth="1.5" />
      <text x="24" y={(G + hand.y) / 2} fill="var(--eg-cyan)" fontSize="10" fontFamily="Times New Roman">V {input.V}</text>
      <g stroke="var(--eg-ink)" strokeWidth="9" strokeLinecap="round" fill="none">
        <polyline points={`${ANKLE},${G - 4} ${knee.x},${knee.y} ${hip.x},${hip.y}`} />
        <line x1={hip.x} y1={hip.y} x2={sh.x} y2={sh.y} stroke={c} />
        <polyline points={`${sh.x},${sh.y} ${elbow.x},${elbow.y} ${hand.x},${hand.y}`} strokeWidth="7" strokeDasharray={reach ? "6 4" : undefined} />
      </g>
      <circle cx={head.x} cy={head.y} r="15" fill="var(--eg-ink)" />
      <line x1={ANKLE - 10} y1={G - 3} x2={ANKLE + 14} y2={G - 3} stroke="var(--eg-ink)" strokeWidth="6" strokeLinecap="round" />
      <circle className="eg-pulse" cx={lumbar.x} cy={lumbar.y} r="7" fill={c} />
      <circle cx={knee.x} cy={knee.y} r="5" fill={squat > 20 ? c : "var(--eg-cyan)"} />
      <rect x={hand.x - 4} y={hand.y - 14} width="34" height="28" rx="3" fill={c} fillOpacity=".85" stroke="var(--eg-ink)" />
      <text x={hand.x + 13} y={hand.y + 4} textAnchor="middle" fill="var(--eg-bg)" fontSize="10" fontWeight="bold" fontFamily="Times New Roman">{input.load}kg</text>
      {input.A > 0 && (
        <g>
          <path d={`M ${hip.x - 22} ${hip.y + 8} A 24 10 0 1 0 ${hip.x + 22} ${hip.y + 8}`} stroke="var(--eg-pink)" strokeWidth="2" fill="none" />
          <text x={hip.x - 30} y={hip.y + 34} fill="var(--eg-pink)" fontSize="10" fontFamily="Times New Roman">A {input.A}°</text>
        </g>
      )}
    </svg>
  );
});
Mannequin.displayName = "Mannequin";
