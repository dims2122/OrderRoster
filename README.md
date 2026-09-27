# Penghasilan Harian — Supabase

Aplikasi ini menggunakan konsep **tabungan/pencatatan penghasilan pribadi**, bukan transaksi penjualan roster.

## Cara kerja
- Tambahkan penghasilan sebanyak yang kamu mau pada tanggal yang sama.
- Setiap catatan memiliki tanggal, sumber, keterangan, dan nominal.
- Total Penghasilan Hari Ini otomatis menjumlahkan semua catatan pada tanggal tersebut.
- Laporan mengelompokkan semua catatan berdasarkan hari.
- Laporan juga menyediakan total bulan/rentang tanggal, grafik, detail pemasukan, dan ekspor CSV.

## Supabase
1. Buka Supabase Dashboard → SQL Editor.
2. Jalankan seluruh isi `supabase-schema.sql`.
3. Pastikan `config.js` berisi URL dan publishable/anon key project Supabase.

> Policy anon pada contoh ini cocok untuk penggunaan pribadi/prototipe. Untuk data finansial pribadi yang sensitif, sebaiknya gunakan Supabase Auth dan policy `authenticated`.
