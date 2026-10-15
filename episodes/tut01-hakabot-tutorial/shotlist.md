# tut01 · Shot list (producer, 14 Okt 2026)

Source of truth for the tutorial edit. Built from the user's guide (`temp/script.txt`) and a full frame-by-frame
watch of the three recordings (1 frame / 2 s overview, full-res checks). Times are **source seconds (m:ss)** and
are accurate to about ±2 s; the edit refines them frame-exact. Every beat becomes one scene in `script.json`
(scene id = beat id). "Explain" is the content the narration must cover (from the user's guide); "Do" is the
click path the viewer should learn.

Sources
- **M** = `temp/2026-10-14 11-19-35.mp4` (22:14, 1920×1080, 30 fps). Account shown: "HakaBot Trading" (company account; keep).
- **H** = `temp/2026-10-14 11-42-10.mp4` (1:19). HB Center with a subscribed account. **Blur the account name "poppyzagamer" (top-right, ~1770–1910 × 18–50).**
- **A** = `temp/2026-10-14 23-28-47.mp4` (0:13, added 14 Okt). Display capture of the Watchlist Acc/Dist hover tooltips (the main recording's hover shows none). Same treatment as P: crop to the browser viewport, cut OBS at 0:00–0:01, blur the account name.
- **P** = `temp/2026-10-14 21-49-53.mp4` (0:20). Display capture of the PEP list with hover tooltips. **Crop to the browser
  viewport** (the browser tab strip at the top and the Windows taskbar at the bottom are personal); cut the OBS window at 0:00–0:01 and 0:19–0:20; blur the account name.

User decisions (14 Okt): ElevenLabs Bahasa voice; tickers, companies, institutions **and** individual names stay
readable (only account names / browser tabs / taskbar are hidden); HB Center shown in full; one long YouTube video
(16:9) with chapter timestamps. Target length ≈ 14–18 min. Skip Float Composition by Investor Type (buggy: >100%).

Layout facts: the app fills x ≈ 280–1630, y ≈ 0–990 of the 1920×1080 frame (y > 990 is black). Text is crisp at full
res, so 1,5–2× zooms stay sharp. Nav bar (y ≈ 15–55): Dashboard · Watchlist · HB Center · Screener · Stock · Index ·
Composition · Subscription · Resources.

Neutral wording: describe how to read what's on screen, never "this stock is good / a buy". The user's guide says
"PTBA seems promising" and "ERAA … candidate for High Tight Flag": phrase as "contoh cara baca", not a call.
Disclaimer "Bukan rekomendasi investasi" on screen in the intro and the end card.

---

## 0 · Intro (code-made title card + nav bar)
| id | Source | Show | Explain |
|---|---|---|---|
| intro-1 | title card | "Tutorial Hakabot" | What Hakabot is: tools to find and analyze IDX stocks yourself (Bandarmology, chart indicators, composition, screener, fundamental) + a Signal plan where Hakabot sends ready signals (HB Center). What this video covers (chapter list). |
| intro-2 | M 0:02 (still) | zoom on the top nav bar, highlight each menu as it's named | Every page lives in this top menu; we go through them in order. |

## 1 · Dashboard (M 0:00–0:26)
| id | Source | Show / zoom | Explain · Do |
|---|---|---|---|
| dash-1 | M 0:00–0:04 | Announcements panel | Admin announcements: reminders and news for users. |
| dash-2 | M 0:00–0:02 (hold) | plan badge top-right "Pro · Renews 5 Nov 2026" | Your plan type and when it renews. |
| dash-3 | M 0:04–0:08 | Quick View: HB Center · Screener Tier S · Perubahan | Quick summary of the screener, signals and latest composition changes. |
| dash-4 | M 0:06–0:09, 0:16–0:18 | Telegram / Discord cards | Join the Hakabot community to discuss and ask about the market and the app. **Cut** 0:09–0:16 (Telegram page opened) and 0:24 (light-mode flash). |

## 2 · Watchlist (M 0:26–1:52)
| id | Source | Show / zoom | Explain · Do |
|---|---|---|---|
| watch-1 | M 0:26–0:32 | groups list left, table | Click **Watchlist**. Stocks are grouped (left); each group has its own list. |
| watch-2 | M 0:32–0:42 | column headers | Click a column (Last, %, Volume, Value…) to sort. |
| watch-3 | M 0:43–0:53 | **Charts** toggle → mini chart cards | Charts = a "drone view" of every stock in the group, to screen out bad charts fast. |
| watch-4 | M 0:54–1:22 | **Acc/Dist** toggle → 5 days of squares; hover tooltip ~0:58–1:12 | Bandarmology of the last 5 days. Left square = top-5 buy brokers vs top-5 sell brokers (green = buyers win). Right square = number of unique buying vs selling brokers (green = fewer buyers than sellers, i.e. buying concentrated in a few hands). Hover a square for the detail. ⚠ The user's guide says "left" twice; producer reads the 2nd as the right square, confirm at Gate 2. |
| watch-4b | A 0:01–0:10 | BREN tooltips: 13 Okt +Rp 2.4B / 15 beli vs 30 jual (both Acc), 12 Okt −Rp 5.0B / 39 vs 16 (both Dist), 09 Okt −Rp 110.9M (Dist) / 18 vs 23 (Acc) | Worked example of reading the squares. User confirmed the right-square reading 14 Okt. |
| watch-5 | M 1:24–1:40 | new group "Blue chip" → search & add BBCA → delete | Add a group, add stocks via search, delete a stock. |
| watch-6 | M 1:44–1:50 | Rename watchlist dialog | Rename a group. (Cut 1:40–1:43 loading skeleton.) |

## 3 · Index (M 1:57–4:12)
| id | Source | Show / zoom | Explain · Do |
|---|---|---|---|
| idx-1 | M 1:57–2:00, then jump to 2:18–2:26 | click **Index**; IHSG chart, clean | Index page = IHSG. User asked: **cut to the decluttered chart** (indicators off, zoomed in), then add indicators one by one. |
| idx-2 | M 2:26–2:31 | Indicators menu → **S/R** | S/R draws strong support/resistance; right now none shows. |
| idx-3 | M 2:31–2:36 | **Tren**: blue line sloping down | Blue = weekly support trendline. |
| idx-4 | M 2:36–2:45 | **Cumulative** overlay line | Cumulative foreign flow; it keeps going down = foreign selling consistently. |
| idx-5 | M 2:46–3:06 | Sector Foreign Flow panel; hover pink line = Infrastructure; double-click its dot ~3:03 | Foreign flow per IHSG sector. Double-click a legend dot to show only that sector. |
| idx-6 | M 3:06–3:10 (hold) | Index Health row: Downtrend · 35,4% below 52w high · Danger | Index health: trend, distance from the 52-week high, foreign-flow status. |
| idx-7 | M 3:08–3:34 | RRG · Rotasi Sektor vs Pasar | Momentum per sector: top-left = starting to gain momentum, top-right = accelerating uptrend, bottom-right = starting to slow, bottom-left = weak momentum (downtrend). |
| idx-8 | M 3:34–3:44 | click Finance → its stocks as nodes (BBRI, BBCA…); Infrastructure 3:40 | Click a sector to see its stocks on the same map: find the strongest stock in the strongest sector. |
| idx-9 | M 3:44–3:50 | sector chips below the chart | Toggle sectors on/off with the chips. |

## 4 · Stock page: chart & indicators (M 4:16–8:52, stock ERAA)
| id | Source | Show / zoom | Explain · Do |
|---|---|---|---|
| stock-1 | M 4:16–4:18, jump to 4:22–4:26 | click **Stock**, search a ticker; **cut to the clean chart** | Stock page; start from a clean chart. |
| stock-2 | M 4:26–4:32 (hold) | right panel: Value/Freq/Volume + **Stock Health** (Trend Uptrend, MA Above, Bandar Moderate, ATH No, RS 88, VP Neutral) + 52W range + S/R levels R 645 / S 350 | Stats + Stock Health. **RS = Relative Strength rating like Mark Minervini's and William O'Neil's: 1–99, how the stock performed vs all other stocks over the past year (recent months weigh more); 88 = beat 88% of stocks.** S/R levels = nearest strong support/resistance. |
| stock-3 | M 4:32–4:46 | **Tech** menu: MA50, MA100, MA200, Vol MA | Moving averages + volume MA. |
| stock-4 | M 4:46–4:58 | **AVWAP** dashed line; **IHSG** overlay | AVWAP anchors itself automatically (no guessing where to anchor). IHSG overlay compares the stock to the index: ERAA held/consolidated while IHSG fell. |
| stock-5 | M 5:00–5:06 | **S/R**: line at 645 | Strong resistance around 645. |
| stock-6 | M 5:06–5:40 | **Tren**: yellow + blue (weekly) | Weekly trendlines yellow (resistance) / blue (support); daily ones are green / red. Footage zooms out 5:14–5:40: trim to ≤ 8 s. |
| stock-7 | M 5:20–5:28 | **Breakout**: yellow candle in August | Breakout candle colored yellow; price rallied after it. |
| stock-8 | M 5:46–6:22 | **Flow** menu: Bandar, Retail, Foreign, SM Local (one at a time) | Bandar = overall bandarmology (strong up = good sign). Retail line falling = fewer retail "dead weight". Foreign = foreign flow line. SM Local = local smart money (bandar lokal), recently up. |
| stock-9 | M 6:24–6:46 | **Stats** → **Insider**: arrow 21 Mar (footage zooms out to 2025, 6:28–6:40) | Insider arrows: green up = a major holder (> 1% / 5%) added to their position. |
| stock-10 | M 6:48–7:28 | **Drivers**: click start candle, end candle (early Jun → early Sep); panel AK 32% +99B · YU 16% · BK 14% · LG 13% + grid | Drivers = broker summary of the chosen range: who drove the move, % impact, net value, per-candle grid (green/blue = buying, red/purple = selling). AK steady green/blue all the way up; LG green only at the end (recent accumulator, still impactful). |
| stock-11 | M 7:30–8:52 | Drivers on the consolidation range | AK taking some profit (more red/purple), BK the biggest accumulator in the consolidation. Trim heavily (much hovering). |

## 5 · Bandarmology: Data Flows, broker summary, POSITION, Broker Activity (M 8:52–13:26)
| id | Source | Show / zoom | Explain · Do |
|---|---|---|---|
| flow-1 | M 8:52–9:20 | **Data Flows** under the chart: Bandar / Retail / Foreign / SM Local histograms | Same flows as histograms instead of overlay lines. |
| flow-2 | M 9:20–9:58 | SM Local yellow bars; hover note top-left "Pola broker ritel tidak biasa: CP"; CP badge | Yellow = anomaly in a retail broker's behaviour in that period (volume, frequency…); here CP, in October. |
| bsum-1 | M 9:58–10:24 | two tables **START RANGE / END RANGE** | Two broker summaries; they work the same, use either. |
| bsum-2 | M 10:24–11:32 (cut to essentials) | set the uptrend period in START RANGE; TOP 1 / TOP 3 / TOP 5 at the bottom | TOP 1/3/5 show how strong the accumulation was. Date-picking 10:30–11:30 is slow: keep only the clicks. |
| pos-1 | M 11:34–12:14 | **POSITION** table after setting the consolidation period in END RANGE | POSITION combines both ranges: how much each broker exited/added in the end range, the profit on what they sold, how much they added and at what price. |
| act-1 | M 12:36–13:08 | **Broker Activity** (bottom of page): lines per broker | Impactful brokers' positions over time: AK drove the big September candle, now flat / selling into profit; YU flat; BK and KI still accumulating. |
| act-2 | M 13:08–13:20 | add broker **CP** | Add brokers not listed by default (e.g. the anomaly broker CP). |

## 6 · Composition (M 13:28–18:00)
| id | Source | Show / zoom | Explain · Do |
|---|---|---|---|
| comp-1 | M 13:28–14:00 | click **Composition**; Holder Network | Network of holders and the other stocks they're connected to. |
| comp-2 | M 14:00–14:22 | **Ownership Composition donut**: Local vs Foreign; Local breakdown (14:06), Foreign breakdown (14:16) | Explain and highlight the donut: share local vs foreign, then by investor type. User asked for extra emphasis here. |
| comp-3 | M 14:24–15:00 | **Composition Over Time**: Foreign up, Local down; Foreign tab → Bank rising (14:50); Local tab → Individual falling (14:56) | Locals (individuals) selling into foreigners (banks). |
| — | M 15:02–15:36 | Float Composition by Investor Type | **SKIP** (buggy, shows > 800%). |
| comp-4 | M 15:38–16:24 | **Kepemilikan Signifikan** + **Perubahan Pemegang Saham** | Major holders; latest ownership changes in this stock. |
| comp-5 | M 16:26–16:40 | **Per Investor** → JP Morgan Securities PLC, expand card | Expand an investor to see their other holdings besides ERAA. |
| comp-6 | M 16:40–16:54 | search "Lo Kheng Hong" | Search any name. |
| comp-7 | M 16:56–17:16 + **P 0:01–0:18** | filter **PEP**; hover the PEP / KONGLO badges (tooltips, from clip P) | Filter by type: PEP = politically exposed persons; hover a badge to see why someone is tagged PEP / Konglo. |
| comp-8 | M 17:18–17:42 | Konglo, BUMN, Sovereign filters | Other types. Trim. |
| comp-9 | M 17:44–18:00 | **Perubahan** sub-page: market-wide ownership changes; ENRG / CGS International Sekuritas Indonesia adding ≈ 2% | Latest ownership changes across all stocks. |

## 7 · Screener → stock analysis → Fundamental (M 18:00–22:02)
| id | Source | Show / zoom | Explain · Do |
|---|---|---|---|
| scr-1 | M 18:02–18:22 | click **Screener**; presets; **Breakout** → TEBE tier S; **Charts** toggle | Ready-made screeners; Charts mode to skim the results. |
| scr-2 | M 18:24–18:44 | click TEBE → its stock page; yellow breakout candle | Clicking a result opens its stock page. |
| scr-3 | M 18:46–19:08 | **Uptrend Fase 2** → many results; Charts mode | Charts mode shows which ones aren't worth a look. |
| scr-4 | M 19:10–19:50 | PTBA page: yellow breakout candle; Tren = green daily trendline; Bandar good; price retracing to the breakout level | Example walkthrough of how to read one stock with the tools (neutral wording). |
| scr-5 | M 19:52–20:22 | Drivers: AK, KZ, YU, BB; AK grid red lately | AK most impactful but selling recently → why price is retracing. |
| scr-6 | M 20:24–20:52 | SM Local data flow up; LG anomaly | |
| scr-7 | M 20:58–21:26 | Broker Activity: AK selling recently | Confirms what Drivers showed. |
| fund-1 | M 21:28–21:46 | **Fundamental** tab: key stats (market cap, PE, net margin…); Kualitas Fundamental **B, skor 72/100** (Piotroski, Pertumbuhan…); **Rentang Wajar** (Graham Number, PER/PBV historis, DCF…): price still inside the fair range | |
| fund-2 | M 21:46–22:02 | scroll: financial statements + chart with key-stat overlays | For manual analysis. |

## 8 · HB Center (clip H 0:00–1:18; main M 22:04–22:14 shows the "Subscribe to Signal Plan" state)
| id | Source | Show / zoom | Explain · Do |
|---|---|---|---|
| hb-1 | M 22:04–22:12 | HB Center without the Signal plan: Subscribe buttons | HB Center needs the Signal plan (optional). |
| hb-2 | H 0:00–0:22 | Strategy vs IHSG chart; setup tabs (0:16–0:22: HK-Reversal, HK-Lanjutan, HK-LotBesar); Performance table | How HB Center signals performed vs IHSG, and per setup. |
| hb-3 | H 0:28–0:44 | Live signals; **Active signals**: entry date, days held, stop, unrealized | The Hakabot portfolio: open signals with entry, holding days, stop loss. |
| hb-4 | H 0:44–1:15 | **Trade history**, paging back | Closed trades: this year has been rough (many reds), earlier years show big wins (good RR) and smaller losses. Honest, no promise of returns. |

## 9 · End
| id | Source | Show |
|---|---|---|
| end | code-made end card | hakabot.com, Subscription, Telegram/Discord, "Bukan rekomendasi investasi". Standard 20 s outro (`hakabot-outro`) is a non-negotiable for shorts; for this tutorial the producer suggests the end card only (the outro tour repeats features just shown): ask the user at Gate 2. |
