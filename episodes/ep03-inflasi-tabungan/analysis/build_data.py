"""ep03 · Rp 10 juta di lemari sejak 2010: inflation vs cash, tabungan and deposito.

Usage:  python -I episodes/ep03-inflasi-tabungan/analysis/build_data.py
Needs:  xlrd (reads the legacy .xls SEKI tables). Everything else is stdlib.
Inputs: episodes/ep03-inflasi-tabungan/data/*   (see data/SOURCES.txt for URLs)
Output: src/episodes/ep03-inflasi-tabungan/data/inflasi.json

Method (also written up in facts.md):
- Inflation basis: BPS headline December-to-December (y-on-y Desember) CPI inflation, 2010..2025, chained
  from the Dec 2009 price level ("uang disimpan awal 2010"). 2026 to date = BPS calendar-year inflation
  (y-to-d) Jan-Sep 2026. So the window is Dec 2009 -> Sep 2026 = 201 months = 16,75 years.
- Rp 10.000.000 placed at the start of Jan 2010, one month at a time (interest credited monthly, rolled over):
    cash      0 %
    tabungan  BI SEKI I.30 average savings rate, "Bank Umum" (all commercial banks), that month
    deposito  (a) LPS guarantee rate (TBP) for bank umum in Rupiah in force on the 1st of the month:
                  the highest rate a deposit can earn and still be guaranteed by LPS
              (b) BI SEKI I.28 average 1-month time-deposit rate, "Bank Umum", that month (sensitivity)
  Interest is taxed 20 % final (PP 131/2000; balance > Rp 7,5 juta). Admin fees are NOT included.
  Monthly interest = balance x annual rate / 12 x (1 - tax).
  SEKI has data to Aug 2026; Sep 2026 reuses the Aug 2026 rate.
- Real value = nominal value / cumulative price factor (in "rupiah 2010", i.e. Dec 2009 prices).
"""
import json
import math
import re
import sys
import zipfile
from pathlib import Path

import xlrd

sys.stdout.reconfigure(encoding="utf-8")

EP = Path(__file__).resolve().parent.parent
ROOT = EP.parent.parent
DATA = EP / "data"
OUT = ROOT / "src" / "episodes" / "ep03-inflasi-tabungan" / "data" / "inflasi.json"

PRINCIPAL = 10_000_000
TAX = 0.20
# PP 131/2000 (pajak.go.id): the 20% final tax applies when deposits + savings exceed Rp 7,5 juta.
TAX_THRESHOLD = 7_500_000
FIRST_YEAR, LAST_FULL_YEAR = 2010, 2025
END_YM = (2026, 9)  # last month with official CPI data (BPS release 1 Okt 2026)

MONTHS_ID = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus",
             "September", "Oktober", "November", "Desember"]
MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


# ---------------------------------------------------------------- inflation (BI "Data Inflasi", BPS)
def read_bi_inflation(path):
    z = zipfile.ZipFile(path)
    strings = [re.sub(r"<[^>]+>", "", s) for s in
               re.findall(r"<si>(.*?)</si>", z.read("xl/sharedStrings.xml").decode("utf-8"), re.S)]
    sheet = z.read("xl/worksheets/sheet1.xml").decode("utf-8")
    yoy = {}
    for row in re.findall(r"<row[^>]*>(.*?)</row>", sheet, re.S):
        cells = []
        for m in re.finditer(r"<c ([^>]*?)(?:/>|>(.*?)</c>)", row, re.S):
            attrs, inner = m.group(1), m.group(2) or ""
            v = re.search(r"<v>([^<]*)</v>", inner)
            val = v.group(1) if v else ""
            if 't="s"' in attrs and v:
                val = strings[int(val)]
            cells.append(val)
        if len(cells) == 3 and cells[2].endswith("%"):
            mon, yr = cells[1].split()
            yoy[(int(yr), MONTHS_ID.index(mon) + 1)] = float(cells[2].rstrip(" %")) / 100
    return yoy


yoy = read_bi_inflation(DATA / "bi_data_inflasi_yoy_monthly.xlsx")
dec_infl = {y: yoy[(y, 12)] for y in range(FIRST_YEAR, LAST_FULL_YEAR + 1)}

# September 2026 BPS release, as reported in the press (BPS site blocks automated fetches).
news = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ",
              (DATA / "news_idxchannel_inflasi_sep2026.html").read_text(encoding="utf-8", errors="replace")))
m = re.search(r"tahun kalender \(year-to-date/y-to-d\) berada di posisi ([\d,]+) persen, sementara laju "
              r"inflasi secara tahunan \(year-on-year/y-on-y\) September 2026 menyentuh angka ([\d,]+) persen", news)
assert m, "Sep 2026 sentence not found in the IDX Channel article"
ytd_2026 = float(m.group(1).replace(",", ".")) / 100
yoy_sep2026 = float(m.group(2).replace(",", ".")) / 100
m2 = re.search(r"dari level ([\d,]+) pada Agustus 2026 menjadi ([\d,]+) pada September 2026", news)
ihk_aug2026, ihk_sep2026 = (float(x.replace(",", ".")) for x in m2.groups())
for other in ("news_investortrust_inflasi_sep2026.html", "news_pasardana_inflasi_sep2026.html"):
    txt = (DATA / other).read_text(encoding="utf-8", errors="replace")
    assert ("3,28%" in txt or "3,28 persen" in txt) and "112,31" in txt, f"{other} does not confirm 3,28% / IHK 112,31"
yoy[END_YM] = yoy_sep2026

# Cumulative price factor, Dec 2009 = 1
price = {(FIRST_YEAR - 1, 12): 1.0}
for y in range(FIRST_YEAR, LAST_FULL_YEAR + 1):
    price[(y, 12)] = price[(y - 1, 12)] * (1 + dec_infl[y])
price[END_YM] = price[(LAST_FULL_YEAR, 12)] * (1 + ytd_2026)

n_months = (END_YM[0] - FIRST_YEAR) * 12 + END_YM[1]  # Jan 2010 .. Sep 2026 inclusive
years = n_months / 12
pf_end = price[END_YM]
pf_2025 = price[(LAST_FULL_YEAR, 12)]
avg_infl = pf_end ** (1 / years) - 1
avg_infl_2025 = pf_2025 ** (1 / 16) - 1

# ---------------------------------------------------------------- World Bank cross-check
wb = {int(r["date"]): r["value"] for r in
      json.loads((DATA / "worldbank_FP.CPI.TOTL_IDN.json").read_text())[1] if r["value"] is not None}
wb_ratio = wb[2025] / wb[2010]
bps_dec2010_dec2025 = pf_2025 / price[(2010, 12)]


# ---------------------------------------------------------------- SEKI rate tables
def seki_series(path, wide_sheet, recent_sheet, group_label, tenor_label=None):
    """Monthly series {(y, m): annual rate as fraction} for one bank group (and tenor) row."""
    book = xlrd.open_workbook(str(path))
    out = {}
    for name, start_year in ((wide_sheet, 2010), (recent_sheet, 2025)):
        sh = book.sheet_by_name(name)
        month_row = next(r for r in range(sh.nrows) if sh.cell_value(r, 3) == "Jan")
        grp = next(r for r in range(sh.nrows) if str(sh.cell_value(r, 2)).strip() == group_label)
        row = grp if tenor_label is None else next(
            r for r in range(grp + 1, sh.nrows) if str(sh.cell_value(r, 2)).strip() == tenor_label)
        y = start_year - 1
        for c in range(3, sh.ncols):
            lab = str(sh.cell_value(month_row, c)).strip()
            if lab not in MONTHS_EN:
                if lab == "" and c > 3 and str(sh.cell_value(month_row, c - 1)).strip() in MONTHS_EN:
                    continue  # annual column (repeats December) or trailing blank
                if lab == "":
                    continue
                break
            if lab == "Jan":
                y += 1
            v = sh.cell_value(row, c)
            if isinstance(v, float):
                key = (y, MONTHS_EN.index(lab) + 1)
                if name == recent_sheet or key not in out:
                    out[key] = v / 100
    return out


sav = seki_series(DATA / "bi_seki_I30_suku_bunga_tabungan_rupiah.xls", "Th 2010-2024", "1.30", "Bank Umum")
dep1m = seki_series(DATA / "bi_seki_I28_suku_bunga_deposito_rupiah.xls", "Th 2010-2024", "1.28", "Bank Umum", "1 Bulan")
dep12m = seki_series(DATA / "bi_seki_I28_suku_bunga_deposito_rupiah.xls", "Th 2010-2024", "1.28", "Bank Umum", "12 Bulan")

# Sanity: Jan 2010 values visible in the PDF/xls header columns, and Aug 2026 in the PDF.
assert abs(sav[(2010, 1)] - 0.0308) < 1e-9 and abs(dep1m[(2010, 1)] - 0.0709) < 1e-9
assert abs(round(sav[(2026, 8)] * 100, 2) - 0.75) < 1e-9 and abs(round(dep1m[(2026, 8)] * 100, 2) - 5.08) < 1e-9

# ---------------------------------------------------------------- LPS guarantee rate (TBP)
lps = json.loads((DATA / "lps_tbp_listperiode.json").read_text())


def lps_rate(y, mth, d=1):
    day = f"{y:04d}-{mth:02d}-{d:02d}"
    live = [r for r in lps if r["startDate"][:10] <= day <= r["endDate"][:10]]
    return max(live, key=lambda r: r["startDate"])["rateUmum"] / 100


lps_now = max(lps, key=lambda r: r["startDate"])
assert lps_now["startDate"][:10] == "2026-10-01"

# ---------------------------------------------------------------- monthly simulation
months = [(FIRST_YEAR + (i // 12), i % 12 + 1) for i in range(n_months)]
last_seki = max(k for k in sav if k <= END_YM)


def rate_of(series, ym):
    return series[ym] if ym in series else series[last_seki]


products = {
    "kas": lambda ym: 0.0,
    "tabungan": lambda ym: rate_of(sav, ym),
    "deposito_lps": lambda ym: lps_rate(*ym),
    "deposito_bi": lambda ym: rate_of(dep1m, ym),
}
bal = {k: float(PRINCIPAL) for k in products}
bal_gross = {k: float(PRINCIPAL) for k in products}
year_start = {k: float(PRINCIPAL) for k in products}
year_start_gross = {k: float(PRINCIPAL) for k in products}
rates_month = []
yearly = []
for ym in months:
    row = {"ym": f"{ym[0]}-{ym[1]:02d}"}
    for k, f in products.items():
        r = f(ym)
        row[k] = round(r, 6)
        bal[k] *= 1 + r / 12 * (1 - TAX)
        bal_gross[k] *= 1 + r / 12
    rates_month.append(row)
    if ym[1] == 12 or ym == END_YM:
        y = ym[0]
        infl = dec_infl[y] if ym[1] == 12 else ytd_2026
        entry = {"year": y, "months": ym[1], "inflation": round(infl, 6),
                 "inflationBasis": "Des-Des y-on-y" if ym[1] == 12 else "y-to-d Jan-Sep 2026",
                 "priceFactor": round(price[ym], 6)}
        for k in products:
            net = bal[k] / year_start[k] - 1
            gross = bal_gross[k] / year_start_gross[k] - 1
            entry[k] = {"gross": round(gross, 6), "net": round(net, 6),
                        "realNet": round((1 + net) / (1 + infl) - 1, 6),
                        "valueNominal": round(bal[k]), "valueReal2010": round(bal[k] / price[ym])}
            year_start[k], year_start_gross[k] = bal[k], bal_gross[k]
        yearly.append(entry)

full_years = [e for e in yearly if e["months"] == 12]
beat = {k: sum(1 for e in full_years if e[k]["net"] > e["inflation"]) for k in ("tabungan", "deposito_lps", "deposito_bi")}
beat_years = {k: [e["year"] for e in full_years if e[k]["net"] > e["inflation"]] for k in beat}


def summary(k):
    v = bal[k]
    real = v / pf_end
    return {"valueNominal": round(v), "valueReal2010": round(real),
            "netPerYear": round((v / PRINCIPAL) ** (1 / years) - 1, 6),
            "grossValueNominal": round(bal_gross[k]),
            "grossPerYear": round((bal_gross[k] / PRINCIPAL) ** (1 / years) - 1, 6),
            "realPerYear": round((real / PRINCIPAL) ** (1 / years) - 1, 6),
            "realChange": round(real / PRINCIPAL - 1, 6),
            "grossValueReal2010": round(bal_gross[k] / pf_end)}


summ = {k: summary(k) for k in products}

# ---------------------------------------------------------------- current snapshot (the self-check)
lps_rate_now = lps_now["rateUmum"] / 100
snap = {
    "inflationYoy": yoy_sep2026, "inflationMonth": "2026-09",
    "lpsRate": lps_rate_now, "lpsPeriod": [lps_now["startDate"][:10], lps_now["endDate"][:10]],
    "lpsNet": round(lps_rate_now * (1 - TAX), 6),
    "lpsNetMinusInflation": round(lps_rate_now * (1 - TAX) - yoy_sep2026, 6),
    "lpsRealExact": round((1 + lps_rate_now * (1 - TAX)) / (1 + yoy_sep2026) - 1, 6),
    "seki1mRate": round(dep1m[last_seki], 6), "seki1mNet": round(dep1m[last_seki] * (1 - TAX), 6),
    "seki1mNetMinusInflation": round(dep1m[last_seki] * (1 - TAX) - yoy_sep2026, 6),
    "savingsRate": round(sav[last_seki], 6), "savingsNet": round(sav[last_seki] * (1 - TAX), 6),
    "savingsNetMinusInflation": round(sav[last_seki] * (1 - TAX) - yoy_sep2026, 6),
    "sekiMonth": f"{last_seki[0]}-{last_seki[1]:02d}",
}

out = {
    "principal": PRINCIPAL,
    "tax": TAX,
    "taxThreshold": TAX_THRESHOLD,
    "start": "2010-01", "end": f"{END_YM[0]}-{END_YM[1]:02d}", "months": n_months, "years": years,
    "sources": {
        "inflation": "BPS (via Bank Indonesia, Data Inflasi); Sep 2026: rilis BPS 1 Okt 2026",
        "savings": "Bank Indonesia SEKI I.30 (Bank Umum)",
        "deposit": "LPS Tingkat Bunga Penjaminan (bank umum, Rupiah); BI SEKI I.28 (Bank Umum, 1 bulan)",
        "tax": "PP 131/2000: PPh final 20% bunga deposito & tabungan, berlaku kalau total simpanan > Rp 7.500.000",
    },
    "inflation": {
        "basis": "BPS y-on-y Desember (Des-Des), 2010-2025, + y-to-d Jan-Sep 2026",
        "decDec": {str(y): dec_infl[y] for y in dec_infl},
        "ytd2026": ytd_2026, "yoySep2026": yoy_sep2026, "ihkAug2026": ihk_aug2026, "ihkSep2026": ihk_sep2026,
        "priceFactor": round(pf_end, 6), "priceRise": round(pf_end - 1, 6),
        "priceFactorDec2025": round(pf_2025, 6),
        "avgPerYear": round(avg_infl, 6), "avgPerYear2010to2025": round(avg_infl_2025, 6),
        "doublingYearsExact": round(math.log(2) / math.log(1 + avg_infl), 3),
        "doublingYearsRule72": round(72 / (avg_infl * 100), 3),
        "needToday": round(PRINCIPAL * pf_end), "realValueOf10jt": round(PRINCIPAL / pf_end),
        "needDec2025": round(PRINCIPAL * pf_2025), "realValueDec2025": round(PRINCIPAL / pf_2025),
        "maxYear": max(dec_infl, key=dec_infl.get), "minYear": min(dec_infl, key=dec_infl.get),
        "path": [{"ym": f"{k[0]}-{k[1]:02d}", "priceFactor": round(v, 6), "realValue": round(PRINCIPAL / v)}
                 for k, v in sorted(price.items())],
    },
    "crossCheck": {
        "worldBankCpi2010": wb[2010], "worldBankCpi2025": wb[2025], "worldBankRatio2025over2010": round(wb_ratio, 6),
        "worldBankRealValue": round(PRINCIPAL / wb_ratio), "worldBankAvg": round(wb_ratio ** (1 / 15) - 1, 6),
        "bpsDec2010toDec2025": round(bps_dec2010_dec2025, 6),
    },
    "summary": summ,
    "beatInflationYears": beat, "beatInflationYearList": beat_years, "fullYears": len(full_years),
    "snapshot": snap,
    "yearly": yearly,
    "monthlyRates": rates_month,
}
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps(out, indent=1, ensure_ascii=False), encoding="utf-8")

# ---------------------------------------------------------------- console report for facts.md
print(f"window Jan 2010 .. {END_YM}, {n_months} months = {years} years")
print("Dec-Dec:", {y: f"{v*100:.2f}" for y, v in dec_infl.items()})
print(f"ytd 2026 {ytd_2026:.4f}  yoy Sep {yoy_sep2026:.4f}  IHK {ihk_aug2026}->{ihk_sep2026} (m-to-m {ihk_sep2026/ihk_aug2026-1:.4%})")
print(f"price factor Dec2009->Sep2026 {pf_end:.6f} (+{pf_end-1:.2%}); ->Dec2025 {pf_2025:.6f}")
print(f"need today Rp {PRINCIPAL*pf_end:,.0f}; real value Rp {PRINCIPAL/pf_end:,.0f}; Dec2025 real Rp {PRINCIPAL/pf_2025:,.0f}")
print(f"avg infl {avg_infl:.4%} (to Dec2025 {avg_infl_2025:.4%}); doubling {math.log(2)/math.log(1+avg_infl):.2f} y, rule72 {72/(avg_infl*100):.2f}")
print(f"WB 2025/2010 {wb_ratio:.4f} real {PRINCIPAL/wb_ratio:,.0f} avg {wb_ratio**(1/15)-1:.4%}; BPS Dec2010->Dec2025 {bps_dec2010_dec2025:.4f}")
for k, s in summ.items():
    print(k, s)
print("beat inflation (full years):", beat, beat_years)
for e in yearly:
    print(e["year"], e["months"], f"infl {e['inflation']*100:5.2f}", " ".join(
        f"{k}: g{e[k]['gross']*100:5.2f} n{e[k]['net']*100:5.2f} r{e[k]['realNet']*100:6.2f}" for k in ("tabungan", "deposito_lps", "deposito_bi")))
print("snapshot", snap)
print("12m deposit Bank Umum Aug 2026:", dep12m[(2026, 8)])
print("wrote", OUT)
