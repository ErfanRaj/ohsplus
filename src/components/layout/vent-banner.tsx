import { Link } from "@tanstack/react-router";
import { ArrowLeft, Wind } from "lucide-react";
import { useRef, useState } from "react";

const tags = ["هود", "کانال", "افت فشار", "فن"];
const particles = Array.from({ length: 14 }, (_, i) => ({
  top: `${(i * 37) % 100}%`,
  dur: `${3 + ((i * 7) % 5)}s`,
  delay: `${-(i * 0.6)}s`,
  w: 20 + ((i * 13) % 50),
}));

export function VentBanner() {
  const ref = useRef<HTMLAnchorElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50, rx: 0, ry: 0, active: false });

  const onMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setPos({ x, y, rx: (50 - y) / 12, ry: (x - 50) / 18, active: true });
  };

  return (
    <section className="container-page pt-8" aria-label="Ventilation+">
      <div style={{ perspective: "1200px" }}>
        <Link
          ref={ref}
          to="/ventilation-plus"
          onMouseMove={onMove}
          onMouseLeave={() => setPos({ x: 50, y: 50, rx: 0, ry: 0, active: false })}
          className="group relative flex flex-col gap-5 overflow-hidden rounded-2xl border border-iso-cyan/20 bg-iso-navy p-6 text-iso-concrete shadow-soft outline-none transition-[transform,box-shadow] duration-300 ease-out hover:shadow-[0_25px_60px_-15px_var(--iso-cyan)] focus-visible:ring-2 focus-visible:ring-ring sm:flex-row sm:items-center sm:justify-between md:p-10"
          style={{ transform: `rotateX(${pos.rx}deg) rotateY(${pos.ry}deg) scale(${pos.active ? 1.015 : 1})` }}
        >
          <span aria-hidden="true" className="vent-flow absolute inset-0 opacity-50 transition-opacity group-hover:opacity-100" />
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            {particles.map((p, i) => (
              <span
                key={i}
                className="vent-particle absolute h-px bg-gradient-to-r from-transparent via-iso-cyan to-transparent opacity-60"
                style={{ top: p.top, width: p.w, animationDuration: p.dur, animationDelay: p.delay }}
              />
            ))}
          </span>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-0 mix-blend-screen transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: `radial-gradient(300px circle at ${pos.x}% ${pos.y}%, color-mix(in oklab, var(--iso-cyan) 45%, transparent), transparent 65%)` }}
          />
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-iso-cyan/25 to-transparent opacity-0 group-hover:iso-sweep group-hover:opacity-100" />
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-iso-cyan/0 transition-all duration-300 group-hover:ring-iso-cyan/70" />

          <div className="relative flex items-center gap-4">
            <span className="relative grid size-16 shrink-0 place-items-center rounded-2xl border border-iso-cyan/50 bg-iso-cyan/10">
              <span aria-hidden="true" className="vent-pulse absolute inset-0 rounded-2xl border border-iso-cyan" />
              <Wind className="size-8 text-iso-cyan transition-transform duration-700 group-hover:rotate-[360deg] group-hover:scale-110" />
            </span>
            <div>
              <p className="text-2xl font-black sm:text-3xl">
                <span dir="ltr" className="font-[Orbitron] tracking-wide">
                  Ventilation<sup className="text-iso-cyan drop-shadow-[0_0_12px_var(--iso-cyan)]">+</sup>
                </span>
              </p>
              <p className="mt-1 text-sm text-iso-concrete/75 sm:text-base">
                محاسبه‌گر آنلاین تهویه موضعی — از دبی هود تا توان فن، با خروجی اکسل
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {tags.map((t, i) => (
                  <span
                    key={t}
                    className="rounded-full border border-iso-cyan/30 bg-iso-cyan/5 px-2.5 py-0.5 text-xs text-iso-cyan transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-iso-cyan/70"
                    style={{ transitionDelay: `${i * 60}ms` }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <span className="relative flex items-center gap-1.5 self-start rounded-full bg-iso-cyan px-5 py-2.5 text-sm font-bold text-iso-navy shadow-[0_0_20px_-4px_var(--iso-cyan)] transition-all group-hover:gap-3 sm:self-auto">
            شروع محاسبه <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          </span>
        </Link>
      </div>
    </section>
  );
}
