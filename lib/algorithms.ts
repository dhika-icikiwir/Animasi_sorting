export type Bar = { id: number; value: number };

export type AlgorithmKey = "bubble" | "selection" | "insertion" | "quick";

export type Step = {
  bars: Bar[];
  /** indeks yang sedang dibandingkan */
  compare: number[];
  /** indeks yang baru saja ditukar */
  swap: number[];
  /** indeks pivot / elemen minimum / kunci */
  pivot: number | null;
  /** indeks yang sudah berada di posisi akhir */
  sorted: number[];
  /** rentang aktif (untuk quick sort) */
  range: [number, number] | null;
  comparisons: number;
  swaps: number;
  message: string;
};

export const ALGORITHMS: Record<
  AlgorithmKey,
  { name: string; best: string; average: string; worst: string; space: string; description: string }
> = {
  bubble: {
    name: "Bubble Sort",
    best: "O(n)",
    average: "O(n²)",
    worst: "O(n²)",
    space: "O(1)",
    description:
      "Membandingkan dua elemen yang bersebelahan lalu menukarnya bila urutannya salah. Elemen terbesar 'menggelembung' ke ujung kanan pada setiap putaran.",
  },
  selection: {
    name: "Selection Sort",
    best: "O(n²)",
    average: "O(n²)",
    worst: "O(n²)",
    space: "O(1)",
    description:
      "Mencari elemen terkecil dari bagian yang belum terurut, lalu menukarnya ke posisi paling kiri bagian tersebut.",
  },
  insertion: {
    name: "Insertion Sort",
    best: "O(n)",
    average: "O(n²)",
    worst: "O(n²)",
    space: "O(1)",
    description:
      "Mengambil satu elemen (kunci) dan menyisipkannya ke posisi yang tepat di bagian kiri yang sudah terurut, seperti menyusun kartu di tangan.",
  },
  quick: {
    name: "Quick Sort",
    best: "O(n log n)",
    average: "O(n log n)",
    worst: "O(n²)",
    space: "O(log n)",
    description:
      "Memilih pivot (elemen terakhir), mempartisi elemen yang lebih kecil ke kiri dan yang lebih besar ke kanan, lalu mengurutkan kedua bagian secara rekursif.",
  },
};

export function randomBars(n: number, min = 5, max = 100): Bar[] {
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    value: Math.floor(Math.random() * (max - min + 1)) + min,
  }));
}

class Recorder {
  steps: Step[] = [];
  comparisons = 0;
  swaps = 0;
  sorted = new Set<number>();
  arr: Bar[];
  constructor(arr: Bar[]) {
    this.arr = arr;
    this.push({ message: "Data awal. Tekan Mulai untuk menjalankan animasi." });
  }
  push(p: Partial<Pick<Step, "compare" | "swap" | "pivot" | "range" | "message">>) {
    this.steps.push({
      bars: this.arr.slice(),
      compare: p.compare ?? [],
      swap: p.swap ?? [],
      pivot: p.pivot ?? null,
      range: p.range ?? null,
      sorted: [...this.sorted],
      comparisons: this.comparisons,
      swaps: this.swaps,
      message: p.message ?? "",
    });
  }
  /** mencatat satu perbandingan dan mengembalikan a[i] > a[j] */
  greater(i: number, j: number, extra: Partial<Step> = {}) {
    this.comparisons++;
    const res = this.arr[i].value > this.arr[j].value;
    this.push({
      compare: [i, j],
      pivot: extra.pivot ?? null,
      range: extra.range ?? null,
      message:
        extra.message ??
        `Bandingkan ${this.arr[i].value} dan ${this.arr[j].value}: ${this.arr[i].value} ${res ? "lebih besar" : "tidak lebih besar"}`,
    });
    return res;
  }
  swap(i: number, j: number, extra: Partial<Step> = {}) {
    if (i === j) return;
    const a = this.arr;
    [a[i], a[j]] = [a[j], a[i]];
    this.swaps++;
    this.push({
      swap: [i, j],
      pivot: extra.pivot ?? null,
      range: extra.range ?? null,
      message: extra.message ?? `Tukar ${a[j].value} dan ${a[i].value}`,
    });
  }
  done() {
    this.arr.forEach((_, i) => this.sorted.add(i));
    this.push({ message: `Selesai: ${this.comparisons} perbandingan, ${this.swaps} pertukaran.` });
    return this.steps;
  }
}

function bubble(r: Recorder) {
  const n = r.arr.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - 1 - i; j++) {
      if (r.greater(j, j + 1)) {
        r.swap(j, j + 1);
        swapped = true;
      }
    }
    r.sorted.add(n - 1 - i);
    r.push({ message: `Putaran ${i + 1} selesai: ${r.arr[n - 1 - i].value} sudah di posisi akhir.` });
    if (!swapped) {
      r.push({ message: "Tidak ada pertukaran pada putaran ini, jadi data sudah terurut." });
      break;
    }
  }
}

function selection(r: Recorder) {
  const n = r.arr.length;
  for (let i = 0; i < n - 1; i++) {
    let min = i;
    r.push({ pivot: min, message: `Cari elemen terkecil mulai indeks ${i}. Minimum sementara: ${r.arr[min].value}` });
    for (let j = i + 1; j < n; j++) {
      if (
        r.greater(min, j, {
          pivot: min,
          message: `Bandingkan minimum ${r.arr[min].value} dengan ${r.arr[j].value}`,
        })
      ) {
        min = j;
        r.push({ pivot: min, message: `Minimum baru: ${r.arr[min].value}` });
      }
    }
    if (min !== i) r.swap(i, min, { message: `Pindahkan minimum ${r.arr[min].value} ke indeks ${i}` });
    r.sorted.add(i);
    r.push({ message: `${r.arr[i].value} sudah di posisi akhir.` });
  }
}

function insertion(r: Recorder) {
  const n = r.arr.length;
  r.sorted.add(0);
  for (let i = 1; i < n; i++) {
    r.push({ pivot: i, message: `Ambil kunci ${r.arr[i].value} dan sisipkan ke bagian kiri yang terurut.` });
    let j = i;
    while (j > 0) {
      const bigger = r.greater(j - 1, j, {
        pivot: j,
        message: `Bandingkan ${r.arr[j - 1].value} dengan kunci ${r.arr[j].value}`,
      });
      if (!bigger) break;
      r.swap(j - 1, j, { pivot: j - 1, message: `${r.arr[j].value} > kunci, geser ke kanan` });
      j--;
    }
    for (let k = 0; k <= i; k++) r.sorted.add(k);
    r.push({ message: `Kunci ${r.arr[j].value} disisipkan di indeks ${j}.` });
  }
}

function quick(r: Recorder) {
  const sort = (lo: number, hi: number) => {
    if (lo > hi) return;
    if (lo === hi) {
      r.sorted.add(lo);
      r.push({ range: [lo, hi], message: `${r.arr[lo].value} hanya satu elemen, sudah di posisi akhir.` });
      return;
    }
    const range: [number, number] = [lo, hi];
    const pivotVal = r.arr[hi].value;
    r.push({ pivot: hi, range, message: `Partisi indeks ${lo}–${hi}, pivot = ${pivotVal}` });
    let i = lo;
    for (let j = lo; j < hi; j++) {
      const bigger = r.greater(j, hi, {
        pivot: hi,
        range,
        message: `Bandingkan ${r.arr[j].value} dengan pivot ${pivotVal}`,
      });
      if (!bigger) {
        r.swap(i, j, { pivot: hi, range, message: `${r.arr[i].value} ≤ pivot, pindah ke bagian kiri` });
        i++;
      }
    }
    r.swap(i, hi, { pivot: i, range, message: `Letakkan pivot ${pivotVal} di indeks ${i}` });
    r.sorted.add(i);
    r.push({ range, message: `Pivot ${pivotVal} sudah di posisi akhir.` });
    sort(lo, i - 1);
    sort(i + 1, hi);
  };
  sort(0, r.arr.length - 1);
}

const RUNNERS: Record<AlgorithmKey, (r: Recorder) => void> = { bubble, selection, insertion, quick };

export function buildSteps(algorithm: AlgorithmKey, bars: Bar[]): Step[] {
  const r = new Recorder(bars.slice());
  RUNNERS[algorithm](r);
  return r.done();
}
