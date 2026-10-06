# Elizabeth Certificate Portal — Vercel Ready

Project ini terdiri dari:

- **Frontend:** Vercel (HTML/CSS/JavaScript)
- **Database:** Google Sheets
- **Backend lookup NIM:** Google Apps Script
- **Generate PDF:** langsung di browser dari template asli

Dengan pendekatan ini template tidak lagi dipaksa ke ukuran Google Slides, sehingga PDF mengikuti rasio gambar asli dan tidak menghasilkan bidang putih di kiri/kanan.

## Struktur

```text
elizabeth-certificate-vercel/
├── index.html
├── style.css
├── script.js
├── favicon.png
├── apple-touch-icon.png
├── vercel.json
├── assets/
│   └── logo-elizabeth.png
├── templates/
│   ├── beauty-class.jpeg
│   ├── ylt-2022.jpeg
│   ├── ylt-2023.jpeg
│   ├── ylt-2024.jpeg
│   └── ylt-2025.jpeg
└── google-apps-script/
    └── Code.gs
```

## A. Setup Google Apps Script

1. Buka `script.google.com`.
2. Buat project baru.
3. Hapus isi `Code.gs`.
4. Copy isi `google-apps-script/Code.gs`.
5. Save.
6. Pilih fungsi `refreshStudentCache` lalu Run sekali dan berikan izin Google Sheets.
7. Klik **Deploy → New deployment → Web app**.
8. Set:
   - Execute as: **Me**
   - Who has access: **Anyone**
9. Deploy.
10. Salin URL yang berakhir `/exec`.

Spreadsheet sudah diarahkan ke:

`1qmUc-hfxY_rifZ6yqSJ1O66mLYcw5wqPt-J2Q33BQa4`

## B. Masukkan URL API ke frontend

Buka `script.js`, cari:

```js
const API_URL = 'PASTE_GOOGLE_APPS_SCRIPT_EXEC_URL_DI_SINI';
```

Ganti dengan URL `/exec` Apps Script Anda.

Contoh:

```js
const API_URL = 'https://script.google.com/macros/s/AKfycbxxxxxxxx/exec';
```

## C. Deploy ke Vercel

### Cara lewat GitHub
1. Buat repository GitHub.
2. Upload seluruh isi folder project ke repository.
3. Di Vercel klik **Add New → Project**.
4. Import repository tersebut.
5. Framework Preset: **Other**.
6. Tidak perlu Build Command.
7. Klik **Deploy**.

### Cara Vercel CLI
Jika Vercel CLI sudah terinstall:

```bash
vercel
```

Lalu untuk production:

```bash
vercel --prod
```

## Branding

- `favicon.png` sudah dibuat dari logo gram Elizabeth.
- Header menggunakan logo landscape.
- Warna UI menggunakan merah + oranye sesuai identitas Elizabeth.

## Aturan sertifikat

- NIM 2022 → YLT 2022
- NIM 2023 → YLT 2023
- NIM 2024 → YLT 2024
- NIM 2025 → YLT 2025
- Beauty Class hanya untuk jenis kelamin perempuan.

## Mengatur posisi nama pada sertifikat

Buka `script.js`, cari:

```js
const LAYOUT = { ... }
```

Contoh Beauty:

```js
BEAUTY: {
  x: 800,
  y: 535,
  maxSize: 42,
  minSize: 21,
  maxWidth: 1080
}
```

- `x` lebih besar → geser kanan
- `x` lebih kecil → geser kiri
- `y` lebih besar → geser bawah
- `y` lebih kecil → geser atas
- `maxSize` → ukuran nama normal
- `minSize` → batas ukuran minimum
- `maxWidth` → lebar maksimum nama

Nama panjang otomatis dikecilkan sampai tetap satu baris.

## Update data mahasiswa

Edit Google Sheet saja. Cache backend berlaku 10 menit.

Jika ingin update langsung tanpa menunggu, buka Apps Script lalu jalankan:

`refreshStudentCache`

## Catatan

Template sertifikat sekarang berada langsung di project Vercel. Jadi tidak perlu lagi memasukkan File ID template Google Drive.
"# certificate-generator" 
