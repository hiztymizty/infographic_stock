"""IHSG drawdowns: the 2026 drop, the recovery math, and every past crash of 40% or more.

Usage: python -I episodes/ep02-ihsg-balik-puncak/analysis/build_data.py
Input:  episodes/ep02-ihsg-balik-puncak/data/jkse_daily_raw.json    (Yahoo chart API ^JKSE, interval=1d, period1=0)
        episodes/ep02-ihsg-balik-puncak/data/jkse_monthly_raw.json  (Yahoo chart API ^JKSE, interval=1mo, period1=0)
Output: src/episodes/ep02-ihsg-balik-puncak/data/drawdown.json

Method
- Daily closing levels (price index, no dividends). Bars with a null close are skipped (Yahoo
  returns empty bars on some holidays). Dates are WIB (UTC+7).
- The last daily bar (today) has no close yet in the bar array; it is filled with
  meta.regularMarketPrice when meta.regularMarketTime is on that same WIB date and after 15:00 WIB.
- Peak = all-time-high close before the fall (running max). Underwater period = from that peak to
  the first later close >= the peak ("recovery"). Trough = lowest close inside the period.
  A "crash" is an underwater period whose trough is 40% or more below its peak.
- Recovery needed from a drop d (as a fraction) = 1 / (1 - d) - 1.
- Years = days / 365.25, months = days / 30.4375 (calendar days).
"""
import datetime as dt
import json
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
EP = Path(__file__).resolve().parent.parent
ROOT = EP.parent.parent
WIB = dt.timezone(dt.timedelta(hours=7))
CRASH = -0.40


def load(name):
    r = json.loads((EP / "data" / name).read_text())["chart"]["result"][0]
    return r, r["indicators"]["quote"][0]


# ---------- daily closes ----------
raw, q = load("jkse_daily_raw.json")
meta = raw["meta"]
days = []
for ts, c in zip(raw["timestamp"], q["close"]):
    d = dt.datetime.fromtimestamp(ts, WIB).date()
    days.append([d, c])
mt = dt.datetime.fromtimestamp(meta["regularMarketTime"], WIB)
filled_from_meta = False
if days[-1][1] is None and days[-1][0] == mt.date() and mt.hour >= 15:
    days[-1][1] = meta["regularMarketPrice"]
    filled_from_meta = True
days = [(d, c) for d, c in days if c is not None and c > 0]
first_day, as_of = days[0][0], days[-1][0]
latest = days[-1][1]

def yrs(a, b):
    return (b - a).days / 365.25

def mos(a, b):
    return (b - a).days / 30.4375

def need(dd):
    """Rise needed to undo a fall of dd (negative fraction)."""
    return 1 / (1 + dd) - 1

# ---------- underwater periods ----------
periods, cur = [], None
ath_d, ath_c = days[0]
for d, c in days:
    if c >= ath_c:
        if cur:
            cur["rec"] = (d, c)
            periods.append(cur)
            cur = None
        ath_d, ath_c = d, c
    else:
        if cur is None:
            cur = {"peak": (ath_d, ath_c), "trough": (d, c), "hit40": None}
        if c < cur["trough"][1]:
            cur["trough"] = (d, c)
        if cur["hit40"] is None and c / ath_c - 1 <= CRASH:
            cur["hit40"] = (d, c)
if cur:
    cur["rec"] = None
    periods.append(cur)

LABELS = {1990: "Awal 1990-an", 1997: "Krismon 1997–98", 2008: "Krisis global 2008",
          2018: "COVID 2020", 2026: "2026"}
crashes = []
for p in periods:
    (pd, pc), (td, tc) = p["peak"], p["trough"]
    dd = tc / pc - 1
    if dd > CRASH:
        continue
    rec = p["rec"]
    end = rec[0] if rec else as_of
    item = {
        "label": LABELS.get(pd.year, str(pd.year)),
        "peakDate": str(pd), "peak": round(pc, 2),
        "troughDate": str(td), "trough": round(tc, 2),
        "drawdown": round(dd, 4),
        "needToRecover": round(need(dd), 4),
        "fallDays": (td - pd).days, "fallMonths": round(mos(pd, td), 1), "fallYears": round(yrs(pd, td), 2),
        "hit40Date": str(p["hit40"][0]), "daysToMinus40": (p["hit40"][0] - pd).days,
        "recovered": rec is not None,
        "recoveryDate": str(rec[0]) if rec else None,
        "recoveryClose": round(rec[1], 2) if rec else None,
        "peakToRecoveryYears": round(yrs(pd, end), 2),
        "troughToRecoveryYears": round(yrs(td, end), 2),
        "peakToRecoveryMonths": round(mos(pd, end), 1),
        "troughToRecoveryMonths": round(mos(td, end), 1),
        "dataNote": None,
    }
    if pd < first_day + dt.timedelta(days=365):
        item["dataNote"] = f"Yahoo daily data starts {first_day}; the real pre-crash peak may be earlier/higher"
    crashes.append(item)

c26 = crashes[-1]
assert c26["peakDate"].startswith("2026") and not c26["recovered"]

# COVID: the fall itself (from the 2020 high, not the 2018 all-time high)
covid = next(c for c in crashes if c["label"] == "COVID 2020")
y2020 = [(d, c) for d, c in days if d.year == 2020 and str(d) < covid["troughDate"]]
h20d, h20c = max(y2020, key=lambda x: x[1])
covid_2020 = {"highDate": str(h20d), "high": round(h20c, 2),
              "drawdown": round(covid["trough"] / h20c - 1, 4),
              "fallDays": (dt.date.fromisoformat(covid["troughDate"]) - h20d).days}

# ---------- 2026 now ----------
peak26, low26 = c26["peak"], c26["trough"]
end2025 = [c for d, c in days if d.year == 2025][-1]
now = {
    "asOf": str(as_of), "latest": round(latest, 2), "filledFromMeta": filled_from_meta,
    "vsPeak": round(latest / peak26 - 1, 4),
    "vsLow": round(latest / low26 - 1, 4),
    "needToPeak": round(peak26 / latest - 1, 4),
    "shareOfDropRecovered": round((latest - low26) / (peak26 - low26), 4),
    "ytd": round(latest / end2025 - 1, 4), "close2025": round(end2025, 2),
}
after = [(d, c) for d, c in days if str(d) > c26["troughDate"]]
hi_after = max(after, key=lambda x: x[1])
now["highSinceTrough"] = {"date": str(hi_after[0]), "close": round(hi_after[1], 2),
                          "vsLow": round(hi_after[1] / low26 - 1, 4)}

# ---------- asymmetry table ----------
asym = [{"drop": -x, "need": round(need(-x), 4), "label": None}
        for x in (0.10, 0.20, 0.30, 0.50)]
asym.append({"drop": c26["drawdown"], "need": c26["needToRecover"], "label": "2026"})
asym.append({"drop": -0.65, "need": round(need(-0.65), 4), "label": None})
asym.sort(key=lambda r: -r["drop"])

# ---------- ep01 tie-in: monthly closes ----------
mraw, mq = load("jkse_monthly_raw.json")
months = []
for ts, c in zip(mraw["timestamp"], mq["close"]):
    if c is None:
        continue
    months.append((dt.datetime.fromtimestamp(ts, WIB).strftime("%Y-%m"), c))
done = [m for m in months if m[0] < as_of.strftime("%Y-%m")]  # complete months only
mpeak = max(done, key=lambda m: m[1])
mlow = min((m for m in done if m[0] > mpeak[0]), key=lambda m: m[1])
monthly = {
    "peakMonth": mpeak[0], "peak": round(mpeak[1], 2),
    "lowMonth": mlow[0], "low": round(mlow[1], 2),
    "drawdown": round(mlow[1] / mpeak[1] - 1, 4),
    "dailyPeakAboveMonthlyPeak": round(peak26 / mpeak[1] - 1, 4),
    "jan2026Close": round(dict(done)["2026-01"], 2),
}

# ---------- chart series ----------
weekly, wk = [], None
for d, c in days:
    k = d.isocalendar()[:2]
    if k != wk:
        weekly.append([str(d), round(c, 2)])
        wk = k
    else:
        weekly[-1] = [str(d), round(c, 2)]
recent = [[str(d), round(c, 2)] for d, c in days if d >= dt.date(2025, 12, 1)]

# ---------- reference checks (printed, also stored) ----------
REF = {"1997-07-08": 740.83, "1998-09-21": 256.83, "2008-01-09": 2830.26, "2008-10-28": 1111.39,
       "2018-02-19": 6689.29, "2020-03-24": 3937.63, "2026-01-20": 9134.70,
       "2019-12-30": 6299.54, "2023-12-29": 7272.80, "2024-12-30": 7079.90, "2025-12-30": 8646.94}
dmap = {str(d): c for d, c in days}
checks = {k: {"expected": v, "yahoo": round(dmap[k], 2), "ok": abs(dmap[k] - v) < 0.01} for k, v in REF.items()}
jumps = []
for (d0, c0), (d1, c1) in zip(days, days[1:]):
    if abs(c1 / c0 - 1) > 0.08:
        jumps.append([str(d1), round(c1 / c0 - 1, 4)])

out = {
    "source": "Yahoo Finance ^JKSE (IDX Composite), daily closes",
    "asOf": str(as_of), "firstDay": str(first_day), "tradingDays": len(days),
    "now": now,
    "crash2026": c26,
    "crashes": crashes,
    "covid2020Phase": covid_2020,
    "asymmetry": asym,
    "monthlyBasis": monthly,
    "referenceChecks": checks,
    "dailyMovesOver8pct": jumps,
    "weekly": weekly,
    "recentDaily": recent,
}
dest = ROOT / "src" / "episodes" / EP.name / "data" / "drawdown.json"
dest.parent.mkdir(parents=True, exist_ok=True)
dest.write_text(json.dumps(out, indent=1))

print(f"{len(days)} days {first_day} .. {as_of} latest {latest:.2f} (meta fill: {filled_from_meta})")
for c in crashes:
    print(json.dumps({k: c[k] for k in c}, ensure_ascii=False))
print("covid 2020 phase", covid_2020)
print("now", json.dumps(now))
print("monthly", monthly)
print("asym", asym)
print("checks all ok:", all(v["ok"] for v in checks.values()), [k for k, v in checks.items() if not v["ok"]])
print("jumps >8%:", jumps)
