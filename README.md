# Animasi Sorting

Animasi diagram batang yang menjalankan Bubble Sort, Selection Sort, Insertion Sort, dan Quick Sort satu langkah demi satu langkah.

- Pengatur kecepatan 1x sampai 10x (1200 ms sampai 15 ms per langkah)
- Tombol Mulai / Jeda / Lanjutkan, Maju dan Mundur satu langkah, Reset, Acak data
- Penghitung perbandingan dan pertukaran yang diperbarui di setiap langkah
- Jumlah batang 5 sampai 60
- Suara per langkah (mati secara bawaan): nada mengikuti tinggi batang yang dibandingkan atau ditukar, dan sapuan naik saat selesai
- Pintasan papan ketik: `Spasi` mulai atau jeda, `←` `→` mundur atau maju satu langkah

Dibuat dengan Next.js 15, Tailwind CSS 4, GSAP (`@gsap/react`), dan komponen Magic UI (`NumberTicker`, `ShimmerButton`).

## Menjalankan

```bash
npm install
npm run dev
```

Buka http://localhost:3000.

## Struktur

| File | Isi |
|---|---|
| `lib/algorithms.ts` | Keempat algoritma. Setiap algoritma mencatat semua langkahnya lebih dulu (perbandingan, pertukaran, pivot, rentang partisi), sehingga animasi bisa maju dan mundur. |
| `components/sorting-bars.tsx` | Batang yang dianimasikan GSAP. Batang dilacak lewat id, sehingga saat ditukar batang itu sendiri yang bergeser. |
| `components/sorting-visualizer.tsx` | Kontrol, penghitung, legenda, dan pemutar langkah. |
| `lib/sound.ts` | Suara per langkah lewat Web Audio API, tanpa file audio. |
| `components/magicui/` | Komponen Magic UI yang dipakai. |
| `.claude/skills/` | Skill [antislop](https://github.com/miqdadbadjuber/anti-slop) v3.2.26 (lisensi MIT). |

## Catatan desain

Arah visual: **instrumen ukur lab**, dengan dial ENERGY 2 / RHYTHM 2 / MOTION 2. Palet, tipografi, dan alasan setiap pilihan ada di [`DESIGN.md`](DESIGN.md).
