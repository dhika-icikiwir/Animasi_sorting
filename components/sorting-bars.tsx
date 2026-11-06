"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { Bar, Step } from "@/lib/algorithms";

gsap.registerPlugin(useGSAP);

export const COLORS = {
  default: "#71717a",
  compare: "#facc15",
  swap: "#f43f5e",
  pivot: "#f4f4f5",
  sorted: "#22c55e",
};

type Props = {
  step: Step;
  /** Referensi baru berarti data baru, dan memicu animasi masuk. */
  initial: Bar[];
  /** Durasi animasi satu langkah dalam detik; 0 berarti langsung pindah. */
  duration: number;
  animateIntro: boolean;
};

export function SortingBars({ step, initial, duration, animateIntro }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const n = step.bars.length;
  const showLabels = n <= 30;

  useGSAP(
    () => {
      if (!animateIntro) return;
      gsap.fromTo(".bar-fill", { scaleY: 0 }, { scaleY: 1, duration: 0.4, ease: "power2.out", stagger: 0.01 });
    },
    { scope: container, dependencies: [initial] },
  );

  // Batang dicari lewat id, bukan indeks, agar GSAP menggeser batang yang sama saat ditukar.
  useGSAP(
    () => {
      const sortedSet = new Set(step.sorted);
      const compareSet = new Set(step.compare);
      const swapSet = new Set(step.swap);
      const [lo, hi] = step.range ?? [0, n - 1];
      const colorDuration = Math.min(duration, 0.25);

      step.bars.forEach((bar, index) => {
        const wrap = container.current?.querySelector<HTMLElement>(`[data-id="${bar.id}"]`);
        if (!wrap) return;
        const fill = wrap.querySelector<HTMLElement>(".bar-fill");
        const label = wrap.querySelector<HTMLElement>(".bar-label");

        let color = COLORS.default;
        if (sortedSet.has(index)) color = COLORS.sorted;
        if (compareSet.has(index)) color = COLORS.compare;
        if (step.pivot === index) color = COLORS.pivot;
        if (swapSet.has(index)) color = COLORS.swap;

        const active = compareSet.has(index) || swapSet.has(index);
        const inRange = (index >= lo && index <= hi) || sortedSet.has(index);

        gsap.to(wrap, {
          xPercent: index * 100,
          y: swapSet.has(index) ? -10 : 0,
          duration,
          ease: "power2.inOut",
          overwrite: "auto",
        });
        if (fill) {
          // Glow hanya untuk pasangan aktif agar mata langsung menemukannya pada kecepatan tinggi.
          gsap.to(fill, {
            backgroundColor: color,
            opacity: inRange ? 1 : 0.3,
            boxShadow: active ? `0 0 14px ${color}` : "0 0 0px transparent",
            duration: colorDuration,
            overwrite: "auto",
          });
        }
        if (label) {
          gsap.to(label, { color: active ? color : "#a1a1aa", duration: colorDuration, overwrite: "auto" });
        }
      });
    },
    { scope: container, dependencies: [step, duration] },
  );

  return (
    <div
      ref={container}
      role="img"
      aria-label={`Diagram batang ${n} data: ${step.bars.map((b) => b.value).join(", ")}`}
      className="relative h-64 w-full sm:h-96"
    >
      {initial.map((bar) => (
        <div
          key={`${bar.id}-${bar.value}`}
          data-id={bar.id}
          className="absolute bottom-0 left-0 flex h-full flex-col justify-end px-px sm:px-[3px]"
          style={{ width: `${100 / n}%` }}
        >
          {showLabels && (
            <span className="bar-label mb-1 text-center text-[10px] font-medium tabular-nums text-zinc-400 sm:text-xs">
              {bar.value}
            </span>
          )}
          <div
            className="bar-fill w-full origin-bottom rounded-t-sm"
            style={{ height: `${bar.value * (showLabels ? 0.9 : 1)}%`, backgroundColor: COLORS.default }}
          />
        </div>
      ))}
    </div>
  );
}
