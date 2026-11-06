# DESIGN.md

Arah visual: **instrumen ukur lab**. Halaman diperlakukan seperti panel alat ukur yang sedang mengamati algoritma: satu layar data (batang), satu panel pembacaan angka, dan satu baris kontrol.

Dial: ENERGY 2 / RHYTHM 2 / MOTION 2

## Identitas

- Penonton: pelajar dan pengajar yang ingin melihat cara kerja algoritma sorting.
- Karakter: presisi, tenang, dan padat informasi. Tidak ada dekorasi yang tidak bisa dibaca sebagai data.
- Motif identitas: **probe kuning**. Kuning hanya berarti "yang sedang dibandingkan sekarang", dan muncul di tiga tempat sekaligus: batang yang dibandingkan, penanda segitiga di bawahnya, dan angka penghitung perbandingan.

## Palet

| Peran | Warna | Alasan |
|---|---|---|
| Latar halaman | `#0b0e11` | Layar alat ukur gelap, agar warna status terbaca kontras |
| Permukaan panel | `#12171c` | Memisahkan panel dari latar tanpa bayangan |
| Garis panel / skala | `#26303a` | Garis rambut untuk skala dan tepi panel |
| Teks utama | `#e6edf3` | |
| Teks sekunder | `#9aa7b4` | Kontras 7:1 di latar panel |
| Batang default | `#66717c` | Netral, mundur ke belakang |
| Aksen (dibandingkan) | `#ffb000` | Kuning amber layar fosfor. Satu-satunya aksen |
| Ditukar | `#ff5a4f` | |
| Terurut | `#3ddc84` | |
| Pivot / kunci / minimum | `#e6edf3` | Netral terang, bukan warna baru |

## Tipografi

- **IBM Plex Sans** untuk teks: punya latar teknik dan tetap mudah dibaca di ukuran kecil.
- **IBM Plex Mono** hanya untuk angka pembacaan dan label skala: digitnya sama lebar, jadi angka tidak bergoyang saat berubah. Judul tidak memakai mono.

## Bentuk

- Radius 2px untuk tombol dan batang, 6px untuk panel. Tidak ada bentuk pil.
- Tanpa bayangan. Kedalaman cukup dari perbedaan warna permukaan.
- Skala sumbu Y (0, 25, 50, 75, 100) di layar data adalah alat baca nilai, bukan pola latar.

## Gerak

- Batang bergeser dan berganti warna setiap langkah (isi utama).
- Penanda probe dan braket rentang partisi mengikuti batang.
- Kilau tombol utama hanya menyala saat animasi berjalan.
- `prefers-reduced-motion`: semua gerak dekoratif mati, batang pindah tanpa transisi.
