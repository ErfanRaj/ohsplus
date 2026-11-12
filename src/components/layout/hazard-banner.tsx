import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useRef, useState } from "react";
import artwork from "@/assets/hazard-entry.jpg.asset.json";

export function HazardBanner() {
  const ref = useRef<HTMLAnchorElement>(null);
  const [p, setP] = useState({ x: 50, y: 50, on: false });
  return (
    <Link
        ref={ref}
        to="/hazard-plus"
        onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setP({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100, on: true }); }}
        onMouseLeave={() => setP({ x: 50, y: 50, on: false })}
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border-2 border-hz-amber/40 bg-hz-steel text-iso-concrete shadow-soft outline-none transition hover:shadow-[0_25px_60px_-15px_var(--hz-amber)] focus-visible:ring-2 focus-visible:ring-ring"
      >
        <img src={artwork.url} alt="HAZARD+ روی دیوار صنعتی" loading="lazy" width={1408} height={768} className="block w-full object-cover flex-1 aspect-[16/8] transition duration-700 motion-safe:group-hover:scale-[1.02]" />
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 transition-opacity" style={{ opacity: p.on ? 1 : 0, background: `radial-gradient(220px circle at ${p.x}% ${p.y}%, transparent 0 40%, color-mix(in oklab, var(--hz-steel) 60%, transparent) 100%)` }} />
        <span aria-hidden="true" className="pointer-events-none absolute size-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-hz-amber transition-opacity" style={{ left: `${p.x}%`, top: `${p.y}%`, opacity: p.on ? 0.9 : 0 }} />
        <div className="pointer-events-none absolute inset-y-0 left-[3%] top-0 flex h-[calc(100%-5.5rem)] w-[46%] flex-col items-center justify-center gap-2 text-center sm:h-[calc(100%-4.5rem)] md:gap-3">
          <span className="hz-headline text-sm font-black leading-snug text-hz-amber sm:text-2xl md:text-lg lg:text-xl">قبل اینکه حادثه بشه، پیداش کن!</span>
          <span className="rounded-full border border-hz-amber/50 bg-hz-steel/60 px-2 py-0.5 text-[9px] font-bold text-iso-concrete backdrop-blur-sm sm:px-3 sm:py-1 sm:text-xs md:text-[10px] lg:text-xs">شبیه‌ساز تعاملی شناسایی خطرات کارگاهی</span>
        </div>
        <span aria-hidden="true" className="hz-stripes absolute inset-x-0 top-0 h-1.5" />
        <div className="relative flex flex-col gap-5 bg-hz-steel p-5 sm:flex-row sm:items-center sm:justify-between md:flex-col md:items-start md:p-4 lg:flex-row lg:items-center">
            <div>
              <p className="mt-1 text-iso-concrete/80">خطرات کارگاه را پیدا کن؛ روش کنترل و استانداردش را یاد بگیر.</p>
            </div>
          <span className="inline-flex items-center gap-2 self-start rounded-full bg-hz-amber px-5 py-2.5 font-bold text-hz-steel sm:self-auto">
            شروع شکار خطر <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          </span>
        </div>
      </Link>
  );
}
