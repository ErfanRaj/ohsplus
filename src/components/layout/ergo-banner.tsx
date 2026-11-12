import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

export function ErgoBanner() {
  const [p, setP] = useState({ x: 50, y: 50, on: false });
  return (
    <Link
      to="/ergo-plus"
      aria-label="ورود به بخش Ergo+"
      onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setP({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100, on: true }); }}
      onMouseLeave={() => setP({ x: 50, y: 50, on: false })}
      className="eg-grid group relative flex h-full min-h-[260px] flex-col justify-between overflow-hidden rounded-2xl border-2 border-eg-cyan/40 bg-eg-bg p-6 text-eg-ink shadow-soft outline-none transition hover:shadow-[0_25px_60px_-15px_var(--eg-pink)] focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 transition-opacity" style={{ opacity: p.on ? 1 : 0, background: `radial-gradient(260px circle at ${p.x}% ${p.y}%, color-mix(in oklab, var(--eg-pink) 30%, transparent), transparent 70%)` }} />
      <svg aria-hidden="true" viewBox="0 0 120 140" className="eg-sway absolute bottom-4 left-6 h-36 w-32 opacity-90 md:h-44">
        <g stroke="var(--eg-cyan)" strokeWidth="6" strokeLinecap="round" fill="none">
          <polyline points="30,132 44,98 30,72" /><line x1="30" y1="72" x2="66" y2="40" /><polyline points="66,40 78,70 92,92" />
        </g>
        <circle cx="76" cy="26" r="11" fill="var(--eg-cyan)" />
        <circle className="eg-pulse" cx="36" cy="66" r="6" fill="var(--eg-pink)" />
        <rect x="84" y="88" width="26" height="22" rx="3" fill="var(--eg-pink)" />
      </svg>
      <div className="relative">
        <div dir="ltr" className="eg-glow text-right text-4xl font-black tracking-wider" style={{ fontFamily: "Orbitron, sans-serif" }}>ERGO<span className="text-eg-pink">+</span></div>
        <p className="mt-3 text-xl font-black md:text-2xl">کمرت رو قبل از بار حساب کن!</p>
        <p className="mt-1 max-w-[60%] text-sm text-eg-ink/75">محاسبه‌گر تعاملی ریسک بلند کردن بار بر اساس معادله NIOSH</p>
      </div>
      <span className="relative inline-flex items-center gap-2 self-start rounded-full bg-eg-cyan px-5 py-2.5 font-bold text-eg-bg">
        شروع ارزیابی <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
      </span>
    </Link>
  );
}
