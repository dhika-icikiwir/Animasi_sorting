import { SortingVisualizer } from "@/components/sorting-visualizer";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-6 sm:py-10">
      <header className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Animasi Sorting</h1>
        <p className="text-ink-2">Empat algoritma, diamati satu langkah demi satu langkah.</p>
      </header>
      <main>
        <SortingVisualizer />
      </main>
      <footer className="mt-auto border-t border-line pt-4 text-sm text-ink-2">
        Pintasan papan ketik: <kbd className="rounded-[2px] border border-line px-1.5 font-mono">Spasi</kbd> mulai atau
        jeda,{" "}
        <span className="whitespace-nowrap">
          <kbd className="rounded-[2px] border border-line px-1.5 font-mono">←</kbd>{" "}
          <kbd className="rounded-[2px] border border-line px-1.5 font-mono">→</kbd>
        </span>{" "}
        mundur atau maju satu langkah.
      </footer>
    </div>
  );
}
