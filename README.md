# Bible Typing Indonesia — Minimalist Scripture Typing

A keyboard-first, distraction-free typing application inspired by Monkeytype, crafted for typing Holy Scripture in Indonesian using the authentic **Alkitab Yang Terbuka (AYT)** translation.

## ✨ Fitur Utama (Features)

- **Tiga Mode Latihan (Three Practice Modes)**:
  - **Ayat Pilihan (`single`)**: Pilih kitab, pasal, dan ayat apa saja, lalu mulai mengetik langsung dari ayat tersebut. Setelah ayat disimpan, aplikasi berpindah ke ayat berikutnya.
  - **Per Kitab (`book`)**: Latihan berurutan ayat demi ayat dalam kitab yang dipilih dengan indikator progres akurat berdasarkan metadata kanonikal. Saat ayat terakhir kitab selesai, tampil dialog penyelesaian kitab untuk memilih kitab lain atau melanjutkan ke kitab kanonikal berikutnya.
  - **Lanjutkan (`continuous`)**: Melanjutkan sesi dari posisi ayat terakhir yang tersimpan di penyimpanan lokal. Jika belum ada posisi tersimpan, disediakan pilihan untuk memulai dari Kejadian 1:1 atau memilih ayat.
- **Word Wrapping Utuh (Complete Word Wrapping)**:
  - Kata tidak akan terpotong di tengah huruf pada akhir baris. Seluruh kata dipindahkan ke baris berikutnya secara rapi dengan penjajaran caret dan sorotan kesalahan yang presisi.
- **Evaluasi Tanpa Membedakan Huruf Besar/Kecil (Case-Insensitive Typing)**:
  - Pengetikan huruf besar atau kecil dievaluasi sama tanpa penalti kesalahan kapitalisasi (misal: mengetik `k` untuk `K` dinilai benar). Teks ayat asli dan riwayat simpanan tetap mempertahankan huruf aslinya.
- **Model Akurasi Sesi ala Monkeytype (Monkeytype Session Accuracy)**:
  - Total keystroke dan kesalahan dihitung secara kumulatif selama sesi latihan. Menghapus dengan Backspace atau kata (`Ctrl + Backspace`) tidak menghapus riwayat kesalahan masa lalu. Akurasi tetap bertahan saat berpindah atau menyimpan ayat, dan hanya direset saat pengguna menekan tombol restart (`Tab` atau tombol ulang).
- **Penanganan Teks Alkitab Asli (Authentic Scripture Handling)**:
  - Teks AYT lengkap (66 kitab, 31.102 ayat) diverifikasi 100% byte-for-byte. Aplikasi tidak pernah membuat atau mengarang teks tiruan.
- **Pengaturan & Personalisasi**:
  - Ukuran huruf (`sm`, `md`, `lg`, `xl`)
  - Gaya caret (`line`, `block`, `underline`)
  - Efek suara ketikan mekanik (Web Audio API, luring tanpa aset eksternal)
  - Dukungan pengurangan animasi (*reduced motion*)
  - Reset progres dengan dialog konfirmasi aman

## ⌨️ Pintasan Papan Ketik (Keyboard Shortcuts)

| Pintasan | Aksi |
|---|---|
| `Tab` | Ulangi ayat / sesi aktif |
| `Esc` | Jeda / Lanjutkan sesi |
| `Ctrl + Backspace` | Hapus kata sebelumnya |
| `Enter` | Lanjut ke ayat berikutnya (pada modal hasil) |

## 📖 Cakupan Alkitab (Scripture Coverage)

Aplikasi ini menggunakan terjemahan resmi Alkitab Yang Terbuka (AYT).

| Terjemahan | Cakupan |
| --- | --- |
| **AYT** (Alkitab Yang Terbuka) | Lengkap — seluruh 66 kitab, **31.102 ayat**, Kejadian 1:1 hingga Wahyu 22:21 |

Dokumentasi asal-usul, checksum SHA-256, dan lisensi teks AYT tercatat di [`src/data/ayt/PROVENANCE.md`](src/data/ayt/PROVENANCE.md).

## 📜 Lisensi & Atribusi (Licensing & Attribution)

- **Alkitab Yang Terbuka (AYT)**: © 2011–2024 Yayasan Lembaga SABDA (YLSA) / [ayt.co](https://ayt.co).
  Digunakan secara **non-komersial** sesuai izin YLSA: *"AYT - usage (non-commercial) is CopyLefted, 2011 — this is to allow free usage/distribution of the text"*, dengan ketentuan turunan CC BY-NC-SA. Izin dikelola oleh YLSA (ylsa@sabda.org).

## 🚀 Pengembangan & Pengujian (Development & Testing)

```bash
# Menjalankan server pengembangan
npm run dev

# Menjalankan seluruh test suite otomatis
npm test

# Build produksi & pemeriksaan tipe TypeScript
npm run build
```

### AYT data pipeline

```bash
npm run ayt:fetch    # mengunduh artefak sumber AYT tersemat dan memverifikasi SHA-256
npm run ayt:build    # validasi dan kompilasi ulang dataset indeks ayat
npm run ayt:verify   # membandingkan seluruh 31.102 ayat byte-for-byte terhadap sumber asli
npm run ayt:coverage # menghasilkan laporan coverage per kitab dan pasal
```
