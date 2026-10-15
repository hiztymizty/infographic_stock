# Facts · ep02-ihsg-balik-puncak

As of: **13 Okt 2026** (IHSG close 5.925,98). Method: **daily closing levels** of IHSG (^JKSE) from
Yahoo Finance, 6 Apr 1990 – 13 Okt 2026 (8.889 trading days; Yahoo's earliest daily bar is 6 Apr 1990,
so 1997 is fully covered and no monthly fallback was needed). **Price index only:** no dividends, so real
investors in an index fund got back a bit sooner than these dates. Peak = the highest close before the fall
(all-time high). Recovery = the first later close at or above that peak. Trough = the lowest close in between.
A "crash" = a fall of 40% or more from the peak. Rise needed to undo a fall of X% = 1/(1−X) − 1. Years =
calendar days / 365,25, months = days / 30,44. Dates in WIB. The 13 Okt close comes from Yahoo's
`meta.regularMarketPrice` (stamped 13 Okt 16:00 WIB, after the close), because the bar array had no close yet
at download time. Source: Yahoo Finance chart API `^JKSE`, interval 1d (`data/jkse_daily_raw.json`) and 1mo
(`data/jkse_monthly_raw.json`, only for the ep01 tie-in). Computed by `analysis/build_data.py` →
`src/episodes/ep02-ihsg-balik-puncak/data/drawdown.json` (also holds the weekly 1990–2026 series and the daily
series from Des 2025 for the charts).

## The 2026 drop and today

| Key | Value | Display (Bahasa) | Source / formula |
|---|---|---|---|
| peak_2026 | 9134.70 | 9.134,7 · "9.100-an" | highest daily close, 20 Jan 2026 (`crash2026.peak`) |
| peak_2026_date | 2026-01-20 | 20 Jan 2026 | `crash2026.peakDate` |
| low_2026 | 5342.14 | 5.342 · "5.300-an" | lowest close since the peak, 8 Jun 2026 (`crash2026.trough`) |
| low_2026_date | 2026-06-08 | 8 Jun 2026 | `crash2026.troughDate` |
| drop_2026 | −0.4152 | −41,5% | 5342,14 / 9134,70 − 1 |
| need_2026 | 0.7099 | +71% | 1 / (1 − 0,4152) − 1 = 9134,70 / 5342,14 − 1 |
| fall_days_2026 | 139 | 139 hari · 4,6 bulan · "nggak sampai 5 bulan" | 20 Jan → 8 Jun 2026 |
| closes_at_or_below_minus40_2026 | 1 | cuma 1 hari (8 Jun) | count of 2026 closes ≤ −40% from peak |
| ihsg_today | 5925.98 | 5.926 · "5.900-an" | 13 Okt 2026 close (`now.latest`) |
| today_vs_peak | −0.3513 | −35,1% | 5925,98 / 9134,70 − 1 |
| today_vs_low | 0.1093 | +10,9% | 5925,98 / 5342,14 − 1 |
| need_today_to_peak | 0.5415 | +54,2% | 9134,70 / 5925,98 − 1 |
| share_of_drop_recovered | 0.1539 | 15% dari jarak turunnya | (5925,98 − 5342,14) / (9134,70 − 5342,14) |
| high_since_low | 6686.44 | 6.686 (8 Sep 2026), +25,2% dari dasar | max close after 8 Jun (`now.highSinceTrough`) |
| months_below_peak_2026 | 8.7 | 8,7 bulan · "hampir 9 bulan" | 20 Jan → 13 Okt 2026 (267 hari) |
| close_2025 | 8646.94 | 8.647 | 30 Des 2025 close |
| ytd_2026 | −0.3147 | −31,5% | 5925,98 / 8646,94 − 1 |
| intraday_high_2026 | 9174.47 | 9.174 (20 Jan, intraday) | not used for the story: closes only |
| intraday_low_2026 | 5317.91 | 5.318 (8 Jun, intraday) | not used for the story: closes only |

## The asymmetry (pure formula: need = 1/(1−drop) − 1)

| Key | Drop | Need | Display |
|---|---|---|---|
| asym_10 | −10% | 0.1111 | turun 10% → naik 11,1% |
| asym_20 | −20% | 0.25 | turun 20% → naik 25% |
| asym_30 | −30% | 0.4286 | turun 30% → naik 42,9% |
| asym_2026 | −41,52% | 0.7099 | turun 41,5% → naik 71% |
| asym_50 | −50% | 1.0 | turun 50% → naik 100% ("harus dobel") |
| asym_65 | −65% | 1.8571 | turun 65% → naik 185,7% ("hampir 3 kali lipat", 2,86×) |

## Crashes of 40% or more (daily closes, `crashes[]`)

| Crash | Peak (date, close) | Trough (date, close) | Fall | Fall took | Rise needed | Back at peak | Peak → back | Trough → back |
|---|---|---|---|---|---|---|---|---|
| Krismon 1997–98 | 8 Jul 1997 · 740,83 | 21 Sep 1998 · 256,83 | **−65,3%** | 440 hari · 14,5 bln | +188,5% (2,88×) | 9 Jan 2004 · 753,69 | **6,5 thn** (78,1 bln) | 5,3 thn (63,6 bln) |
| Krisis global 2008 | 9 Jan 2008 · 2.830,26 | 28 Okt 2008 · 1.111,39 | **−60,7%** | 293 hari · 9,6 bln | +154,7% (2,55×) | 5 Apr 2010 · 2.887,25 | **2,2 thn** (26,8 bln) | 1,4 thn (17,2 bln) |
| COVID 2020 | 19 Feb 2018 · 6.689,29 | 24 Mar 2020 · 3.937,63 | **−41,1%** | 764 hari · 25,1 bln | +69,9% | 11 Nov 2021 · 6.691,34 | **3,7 thn** (44,7 bln) | 1,6 thn (19,6 bln) |
| 2026 | 20 Jan 2026 · 9.134,70 | 8 Jun 2026 · 5.342,14 | **−41,5%** | 139 hari · 4,6 bln | +71,0% | belum (as of 13 Okt 2026) | 8,7 bln so far | 4,2 bln so far |
| (Awal 1990-an, data note) | 22 Mei 1990 · 647,40* | 11 Nov 1991 · 223,25 | −65,5% | 538 hari · 17,7 bln | +190% | 6 Jan 1997 · 653,96 | 6,6 thn* | 5,2 thn |

\* Yahoo's daily data starts 6 Apr 1990, a few weeks into that boom; the real 1990 peak may be earlier and
higher, so this row's peak and durations aren't reliable. Recommendation: leave it out and say "sejak 1997" /
"sejak krismon" rather than "sepanjang sejarah".

Extra keys for the speed comparison:

| Key | Value | Display (Bahasa) | Source / formula |
|---|---|---|---|
| days_to_minus40_1997 | 128 | 128 hari (8 Jul → 13 Nov 1997) | first close ≤ −40% from peak (`hit40Date`) |
| days_to_minus40_2008 | 271 | 271 hari (9 Jan → 6 Okt 2008) | same |
| days_to_minus40_covid | 763 | 763 hari (19 Feb 2018 → 23 Mar 2020) | same |
| days_to_minus40_2026 | 139 | 139 hari (20 Jan → 8 Jun 2026) | same |
| covid_2020_high | 6325.41 | 6.325 (14 Jan 2020) | highest close of 2020 before the trough (`covid2020Phase`) |
| covid_2020_phase_drop | −0.3775 | −37,7% dalam 70 hari | 3937,63 / 6325,41 − 1; 14 Jan → 24 Mar 2020 |

## The ep01 tie-in (monthly vs daily)

| Key | Value | Display (Bahasa) | Source / formula |
|---|---|---|---|
| monthly_peak | 8646.94 | 8.647 (Des 2025) | highest monthly close (ep01's basis), `monthlyBasis.peak` |
| monthly_jan2026_close | 8329.61 | 8.330 (Jan 2026) | Jan 2026 monthly close: the crash started in late Jan, so Jan closed below Dec |
| monthly_low | 5643.19 | 5.643 (Jun 2026) | lowest monthly close after the peak |
| monthly_drop | −0.3474 | −34,7% / "−35%" (as in ep01) | 5643,19 / 8646,94 − 1 |
| daily_peak_above_monthly | 0.0564 | +5,6% | 9134,70 / 8646,94 − 1 |

**Basis for ep02: daily, throughout.** Peak and low both fell mid-month (20 Jan, 8 Jun), so month-end closes miss
both extremes and understate the fall (−34,7% vs −41,5%). Every historical crash is measured the same way (daily
closes back to 1990), the reference values below match daily closes exactly, and it lets the video name exact days.
Do not mix in ep01's 8.647 except in the one explaining line. One-line explanation for the script:
"Di video DCA kemarin kita pakai harga akhir bulan, jadi puncaknya 8.647. Kalau dilihat harian, puncaknya 9.134
di 20 Januari."

## Data checks done

- **Reference values, all exact matches (to 0,01):** 740,83 (8 Jul 1997), 256,83 (21 Sep 1998), 2.830,26
  (9 Jan 2008), 1.111,39 (28 Okt 2008), 6.689,29 (19 Feb 2018), 3.937,63 (24 Mar 2020), 9.134,70 (20 Jan 2026),
  and year-end closes 6.299,54 (2019), 7.272,80 (2023), 7.079,90 (2024), 8.646,94 (2025). Stored in
  `referenceChecks`. News cross-checks: 9.134,70 record close on 20 Jan 2026
  (https://rri.co.id/semarang/ekonomi/keuangan/2120180/ihsg-cetak-rekor-baru-rupiah-terpuruk-ke-level-terlemah);
  5.342,137 close on 8 Jun 2026, −4,52%
  (https://pasardana.id/news/2026/6/8/ditutup-di-level-5-342-ihsg-senin-melemah-4-52-persen);
  1.111,39 / −60,73% in Okt 2008
  (https://katadata.co.id/yuliawati/finansial/5ef5eb92b5cee/cerita-dirut-bei-soal-anjloknya-ihsg-saat-krisis-1998-dan-2008);
  3.937,63 on 24 Mar 2020
  (https://www.idxchannel.com/market-news/perjalanan-ihsg-saat-panik-covid-19-sentuh-titik-terendah-hingga-berhasil-bangkit);
  740,83 (Jul 1997) and 256,83 (21 Sep 1998) (https://surabaya-memory.petra.ac.id/index.php/digital/get-file/5373).
- **Bad points:** 316 bars have a null close (≈ 13–21 per year in 1990–2006 and 2017–2019; holidays). They're
  skipped. None falls within 7 days of any peak, trough or recovery date above, except 16 Feb 2018 (Imlek, market
  closed). No zero or negative closes, no duplicate dates, no gap over 12 days (longest: Lebaran and year-end breaks).
- **Spikes:** 15 daily moves over ±8%, all on known crisis days (e.g. −11,9% 8 Jan 1998, −10,4% 14 Okt 2002 Bali
  bombing, −10,7% / −10,4% 6 & 8 Okt 2008, +10,2% 26 Mar 2020). None in 2026 (biggest 2026 rebound: 9 Jun, +7,6%).

## Caveats to show on screen

- Cuma harga indeks (harga penutupan harian), belum termasuk dividen.
- "Balik" = pertama kali ditutup di atas puncak lamanya.
- Data: Yahoo Finance (^JKSE), 1997 – 13 Okt 2026.
- Sejarah nggak bisa nebak kapan IHSG balik. Bukan rekomendasi investasi.

## Rounded forms used in voice/captions
Captions show what the voice says. Exact figures stay in the on-screen graphics.

| Form (voice = caption) | ← Exact value (key) | Rule |
|---|---|---|
| "41%" (turun) | −41,52% (drop_2026) | down to whole %; nearest would be 42%. Or "lebih dari 40%" |
| "71%" (naik) | +70,99% (need_2026) | nearest whole % |
| "9.100-an" / "sembilan ribu seratus-an" | 9.134,70 (peak_2026) | hundreds, "-an" = a bit above |
| "5.300-an" | 5.342,14 (low_2026) | hundreds, "-an" |
| "5.900-an" | 5.925,98 (ihsg_today) | hundreds, "-an" |
| "35%" (masih di bawah puncak) | −35,13% (today_vs_peak) | nearest whole % |
| "54%" lagi | +54,15% (need_today_to_peak) | nearest whole % |
| "11%" dari dasar | +10,93% (today_vs_low) | nearest whole %; or "hampir 11%" |
| "nggak sampai 5 bulan" | 139 hari / 4,6 bln (fall_days_2026) | below 5 → "nggak sampai" |
| "hampir 9 bulan" | 8,7 bln (months_below_peak_2026) | below 9 → "hampir" |
| "65%" (krismon) | −65,33% | nearest whole % |
| "6,5 tahun" (krismon, puncak → balik) | 6,51 thn | nearest 0,5 |
| "5 tahun lebih" (krismon, dasar → balik) | 5,30 thn | down to whole, "lebih" |
| "61%" (2008) | −60,73% | nearest whole %; or "60% lebih" |
| "2 tahun lebih" / "2,2 tahun" (2008, puncak → balik) | 2,24 thn | down to whole, "lebih" |
| "1,4 tahun" (2008, dasar → balik) | 1,43 thn | nearest 0,1 |
| "41%" (COVID) | −41,14% | nearest whole % |
| "hampir 4 tahun" / "3,7 tahun" (COVID, puncak → balik) | 3,73 thn | below 4 → "hampir" |
| "1,6 tahun" (COVID, dasar → balik) | 1,63 thn | nearest 0,1 |
| "dua tahun lebih" (COVID, lama turunnya dari puncak 2018) | 25,1 bln | down to whole year, "lebih" |
| "dobel" / "100%" | asym_50 | exact |
| "hampir 3 kali lipat" | +185,7% (asym_65), +188,5% (krismon) | 2,86× / 2,88× → below 3 → "hampir" |
| "8.600-an" (ep01) | 8.646,94 (monthly_peak) | as ep01 ("8.600") |
