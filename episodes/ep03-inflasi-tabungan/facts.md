# Facts · ep03-inflasi-tabungan

As of: **Sep 2026** (latest BPS CPI, released 1 Okt 2026); LPS rate as of **1 Okt 2026**; BI rate tables to
**Agu 2026**. Data pulled 14 Okt 2026.

Method: Rp 10.000.000 is put away at the **start of Jan 2010** and checked at the **end of Sep 2026** (201 months =
16,75 years). **Inflation basis: the BPS headline December-to-December inflation** (y-on-y Desember) for each year
2010–2025, chained from the Dec 2009 price level, plus BPS calendar-year inflation (y-to-d) Jan–Sep 2026. I picked
this one because it's the official figure people hear in the news ("inflasi 2025 2,92%"), it's the same y-on-y measure
as the latest monthly figure in the self-check, and it lines up with calendar years, so you can put each year's deposit
return next to that year's inflation. Three ways to keep the money, each compounded monthly:
**kas** (0%); **tabungan** at Bank Indonesia's average savings rate for all commercial banks (SEKI I.30, "Bank Umum")
for that month; **deposito** rolled over every month at the **LPS guarantee rate (Tingkat Bunga Penjaminan, bank umum,
Rupiah)** in force on the 1st of the month. That's the highest rate a deposit can earn and still be guaranteed by LPS,
so it's a ceiling and not a typical bank's counter rate. As a sensitivity check, BI's average 1-month deposit rate (SEKI I.28,
Bank Umum) gives almost the same result. Interest on both tabungan and deposito is cut by the **20% final tax**
(PP 131/2000: applies when deposits + savings exceed Rp 7,5 juta, which Rp 10 juta does). **Savings admin fees aren't
included**, and there's no official "typical" figure for them. Sep 2026 reuses the Aug 2026 BI rates (the last published month).
"Real value" = nominal ÷ cumulative price factor = buying power in early-2010 rupiah.
Script: `analysis/build_data.py` (`python -I`, needs `xlrd`) → `src/episodes/ep03-inflasi-tabungan/data/inflasi.json`.
Raw files + URLs: `data/SOURCES.txt`.

## Inflation (cash in the drawer)

| Key | Value | Display (Bahasa) | Source / formula |
|---|---|---|---|
| principal | 10000000 | Rp 10.000.000 / Rp 10 juta | brief |
| window | 2010-01 → 2026-09 | Jan 2010 – Sep 2026 (16,75 tahun) | 201 months |
| infl_2010 … infl_2025 | 6,96 · 3,79 · 4,30 · 8,38 · 8,36 · 3,35 · 3,02 · 3,61 · 3,13 · 2,72 · 1,68 · 1,87 · 5,51 · 2,61 · 1,57 · 2,92 (%) | e.g. "Inflasi 2025: 2,92%" | BPS y-on-y Desember, from `bi_data_inflasi_yoy_monthly.xlsx` (BI "Data Inflasi", source BPS) |
| infl_max_year | 2013: 8,38% (2014: 8,36%) | 8,38% | max of the above |
| infl_min_year | 2024: 1,57% | 1,57% | min of the above |
| infl_ytd_2026 | 0.0217 | 2,17% (Jan–Sep 2026) | BPS release 1 Okt 2026, via IDX Channel (`news_idxchannel_inflasi_sep2026.html`) |
| infl_yoy_sep2026 | 0.0328 | 3,28% (Sep 2026, y-on-y) | same release; Pasardana and Investortrust confirm 3,28% and IHK 112,31 |
| ihk_aug_sep2026 | 111,97 → 112,31 | IHK 112,31 (2022 = 100) | same release (m-to-m +0,30%) |
| price_factor | 1.903298 | ×1,90 / harga naik **+90,3%** | Π(1+Des-Des 2010..2025) × (1+0,0217) |
| need_today | 19032983 | Rp 19.032.983 / **Rp 19 juta** | 10 jt × 1,903298 (what the same basket costs now) |
| real_value_10jt | 5254037 | Rp 5.254.037 / **Rp 5,25 juta** | 10 jt ÷ 1,903298 (early-2010 buying power left) |
| cash_buying_power_lost | −0.4746 | −47,5% / "hampir setengahnya" | 5.254.037 / 10 jt − 1 |
| avg_inflation | 0.039171 | **3,92% per tahun** | 1,903298^(1/16,75) − 1 (geometric) |
| doubling_exact | 18.04 | ~18 tahun | ln 2 / ln 1,039171 |
| doubling_rule72 | 18.38 | ~18 tahun ("72 ÷ 3,9") | 72 / 3,9171 |
| price_factor_dec2025 | 1.862874 | +86,3% (s.d. Des 2025) | Π(1+Des-Des 2010..2025) |
| need_dec2025 / real_dec2025 | 18628740 / 5368050 | Rp 18,6 juta / Rp 5,37 juta | 10 jt × / ÷ 1,862874 |
| avg_inflation_2010_2025 | 0.039648 | 3,96% per tahun | 1,862874^(1/16) − 1 |

**Cross-check (World Bank, the scout's source).** WB CPI (2010 = 100, annual average) 2025 = 176,05 → +76,0%,
Rp 10 jt → Rp 5.680.315, 3,84% a year (15 years, 2010 average → 2025 average). The BPS Dec-to-Dec chain over
roughly the same span (Des 2010 → Des 2025) gives ×1,7417 (+74,2%), about 1% off, which is what the different averaging
would explain. Our headline (+90%, Rp 5,25 jt) is bigger because it starts a year earlier (it counts 2010's own 6,96%) and
runs on to Sep 2026. **Don't mix the two sets on screen.** The pitch's "Rp 17,6 juta / Rp 5,68 juta / 3,8%" is the WB
version and is superseded by this table. The BPS Dec-to-Dec values were also checked by eye against the published
BPS headline figures (2010 6,96 … 2025 2,92). They match.

## What "diam" earned, Jan 2010 → Sep 2026 (Rp 10 juta, net of 20% tax)

| Key | Value | Display (Bahasa) | Source / formula |
|---|---|---|---|
| kas_nominal / kas_real | 10000000 / 5254037 | Rp 10 juta → daya beli Rp 5,25 juta | 0% |
| tab_nominal | 12062159 | Rp 12.062.159 / **Rp 12,1 juta** | monthly: bal × SEKI I.30 Bank Umum rate/12 × 0,8 |
| tab_real | 6337503 | Rp 6.337.503 / **Rp 6,34 juta** | tab_nominal ÷ 1,903298 |
| tab_net_per_year | 0.011256 | 1,13% per tahun (bersih) | (12.062.159/10 jt)^(1/16,75) − 1 |
| tab_gross_per_year | 0.014088 | 1,41% per tahun (kotor) | same, no tax (gross value Rp 12.640.562) |
| tab_real_change | −0.3663 | −36,6% daya beli | tab_real / 10 jt − 1 |
| tab_years_beat | 0 of 16 | "nggak pernah sekali pun" | full years 2010–2025, net > inflation |
| tab_rate_2010_01 / _2026_08 | 3,08% / 0,75% | 3,08% → 0,75% | SEKI I.30 Bank Umum |
| dep_nominal | 21406984 | Rp 21.406.984 / **Rp 21,4 juta** | monthly: bal × LPS TBP/12 × 0,8 |
| dep_real | 11247309 | Rp 11.247.309 / **Rp 11,2 juta** | dep_nominal ÷ 1,903298 |
| dep_real_gain | 1247309 | +Rp 1,25 juta daya beli (+12,5%) | dep_real − 10 jt |
| dep_net_per_year | 0.046489 | **4,65% per tahun** (bersih) | (21.406.984/10 jt)^(1/16,75) − 1 |
| dep_gross_per_year | 0.058415 | 5,84% per tahun (kotor) | gross value Rp 25.881.344 |
| dep_tax_paid | 4474360 | ≈ Rp 4,47 juta kepotong pajak | 25.881.344 − 21.406.984 |
| dep_real_per_year | 0.007042 | **+0,70% per tahun** di atas inflasi | (11.247.309/10 jt)^(1/16,75) − 1 |
| dep_years_beat | 12 of 16 | "12 dari 16 tahun" | net > Des-Des inflation |
| dep_years_lost | 2010, 2013, 2014, 2022 | 4 tahun kalah | the high-inflation years (6,96 / 8,38 / 8,36 / 5,51%) |
| dep_2026_ytd | net 2,17% vs inflasi 2,17% | "seri" (real 0,00%) | Jan–Sep 2026 |
| lps_rate_2010_01 | 0.07 | 7,00% | LPS TBP (period 15 Sep 2009 – 14 Jan 2010) |
| depbi_nominal / depbi_real | 21504842 / 11298724 | Rp 21,5 juta / Rp 11,3 juta | sensitivity: SEKI I.28 Bank Umum 1 bulan |
| depbi_net / real per year | 0.046774 / 0.007316 | 4,68% / +0,73% | same years beaten (12 of 16) |

Per-year table (gross / net / real for each product, inflation, values) is in `inflasi.json → yearly`, and the monthly rates are in
`monthlyRates`.

## Current snapshot: the self-check ("hasil bersih − inflasi = untung beneran")

| Key | Value | Display (Bahasa) | Source / formula |
|---|---|---|---|
| lps_rate_now | 0.0375 | **3,75%** | LPS TBP bank umum Rupiah, 1 Okt 2026 – 31 Jan 2027 (`lps_tbp_listperiode.json`) |
| tax | 0.20 | pajak 20% | PP 131/2000 (`pajak_go_id_pp131_2000.html`) |
| lps_net_now | 0.0300 | **3,00%** bersih | 3,75% × (1 − 0,2) |
| inflation_now | 0.0328 | **3,28%** (Sep 2026, y-on-y) | BPS |
| lps_untung_beneran | −0.0028 | **−0,28%** | 3,00% − 3,28% (simple formula, as shown to viewers) |
| lps_real_exact | −0.00271 | −0,27% | 1,03 / 1,0328 − 1 (exact; keep for notes only) |
| sav_rate_now | 0.007507 | 0,75% → bersih 0,60% → **−2,68%** | SEKI I.30 Bank Umum, Agu 2026 |
| depbi_rate_now | 0.05076 | 5,08% → bersih 4,06% → +0,78% | SEKI I.28 Bank Umum 1 bulan, Agu 2026 (average across all deposits, including large negotiated ones) |

## Caveats to show on screen
- Inflasi: BPS, y-on-y Desember 2010–2025 + Jan–Sep 2026. Data s.d. Sep 2026.
- Deposito: pakai bunga penjaminan LPS (bunga tertinggi yang masih dijamin), dipotong pajak 20%, diperpanjang tiap bulan. Bunga di bank bisa lebih rendah.
- Tabungan: rata-rata bunga tabungan bank umum (Bank Indonesia), dipotong pajak 20%, **belum dipotong biaya admin**.
- Contoh "sekarang": bunga hari ini dibanding inflasi 12 bulan terakhir; ke depannya bisa berubah.
- Pajak 20% berlaku kalau total tabungan + deposito di atas Rp 7,5 juta.
- Bukan rekomendasi investasi.

## Rounded forms used in voice/captions
Captions show what the voice says. Exact figures stay in the on-screen graphics.

| Form (voice = caption) | ← Exact value (key) | Rule |
|---|---|---|
| "Rp 10 juta" | 10.000.000 (principal) | exact |
| "hampir dua kali lipat" / "naik 90%" | ×1,9033 / +90,33% (price_factor) | ×: down from 2, "hampir"; %: down to whole % |
| "Rp 19 juta" | 19.032.983 (need_today) | nearest juta |
| "tinggal Rp 5,3 juta" / "cuma sekitar Rp 5 juta" | 5.254.037 (real_value_10jt) | nearest 0,1 juta / "sekitar" for a looser form |
| "hampir setengahnya hilang" | −47,46% (cash_buying_power_lost) | down to ½, "hampir" |
| "hampir 4% setahun" | 3,917% (avg_inflation) | up to whole %, "hampir" = below |
| "sekitar 18 tahun" (harga dua kali lipat) | 18,04 (doubling_exact) / 18,38 (rule 72) | nearest whole year |
| "Rp 12 juta" (tabungan) | 12.062.159 (tab_nominal) | nearest juta |
| "Rp 6,3 juta" (tabungan, daya beli) | 6.337.503 (tab_real) | nearest 0,1 juta |
| "nggak pernah menang sekali pun" | 0 of 16 (tab_years_beat) | exact |
| "Rp 21 juta lebih" (deposito) | 21.406.984 (dep_nominal) | down to whole juta, "lebih" |
| "Rp 11 juta lebih" (deposito, daya beli) | 11.247.309 (dep_real) | down to whole juta, "lebih" |
| "cuma untung sejuta lebih" | 1.247.309 (dep_real_gain) | down to whole juta |
| "kurang dari 1% setahun" / "tipis, 0,7% setahun" | 0,704% (dep_real_per_year) | under 1 / nearest 0,1 pt |
| "hampir Rp 4,5 juta" (dipotong pajak) | 4.474.360 (dep_tax_paid) | nearest 0,1 juta, below → "hampir" |
| "12 dari 16 tahun" | 12 / 16 (dep_years_beat) | exact |
| "3,75%" → "3%" bersih | 0,0375 / 0,0300 (lps_rate_now / lps_net_now) | exact |
| "inflasi 3,3%" | 3,28% (inflation_now) | nearest 0,1 pt (or say "3,28%" exactly) |
| "minus 0,3%" / "malah minus" | −0,28 pt (lps_untung_beneran) | nearest 0,1 pt |

## Not sourced (left out)
- **Everyday prices then vs now** (beras, BBM, etc.): bps.go.id blocks automated access (HTTP 403), so BPS average
  prices couldn't be pulled. Fuel prices are government-set, and the product changed (Premium → Pertalite), so a
  then-vs-now fuel price would show subsidy policy, not inflation. Skipped. Don't invent examples.
- **Typical savings admin fee and big-bank counter rates** (the pitch's "tabungan 0,1–0,5%, deposito bank besar ~2,5%"):
  there's no official aggregate, so they're not used. Point at the fees qualitatively ("belum termasuk biaya admin").
