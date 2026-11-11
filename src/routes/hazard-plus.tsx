import { createFileRoute } from "@tanstack/react-router";
import { Lightbulb, RotateCcw, X } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { CATEGORY_LABEL, RISK_LABEL, type Hazard } from "@/lib/hazards";
import { scenariosQuery, type Scenario } from "@/lib/hazard-queries";
import { resolveImageUrl } from "@/lib/uploads";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/hazard-plus")({
  loader: ({ context }) => context.queryClient.ensureQueryData(scenariosQuery()),
  head: () => ({
    meta: [
      { title: "Hazard+ | شکار خطر در محیط کار — OHS Plus" },
      { name: "description", content: "آموزش تعاملی شناسایی خطرات ایمنی و بهداشت شغلی در کارگاه ماشین‌کاری با روش‌های کنترل و استانداردها." },
      { property: "og:title", content: "Hazard+ | خطرات کارگاه را پیدا کن" },
      { property: "og:description", content: "روی خطرات کلیک کن و سلسله‌مراتب کنترل و استانداردهای مرتبط را ببین." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HazardPage,
});

const riskClass: Record<Hazard["risk"], string> = {
  high: "bg-hz-red text-iso-concrete", medium: "bg-hz-amber text-hz-steel", low: "bg-iso-cyan text-hz-steel",
};

function HazardPage() {
  const { data: scenarios } = useSuspenseQuery(scenariosQuery());
  const [scenarioId, setScenarioId] = useState<string | null>(null);
  const scenario = scenarios.find(s => s.id === scenarioId) ?? scenarios[0];
  return <div className="min-h-screen bg-hz-steel text-iso-concrete"><SiteHeader /><main>
    {scenarios.length > 1 && <div className="container-page pt-6"><Select value={scenario?.id} onValueChange={setScenarioId}><SelectTrigger className="max-w-md" aria-label="انتخاب سناریو"><SelectValue /></SelectTrigger><SelectContent>{scenarios.map(s => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}</SelectContent></Select></div>}
    {scenario ? <HazardGame key={scenario.id} scenario={scenario} /> : <section className="container-page py-16"><h1 className="text-4xl font-bold" dir="ltr">HAZARD+</h1><p className="mt-5">هنوز سناریوی فعالی وجود ندارد.</p></section>}
  </main><SiteFooter /></div>;
}

function HazardGame({ scenario }: { scenario: Scenario }) {
  const hazards = scenario.hazards;
  const [found, setFound] = useState<string[]>([]);
  const [active, setActive] = useState<Hazard | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [miss, setMiss] = useState<{ x: number; y: number; k: number } | null>(null);
  const total = hazards.length;
  const done = found.length === total;

  const onSceneClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    const ratio = r.height / r.width;
    const hit = hazards.find((h) => Math.hypot(x - h.x, (y - h.y) * ratio) <= h.r);
    if (hit) {
      setFound((f) => (f.includes(hit.id) ? f : [...f, hit.id]));
      setActive(hit);
      setHint(null);
    } else {
      setMiss({ x, y, k: Date.now() });
    }
  };

  const showHint = () => {
    const next = hazards.find((h) => !found.includes(h.id));
    setHint(next?.id ?? null);
  };

  return (
    <>
        <div className="hz-stripes h-2" aria-hidden="true" />
        <section className="container-page py-10 md:py-14">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="flex items-center gap-3 text-4xl font-black md:text-5xl">
                <span dir="ltr" className="font-[Orbitron] tracking-wider">HAZARD<span className="text-hz-amber">+</span></span>
              </h1>
              <p className="mt-3 max-w-2xl leading-8 text-iso-concrete/80">
                {scenario.description}
              </p>
              <h2 className="mt-3 font-bold text-hz-amber">{scenario.title}</h2>
            </div>
            <div className="w-full max-w-xs">
              <div className="flex justify-between text-sm">
                <span>خطرات شناسایی‌شده</span>
                <span dir="ltr" className="font-bold tabular-nums">{found.length} / {total}</span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-iso-concrete/15">
                <div className="h-full rounded-full bg-hz-amber transition-all duration-500" style={{ width: `${(found.length / total) * 100}%` }} />
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="secondary" onClick={showHint} disabled={done}><Lightbulb className="size-4" /> راهنما</Button>
                <Button size="sm" variant="ghost" onClick={() => { setFound([]); setActive(null); setHint(null); }}><RotateCcw className="size-4" /> شروع دوباره</Button>
              </div>
            </div>
          </div>

          <div className="mt-8 overflow-x-auto rounded-2xl border-2 border-hz-amber/40 shadow-[0_20px_60px_-20px_var(--hz-amber)]">
            <div className="relative min-w-[720px] cursor-crosshair select-none" onClick={onSceneClick} role="application" aria-label="تصویر کارگاه برای شناسایی خطر">
              <img src={resolveImageUrl(scenario.image_url) ?? ""} alt={scenario.title} className="block w-full" draggable={false} />
              <span aria-hidden="true" className="hz-scan pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-hz-amber/10 to-transparent" />
              {hazards.map((h, i) => {
                const isFound = found.includes(h.id);
                const isHint = hint === h.id;
                if (!isFound && !isHint) return null;
                return (
                  <Button variant="ghost"
                    key={h.id}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setActive(h); }}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${h.x}%`, top: `${h.y}%` }}
                    aria-label={h.title}
                  >
                    {isFound ? (
                      <span className="relative grid size-10 place-items-center">
                        <span className="hz-ping absolute inset-0 rounded-full border-2 border-hz-amber" />
                        <span dir="ltr" className="relative grid size-9 place-items-center rounded-full border-2 border-hz-steel bg-hz-amber font-black text-hz-steel">{i + 1}</span>
                      </span>
                    ) : (
                      <span className="block size-28 animate-pulse rounded-full border-2 border-dashed border-hz-amber/80 bg-hz-amber/10" />
                    )}
                  </Button>
                );
              })}
              {miss && (
                <span key={miss.k} className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 animate-ping text-hz-red" style={{ left: `${miss.x}%`, top: `${miss.y}%` }}>
                  <X className="size-8" />
                </span>
              )}
            </div>
          </div>
          {hint && <p className="mt-3 text-sm text-hz-amber">💡 {hazards.find((h) => h.id === hint)?.hint}</p>}

          {done && (
            <div className="mt-6 rounded-2xl border border-hz-amber bg-hz-amber/10 p-5 text-center">
              <p className="text-xl font-black text-hz-amber">آفرین! همه {total} خطر را پیدا کردید.</p>
              <p className="mt-1 text-sm text-iso-concrete/80">برای مرور، روی شماره‌ها کلیک کنید.</p>
            </div>
          )}

          {found.length > 0 && (
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {hazards.map((h, i) => found.includes(h.id) && (
                <Button variant="ghost" key={h.id} type="button" onClick={() => setActive(h)} className="h-auto whitespace-normal rounded-lg border border-iso-concrete/15 bg-iso-concrete/5 p-3 text-start transition hover:border-hz-amber">
                  <span dir="ltr" className="font-black text-hz-amber">#{i + 1}</span> <span className="text-sm">{h.title}</span>
                </Button>
              ))}
            </div>
          )}
        </section>

      {active && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-hz-steel/70 p-3 backdrop-blur-sm sm:items-center" onClick={() => setActive(null)}>
          <div className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-hz-amber/50 bg-hz-steel shadow-2xl" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={active.title}>
            <div className="hz-stripes h-2" />
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-xl font-black leading-9">{active.title}</h2>
                <Button variant="ghost" size="icon" type="button" onClick={() => setActive(null)} aria-label="بستن"><X className="size-5" /></Button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                <span className="rounded-full bg-iso-concrete/10 px-3 py-1">{CATEGORY_LABEL[active.category]}</span>
                <span className={`rounded-full px-3 py-1 ${riskClass[active.risk]}`}>{RISK_LABEL[active.risk]}</span>
              </div>
              <h3 className="mt-5 font-bold text-hz-amber">پیامد احتمالی</h3>
              <p className="mt-1 leading-8 text-iso-concrete/85">{active.consequence}</p>
              <h3 className="mt-5 font-bold text-hz-amber">روش‌های کنترل (سلسله‌مراتب کنترل)</h3>
              <ul className="mt-2 space-y-2">
                {active.controls.map((c, i) => (
                  <li key={i} className="rounded-lg border border-iso-concrete/10 bg-iso-concrete/5 p-3 text-sm leading-7">
                    <span className="ms-0 me-2 rounded bg-hz-amber/20 px-2 py-0.5 text-xs font-bold text-hz-amber">{c.level}</span>{c.text}
                  </li>
                ))}
              </ul>
              <h3 className="mt-5 font-bold text-hz-amber">استانداردها و مراجع</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {active.standards.map((s) => <span key={s} className="rounded-md border border-iso-cyan/40 px-2 py-1 text-xs text-iso-cyan">{s}</span>)}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
