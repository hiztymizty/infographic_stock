# IHSG sempat turun 41%, butuh naik berapa buat balik?

Durasi: **76 detik**, estimated (no voiceover yet).

## hook · 0.0s–5.6s

_Visual: Frame 0 sudah jadi: garis IHSG harian dari puncak 20 Jan 2026 menukik merah ke dasar 8 Jun, label besar −41,5% (sumber: drawdown.json). Di hook-2 muncul pill pertanyaan "+?%" di atas celah antara dasar dan puncak._

- **IHSG sempat turun 41%.**
  - dibaca: _I-Ha-Es-Ge sempat turun empat puluh satu persen._
- **Butuh naik berapa buat balik?**

## math · 5.6s–19.8s

_Visual: Bar Rp 100 menyusut ke Rp 50 (−50%), lalu bar Rp 50 harus tumbuh +100% balik ke garis Rp 100: panah turun pendek vs panah naik panjang, asimetrinya kelihatan. Di math-4 bar berganti ke IHSG: puncak 9.134,7 → dasar 5.342 (−41,5%) dan panah naik +71% ke puncak, dengan footnote kecil "Puncak harian 20 Jan 2026; video DCA pakai harga akhir bulan"._

- **Modal Rp 100 turun jadi Rp 50.**
  - dibaca: _Modal seratus rupiah turun jadi lima puluh._
- **Buat balik, harus naik 100%, alias dobel.**
  - dibaca: _Buat balik, harus naik seratus persen, alias dobel._
- **Nggak simetris, kan?**
- **Makanya IHSG yang turun 41%, butuh naik 71%.**
  - dibaca: _Makanya I-Ha-Es-Ge yang turun empat puluh satu persen, butuh naik tujuh puluh satu persen._

## today · 19.8s–30.1s

_Visual: Garis harian Des 2025 → 13 Okt 2026: dari dasar 5.342 garis naik ke 5.926 (+10,9%, chip kecil), lalu bracket merah "−35,1% dari puncak" dan celah sisa ke garis puncak 9.134,7 dengan label +54,2%. Tanggal "Per 13 Okt 2026" di pojok grafik._

- **Sekarang IHSG udah naik 11% dari dasarnya.**
  - dibaca: _Sekarang I-Ha-Es-Ge udah naik sebelas persen dari dasarnya._
- **Tapi masih 35% di bawah puncak, dan butuh naik 54% lagi.**
  - dibaca: _Tapi masih tiga puluh lima persen di bawah puncak, dan butuh naik lima puluh empat persen lagi._

## history · 30.1s–47.2s

_Visual: Grafik IHSG 1990–2026 skala log (data mingguan dari drawdown.json), tiap crash diwarnai merah dengan "jembatan" horizontal dari puncak ke hari ditutup di atas puncak itu lagi; tiap jembatan + bar durasinya muncul di line-nya dan ditahan ≥ 1,2 s: Krismon (8 Jul 1997 → 9 Jan 2004, −65,3%, 6,5 thn), 2008 (9 Jan 2008 → 5 Apr 2010, −60,7%, 2,2 thn), COVID (puncak 19 Feb 2018 → 11 Nov 2021, −41,1%, 3,7 thn). Akhirnya jembatan 2026 masih terbuka, ujungnya titik-titik dengan "?". Voice cuma sebut lamanya; persen jatuhnya tampil di label. Label kecil di bawah judul: "Lama balik = dari puncak sampai ditutup di atas puncak itu lagi"._

- **Sejak 1997, IHSG tiga kali jatuh sedalam ini.**
  - dibaca: _Sejak sembilan belas sembilan puluh tujuh, I-Ha-Es-Ge tiga kali jatuh sedalam ini._
- **Dari puncak sampai balik lagi, krismon butuh 6,5 tahun.**
  - dibaca: _Dari puncak sampai balik lagi, krismon butuh enam setengah tahun._
- **Krisis 2008, 2,2 tahun.**
  - dibaca: _Krisis dua ribu delapan, dua koma dua tahun._
- **COVID, dari puncak 2018, 3,7 tahun.**
  - dibaca: _COVID, dari puncak dua ribu delapan belas, tiga koma tujuh tahun._

## lesson · 47.2s–55.1s

_Visual: Statement dua baris: "Turun: < 5 bulan" vs "Balik: bisa bertahun-tahun". Footer kecil: "Cuma harga indeks (penutupan harian), belum termasuk dividen. Balik = pertama kali ditutup di atas puncak lamanya. Data: Yahoo Finance (^JKSE), 1997 – 13 Okt 2026." dan pill disclaimer "Sejarah nggak bisa nebak kapan IHSG balik. Bukan rekomendasi investasi." Tanpa pertanyaan komen, langsung ke outro._

- **Tahun ini jatuhnya nggak sampai 5 bulan.**
  - dibaca: _Tahun ini jatuhnya nggak sampai lima bulan._
- **Baliknya bisa bertahun-tahun, dan nggak ada yang bisa nebak kapan.**

## hakabot-outro · 55.1s–76.1s

_Visual: Outro standar Hakabot v3.3: Indikator, Bandarmology (POSITION), Komposisi, Screener (ticker & nama di-blur), lalu end card hakabot.com._

- **Hakabot punya banyak indikator racikan sendiri, tinggal klik langsung muncul di chart.**
- **Kelihatan broker mana yang nambah, keluar, sampai untung ruginya.**
- **Pemilik saham tiap perusahaan, tampil rapi.**
- **Screener siap pakai, bantu nyaring saham yang jelek.**
- **Cek di hakabot.com.**
  - dibaca: _Cek di hakabot dot com._

## Sumber data

- Yahoo Finance chart API, ^JKSE, interval 1d, 6 Apr 1990 – 13 Okt 2026 (episodes/ep02-ihsg-balik-puncak/data/jkse_daily_raw.json); penutupan 13 Okt 2026 dari meta.regularMarketPrice
- Yahoo Finance chart API, ^JKSE, interval 1mo (episodes/ep02-ihsg-balik-puncak/data/jkse_monthly_raw.json), hanya untuk catatan puncak bulanan ep01
- Perhitungan drawdown, crash ≥ 40% dan waktu balik: episodes/ep02-ihsg-balik-puncak/analysis/build_data.py → src/episodes/ep02-ihsg-balik-puncak/data/drawdown.json
- Cek silang berita: rri.co.id (rekor 9.134,70, 20 Jan 2026), pasardana.id (5.342, 8 Jun 2026), katadata.co.id (1.111,39, Okt 2008), idxchannel.com (3.937,63, 24 Mar 2020), surabaya-memory.petra.ac.id (740,83 dan 256,83, 1997–98)
