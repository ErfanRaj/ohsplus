import { Link } from "@tanstack/react-router";
import { ArrowLeft, Wind } from "lucide-react";

export function VentBanner() {
  return (
    <section className="container-page pt-8" aria-label="Ventilation+">
      <Link
        to="/ventilation-plus"
        className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl bg-iso-navy p-6 text-iso-concrete shadow-soft outline-none transition-all duration-300 hover:shadow-[0_25px_60px_-15px_var(--iso-cyan)] focus-visible:ring-2 focus-visible:ring-ring sm:flex-row sm:items-center sm:justify-between md:p-10"
      >
        <span aria-hidden="true" className="vent-flow absolute inset-0 opacity-50 transition-opacity group-hover:opacity-100" />
        <div className="relative flex items-center gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl border border-iso-cyan/50 bg-iso-cyan/10">
            <Wind className="size-7 text-iso-cyan transition-transform duration-700 group-hover:rotate-180" />
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
          </div>
        </div>
        <span className="relative flex items-center gap-1.5 self-start rounded-full bg-iso-cyan px-5 py-2.5 text-sm font-bold text-iso-navy sm:self-auto">
          شروع محاسبه <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
        </span>
      </Link>
    </section>
  );
}
