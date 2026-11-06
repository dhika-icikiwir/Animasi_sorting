"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { ALGORITHMS, AlgorithmKey, Bar, buildSteps, randomBars } from "@/lib/algorithms";
import { StepSound } from "@/lib/sound";
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
  const [soundOn, setSoundOn] = useState(false);
  const sound = useRef<StepSound | null>(null);

  useEffect(() => setInitial(randomBars(20)), []);

  const steps = useMemo(() => buildSteps(algorithm, initial), [algorithm, initial]);
  const step = steps[Math.min(stepIdx, steps.length - 1)];
  const last = steps.length - 1;
  const finished = stepIdx >= last;
  const delay = SPEED_DELAYS[speed - 1];
  const duration = reduceMotion ? 0 : Math.min(delay / 1000, 0.45);
  const info = ALGORITHMS[algorithm];
  const pivotLabel = PIVOT_LABEL[algorithm];

  useEffect(() => {
    if (!playing) return;
    if (stepIdx >= last) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setStepIdx((i) => i + 1), delay);
    return () => clearTimeout(t);
  }, [playing, stepIdx, last, delay]);

  // Bunyi hanya saat langkah berubah; langkah 0 berarti reset atau data baru, jadi diam.
  const soundedIdx = useRef(0);
  useEffect(() => {
    if (soundedIdx.current === stepIdx) return;
    soundedIdx.current = stepIdx;
    if (!soundOn || stepIdx === 0 || !sound.current) return;
    if (stepIdx === last) sound.current.playFinish(step);
    else sound.current.playStep(step, delay);
  }, [stepIdx, soundOn, last, step, delay]);

  const toggleSound = () => {
    sound.current ??= new StepSound();
    sound.current.unlock();
    setSoundOn((s) => !s);
  };

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
    <div className="flex flex-col gap-4">
      <div
        role="group"
        aria-label="Pilih algoritma"
        className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-4"
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
              "flex min-h-12 items-center justify-between gap-2 px-4 text-left text-sm font-semibold transition-colors active:translate-y-px",
              algorithm === key ? "bg-ink text-bg" : "bg-panel text-ink-2 hover:bg-panel-2 hover:text-ink",
            )}
          >
            {ALGORITHMS[key].name}
            <span
              className={cn(
                "hidden font-mono text-xs font-normal lg:inline",
                algorithm === key ? "text-bg/70" : "text-ink-2",
              )}
            >
              {ALGORITHMS[key].average}
            </span>
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <section aria-label="Layar data" className="rounded-md border border-line bg-panel px-3 pb-4 pt-3 sm:px-5">
          <SortingBars step={step} initial={initial} duration={duration} animateIntro={!reduceMotion} />
          <p aria-live={playing ? "off" : "polite"} className="sr-only">
            {step.message}
          </p>
        </section>

        <aside aria-label="Pembacaan" className="flex flex-col rounded-md border border-line bg-panel">
          <dl className="grid grid-cols-2 lg:grid-cols-1">
            <div className="col-span-2 border-b border-line p-4 lg:col-span-1">
              <dt className="text-sm text-ink-2">Perbandingan</dt>
              <dd className="mt-1 font-mono text-6xl font-semibold leading-none text-probe">
                <NumberTicker value={step.comparisons} className="tracking-tight" />
              </dd>
            </div>
            <div className="border-b border-r border-line p-4 lg:border-r-0">
              <dt className="text-sm text-ink-2">Pertukaran</dt>
              <dd className="mt-1 font-mono text-2xl font-medium leading-none text-swap">
                <NumberTicker value={step.swaps} />
              </dd>
            </div>
            <div className="border-b border-line p-4">
              <dt className="text-sm text-ink-2">Langkah</dt>
              <dd className="mt-1 font-mono text-2xl font-medium leading-none text-ink">
                <span className="tabular-nums">{stepIdx}</span>
                <span className="text-base text-ink-2"> / {last}</span>
              </dd>
              <div className="mt-3 h-1 bg-line" aria-hidden="true">
                <div className="h-full bg-ink transition-[width] duration-200" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </dl>
          <ul aria-label="Arti warna" className="grid grid-cols-2 gap-x-3 gap-y-2 p-4 text-sm text-ink-2 lg:grid-cols-1">
            <Legend color={COLORS.default} label="Belum terurut" />
            <Legend color={COLORS.compare} label="Dibandingkan" />
            <Legend color={COLORS.swap} label="Ditukar" />
            {pivotLabel && <Legend color={COLORS.pivot} label={pivotLabel} />}
            <Legend color={COLORS.sorted} label="Terurut" />
          </ul>
        </aside>
      </div>

      <section
        aria-label="Kontrol"
        className="grid gap-x-8 gap-y-4 rounded-md border border-line bg-panel p-4 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center"
      >
        <div className="flex flex-wrap items-center gap-2">
          <ShimmerButton
            onClick={togglePlay}
            shimmer={playing && !reduceMotion}
            borderRadius="2px"
            background={COLORS.pivot}
            shimmerColor={COLORS.compare}
            className="min-h-11 min-w-32 border-0 px-5 py-0 font-semibold text-bg hover:brightness-90"
          >
            <Icon name={playing ? "pause" : finished ? "replay" : "play"} />
            {playing ? "Jeda" : finished ? "Ulangi" : stepIdx > 0 ? "Lanjutkan" : "Mulai"}
          </ShimmerButton>
          <div className="flex">
            <ControlButton onClick={() => stepBy(-1)} disabled={stepIdx === 0} aria-label="Mundur satu langkah" className="rounded-r-none">
              <Icon name="prev" />
            </ControlButton>
            <ControlButton onClick={() => stepBy(1)} disabled={finished} aria-label="Maju satu langkah" className="-ml-px rounded-l-none">
              <Icon name="next" />
            </ControlButton>
          </div>
          <ControlButton onClick={() => reset()} disabled={stepIdx === 0 && !playing}>
            <Icon name="reset" /> Reset
          </ControlButton>
          <ControlButton onClick={() => reset(randomBars(size))}>
            <Icon name="shuffle" /> Acak data
          </ControlButton>
          <ControlButton onClick={toggleSound} aria-pressed={soundOn} className={soundOn ? "border-probe text-probe" : ""}>
            <Icon name={soundOn ? "soundOn" : "soundOff"} /> Suara
          </ControlButton>
        </div>

        <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
          <Slider label="Kecepatan" value={speed} min={1} max={10} display={`${delay} ms/langkah`} onChange={setSpeed} />
          <Slider
            label="Jumlah batang"
            value={size}
            min={5}
            max={60}
            display={`${size}`}
            onChange={(v) => {
              setSize(v);
              reset(randomBars(v));
            }}
          />
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div>
          <h2 className="text-xl font-semibold text-ink">Cara kerja {info.name}</h2>
          <p className="mt-2 max-w-2xl leading-relaxed text-ink-2">{info.description}</p>
        </div>
        <dl className="font-mono text-sm">
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
      <span aria-hidden="true" className="h-3 w-2 rounded-[1px]" style={{ backgroundColor: color }} />
      {label}
    </li>
  );
}

function Complexity({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-line py-2">
      <dt className="font-sans text-ink-2">{label}</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  );
}

function ControlButton({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      className={cn(
        "flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-[2px] border border-line bg-panel-2 px-3 text-sm font-medium text-ink transition-colors hover:border-ink-2 hover:bg-line active:translate-y-px disabled:border-line disabled:bg-transparent disabled:text-ink-3",
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
    <label className="flex flex-col">
      <span className="flex justify-between gap-3 text-sm">
        <span className="font-medium text-ink">{label}</span>
        <span className="font-mono tabular-nums text-ink-2">{display}</span>
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
