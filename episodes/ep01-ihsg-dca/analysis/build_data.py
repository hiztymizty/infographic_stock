"""Turn Yahoo Finance ^JKSE monthly bars into the DCA dataset the video reads.

Usage: python -I episodes/ep01-ihsg-dca/analysis/build_data.py
Input:  episodes/ep01-ihsg-dca/data/jkse_raw.json  (Yahoo chart API, interval=1mo)
Output: src/episodes/ep01-ihsg-dca/data/dca.json
"""
import datetime as dt
import json
from pathlib import Path

EP = Path(__file__).resolve().parent.parent
ROOT = EP.parent.parent
MONTHLY = 5_000_000  # Rp per month
START = "2010-01"
WIB = dt.timezone(dt.timedelta(hours=7))

raw = json.loads((EP / "data" / "jkse_raw.json").read_text())["chart"]["result"][0]
quote = raw["indicators"]["quote"][0]
meta = raw["meta"]

months = []
units = 0.0
invested = 0
for ts, o, c, lo, hi in zip(raw["timestamp"], quote["open"], quote["close"], quote["low"], quote["high"]):
    ym = dt.datetime.fromtimestamp(ts, WIB).strftime("%Y-%m")
    if ym < START:
        continue
    # Buy on the first trading day of each month (monthly open).
    units += MONTHLY / o
    invested += MONTHLY
    months.append({
        "ym": ym,
        "open": round(o, 2),
        "close": round(c, 2),
        "invested": invested,
        "value": round(units * c),
    })

today_price = meta["regularMarketPrice"]
today_date = dt.datetime.fromtimestamp(meta["regularMarketTime"], WIB).strftime("%Y-%m-%d")
# The current month's bar is still forming; value it at the latest print.
months[-1]["close"] = round(today_price, 2)
months[-1]["value"] = round(units * today_price)

def annualized_return(months, final_value, as_of):
    """Money-weighted (XIRR) annual return: one contribution per month, valued at as_of."""
    end = dt.date.fromisoformat(as_of)
    years = [(end - dt.date.fromisoformat(m["ym"] + "-01")).days / 365.25 for m in months]

    def npv(r):
        return final_value - sum(MONTHLY * (1 + r) ** t for t in years)

    lo, hi = -0.5, 1.0
    for _ in range(100):
        mid = (lo + hi) / 2
        lo, hi = (mid, hi) if npv(mid) > 0 else (lo, mid)
    return (lo + hi) / 2


peak = max(months, key=lambda m: m["value"] - m["invested"])
worst = min(months, key=lambda m: m["value"] / m["invested"])
index_peak = max(months, key=lambda m: m["close"])

out = {
    "monthly": MONTHLY,
    "source": "Yahoo Finance ^JKSE monthly bars",
    "asOf": today_date,
    "units": round(units, 2),
    "avgPrice": round(invested / units, 2),
    "todayPrice": round(today_price, 2),
    "invested": invested,
    "value": months[-1]["value"],
    "annualized": round(annualized_return(months, months[-1]["value"], today_date), 4),
    "peak": {**peak, "annualized": round(annualized_return(
        months[: months.index(peak) + 1], peak["value"], peak["ym"] + "-28"), 4)},
    "worst": worst,
    "indexPeak": index_peak,
    "months": months,
}
dest = ROOT / "src" / "episodes" / EP.name / "data" / "dca.json"
dest.parent.mkdir(parents=True, exist_ok=True)
dest.write_text(json.dumps(out, indent=1))
print(f"{len(months)} months, invested {invested:,}, value {out['value']:,}, avg {out['avgPrice']}")
print("peak", peak["ym"], peak["value"], "worst", worst["ym"], worst["value"] / worst["invested"] - 1)
