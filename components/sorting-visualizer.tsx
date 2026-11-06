"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "motion/react";
import { ALGORITHMS, AlgorithmKey, Bar, buildSteps, randomBars } from "@/lib/algorithms";
import { COLORS, SortingBars } from "@/components/sorting-bars";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils";

/** Jeda antar langkah (ms) untuk level kecepatan 1 sampai 10. */
const SPEED_DELAYS = [1200, 850, 600, 420, 300, 200, 130, 80, 40, 15];
const KEYS = Object.keys(ALGORITHMS) as AlgorithmKey[];
const PIVOT_LABEL: Record<AlgorithmKey, string | null> = {
  bubble: null,
  selection: "Minimum sementara",
  insertion: "Kunci",
  quick: "Pivot",
};

/** Render pertama harus sama di server dan klien, jadi datanya tidak memakai Math.random. */
function seededBars(n: number): Bar[] {
  let seed = 7;
  return Array.from({ length: n }, (_, i) => {
    seed = (seed * 9301 + 49297) % 233280;
    return { id: i, value: 5 + Math.floor((seed / 233280) * 96) };
  });
}

export function SortingVisualizer() {
  const reduceMotion = useReducedMotion() ?? false;
  const [algorithm, setAlgorithm] = useState<AlgorithmKey>("bubble");
  const [size, setSize] = useState(20);
  const [speed, setSpeed] = useState(5);
  const [initial, setInitial] = useState<Bar[]>(() => seededBars(20));
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => setInitial(randomBars(20)), []);

  const steps = useMemo(() => buildSteps(algorithm, initial), [algorithm, initial]);
  const step = steps[Math.min(stepIdx, steps.length - 1)];
  const last = steps.length - 1;
  const finished = stepIdx >= last;
  const delay = SPEED_DELAYS[speed - 1];
  const duration = reduceMotion ? 0 : Math.min(delay / 1000, 0.45);
  const info = ALGORITHMS[algorithm];

  useEffect(() => {
    if (!playing) return;
    if (stepIdx >= last) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setStepIdx((i) => i + 1), delay);
    return () => clearTimeout(t);
  }, [playing, stepIdx, last, delay]);

  const reset = useCallback((bars?: Bar[]) => {
    setPlaying(false);
    setStepIdx(0);
    if (bars) setInitial(bars);
  }, []);

  const togglePlay = useCallback(() => {
    if (finished) {
      setStepIdx(0);
      setPlaying(true);
    } else setPlaying((p) => !p);
  }, [finished]);

  const stepBy = useCallback(
    (delta: number) => {
      setPlaying(false);
      setStepIdx((i) => Math.min(Math.max(i + delta, 0), last));
    },
    [last],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Biarkan kontrol yang sedang fokus memakai Spasi dan panah bawaannya sendiri.
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      if (e.code === "Space" && tag !== "BUTTON" && tag !== "A") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "ArrowRight") stepBy(1);
      else if (e.key === "ArrowLeft") stepBy(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePlay, stepBy]);

  const progress = last === 0 ? 100 : (stepIdx / last) * 100;

  return (
    <div className="flex w-full flex-col gap-6">
      <div
        role="group"
        aria-label="Pilih algoritma"
        className="grid grid-cols-2 gap-1 rounded-lg border border-zinc-800 bg-zinc-900 p-1 sm:grid-cols-4"
      >
        {KEYS.map((key) => (
          <button
            key={key}
            aria-pressed={algorithm === key}
            onClick={() => {
              setAlgorithm(key);
              reset();
            }}
            className={cn(
              "min-h-11 rounded-md px-3 text-sm font-semibold transition-colors active:translate-y-px",
              algorithm === key
                ? "bg-zinc-100 text-zinc-950"
                : "text-zinc-300 hover:bg-zinc-800 hover:text-white",
            )}
          >
            {ALGORITHMS[key].name}
          </button>
        ))}
      </div>

      <section aria-label="Animasi" className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 sm:p-6">
        <SortingBars step={step} initial={initial} duration={duration} animateIntro={!reduceMotion} />
        <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-zinc-800">
          <div className="h-full bg-zinc-300 transition-[width] duration-200" style={{ width: `${progress}%` }} />
        </div>
        <p aria-live={playing ? "off" : "polite"} className="mt-3 min-h-12 text-center text-sm text-zinc-200 sm:text-base">
          {step.message}
        </p>
      </section>

      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <dl className="flex flex-wrap items-end gap-x-8 gap-y-3">
          <div>
            <dt className="text-sm text-zinc-400">Perbandingan</dt>
            <dd className="text-5xl font-bold leading-none" style={{ color: COLORS.compare }}>
              <NumberTicker value={step.comparisons} />
            </dd>
          </div>
          <div>
            <dt className="text-sm text-zinc-400">Pertukaran</dt>
            <dd className="text-2xl font-semibold leading-none" style={{ color: COLORS.swap }}>
              <NumberTicker value={step.swaps} />
            </dd>
          </div>
          <div>
            <dt className="text-sm text-zinc-400">Langkah</dt>
            <dd className="text-2xl font-semibold leading-none text-zinc-100">
              <span className="tabular-nums">{stepIdx}</span>
              <span className="text-base font-normal text-zinc-400"> / {last}</span>
            </dd>
          </div>
        </dl>
        <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-zinc-300" aria-label="Arti warna">
          <Legend color={COLORS.default} label="Belum terurut" />
          <Legend color={COLORS.compare} label="Dibandingkan" />
          <Legend color={COLORS.swap} label="Ditukar" />
          {PIVOT_LABEL[algorithm] && <Legend color={COLORS.pivot} label={PIVOT_LABEL[algorithm]} />}
          <Legend color={COLORS.sorted} label="Terurut" />
        </ul>
      </div>

      <section aria-label="Kontrol" className="flex flex-col gap-5 border-t border-zinc-800 pt-6">
        <div className="flex flex-wrap items-center gap-2">
          <ShimmerButton
            onClick={togglePlay}
            shimmer={playing && !reduceMotion}
            borderRadius="6px"
            background="#f4f4f5"
            shimmerColor={COLORS.compare}
            className="min-h-11 min-w-36 px-5 py-0 font-semibold text-zinc-950 hover:brightness-90"
          >
            <Icon name={playing ? "pause" : finished ? "replay" : "play"} />
            {playing ? "Jeda" : finished ? "Ulangi" : stepIdx > 0 ? "Lanjutkan" : "Mulai"}
          </ShimmerButton>
          <ControlButton onClick={() => stepBy(-1)} disabled={stepIdx === 0}>
            <Icon name="prev" /> Mundur
          </ControlButton>
          <ControlButton onClick={() => stepBy(1)} disabled={finished}>
            Maju <Icon name="next" />
          </ControlButton>
          <ControlButton onClick={() => reset()} disabled={stepIdx === 0 && !playing}>
            <Icon name="reset" /> Reset
          </ControlButton>
          <ControlButton onClick={() => reset(randomBars(size))}>
            <Icon name="shuffle" /> Acak data
          </ControlButton>
        </div>

        <div className="grid gap-x-8 gap-y-4 md:grid-cols-2">
          <Slider
            label="Kecepatan"
            value={speed}
            min={1}
            max={10}
            display={`${speed}x, ${delay} ms per langkah`}
            onChange={setSpeed}
          />
          <Slider
            label="Jumlah batang"
            value={size}
            min={5}
            max={60}
            display={`${size} data`}
            onChange={(v) => {
              setSize(v);
              reset(randomBars(v));
            }}
          />
        </div>
      </section>

      <section className="border-t border-zinc-800 pt-6">
        <h2 className="text-xl font-semibold text-white">Cara kerja {info.name}</h2>
        <p className="mt-2 max-w-3xl leading-relaxed text-zinc-300">{info.description}</p>
        <dl className="mt-4 grid max-w-xl grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
          <Complexity label="Terbaik" value={info.best} />
          <Complexity label="Rata-rata" value={info.average} />
          <Complexity label="Terburuk" value={info.worst} />
          <Complexity label="Memori" value={info.space} />
        </dl>
      </section>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <li className="flex items-center gap-2">
      <span aria-hidden="true" className="size-3 rounded-sm" style={{ backgroundColor: color }} />
      {label}
    </li>
  );
}

function Complexity({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-zinc-400">{label}</dt>
      <dd className="font-semibold text-zinc-100">{value}</dd>
    </div>
  );
}

function ControlButton({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      className={cn(
        "flex min-h-11 items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-900 px-4 text-sm font-medium text-zinc-100 transition-colors hover:border-zinc-400 hover:bg-zinc-800 active:translate-y-px disabled:border-zinc-800 disabled:bg-transparent disabled:text-zinc-600",
        className,
      )}
      {...props}
    />
  );
}

function Slider({
  label,
  value,
  min,
  max,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  display: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="flex flex-wrap justify-between gap-x-3 text-sm">
        <span className="font-medium text-zinc-100">{label}</span>
        <span className="tabular-nums text-zinc-400">{display}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-11 w-full"
      />
    </label>
  );
}
