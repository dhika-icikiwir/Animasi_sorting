"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { Bar, Step } from "@/lib/algorithms";

gsap.registerPlugin(useGSAP);

export const COLORS = {
  default: "#66717c",
  compare: "#ffb000",
  swap: "#ff5a4f",
  pivot: "#e6edf3",
  sorted: "#3ddc84",
};

const SCALE = [0, 25, 50, 75, 100];

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
      const root = container.current;
      if (!root) return;
      const sortedSet = new Set(step.sorted);
      const compareSet = new Set(step.compare);
      const swapSet = new Set(step.swap);
      const [lo, hi] = step.range ?? [0, n - 1];
      const colorDuration = Math.min(duration, 0.25);

      step.bars.forEach((bar, index) => {
        const wrap = root.querySelector<HTMLElement>(`[data-id="${bar.id}"]`);
        if (!wrap) return;
        const fill = wrap.querySelector<HTMLElement>(".bar-fill");
        const label = wrap.querySelector<HTMLElement>(".bar-label");

        let color = COLORS.default;
        if (sortedSet.has(index)) color = COLORS.sorted;
        if (compareSet.has(index)) color = COLORS.compare;
        if (step.pivot === index) color = COLORS.pivot;
        if (swapSet.has(index)) color = COLORS.swap;
        const probed = compareSet.has(index);
        const inRange = (index >= lo && index <= hi) || sortedSet.has(index);

        gsap.to(wrap, {
          xPercent: index * 100,
          y: swapSet.has(index) ? -8 : 0,
          duration,
          ease: "power2.inOut",
          overwrite: "auto",
        });
        if (fill) {
          // Pendar hanya pada pasangan yang dibandingkan: itu motif probe dari DESIGN.md.
          gsap.to(fill, {
            backgroundColor: color,
            opacity: inRange ? 1 : 0.3,
            boxShadow: probed ? `0 0 12px ${COLORS.compare}80` : "0 0 0px transparent",
            duration: colorDuration,
            overwrite: "auto",
          });
        }
        if (label) {
          gsap.to(label, {
            color: probed || swapSet.has(index) ? color : "#9aa7b4",
            duration: colorDuration,
            overwrite: "auto",
          });
        }
      });

      root.querySelectorAll<HTMLElement>(".probe").forEach((probe, k) => {
        const target = step.compare[k];
        gsap.to(probe, {
          xPercent: (target ?? 0) * 100,
          opacity: target === undefined ? 0 : 1,
          duration: target === undefined ? colorDuration : duration,
          ease: "power2.inOut",
          overwrite: "auto",
        });
      });

      const bracket = root.querySelector<HTMLElement>(".range-bracket");
      if (bracket) {
        gsap.to(bracket, {
          left: `${(lo / n) * 100}%`,
          width: `${((hi - lo + 1) / n) * 100}%`,
          opacity: step.range ? 1 : 0,
          duration,
          ease: "power2.inOut",
          overwrite: "auto",
        });
      }
    },
    { scope: container, dependencies: [step, duration] },
  );

  return (
    <div ref={container} className="flex gap-2">
      <div aria-hidden="true" className="relative mt-6 h-56 w-7 shrink-0 font-mono text-[11px] text-ink-2 sm:h-80 lg:h-96">
        {SCALE.map((v) => (
          <span key={v} className="absolute right-0 translate-y-1/2 tabular-nums" style={{ bottom: `${v}%` }}>
            {v}
          </span>
        ))}
      </div>

      <div className="min-w-0 flex-1">
        <div
          role="img"
          aria-label={`Diagram batang ${n} data: ${step.bars.map((b) => b.value).join(", ")}`}
          className="relative mt-6 h-56 sm:h-80 lg:h-96"
        >
          {SCALE.map((v) => (
            <div
              key={v}
              aria-hidden="true"
              className={v === 0 ? "absolute inset-x-0 border-t border-ink-3" : "absolute inset-x-0 border-t border-line/70"}
              style={{ bottom: `${v}%` }}
            />
          ))}
          {initial.map((bar) => (
            <div
              key={`${bar.id}-${bar.value}`}
              data-id={bar.id}
              className="absolute bottom-0 left-0 h-full"
              style={{ width: `${100 / n}%` }}
            >
              <div
                className="bar-fill absolute inset-x-px bottom-0 origin-bottom rounded-t-[2px] sm:inset-x-[3px]"
                style={{ height: `${bar.value}%`, backgroundColor: COLORS.default }}
              />
              {showLabels && (
                <span
                  className="bar-label absolute inset-x-0 mb-1 text-center font-mono text-[10px] tabular-nums text-ink-2 sm:text-xs"
                  style={{ bottom: `${bar.value}%` }}
                >
                  {bar.value}
                </span>
              )}
            </div>
          ))}
        </div>

        <div aria-hidden="true" className="relative mt-2 h-4">
          {[0, 1].map((k) => (
            <div key={k} className="probe absolute left-0 top-0 flex justify-center opacity-0" style={{ width: `${100 / n}%` }}>
              <svg viewBox="0 0 10 8" className="h-2 w-2.5 fill-probe">
                <path d="M5 0 10 8H0z" />
              </svg>
            </div>
          ))}
          <div className="range-bracket absolute bottom-0 h-1.5 border-x border-b border-ink-2 opacity-0" />
        </div>
      </div>
    </div>
  );
}
