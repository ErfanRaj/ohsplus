import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle, ArrowLeft, ArrowRight, Download, Fan, Gauge, MapPin, Plus, Printer, RotateCcw,
  Trash2, Wind,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { InteractiveGrid } from "@/components/layout/interactive-grid";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  calculate, MANDATORY_WARNINGS, newHood, SAMPLE_INPUT, TRANSPORT_EXAMPLES,
  type HoodInput, type VentInput,
} from "@/lib/ventilation";

export const Route = createFileRoute("/ventilation-plus")({
  head: () => ({
    meta: [
      { title: "Ventilation+ | محاسبه تهویه موضعی — OHS Plus" },
      {
        name: "description",
        content: "محاسبه گام‌به‌گام تهویه موضعی صنعتی: دبی هود، قطر کانال، افت فشار، بالانس شاخه‌ها، فشار و توان فن با خروجی اکسل.",
      },
      { property: "og:title", content: "Ventilation+ | محاسبه‌گر تهویه موضعی OHS Plus" },
      { property: "og:description", content: "طراحی مقدماتی سیستم تهویه موضعی بر پایه روش ACGIH با گزارش و فایل اکسل." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VentilationPage,
});

const STEPS = [
  { title: "پروژه و شرایط هوا", icon: MapPin },
  { title: "هودها و شاخه‌ها", icon: Wind },
  { title: "کانال اصلی و غبارگیر", icon: Gauge },
  { title: "فن و هوای جبرانی", icon: Fan },
  { title: "گزارش نهایی", icon: Printer },
];

const fa = (n: number, d = 0) =>
  Number.isFinite(n) ? n.toLocaleString("fa-IR", { maximumFractionDigits: d, minimumFractionDigits: d }) : "—";

function Field({
  label, unit, value, onChange, step = "any", hint,
}: { label: string; unit?: string; value: number; onChange: (v: number) => void; step?: string; hint?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-iso-navy/85">{label}</span>
      <div className="relative mt-1.5">
        <Input
          type="number"
          dir="ltr"
          step={step}
          value={Number.isFinite(value) ? value : ""}
          onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
          className="h-11 border-iso-navy/20 bg-background/90 pl-16 text-left font-mono focus-visible:ring-iso-cyan"
        />
        {unit && (
          <span dir="ltr" className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs font-bold text-iso-navy/50">
            {unit}
          </span>
        )}
      </div>
      {hint && <span className="mt-1 block text-xs text-iso-navy/55">{hint}</span>}
    </label>
  );
}

function Panel({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <div className="rounded-2xl border border-iso-navy/15 bg-background/85 p-5 backdrop-blur md:p-7">
      {title && <h3 className="mb-5 text-lg font-extrabold">{title}</h3>}
      {children}
    </div>
  );
}

function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span dir="ltr" className={`font-[Orbitron] tracking-wide ${className}`}>
      Ventilation<sup className="text-iso-cyan drop-shadow-[0_0_12px_var(--iso-cyan)]">+</sup>
    </span>
  );
}

function VentilationPage() {
  const [input, setInput] = useState<VentInput>(SAMPLE_INPUT);
  const [step, setStep] = useState(0);
  const r = useMemo(() => calculate(input), [input]);

  const set = <K extends keyof VentInput>(k: K, v: VentInput[K]) => setInput((s) => ({ ...s, [k]: v }));
  const setHood = (id: string, patch: Partial<HoodInput>) =>
    setInput((s) => ({ ...s, hoods: s.hoods.map((h) => (h.id === id ? { ...h, ...patch } : h)) }));

  const exportXlsx = async () => {
    try {
      const { downloadVentWorkbook } = await import("@/lib/ventilation-excel");
      await downloadVentWorkbook(input, r);
      toast.success("فایل اکسل آماده شد");
    } catch {
      toast.error("ساخت فایل اکسل ناموفق بود");
    }
  };

  return (
    <div className="relative isolate min-h-screen bg-iso-concrete text-iso-navy">
      <InteractiveGrid variant="iso" />
      <SiteHeader />
      <main>
        {/* Header */}
        <section className="relative overflow-hidden bg-iso-navy text-iso-concrete print:hidden">
          <div aria-hidden="true" className="vent-flow absolute inset-0 opacity-60" />
          <div className="container-page relative py-12 md:py-16">
            <p className="text-sm font-bold tracking-widest text-iso-cyan">LEV DESIGN ENGINE</p>
            <h1 className="mt-3 text-3xl font-extrabold sm:text-5xl">
              طراحی تهویه موضعی با <Wordmark className="text-iso-concrete" />
            </h1>
            <p className="mt-4 max-w-2xl leading-8 text-iso-concrete/80">
              داده‌های اولیه را وارد کنید؛ دبی هود، قطر کانال، افت فشار، بالانس شاخه‌ها و فشار و توان فن
              به‌صورت زنده محاسبه می‌شود و در پایان گزارش و فایل اکسل فرمول‌دار تحویل می‌گیرید.
            </p>
          </div>
        </section>

        {/* Stepper */}
        <section className="container-page pt-8 print:hidden">
          <ol className="grid grid-cols-5 gap-2">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const active = i === step;
              return (
                <li key={s.title}>
                  <button
                    type="button"
                    onClick={() => setStep(i)}
                    className={`flex w-full flex-col items-center gap-1.5 rounded-xl border px-1 py-3 text-center text-[11px] font-bold transition-all sm:flex-row sm:justify-center sm:text-sm ${
                      active
                        ? "border-iso-cyan bg-iso-navy text-iso-concrete shadow-[0_0_18px_var(--iso-cyan)]"
                        : i < step
                          ? "border-iso-cyan/50 bg-background/80"
                          : "border-iso-navy/15 bg-background/70 hover:border-iso-cyan"
                    }`}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="hidden sm:inline">{s.title}</span>
                    <span className="sm:hidden">{fa(i + 1)}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="container-page grid gap-6 py-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            {step === 0 && (
              <Panel title="۱. مشخصات پروژه و شرایط محیطی">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <span className="text-sm font-semibold text-iso-navy/85">نام پروژه</span>
                    <Input value={input.projectName} onChange={(e) => set("projectName", e.target.value)} className="mt-1.5 h-11 border-iso-navy/20 bg-background/90" />
                  </label>
                  <Field label="دمای هوا در سیستم" unit="°C" value={input.tempC} onChange={(v) => set("tempC", v)} />
                  <Field label="ارتفاع محل از سطح دریا" unit="m" value={input.elevation} onChange={(v) => set("elevation", v)} hint="مثلاً تهران ≈ ۱۲۰۰ متر" />
                  <Field label="زبری داخلی کانال" unit="mm" value={input.roughnessMm} onChange={(v) => set("roughnessMm", v)} hint="ورق گالوانیزه ≈ ۰٫۱۵ میلی‌متر" />
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3 rounded-xl bg-iso-navy p-4 text-iso-concrete">
                  <Stat label="فشار بارومتریک" value={`${fa(r.pressure / 1000, 2)} kPa`} />
                  <Stat label="چگالی واقعی هوا (ρ)" value={`${fa(r.density, 3)} kg/m³`} />
                </div>
              </Panel>
            )}

            {step === 1 && (
              <>
                {input.hoods.map((h, i) => {
                  const res = r.hoods[i];
                  return (
                    <Panel key={h.id}>
                      <div className="mb-5 flex items-center gap-3">
                        <span className="grid size-9 place-items-center rounded-full bg-iso-navy font-[Orbitron] text-sm text-iso-cyan">{i + 1}</span>
                        <Input value={h.name} onChange={(e) => setHood(h.id, { name: e.target.value })} className="h-10 max-w-xs border-iso-navy/20 bg-background/90 font-bold" />
                        {input.hoods.length > 1 && (
                          <button type="button" aria-label="حذف هود" onClick={() => set("hoods", input.hoods.filter((x) => x.id !== h.id))} className="mr-auto rounded-lg p-2 text-destructive hover:bg-destructive/10">
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                      <div className="mb-4 flex flex-wrap gap-2">
                        {([["face", "دهانه / کابین (V×A)"], ["slot", "هود شیاری (Slot)"], ["direct", "دبی مستقیم"]] as const).map(([m, l]) => (
                          <button key={m} type="button" onClick={() => setHood(h.id, { method: m })}
                            className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-all ${h.method === m ? "border-iso-cyan bg-iso-navy text-iso-concrete shadow-[0_0_12px_var(--iso-cyan)]" : "border-iso-navy/20 bg-background/70 hover:border-iso-cyan"}`}>
                            {l}
                          </button>
                        ))}
                      </div>
                      <div className="grid gap-4 sm:grid-cols-3">
                        {h.method === "direct" ? (
                          <Field label="دبی طراحی هود" unit="m³/h" value={h.directFlow} onChange={(v) => setHood(h.id, { directFlow: v })} />
                        ) : (
                          <>
                            <Field label={h.method === "slot" ? "سرعت شیار" : "سرعت دهانه / ربایش"} unit="m/s" value={h.velocity} onChange={(v) => setHood(h.id, { velocity: v })} />
                            <Field label={h.method === "slot" ? "عرض شیار" : "عرض دهانه"} unit="m" value={h.width} onChange={(v) => setHood(h.id, { width: v })} />
                            <Field label={h.method === "slot" ? "طول شیار" : "ارتفاع دهانه"} unit="m" value={h.height} onChange={(v) => setHood(h.id, { height: v })} />
                          </>
                        )}
                        <Field label="ضریب افت ورودی هود (Ke)" value={h.entryK} onChange={(v) => setHood(h.id, { entryK: v })} hint="از جدول هود مرجع" />
                        {h.method === "slot" && <Field label="ضریب افت شیار" value={h.slotK} onChange={(v) => setHood(h.id, { slotK: v })} />}
                        <Field label="سرعت حداقل انتقال" unit="m/s" value={h.transportVelocity} onChange={(v) => setHood(h.id, { transportVelocity: v })} />
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {TRANSPORT_EXAMPLES.map((t) => (
                          <button key={t.label} type="button" onClick={() => setHood(h.id, { transportVelocity: t.v })} className="rounded-md border border-iso-navy/15 bg-background/70 px-2 py-1 text-xs hover:border-iso-cyan">
                            {t.label}: {fa(t.v, 1)}
                          </button>
                        ))}
                      </div>
                      <h4 className="mt-6 mb-3 text-sm font-extrabold text-iso-navy/70">کانال شاخه</h4>
                      <div className="grid gap-4 sm:grid-cols-3">
                        <Field label="طول کانال" unit="m" value={h.length} onChange={(v) => setHood(h.id, { length: v })} />
                        <Field label="تعداد زانویی" value={h.elbows} step="1" onChange={(v) => setHood(h.id, { elbows: v })} />
                        <Field label="ضریب هر زانویی" value={h.elbowK} onChange={(v) => setHood(h.id, { elbowK: v })} />
                        <Field label="ضریب ورود به اتصال" value={h.branchEntryK} onChange={(v) => setHood(h.id, { branchEntryK: v })} />
                        <Field label="افت‌های دیگر" unit="Pa" value={h.otherLoss} onChange={(v) => setHood(h.id, { otherLoss: v })} />
                      </div>
                      <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-iso-navy p-4 text-iso-concrete sm:grid-cols-4">
                        <Stat label="دبی" value={`${fa(res.flow * 3600)} m³/h`} />
                        <Stat label="قطر کانال" value={`${fa(res.diameterMm)} mm`} />
                        <Stat label="سرعت کانال" value={`${fa(res.velocity, 1)} m/s`} />
                        <Stat label="فشار استاتیک شاخه" value={`${fa(res.sp)} Pa`} />
                      </div>
                    </Panel>
                  );
                })}
                <Button type="button" variant="outline" onClick={() => set("hoods", [...input.hoods, newHood()])} className="w-full border-dashed border-iso-cyan bg-background/70">
                  <Plus className="size-4" /> افزودن هود جدید
                </Button>
              </>
            )}

            {step === 2 && (
              <Panel title="۳. کانال اصلی، تصحیح بالانس و غبارگیر">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="طول کانال اصلی تا فن" unit="m" value={input.mainLength} onChange={(v) => set("mainLength", v)} />
                  <Field label="تعداد زانویی" step="1" value={input.mainElbows} onChange={(v) => set("mainElbows", v)} />
                  <Field label="ضریب هر زانویی" value={input.mainElbowK} onChange={(v) => set("mainElbowK", v)} />
                  <Field label="افت فشار غبارگیر / فیلتر" unit="Pa" value={input.cleanerLoss} onChange={(v) => set("cleanerLoss", v)} hint="از کاتالوگ سازنده" />
                </div>
                <BalanceTable r={r} />
              </Panel>
            )}

            {step === 3 && (
              <Panel title="۴. فن، دودکش و هوای جبرانی">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="طول کانال خروجی / دودکش" unit="m" value={input.outletLength} onChange={(v) => set("outletLength", v)} />
                  <Field label="افت‌های دیگر خروجی" unit="Pa" value={input.outletOtherLoss} onChange={(v) => set("outletOtherLoss", v)} />
                  <Field label="راندمان فن" value={input.fanEfficiency} onChange={(v) => set("fanEfficiency", v)} hint="بین ۰ و ۱" />
                  <Field label="راندمان موتور" value={input.motorEfficiency} onChange={(v) => set("motorEfficiency", v)} />
                  <Field label="هوای جبرانی موجود" unit="m³/h" value={input.supplyAir} onChange={(v) => set("supplyAir", v)} />
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3 rounded-xl bg-iso-navy p-4 text-iso-concrete sm:grid-cols-3">
                  <Stat label="FSP" value={`${fa(r.fsp)} Pa`} />
                  <Stat label="FTP" value={`${fa(r.ftp)} Pa`} />
                  <Stat label="FSP در هوای استاندارد" value={`${fa(r.fspStd)} Pa`} />
                  <Stat label="توان شفت" value={`${fa(r.shaftKw, 2)} kW`} />
                  <Stat label="توان ورودی موتور" value={`${fa(r.motorKw, 2)} kW`} />
                  <Stat label="تراز هوای جبرانی" value={`${fa(r.makeupBalance)} m³/h`} />
                </div>
              </Panel>
            )}

            {step === 4 && <Report input={input} r={r} onExcel={exportXlsx} />}

            <div className="flex justify-between gap-3 print:hidden">
              <Button type="button" variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)} className="bg-background/80">
                <ArrowRight className="size-4" /> مرحله قبل
              </Button>
              {step < 4 ? (
                <Button type="button" onClick={() => setStep((s) => s + 1)} className="bg-iso-navy text-iso-concrete hover:bg-iso-navy/90">
                  مرحله بعد <ArrowLeft className="size-4" />
                </Button>
              ) : (
                <Button type="button" onClick={exportXlsx} className="bg-iso-navy text-iso-concrete hover:bg-iso-navy/90">
                  <Download className="size-4" /> دانلود اکسل
                </Button>
              )}
            </div>
          </div>

          {/* Live sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start print:hidden">
            <div className="overflow-hidden rounded-2xl bg-iso-navy text-iso-concrete shadow-[0_20px_50px_-20px_var(--iso-cyan)]">
              <div className="flex items-center justify-between border-b border-iso-concrete/10 px-5 py-3">
                <span className="text-sm font-bold">نتایج زنده</span>
                <span className="size-2 animate-pulse rounded-full bg-iso-cyan shadow-[0_0_10px_var(--iso-cyan)]" />
              </div>
              <div className="grid grid-cols-2 gap-4 p-5">
                <Stat big label="دبی کل" value={fa(r.totalFlow * 3600)} unit="m³/h" />
                <Stat big label="قطر کانال اصلی" value={fa(r.main.diameterMm)} unit="mm" />
                <Stat big label="فشار استاتیک فن" value={fa(r.fsp)} unit="Pa" />
                <Stat big label="توان موتور" value={fa(r.motorKw, 2)} unit="kW" />
              </div>
            </div>
            {r.warnings.length > 0 && (
              <div className="rounded-2xl border border-iso-copper/40 bg-background/90 p-4">
                <p className="mb-2 flex items-center gap-2 text-sm font-extrabold"><AlertTriangle className="size-4 text-iso-copper" /> هشدارها</p>
                <ul className="space-y-1.5 text-xs leading-6 text-iso-navy/80">
                  {r.warnings.map((w) => <li key={w}>• {w}</li>)}
                </ul>
              </div>
            )}
            <Button type="button" variant="ghost" onClick={() => { setInput({ ...SAMPLE_INPUT, hoods: [newHood({ branchEntryK: 0 })] }); setStep(0); }} className="w-full text-iso-navy/70">
              <RotateCcw className="size-4" /> شروع پروژه جدید
            </Button>
          </aside>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Stat({ label, value, unit, big }: { label: string; value: string; unit?: string; big?: boolean }) {
  return (
    <div>
      <p className="text-[11px] text-iso-concrete/60">{label}</p>
      <p dir="ltr" className={`text-right font-[Orbitron] font-bold text-iso-cyan ${big ? "text-xl" : "text-sm"}`}>
        {value} {unit && <span className="text-[10px] text-iso-concrete/60">{unit}</span>}
      </p>
    </div>
  );
}

const STATUS: Record<string, string> = {
  governing: "شاخه حاکم",
  ok: "متعادل",
  corrected: "تصحیح دبی",
  redesign: "نیاز به بازطراحی",
};

function BalanceTable({ r }: { r: ReturnType<typeof calculate> }) {
  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full min-w-[520px] text-sm">
        <thead>
          <tr className="border-b border-iso-navy/15 text-right text-xs text-iso-navy/60">
            <th className="py-2">هود</th><th>فشار شاخه (Pa)</th><th>اختلاف</th><th>دبی اصلاح‌شده (m³/h)</th><th>وضعیت</th>
          </tr>
        </thead>
        <tbody>
          {r.hoods.map((h) => (
            <tr key={h.id} className="border-b border-iso-navy/10">
              <td className="py-2 font-bold">{h.name}</td>
              <td>{fa(h.sp)}</td>
              <td>{fa(h.diffPct, 1)}٪</td>
              <td>{fa(h.correctedFlow * 3600)}</td>
              <td className={h.status === "redesign" ? "font-bold text-destructive" : ""}>{STATUS[h.status]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Report({ input, r, onExcel }: { input: VentInput; r: ReturnType<typeof calculate>; onExcel: () => void }) {
  const rows: [string, string][] = [
    ["چگالی هوا", `${fa(r.density, 3)} kg/m³`],
    ["دبی کل سیستم", `${fa(r.totalFlow * 3600)} m³/h (${fa(r.totalFlow, 3)} m³/s)`],
    ["قطر / سرعت کانال اصلی", `${fa(r.main.diameterMm)} mm — ${fa(r.main.velocity, 1)} m/s`],
    ["فشار استاتیک شاخه حاکم", `${fa(r.governingSp)} Pa`],
    ["افت کانال اصلی (اصطکاک + اتصالات)", `${fa(r.main.friction + r.main.fittings)} Pa`],
    ["افت شتاب در اتصال", `${fa(r.accelLoss)} Pa`],
    ["افت غبارگیر", `${fa(input.cleanerLoss)} Pa`],
    ["فشار استاتیک ورودی / خروجی فن", `${fa(r.spInlet)} / ${fa(r.spOutlet)} Pa`],
    ["FSP / FTP", `${fa(r.fsp)} / ${fa(r.ftp)} Pa`],
    ["توان هوا / شفت / موتور", `${fa(r.airPowerKw, 2)} / ${fa(r.shaftKw, 2)} / ${fa(r.motorKw, 2)} kW`],
  ];
  return (
    <Panel>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-widest text-iso-cyan"><Wordmark /> REPORT</p>
          <h3 className="mt-1 text-xl font-extrabold">{input.projectName}</h3>
        </div>
        <div className="flex gap-2 print:hidden">
          <Button type="button" variant="outline" onClick={() => window.print()}><Printer className="size-4" /> چاپ / PDF</Button>
          <Button type="button" onClick={onExcel} className="bg-iso-navy text-iso-concrete hover:bg-iso-navy/90"><Download className="size-4" /> اکسل</Button>
        </div>
      </div>
      <dl className="mt-6 divide-y divide-iso-navy/10">
        {rows.map(([k, v]) => (
          <div key={k} className="flex flex-wrap justify-between gap-2 py-2.5 text-sm">
            <dt className="text-iso-navy/70">{k}</dt>
            <dd dir="ltr" className="font-mono font-bold">{v}</dd>
          </div>
        ))}
      </dl>
      <h4 className="mt-8 mb-2 font-extrabold">شاخه‌ها</h4>
      <BalanceTable r={r} />
      <div className="mt-8 rounded-xl border border-iso-copper/40 bg-iso-copper/5 p-4 text-xs leading-6">
        <p className="mb-2 font-extrabold">هشدارها و محدودیت‌ها</p>
        <ul className="space-y-1">
          {[...r.warnings, ...MANDATORY_WARNINGS].map((w) => <li key={w}>• {w}</li>)}
        </ul>
        <p className="mt-3 text-iso-navy/60">
          مبنا: ACGIH Industrial Ventilation (ویرایش ۲۳، ۱۹۹۸) و فصل ۸ Handbook of Ventilation for Contaminant Control؛ اصطکاک کانال با روش دارسی–وایسباخ (SI).
        </p>
      </div>
    </Panel>
  );
}
