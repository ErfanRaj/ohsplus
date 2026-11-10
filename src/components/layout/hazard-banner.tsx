import { Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { useRef, useState } from "react";
import scene from "@/assets/hazard-workshop.jpg";

export function HazardBanner() {
  const ref = useRef<HTMLAnchorElement>(null);
  const [p, setP] = useState({ x: 50, y: 50, on: false });
  return (
    <section className="container-page pt-8" aria-label="Hazard+">
      <Link
        ref={ref}
        to="/hazard-plus"
        onMouseMove={(e) => { const r = ref.current!.getBoundingClientRect(); setP({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100, on: true }); }}
        onMouseLeave={() => setP({ x: 50, y: 50, on: false })}
        className="group relative block overflow-hidden rounded-2xl border-2 border-hz-amber/40 bg-hz-steel text-iso-concrete shadow-soft outline-none transition hover:shadow-[0_25px_60px_-15px_var(--hz-amber)] focus-visible:ring-2 focus-visible:ring-ring"
      >
        <img src={scene} alt="" loading="lazy" width={1920} height={1088} className="absolute inset-0 size-full object-cover opacity-35 grayscale transition duration-700 group-hover:scale-105 group-hover:opacity-60 group-hover:grayscale-0" />
        <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-l from-hz-steel via-hz-steel/80 to-transparent" />
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 transition-opacity" style={{ opacity: p.on ? 1 : 0, background: `radial-gradient(220px circle at ${p.x}% ${p.y}%, transparent 0 40%, color-mix(in oklab, var(--hz-steel) 60%, transparent) 100%)` }} />
        <span aria-hidden="true" className="pointer-events-none absolute size-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-hz-amber transition-opacity" style={{ left: `${p.x}%`, top: `${p.y}%`, opacity: p.on ? 0.9 : 0 }} />
        <span aria-hidden="true" className="hz-stripes absolute inset-x-0 top-0 h-1.5" />
        <div className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between md:p-10">
          <div className="flex items-center gap-4">
            <span className="grid size-16 shrink-0 place-items-center rounded-2xl border border-hz-amber/60 bg-hz-amber/15">
              <ShieldAlert className="size-8 text-hz-amber transition-transform group-hover:scale-110" />
            </span>
            <div>
              <p dir="ltr" className="text-end font-[Orbitron] text-2xl font-black tracking-wider sm:text-3xl">HAZARD<span className="text-hz-amber">+</span></p>
              <p className="mt-1 text-iso-concrete/80">خطرات کارگاه را پیدا کن؛ روش کنترل و استانداردش را یاد بگیر.</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 self-start rounded-full bg-hz-amber px-5 py-2.5 font-bold text-hz-steel sm:self-auto">
            شروع شکار خطر <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          </span>
        </div>
      </Link>
    </section>
  );
}
