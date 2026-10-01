# Multi Stopwatch untuk Event Lari

Stopwatch banyak sekaligus dengan milidetik, lap, catatan, dan **mode layar** untuk videotron. Tema hitam, tanpa framework, tanpa build. Cukup HTML, CSS, dan JavaScript.

## Fitur

- Banyak stopwatch sekaligus, format `HH:MM:SS.mmm`
- Lap dengan waktu lap dan waktu total, lap tercepat (hijau) dan terlambat (merah) ditandai otomatis
- Catatan per lap dan catatan per stopwatch
- Teks di **atas** dan **bawah** jam: tombol cepat 5K, 10K, 21K, 42K, HM, FM, START, FINISH, atau ketik teks sendiri
- 10 pilihan font jam, warna border bisa diubah (palet cepat atau color picker), ukuran tampilan bisa diatur
- Set cepat 5K / 10K / 21K / 42K dengan satu klik
- Mulai, jeda, dan reset semua stopwatch sekaligus
- Mode layar untuk videotron: hanya jam dan label yang tampil, jumlah kolom 1–4, opsi menampilkan lap terakhir, layar tetap menyala
- Data tersimpan otomatis di browser. Jika halaman ter-refresh saat stopwatch berjalan, waktu tetap lanjut dengan benar
- Ekspor CSV (bisa dibuka di Excel) berisi semua lap, catatan, dan waktu akhir

## Tombol cepat

| Tombol | Fungsi |
|---|---|
| `1` – `9` | Mulai / jeda stopwatch ke-1 sampai ke-9 |
| `Shift` + `1` – `9` | Lap stopwatch ke-N |
| `D` | Masuk / keluar mode layar |
| `Esc` | Keluar mode layar |

Tombol cepat tidak aktif saat Anda sedang mengetik di kolom teks.

## Upload ke GitHub dan pasang di GitHub Pages

1. Buat repository baru di GitHub, misalnya `multi-stopwatch`.
2. Klik **Add file → Upload files**, lalu seret `index.html`, `style.css`, `app.js`, dan `README.md`. Klik **Commit changes**.
3. Buka **Settings → Pages**. Pada *Build and deployment*, pilih **Deploy from a branch**, branch `main`, folder `/ (root)`, lalu **Save**.
4. Tunggu satu sampai dua menit. Alamatnya: `https://USERNAME.github.io/multi-stopwatch/`

Dengan cara lewat terminal:

```bash
git init
git add .
git commit -m "Multi Stopwatch event lari"
git branch -M main
git remote add origin https://github.com/USERNAME/multi-stopwatch.git
git push -u origin main
```

## Catatan penting untuk hari-H

- **Font** dimuat dari Google Fonts, jadi butuh internet saat pertama dibuka. Tanpa internet, jam tetap jalan memakai font monospace bawaan. Untuk offline penuh, unduh font dari Google Fonts ke folder `fonts/` lalu tambahkan `@font-face` di `style.css`.
- **Data tersimpan per browser dan per alamat**. Laptop timer dan laptop videotron tidak berbagi data. Gunakan satu perangkat sebagai sumber waktu, lalu tampilkan layarnya ke videotron (HDMI atau extend display).
- Tekan **Ekspor CSV** secara berkala sebagai cadangan, terutama sebelum *Reset semua*.
- Uji coba dulu di perangkat yang akan dipakai, termasuk resolusi videotron dan jumlah kolom yang paling terbaca.
- Waktu dihitung dari jam internal browser (`performance.now()`), jadi tetap akurat meski tampilan sempat tertahan. Jika tab berada di latar belakang, tampilan bisa tertunda tetapi waktu yang ditampilkan saat kembali tetap benar.

## Kustomisasi

Semua pengaturan ada di bagian atas `app.js`:

- `PRESETS`: daftar tombol teks cepat (tambahkan misalnya `'10K ELITE'`)
- `COLORS`: palet warna cepat
- `FONTS`: daftar font. Jika menambah font, tambahkan juga di tag `<link>` Google Fonts pada `index.html`
