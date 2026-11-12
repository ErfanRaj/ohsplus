import { createFileRoute } from "@tanstack/react-router";
import { Download, RotateCcw } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { Mannequin, RISK_COLOR } from "@/components/ergo/mannequin";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { buildReportSvg, downloadBlob, svgToPng } from "@/lib/ergo-export";
import { calcLift, FREQUENCY_OPTIONS, type Coupling, type Duration, type LiftInput } from "@/lib/niosh";

export const Route = createFileRoute("/ergo-plus")({
  head: () => ({
    meta: [
      { title: "Ergo+ | محاسبه‌گر معادله بلند کردن بار NIOSH — OHS Plus" },
      { name: "description", content: "حد وزن توصیه‌شده (RWL) و شاخص بلند کردن (LI) را با معادله بازنگری‌شده NIOSH محاسبه کنید و گزارش تصویری بگیرید." },
      { property: "og:title", content: "Ergo+ | ریسک ارگونومی حمل بار" },
      { property: "og:description", content: "آدمک تعاملی، محاسبه RWL و LI و دانلود گزارش تصویری." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ErgoPage,
});

const DEFAULT: LiftInput = { load: 12, H: 40, V: 30, D: 70, A: 30, F: 2, duration: "moderate", coupling: "fair" };
const RISK_TEXT = { low: "ریسک پایین — برای اکثر کارگران قابل قبول", moderate: "ریسک افزایش‌یافته — نیاز به اصلاح", high: "ریسک بالا — اصلاح فوری لازم است" };
const FIX: Record<string, string> = {
  HM: "بار را به بدن نزدیک‌تر کنید؛ موانع جلوی پا را بردارید یا از بار کوچک‌تر استفاده کنید.",
  VM: "ارتفاع شروع را به حدود ۷۵ سانتی‌متر (سطح کمر) برسانید؛ از میز بالابر یا پالت استفاده کنید.",
  DM: "اختلاف ارتفاع مبدأ و مقصد را کاهش دهید.",
  AM: "مبدأ و مقصد را روبه‌روی کارگر بچینید تا پیچش تنه حذف شود.",
  FM: "تکرار را کم کنید، کار را چرخشی کنید یا استراحت بیشتری بگذارید.",
  CM: "از جعبه با دستگیره مناسب یا ابزار کمکی گرفتن بار استفاده کنید.",
};

function Range({ label, tip, unit, value, min, max, step = 1, onChange }: { label: string; tip: string; unit: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void }) {
  return (
    <div className="rounded-xl border border-eg-cyan/20 bg-eg-panel/70 p-4">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-bold">{label}</span>
        <span className="eg-num text-lg font-bold text-eg-cyan">{value} <span className="text-xs text-eg-ink/60">{unit}</span></span>
      </div>
      <Slider dir="ltr" className="mt-3" min={min} max={max} step={step} value={[value]} onValueChange={([v]) => onChange(v)} aria-label={label} />
      <p className="mt-2 text-xs text-eg-ink/60">{tip}</p>
    </div>
  );
}

function ErgoPage() {
  const [input, setInput] = useState<LiftInput>(DEFAULT);
  const [busy, setBusy] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const r = useMemo(() => calcLift(input), [input]);
  const set = <K extends keyof LiftInput>(k: K) => (v: LiftInput[K]) => setInput((p) => ({ ...p, [k]: v }));
  const fmt = (x: number, d = 2) => (Number.isFinite(x) ? x.toFixed(d) : "∞");

  const download = async () => {
    if (!svgRef.current) return;
    setBusy(true);
    try { downloadBlob(await svgToPng(buildReportSvg(svgRef.current, input)), "ergo-plus-niosh-report.png"); }
    finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-eg-bg text-eg-ink">
      <SiteHeader />
      <main>
        <section className="eg-grid border-b border-eg-cyan/20">
          <div className="container-page py-12 text-center md:py-16">
            <h1 dir="ltr" className="eg-glow text-5xl font-black tracking-wider md:text-6xl" style={{ fontFamily: "Orbitron, sans-serif" }}>ERGO<span className="text-eg-pink">+</span></h1>
            <p className="mx-auto mt-4 max-w-2xl text-eg-ink/80">ارزیابی ریسک بلند کردن دستی بار با معادله بازنگری‌شده NIOSH؛ داده‌ها را تغییر بده و واکنش آدمک را ببین.</p>
          </div>
        </section>

        <section className="container-page grid gap-6 py-10 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-3">
            <Range label="وزن بار (L)" unit="kg" tip="وزن واقعی جسمی که جابه‌جا می‌شود." value={input.load} min={1} max={50} step={0.5} onChange={set("load")} />
            <Range label="فاصله افقی (H)" unit="cm" tip="از وسط قوزک پاها تا وسط دست‌ها؛ محدوده ۲۵ تا ۶۳ (بیش از ۶۳ یعنی صفر)." value={input.H} min={25} max={70} onChange={set("H")} />
            <Range label="ارتفاع عمودی دست‌ها (V)" unit="cm" tip="ارتفاع دست‌ها از زمین در مبدأ؛ بهترین حالت ۷۵ سانتی‌متر." value={input.V} min={0} max={175} onChange={set("V")} />
            <Range label="مسافت جابه‌جایی عمودی (D)" unit="cm" tip="اختلاف ارتفاع مبدأ و مقصد؛ حداقل ۲۵ سانتی‌متر در نظر گرفته می‌شود." value={input.D} min={25} max={175} onChange={set("D")} />
            <Range label="زاویه عدم تقارن / پیچش (A)" unit="°" tip="زاویه چرخش بار نسبت به صفحه میانی بدن؛ بیش از ۱۳۵ درجه یعنی صفر." value={input.A} min={0} max={140} step={5} onChange={set("A")} />
            <div className="grid gap-3 sm:grid-cols-3">
              <Pick label="تکرار (F)" tip="دفعه در دقیقه" value={String(input.F)} onChange={(v) => set("F")(Number(v))} options={[...FREQUENCY_OPTIONS.map((f) => [String(f), String(f)] as [string, string]), ["16", ">15"]]} />
              <Pick label="مدت کار" tip="در هر شیفت" value={input.duration} onChange={(v) => set("duration")(v as Duration)} options={[["short", "≤ ۱ ساعت"], ["moderate", "۱ تا ۲ ساعت"], ["long", "۲ تا ۸ ساعت"]]} />
              <Pick label="کیفیت گرفتن (C)" tip="دستگیره و شکل بار" value={input.coupling} onChange={(v) => set("coupling")(v as Coupling)} options={[["good", "خوب"], ["fair", "متوسط"], ["poor", "ضعیف"]]} />
            </div>
            <Button variant="outline" className="border-eg-cyan/40 bg-transparent text-eg-ink" onClick={() => setInput(DEFAULT)}><RotateCcw className="size-4" /> بازنشانی</Button>
          </div>

          <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <div className="overflow-hidden rounded-2xl border-2 transition-colors" style={{ borderColor: RISK_COLOR[r.risk] }}>
              <div className="aspect-[300/340] max-h-[460px] w-full"><Mannequin ref={svgRef} input={input} risk={r.risk} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Stat label="حد وزن توصیه‌شده RWL" value={`${fmt(r.RWL)} kg`} />
              <Stat label="شاخص بلند کردن LI" value={fmt(r.LI)} color={RISK_COLOR[r.risk]} />
            </div>
            <div className="rounded-xl p-4 font-bold" style={{ background: `color-mix(in oklab, ${RISK_COLOR[r.risk]} 22%, transparent)`, color: RISK_COLOR[r.risk] }}>{RISK_TEXT[r.risk]}</div>
            <div className="grid grid-cols-3 gap-2" dir="ltr">
              {Object.entries(r.multipliers).map(([k, v]) => (
                <div key={k} className={`rounded-lg border p-2 text-center ${k === r.worst ? "border-eg-pink" : "border-eg-cyan/20"}`}>
                  <div className="eg-num text-xs text-eg-ink/60">{k}</div>
                  <div className="eg-num font-bold">{v.toFixed(3)}</div>
                </div>
              ))}
            </div>
            {r.risk !== "low" && <p className="rounded-xl border border-eg-pink/40 p-4 text-sm"><b className="text-eg-pink">پیشنهاد اصلاح ({r.worst}):</b> {FIX[r.worst]}</p>}
            <Button className="w-full bg-eg-cyan font-bold text-eg-bg hover:bg-eg-cyan/90" onClick={download} disabled={busy}><Download className="size-4" /> دانلود گزارش تصویری (PNG)</Button>
            <p className="text-xs text-eg-ink/50">مبنا: Revised NIOSH Lifting Equation (Waters و همکاران ۱۹۹۳؛ NIOSH Pub. 94-110). نتایج غربالگری اولیه است و جایگزین ارزیابی کارشناس نیست.</p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return <div className="rounded-xl border border-eg-cyan/20 bg-eg-panel p-4"><div className="text-xs text-eg-ink/60">{label}</div><div className="eg-num mt-1 text-2xl font-black" style={color ? { color } : undefined}>{value}</div></div>;
}

function Pick({ label, tip, value, onChange, options }: { label: string; tip: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <div className="rounded-xl border border-eg-cyan/20 bg-eg-panel/70 p-3">
      <div className="text-sm font-bold">{label}</div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="mt-2 eg-num" aria-label={label}><SelectValue /></SelectTrigger>
        <SelectContent>{options.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
      </Select>
      <p className="mt-1 text-xs text-eg-ink/60">{tip}</p>
    </div>
  );
}
