import { useEffect, useRef } from "react";

/**
 * Fixed, non-interactive-looking grid backdrop that reacts to pointer movement:
 * a soft spotlight follows the cursor and brightens the grid lines beneath it.
 */
export function InteractiveGrid() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let frame = 0;
    const onMove = (event: PointerEvent) => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        el.style.setProperty("--grid-x", `${event.clientX}px`);
        el.style.setProperty("--grid-y", `${event.clientY}px`);
        el.style.setProperty("--grid-opacity", "1");
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} className="interactive-grid" aria-hidden="true">
      <div className="interactive-grid-base" />
      <div className="interactive-grid-glow" />
    </div>
  );
}
