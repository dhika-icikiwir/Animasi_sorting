# Animasi Sorting

Animasi diagram batang yang menjalankan Bubble Sort, Selection Sort, Insertion Sort, dan Quick Sort satu langkah demi satu langkah.

- Pengatur kecepatan 1x sampai 10x (1200 ms sampai 15 ms per langkah)
- Tombol Mulai / Jeda / Lanjutkan, Maju dan Mundur satu langkah, Reset, Acak data
- Penghitung perbandingan dan pertukaran yang diperbarui di setiap langkah
- Jumlah batang 5 sampai 60
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
| `components/magicui/` | Komponen Magic UI yang dipakai. |
| `.claude/skills/` | Skill [antislop](https://github.com/miqdadbadjuber/anti-slop) v3.2.26 (lisensi MIT). |

## Catatan desain

Tampilan ini adalah **draf tanpa arahan desain**: proyek belum punya `DESIGN.md`. Dial antislop: ENERGY 1 / RHYTHM 1 / MOTION 1. Gerakan batang adalah isi yang diminta, bukan dekorasi.

- Warna kuat hanya untuk status batang: kuning = dibandingkan, merah = ditukar, putih = pivot / minimum / kunci, hijau = terurut. Batang lain abu-abu.
- Angka perbandingan dan pertukaran memakai warna status yang dihitungnya.
- Tema gelap dipilih karena kelima warna status butuh latar gelap agar kontrasnya minimal 3:1.
- Font memakai font sistem, jadi tidak ada font web yang perlu dimuat.
- Kilau tombol hanya menyala saat animasi berjalan. Bila sistem meminta gerak dikurangi, kilau dimatikan dan batang langsung pindah tanpa transisi.
