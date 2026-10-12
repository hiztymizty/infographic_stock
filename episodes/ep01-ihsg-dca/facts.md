# Facts · ep01-ihsg-dca

As of: **9 Okt 2026** (latest IHSG print 6.043,01). Method: Rp 5.000.000 buys IHSG at each month's
**opening** level, from Jan 2010 to Oct 2026 (202 buys). Units are valued at each month's close,
and the current month at the latest print. **Price index only:** dividends, fees and taxes are not
included, and the index can't be bought directly (an IHSG index fund is the real-world equivalent).
The per-year figure is a money-weighted return (XIRR) over all contributions.
Source: Yahoo Finance chart API `^JKSE`, interval 1mo (`data/jkse_raw.json`). Computed by
`analysis/build_data.py` → `src/episodes/ep01-ihsg-dca/data/dca.json`.

| Key | Value | Display (Bahasa) | Source / formula |
|---|---|---|---|
| monthly | 5000000 | Rp 5.000.000 / Rp 5 juta | brief |
| buys | 202 | 202 bulan | Jan 2010 – Okt 2026 |
| years | 16.8 | "16 tahun" (kicker, whole years) | 202 / 12 = 16,8 → floor |
| invested_total | 1010000000 | Rp 1.010.000.000 / Rp 1,01 miliar | 202 × 5.000.000 |
| value_today | 1168051283 | Rp 1.168.051.283 / Rp 1,17 miliar | units × 6.043,01 |
| profit_today | 158051283 | +Rp 158 juta | value − invested |
| return_total | 0.1565 | +15,6% | value / invested − 1 |
| return_per_year | 0.0171 | 1,7% per tahun | XIRR |
| avg_buy_price | 5225.31 | 5.225 | invested / units |
| ihsg_today | 6043.01 | 6.043 | meta.regularMarketPrice |
| ihsg_jan2010 | 2610.8 | 2.611 / "2.600-an" | Jan 2010 close |
| ihsg_peak_close | 8646.94 | 8.647 / "8.600" | Dec 2025 close (highest monthly close) |
| ihsg_rise_to_peak | 2.312 | +231% / "lebih dari tiga kali lipat" (3,31×) | 8646,94 / 2610,8 − 1 |
| ihsg_fall_peak_to_today | −0.301 | −30% | 6043,01 / 8646,94 − 1 |
| ihsg_fall_6m | −0.347 | −35% "dalam 6 bulan" | Jun 2026 close 5643,19 / Dec 2025 close − 1 |
| ret_2015_09 | 0.0465 | +4,7% | value 361.049.924 / invested 345.000.000 − 1 |
| ret_2020_03 | −0.0163 | −1,6% "sempat minus" | value 604.954.272 / invested 615.000.000 − 1 (the only other red month is Feb 2010, −0,88%, so not "pertama kali") |
| cross_1b | 2021-12 | Des 2021 "tembus Rp 1 miliar" | first month value ≥ 1e9 (1.000.993.915) |
| peak_value | 1608337863 | Rp 1.608.337.863 / Rp 1,61 miliar | Dec 2025 |
| peak_return | 0.675 | +67,5% / "67%" | peak value / 960.000.000 − 1 |
| peak_per_year | 0.0614 | 6,1% / tahun | XIRR to Dec 2025 |
| low_value_jun2026 | 1072301810 | Rp 1.072.301.810 / Rp 1,07 miliar | Jun 2026 |
| low_return_jun2026 | 0.0831 | +8,3% | 1.072.301.810 / 990.000.000 − 1 |
| drop_peak_to_low | 536036053 | −Rp 536 juta / "lebih dari setengah miliar" | peak − Jun 2026 value |

## Caveats to show on screen
- Cuma harga indeks: belum termasuk dividen, fee & pajak.
- Beli di harga open tiap bulan.
- Data: Yahoo Finance (^JKSE), Jan 2010 – 9 Okt 2026.
- Bukan rekomendasi investasi.

## Rounded forms used in voice/captions
Captions show what the voice says. Exact figures stay in the on-screen graphics.

| Form (voice = caption) | Line | ← Exact value (key) | Rule |
|---|---|---|---|
| "2.600-an" | ihsg-1 | 2.610,8 (ihsg_jan2010) | hundreds, "-an" = a bit above |
| "8.600" | ihsg-2 | 8.646,94 (ihsg_peak_close) | nearest 100, below |
| "tiga kali lipat lebih" | ihsg-2 | 3,31× (ihsg_rise_to_peak + 1) | down to whole ×, "lebih" = above |
| "Rp 1 miliar lebih" | rules-2 | 1.010.000.000 (invested_total) | down to whole miliar, "lebih" = above |
| "67%" | j-peak | 0,6754 (peak_return) | down to whole % (nearest would be 68%) |
| "Rp 1,6 miliar" | twist-1 | 1.608.337.863 (peak_value) | nearest 0,1 M |
| "Rp 1 miliar lebih dikit" | twist-1 | 1.072.301.810 (low_value_jun2026) | down to whole miliar, "lebih dikit" = Rp 72 juta above |
| "lebih dari setengah miliar" | twist-2 | 536.036.053 (drop_peak_to_low) | down to 0,5 M, "lebih dari" = above |
| "Rp 1 miliar" (modal) | result-1 | 1.010.000.000 (invested_total) | nearest 0,1 M |
| "hampir Rp 1,2 miliar" | result-1 | 1.168.051.283 (value_today) | nearest 0,1 M, below → "hampir" |
| "15% lebih" | result-2 | 0,1565 (return_total) | down to whole %, "lebih" = above |
| "1,7%" setahun | result-2 | 0,0171 (return_per_year) | nearest 0,1 pt |
