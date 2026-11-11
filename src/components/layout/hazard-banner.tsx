import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useRef, useState } from "react";
import artwork from "@/assets/hazard-entry.jpg.asset.json";

export function HazardBanner() {
  const ref = useRef<HTMLAnchorElement>(null);
  const [p, setP] = useState({ x: 50, y: 50, on: false });
  return (
    <section className="container-page pt-8" aria-label="Hazard+">
      <Link
        ref={ref}
        to="/hazard-plus"
        onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setP({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100, on: true }); }}
        onMouseLeave={() => setP({ x: 50, y: 50, on: false })}
        className="group relative block overflow-hidden rounded-2xl border-2 border-hz-amber/40 bg-hz-steel text-iso-concrete shadow-soft outline-none transition hover:shadow-[0_25px_60px_-15px_var(--hz-amber)] focus-visible:ring-2 focus-visible:ring-ring"
      >
        <img src={artwork.url} alt="HAZARD+ روی دیوار صنعتی" loading="lazy" width={1408} height={768} className="block w-full transition duration-700 motion-safe:group-hover:scale-[1.02]" />
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 transition-opacity" style={{ opacity: p.on ? 1 : 0, background: `radial-gradient(220px circle at ${p.x}% ${p.y}%, transparent 0 40%, color-mix(in oklab, var(--hz-steel) 60%, transparent) 100%)` }} />
        <span aria-hidden="true" className="pointer-events-none absolute size-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-hz-amber transition-opacity" style={{ left: `${p.x}%`, top: `${p.y}%`, opacity: p.on ? 0.9 : 0 }} />
        <span aria-hidden="true" className="hz-stripes absolute inset-x-0 top-0 h-1.5" />
        <div className="relative flex flex-col gap-5 bg-hz-steel p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
            <div>
              <p className="mt-1 text-iso-concrete/80">خطرات کارگاه را پیدا کن؛ روش کنترل و استانداردش را یاد بگیر.</p>
            </div>
          <span className="inline-flex items-center gap-2 self-start rounded-full bg-hz-amber px-5 py-2.5 font-bold text-hz-steel sm:self-auto">
            شروع شکار خطر <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          </span>
        </div>
      </Link>
    </section>
  );
}
