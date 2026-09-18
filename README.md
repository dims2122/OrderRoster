# Roster Cilegon — Form & Laporan (Supabase)

## Isi ZIP
- `index.html`, `style.css`, `app.js`: aplikasi responsif dengan tampilan yang menyesuaikan layar HP.
- `config.js`: tempat URL dan anon/publishable key Supabase.
- `supabase-schema.sql`: struktur tabel dan policy awal.
- `README.md`: panduan pemasangan.

## Fitur
Form mencatat nama, WhatsApp, lokasi, tanggal, jumlah, dan harga negosiasi per pcs. Total Harga = jumlah × harga negosiasi. Pendapatan dari Barang = jumlah pcs × Rp1.000 (terpisah dari harga negosiasi).
Menu Laporan menampilkan transaksi sesuai bulan atau rentang tanggal, total transaksi, total pcs, total pendapatan, grafik per tanggal, dan rincian transaksi. Tombol ekspor menghasilkan CSV yang bisa dibuka di Excel.

## Cara menghubungkan
1. Di Supabase buat project.
2. SQL Editor → New query, jalankan seluruh `supabase-schema.sql`.
3. Project Settings → API, salin Project URL dan anon/publishable key.
4. Tempel ke `config.js` pada `SUPABASE_URL` dan `SUPABASE_ANON_KEY`.
5. Jalankan `index.html` dengan Live Server atau deploy ke hosting statis.

## Keamanan
SQL awal mengizinkan role `anon` membaca dan menambahkan transaksi supaya bisa diuji tanpa login. Ini bukan privasi untuk data bisnis: siapa pun yang memperoleh URL dan anon key dapat mengakses sesuai policy. Sebelum dipakai dengan data pelanggan sungguhan, aktifkan Supabase Auth dan batasi policy ke pengguna terautentikasi.
