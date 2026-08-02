import { useEffect, useState } from "react";

import heroImage from "@/assets/hero-hse.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";
import hero4 from "@/assets/hero-4.jpg";

const SLIDES = [
  { src: heroImage, alt: "کارشناس ایمنی با کلاه ایمنی و جلیقه شبرنگ در محیط صنعتی" },
  { src: hero2, alt: "اتاق کنترل صنعتی و پایش شاخص‌های ایمنی" },
  { src: hero3, alt: "بازرسی ایمنی کارگاه ساختمانی با چک‌لیست" },
  { src: hero4, alt: "نمونه‌برداری از آلاینده‌های هوا در محیط کار" },
];

const INTERVAL = 6000;

export function HeroSlideshow() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActive((prev) => (prev + 1) % SLIDES.length);
    }, INTERVAL);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="absolute inset-0" aria-hidden={false}>
      {SLIDES.map((slide, index) => (
        <img
          key={slide.src}
          src={slide.src}
          alt={index === active ? slide.alt : ""}
          width={1600}
          height={1104}
          loading={index === 0 ? "eager" : "lazy"}
          className={`absolute inset-0 size-full object-cover object-left transition-opacity duration-[1500ms] ease-in-out ${
            index === active ? "opacity-60" : "opacity-0"
          }`}

        />
      ))}
      <div
        className="absolute inset-0 bg-gradient-to-l from-ink via-ink/85 to-ink/20"
        aria-hidden="true"
      />
    </div>
  );
}
