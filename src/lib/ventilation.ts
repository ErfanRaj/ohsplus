// Ventilation+ — preliminary local-exhaust (LEV) calculation engine. SI units throughout.
// Method follows the OHS Plus ventilation spec (ACGIH IV Manual / Handbook ch.8 workflow).

export const R_AIR = 287.05; // J/(kg·K)
export const RHO_STD = 1.204; // kg/m³ at 20 °C, 101.325 kPa
export const MU_AIR = 1.81e-5; // Pa·s
export const STD_DIAMETERS_MM = [
  80, 100, 125, 150, 160, 180, 200, 224, 250, 280, 300, 315, 355, 400, 450, 500, 560, 630, 710,
  800, 900, 1000, 1120, 1250, 1400, 1600,
];

export type HoodMethod = "face" | "slot" | "direct";

export interface HoodInput {
  id: string;
  name: string;
  method: HoodMethod;
  velocity: number; // m/s — face or slot velocity
  width: number; // m (opening/slot width)
  height: number; // m (opening height or slot length)
  directFlow: number; // m³/h when method = direct
  entryK: number; // duct-entry loss coefficient (user / source)
  slotK: number; // slot loss coefficient (slot hoods only)
  transportVelocity: number; // minimum duct transport velocity, m/s
  length: number; // branch duct length, m
  elbows: number; // count
  elbowK: number; // per-elbow coefficient
  branchEntryK: number; // junction entry coefficient (0 for the first/main hood)
  otherLoss: number; // Pa
}

export interface VentInput {
  projectName: string;
  tempC: number;
  elevation: number; // m
  roughnessMm: number;
  hoods: HoodInput[];
  mainLength: number;
  mainElbows: number;
  mainElbowK: number;
  cleanerLoss: number; // Pa
  outletLength: number; // m, fan → stack
  outletOtherLoss: number; // Pa (stack head etc.)
  fanEfficiency: number; // 0-1
  motorEfficiency: number; // 0-1
  supplyAir: number; // m³/h existing make-up air
}

export interface SegmentResult {
  flow: number; // m³/s
  diameterMm: number;
  tentativeMm: number;
  area: number;
  velocity: number;
  vp: number;
  friction: number;
  fittings: number;
  reynolds: number;
  f: number;
}

export interface HoodResult extends SegmentResult {
  id: string;
  name: string;
  hoodArea: number;
  hoodLoss: number;
  sp: number; // cumulative static pressure needed at junction (positive magnitude)
  status: "governing" | "ok" | "corrected" | "redesign";
  diffPct: number;
  correctedFlow: number;
}

export interface VentResult {
  pressure: number;
  density: number;
  densityFactor: number;
  hoods: HoodResult[];
  governingSp: number;
  totalFlow: number;
  main: SegmentResult;
  vpResultant: number;
  accelLoss: number;
  spInlet: number;
  outlet: SegmentResult;
  spOutlet: number;
  fsp: number;
  ftp: number;
  fspStd: number;
  airPowerKw: number;
  shaftKw: number;
  motorKw: number;
  makeupBalance: number; // m³/h (supply − exhaust)
  warnings: string[];
}

export const MANDATORY_WARNINGS = [
  "این یک محاسبه طراحی مقدماتی است و گواهی کنترل مواجهه یا انطباق قانونی محسوب نمی‌شود.",
  "عملکرد واقعی هود به نصب، جریان‌های عرضی، موقعیت کارگر و منبع و روش کار بستگی دارد؛ تأیید میدانی الزامی است.",
  "انتخاب فن نیازمند منحنی سازنده با مبنای صحیح FSP/FTP و چگالی است.",
  "نامشخص بودن یا حذف افت فشار غبارگیر می‌تواند نیاز فشاری فن را به‌شدت کمتر از واقع نشان دهد.",
  "سرعت‌های انتقال و ضرایب هود وابسته به منبع و کاربرد هستند؛ مقدار انتخابی را با داده طراحی مرجع تطبیق دهید.",
  "بازچرخش هوای آلوده توسط این ابزار تأیید نمی‌شود.",
  "گردوغبار قابل‌احتراق، مواد واکنش‌پذیر، سمیت شدید و شرایط غیرمعمول فرایند نیازمند بررسی متخصص است.",
];

export function airDensity(tempC: number, elevation: number) {
  const pressure = 101325 * Math.pow(1 - 2.25577e-5 * elevation, 5.25588);
  return { pressure, density: pressure / (R_AIR * (tempC + 273.15)) };
}

export const velocityPressure = (rho: number, v: number) => 0.5 * rho * v * v;

/** Swamee–Jain explicit approximation of the Colebrook friction factor (laminar fallback). */
export function frictionFactor(re: number, d: number, roughness: number) {
  if (re <= 0) return 0;
  if (re < 2300) return 64 / re;
  return 0.25 / Math.pow(Math.log10(roughness / (3.7 * d) + 5.74 / Math.pow(re, 0.9)), 2);
}

/** Largest standard diameter whose velocity still meets the minimum transport velocity. */
export function selectDiameter(flow: number, vMin: number) {
  const tentative = Math.sqrt((4 * flow) / (Math.PI * vMin));
  const tentMm = tentative * 1000;
  const fit = [...STD_DIAMETERS_MM].reverse().find((d) => d <= tentMm) ?? STD_DIAMETERS_MM[0];
  return { tentativeMm: tentMm, diameterMm: fit };
}

export function segment(
  flow: number,
  vMin: number,
  length: number,
  fittingK: number,
  rho: number,
  roughnessM: number,
  fixedDiameterMm?: number,
): SegmentResult {
  const sel = fixedDiameterMm
    ? { tentativeMm: fixedDiameterMm, diameterMm: fixedDiameterMm }
    : selectDiameter(flow, vMin);
  const d = sel.diameterMm / 1000;
  const area = (Math.PI * d * d) / 4;
  const velocity = flow / area;
  const vp = velocityPressure(rho, velocity);
  const reynolds = (rho * velocity * d) / MU_AIR;
  const f = frictionFactor(reynolds, d, roughnessM);
  return {
    flow,
    ...sel,
    area,
    velocity,
    vp,
    reynolds,
    f,
    friction: f * (length / d) * vp,
    fittings: fittingK * vp,
  };
}

export function hoodFlow(h: HoodInput) {
  if (h.method === "direct") return { area: 0, flow: h.directFlow / 3600 };
  const area = h.width * h.height;
  return { area, flow: h.velocity * area };
}

export function calculate(input: VentInput): VentResult {
  const warnings: string[] = [];
  const { pressure, density } = airDensity(input.tempC, input.elevation);
  const rough = input.roughnessMm / 1000;

  const raw = input.hoods.map((h) => {
    const { area, flow } = hoodFlow(h);
    const seg = segment(
      flow,
      h.transportVelocity,
      h.length,
      h.elbows * h.elbowK + h.branchEntryK,
      density,
      rough,
    );
    const slotVp = h.method === "slot" ? velocityPressure(density, h.velocity) : 0;
    const hoodLoss =
      (h.method === "slot" ? h.slotK * slotVp + slotVp : 0) + h.entryK * seg.vp + seg.vp;
    const sp = hoodLoss + seg.friction + seg.fittings + h.otherLoss;
    if (flow <= 0) warnings.push(`هود «${h.name}»: دبی صفر است؛ ورودی‌ها را بررسی کنید.`);
    if (seg.velocity < h.transportVelocity * 0.999)
      warnings.push(`هود «${h.name}»: سرعت کانال کمتر از سرعت حداقل انتقال است (خطر رسوب).`);
    if (!h.entryK) warnings.push(`هود «${h.name}»: ضریب افت ورودی هود وارد نشده است.`);
    return { h, area, seg, hoodLoss, sp };
  });

  const governingSp = Math.max(0, ...raw.map((r) => r.sp));
  const hoods: HoodResult[] = raw.map(({ h, area, seg, hoodLoss, sp }) => {
    const diffPct = governingSp > 0 ? ((governingSp - sp) / governingSp) * 100 : 0;
    let status: HoodResult["status"] = "ok";
    let correctedFlow = seg.flow;
    if (sp === governingSp) status = "governing";
    else if (diffPct > 20) {
      status = "redesign";
      correctedFlow = seg.flow * Math.sqrt(governingSp / sp);
      warnings.push(
        `هود «${h.name}»: اختلاف فشار ${diffPct.toFixed(1)}٪ (بیش از ۲۰٪) — قطر کانال شاخه را بازطراحی کنید یا از دمپر استفاده کنید.`,
      );
    } else if (diffPct > 5) {
      status = "corrected";
      correctedFlow = seg.flow * Math.sqrt(governingSp / sp);
    }
    return { ...seg, id: h.id, name: h.name, hoodArea: area, hoodLoss, sp, status, diffPct, correctedFlow };
  });

  const totalFlow = hoods.reduce((s, h) => s + h.correctedFlow, 0);
  const vMinMain = Math.max(0, ...input.hoods.map((h) => h.transportVelocity));
  const main = segment(totalFlow, vMinMain || 10, input.mainLength, input.mainElbows * input.mainElbowK, density, rough);
  const vpResultant =
    totalFlow > 0
      ? hoods.reduce((s, h) => {
          const v = h.correctedFlow / h.area;
          return s + (h.correctedFlow / totalFlow) * velocityPressure(density, v);
        }, 0)
      : 0;
  const accelLoss = hoods.length > 1 ? Math.max(0, main.vp - vpResultant) : 0;
  const spInlet = governingSp + main.friction + main.fittings + accelLoss + input.cleanerLoss;

  const outlet = segment(totalFlow, vMinMain || 10, input.outletLength, 0, density, rough, main.diameterMm);
  const spOutlet = outlet.friction + input.outletOtherLoss;
  const fsp = spInlet + spOutlet - main.vp;
  const ftp = spOutlet + outlet.vp + spInlet - main.vp;
  const densityFactor = density / RHO_STD;
  const airPowerKw = (totalFlow * ftp) / 1000;
  const shaftKw = airPowerKw / Math.max(input.fanEfficiency, 0.01);
  const motorKw = shaftKw / Math.max(input.motorEfficiency, 0.01);
  const makeupBalance = input.supplyAir - totalFlow * 3600;

  if (!input.cleanerLoss) warnings.push("افت فشار غبارگیر/تصفیه‌کننده صفر وارد شده است.");
  if (makeupBalance < 0)
    warnings.push(
      `کمبود هوای جبرانی: حدود ${Math.round(-makeupBalance).toLocaleString("fa-IR")} m³/h هوای تازه باید تأمین شود.`,
    );

  return {
    pressure,
    density,
    densityFactor,
    hoods,
    governingSp,
    totalFlow,
    main,
    vpResultant,
    accelLoss,
    spInlet,
    outlet,
    spOutlet,
    fsp,
    ftp,
    fspStd: fsp / densityFactor,
    airPowerKw,
    shaftKw,
    motorKw,
    makeupBalance,
    warnings,
  };
}

let seq = 0;
export function newHood(partial: Partial<HoodInput> = {}): HoodInput {
  seq += 1;
  return {
    id: `h${Date.now().toString(36)}${seq}`,
    name: `هود ${seq}`,
    method: "face",
    velocity: 0.5,
    width: 0.6,
    height: 0.5,
    directFlow: 1000,
    entryK: 0.5,
    slotK: 1.78,
    transportVelocity: 17.8,
    length: 6,
    elbows: 2,
    elbowK: 0.27,
    branchEntryK: 0.18,
    otherLoss: 0,
    ...partial,
  };
}

export const SAMPLE_INPUT: VentInput = {
  projectName: "سالن سنگ‌زنی — خط ۱",
  tempC: 25,
  elevation: 1200,
  roughnessMm: 0.15,
  hoods: [
    newHood({ name: "هود سنگ‌زنی", velocity: 1, width: 0.5, height: 0.4, transportVelocity: 20, branchEntryK: 0 }),
    newHood({ name: "هود میز جوشکاری", method: "slot", velocity: 10, width: 0.05, height: 1.2, transportVelocity: 15, length: 4 }),
  ],
  mainLength: 15,
  mainElbows: 2,
  mainElbowK: 0.27,
  cleanerLoss: 1000,
  outletLength: 5,
  outletOtherLoss: 0,
  fanEfficiency: 0.7,
  motorEfficiency: 0.9,
  supplyAir: 0,
};

/** Illustrative transport-velocity examples from the supplied handbook scan (Table 8-4). */
export const TRANSPORT_EXAMPLES = [
  { label: "گازها، بخارات و دود", v: 10 },
  { label: "دود جوشکاری", v: 12.7 },
  { label: "دود لحیم‌کاری", v: 10.16 },
  { label: "گردوغبار خشک", v: 17.8 },
  { label: "گردوغبار سنگ‌زنی", v: 25.4 },
];
