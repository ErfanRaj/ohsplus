import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useRef, useState } from "react";

import isoBanner from "@/assets/iso-home-banner.jpg.asset.json";

export function IsoBanner() {
  const ref = useRef<HTMLAnchorElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50, rx: 0, ry: 0, active: false });

  const onMove = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setPos({ x, y, rx: (50 - y) / 10, ry: (x - 50) / 14, active: true });
  };

  return (
    <section className="container-page pt-16 md:pt-24" aria-label="ISO+">
      <div style={{ perspective: "1200px" }}>
        <Link
          ref={ref}
          to="/iso-plus"
          onMouseMove={onMove}
          onMouseLeave={() => setPos({ x: 50, y: 50, rx: 0, ry: 0, active: false })}
          aria-label="ورود به بخش ISO+"
          className="group relative block overflow-hidden rounded-2xl border border-border shadow-soft outline-none transition-[transform,box-shadow] duration-300 ease-out hover:shadow-[0_25px_60px_-15px_var(--iso-green)] focus-visible:ring-2 focus-visible:ring-ring"
          style={{
            transform: `rotateX(${pos.rx}deg) rotateY(${pos.ry}deg) scale(${pos.active ? 1.015 : 1})`,
          }}
        >
          <img
            src={isoBanner.url}
            alt="ISO+ — استانداردهای ایزو"
            loading="lazy"
            className="aspect-[16/6] w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {/* right-side tagline */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-3/5 bg-gradient-to-l from-iso-navy/70 via-iso-navy/30 to-transparent"
          />
          <div className="pointer-events-none absolute inset-y-0 right-[6%] flex w-[44%] flex-col items-center justify-center gap-1 text-center sm:gap-3">
            <span className="relative inline-block text-sm font-extrabold text-iso-concrete/90 [text-shadow:0_2px_10px_rgb(0_0_0/0.5)] sm:text-2xl md:text-4xl">
              پیچیده‌اش نکن،
              <svg
                viewBox="0 0 100 40"
                preserveAspectRatio="none"
                className="absolute -inset-x-2 -inset-y-1 h-[calc(100%+0.5rem)] w-[calc(100%+1rem)] -rotate-3 overflow-visible"
                aria-hidden="true"
              >
                <path d="M4 6 Q50 22 96 36" className="iso-strike" stroke="#ef2b2b" strokeWidth="5" strokeLinecap="round" fill="none" />
                <path d="M96 4 Q52 20 5 37" className="iso-strike iso-strike-2" stroke="#ef2b2b" strokeWidth="5" strokeLinecap="round" fill="none" />
              </svg>
            </span>
            <span className="text-base font-black leading-tight text-iso-concrete [text-shadow:0_2px_12px_rgb(0_0_0/0.6)] sm:text-3xl md:text-5xl">
              <span
                dir="ltr"
                className="font-[Orbitron] tracking-wider text-iso-green [text-shadow:0_0_18px_var(--iso-green),0_0_4px_var(--iso-green)]"
              >
                ISO
              </span>{" "}
              به همین راحتی
            </span>
          </div>
          {/* cursor spotlight */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-0 mix-blend-screen transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background: `radial-gradient(320px circle at ${pos.x}% ${pos.y}%, color-mix(in oklab, var(--iso-green) 55%, transparent), transparent 65%)`,
            }}
          />
          {/* light sweep */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-background/50 to-transparent opacity-0 group-hover:iso-sweep group-hover:opacity-100"
          />
          {/* glowing border */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-iso-green/0 transition-all duration-300 group-hover:ring-iso-green/80"
          />
          <span className="absolute bottom-3 left-3 flex translate-y-3 items-center gap-1.5 rounded-full bg-iso-navy px-4 py-2 text-xs font-bold text-iso-concrete opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:bottom-5 sm:left-5 sm:text-sm">
            ورود به دنیای استانداردها
            <ArrowLeft className="size-4" aria-hidden="true" />
          </span>
        </Link>
      </div>
    </section>
  );
}
