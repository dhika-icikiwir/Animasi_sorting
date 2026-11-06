import { SortingVisualizer } from "@/components/sorting-visualizer";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-8 sm:py-12">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Animasi Sorting</h1>
        <p className="mt-2 max-w-2xl text-zinc-300">
          Bubble, Selection, Insertion, dan Quick Sort, dijalankan satu langkah demi satu langkah.
        </p>
      </header>
      <main>
        <SortingVisualizer />
      </main>
      <footer className="mt-auto border-t border-zinc-800 pt-4 text-sm text-zinc-400">
        Pintasan papan ketik: <kbd className="rounded border border-zinc-700 px-1.5">Spasi</kbd> mulai atau jeda,{" "}
        <span className="whitespace-nowrap">
          <kbd className="rounded border border-zinc-700 px-1.5">←</kbd>{" "}
          <kbd className="rounded border border-zinc-700 px-1.5">→</kbd>
        </span>{" "}
        mundur atau maju satu langkah.
      </footer>
    </div>
  );
}
