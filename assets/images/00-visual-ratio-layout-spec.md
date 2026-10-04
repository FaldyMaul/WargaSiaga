# WargaSiaga Web Visual System

## Tujuan

Sistem ini mengganti penggunaan gambar dengan tinggi paksa menjadi slot berbasis rasio. Gambar dibuat untuk konteks web, bukan slide: tidak ada area avatar, subtitle video, atau teks yang dibakar ke gambar. Seluruh copy, label, angka, dan diagram instruksional tetap berupa HTML/SVG agar dapat dibaca, diterjemahkan, dan diakses pembaca layar.

## Slot dan rasio produksi

| Slot | Source master | Rasio | Render desktop | Render mobile | Crop |
|---|---:|---:|---:|---:|---|
| Hero katalog Kenali Modus | 1536 × 1024 | 3:2 | 360–420 px lebar | lebar penuh | `object-fit: cover`, central 78% safe |
| Persona usia | 1024 × 1024 | 1:1 | 72 × 72 px | 64 × 64 px | wajah dan bahu di central 70% |
| Hero setiap panduan | 1536 × 1024 | 3:2 | lebar artikel | lebar penuh | central 82% safe, tanpa detail penting di tepi |
| Hero AI | 1280 × 720 | 16:9 | 300–360 px lebar | lebar penuh | tidak dipaksa ke 3:2 |
| Hero komunitas | 1280 × 853 | 3:2 | 300–360 px lebar | lebar penuh | central crop |
| Hero beranda | 1280 × 853 | 3:2 | lebar panel | lebar penuh | central crop |
| Diagram proses | HTML + SVG | responsif | 3 kolom | 1 kolom | tidak memakai bitmap |

## Adaptasi benchmark

- Dipakai: split-hero, visual hierarchy, central safe crop, clean editorial composition, matte/soft materials, zero text in generated images, restrained palette, accessible non-color cues.
- Tidak dipakai: canvas slide 16:9 universal, koordinat presentasi, area avatar, subtitle zone, dan palet biru–coral sebagai identitas utama.
- Override terkontrol: persona umur menggunakan foto editorial hiperrealistis warga Indonesia karena diminta untuk personalisasi. Foto harus natural, beragam, tidak stereotip, tidak menampilkan merek, dan tidak menggambarkan korban sebagai ceroboh.
- Diagram, flow, simulasi, dan label dibuat dalam HTML/SVG menggunakan ikon lokal Lucide agar teks akurat dan tetap aksesibel.

## Palet gambar

- Purple identitas: `#7A5AF8`, hanya sebagai aksen.
- Navy: `#182230`.
- Teal: `#147D70`.
- Amber: `#D98B24`.
- Sky: `#EAF4FB`.
- Surface: `#FFFFFF`, `#F7F8FA`, warm off-white.
- Merah hanya untuk risiko/tindakan mendesak, bukan dekorasi.

## Aturan manusia

- Warga Indonesia dengan tekstur kulit, rambut, kain, dan pencahayaan natural.
- Tidak ada wajah selebritas, seragam pemerintah, logo sekolah/perusahaan, merek perangkat, atau antarmuka aplikasi nyata.
- Ekspresi tenang, berpikir, atau sedang memeriksa; tidak panik, menangis, dipermalukan, atau disalahkan.
- Anak selalu ditampilkan dalam situasi aman dan, bila konteksnya sensitif, didampingi orang dewasa tepercaya.

## Quality gate

- Rasio file cocok dengan slot dan tidak bergantung pada fixed-height crop.
- Tidak ada teks/pseudo-teks yang menjadi sumber informasi.
- Subjek utama tetap utuh pada crop mobile.
- Alt text menjelaskan fungsi visual, bukan mengulang judul.
- Gambar detail memakai `loading="lazy"`, dimensi eksplisit, dan WebP teroptimasi.
- Target produksi 70–180 KB per hero; persona 25–80 KB.
- `prefers-reduced-motion` mematikan animasi dekoratif SVG/CSS.

