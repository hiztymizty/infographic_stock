# Outro recordings: shot log and EDL

Source material for the shared Hakabot outro (`hakabot-outro`). Recordings A and B are 1280×720, 30 fps
and are **retired**: the user deleted them from `outro_raw/` on 12 Okt 2026 (they're still in git history,
and the v2 clips were removed when v3 was cut). **Recording C**
(1920×1080, 30 fps) and **Recording D** (1920×1080, 6,9 s, POSITION) are the sources of the current edit (v3.3, below). All times are seconds in the raw
recording and all boxes are `x, y, w, h` in recording pixels. Times were found by stepping through the footage (1 s overview,
0.25 s full-res around interactions, then frame-exact 30 fps diffs of the regions that change), so
click times are accurate to one frame.

The cut list lives in `src/core/brand/outroClips.json` (read by `scripts/outro_clips.py`, which
cuts `public/outro/<clip>.mp4`, and by `outroConfig.ts`). The edit itself (segments, speed, camera,
highlights, blur) is `OUTRO_GROUPS` in `src/core/brand/outroConfig.ts`.

---

## Recording A · `2026-10-09 18-35-30.mp4` (124,2 s) · RETIRED (deleted from outro_raw 12 Okt)

App only (no browser chrome): the app window fills the frame inside a ~12 px dark border
(content `14, 14, 1252, 692`). Stock page of **ASLI**, with a sticky nav bar.

### Identifiers

| What | Box | When visible |
|---|---|---|
| Account name "Jonathan Andrew" + avatar "JA" (sticky nav) | `1118, 16, 150, 46` | every frame |
| Stock identity: logo, ticker **ASLI**, "Asri Karya Lestari Tbk · IDX" | `108, 56, 176, 66` | 0–74 s and 119,5–124 s (page at top) |
| Price "478 IDR +3,02% +14" (top right) | `1090, 75, 90, 50` | same as above. Not a name, but identifying together with the chart: the edit never frames it |
| Stock Health badge "SAHAM GORENGAN" | `940, 330, 100, 16` | 0–74 s. Not an identifier; only its left edge reaches the frame (flow-chart shot) |
| Broker codes (AK, YU, ZP, XL, LG, CC…) in Drivers / broker summary / broker activity | – | brokerage codes, not personal or stock identifiers: left visible (as in the previous outro) |

No ticker or name appears in the broker summary (76–112 s) or broker activity (112–119 s) views.

### Shot log

| Time | On screen / action | Use? |
|---|---|---|
| 0–3,0 | Stock page at top: chart (1D) with Tech 4 / Flow / Stats / BBK menus, Stock Health panel. Idle. | cut |
| 3,0–3,5 | Tech menu: indicators toggled (chart redraws at 3,00, 3,25, 3,50). Menu closes. | weak (tiny change) |
| 3,5–8,3 | Tech menu re-opened (MA50, MA100 off; MA200, Vol MA50, AVWAP on), cursor hovering, **idle** | cut |
| **8,333** | **Click Flow**: Tech menu closes, Flow menu opens (Bandar, Retail ✓, Foreign, SM Local) | – (menu already open in the edit) |
| 8,4–10,0 | cursor travel inside the menu | cut |
| 10,067 | Retail toggled off (Retail line disappears) | – |
| 10,1–11,3 | cursor travel | cut |
| **11,30** | **Foreign on** → Foreign flow line + "Foreign" axis tag (`819, 379`) appear on the chart | ✔ flow-menu + flow-chart |
| 12,53 | Foreign off | – |
| **13,733** | **SM Local on** → SM Local line + tag (`818, 389`) | ✔ flow-chart |
| 15,00 | SM Local off | – |
| **16,333** | **Bandar on** → Bandar line swings across the chart + tag (`824, 469`); off again at 17,23 (on screen < 1 s) | spare |
| 17,23 | Bandar off; 17,5–18,5 menu closes | – |
| 18,5–33,6 | Idle: cursor wanders, crosshair hovers, Stats menu peeks (21–23, 33) | cut |
| 33,63 | Stats menu opens (HB Signals, Drivers, Insider) | – |
| **35,833** | **Click Drivers** → hint "Klik candle awal untuk mulai analisa range" | spare (cut 10 Okt) |
| 37,67 | menu closes | – |
| **37,867** | **Click start candle** (20 Aug '26): vertical marker | spare (cut 10 Okt) |
| 38,1–40,4 | crosshair hover over candles (11 Sep, 29 Sep, 08 Okt) | cut |
| **40,433** | **Click end candle** → range shaded (20 Agu → 08 Okt, 27 hari) + **Drivers panel** `128, 268, 274, 82`: AK 23% +7,7B TAKING PROFIT · YU 11% +27B AKUMULASI · ZP 9% +2,2B CUT LOSS | spare (cut 10 Okt) |
| 41–46,3 | hover inside the range; 43,8–44,5 Stats menu; 46,3 range cleared | cut |
| 47–73 | BBK menu: candle colouring modes switched (≈52, ≈61, VPA at ≈67); 50–53 chart dragged/zoomed | spare (BBK colouring) |
| 73–76 | **scroll** down | cut |
| 76–95,8 | Broker summary (Mode Net/Gross, TRX, Origin; START RANGE / END RANGE tables, TOP 1/3/5 ACC/DIST): cursor travel, date pickers opened | cut |
| **96,367** | **Start range table fills in** (09/01 → 10/05): TOP 1/3/5 **DIST** (`500, 553, 104, 72`) | spare (cut 10 Okt) |
| 97,1–99,8 | end-range date picker: mouse travel, typing | cut |
| **102,20** | **End range table updates** (10/06 → 10/08): TOP 1 / TOP 3 **ACC** (`1030, 553, 104, 50`) | spare (cut 10 Okt) |
| 103–112,9 | **scroll** through Huge Nego / Foreign flow | cut |
| 112,2–114,1 | scroll settles on Broker Activity | cut |
| **114,1–118,7** | **Broker Activity** chart (price + cumulative lines XL, LG, YU, GR, CC; tags `1090, 336, 38, 226`), static | ✔ broker-activity |
| 118,7–120 | fast scroll back to top | cut |
| 120–124,2 | page top again (ASLI header, search box) idle | cut |

## Recording B · `2026-10-10 11-54-43.mp4` (89,9 s) · RETIRED (deleted from outro_raw 12 Okt)

Browser screen capture. **Never shown:** the tab strip (y 0–40: "HAKABot — Bandarmology &…",
"how to know if i got shadow b…", "What is shadow ban and how d…", "Check your Account Status on I…",
"New Tab") and the URL bar (y 40–70, e.g. `hakabot.com/composition?tab=ringkasan&stock=ASLI`, VPN,
profile). The app is `14, 84, 1252, 582` (nav bar y 89–130); y > 668 is a black strip. The outro's
camera is clamped to the app box, so the chrome can't come into frame.

### Identifiers

| What | Box | When visible |
|---|---|---|
| Account "Jonathan Andrew" + avatar "JA" (sticky nav) | `1114, 89, 152, 40` | every frame |
| Tab strip + URL bar (contain `stock=ASLI`, personal tab titles) | `0, 0, 1280, 72` | every frame: cropped out |
| Screener results table: stock logos + tickers (Dekat Support 2 rows, Breakout TEBE, Uptrend Fase 2 SINI, PACK, TINS…) | `182, 526, 98, 146` | 0–8,93 |
| Screener chart cards: ticker label of each card | row 1 before scroll `x∈{186,414,643,871}, 512, 68, 26` | 8,9–9,9 |
| same after the scroll: SINI PACK TINS SRSN / ERAA ULTJ AADI PTBA / EMAS | `x∈{186,414,643,871}, y∈{199,355,504}, 68, 27` | 10,05–13 |
| Composition header: logo + ticker (ASLI, then **BBRI**) | `172, 260, 106, 50` | page top: 16–19, 28,5–32,6, 59–61 |
| Search box ticker badge "BBRI" | `344, 176, 50, 30` | page top, from 31,1 on |
| Holder Network: every node labelled with a ticker or holder name | `178, 358, 458, 310` | 31,5–32,6, 59–61 |
| Major holders (Danantara, INA, EPF, BPJS…), investor list (5.178 investors), "DRS LO KHENG HONG" holdings, changes table tickers (MSIN, NSSS, KPIG, BMTR, RLCO…) and investor names | – | 44–89: **not used** (names everywhere, fine print, scrolling) |

### Shot log

| Time | On screen / action | Use? |
|---|---|---|
| 0–4,07 | Screener: presets "Pola Teknikal" (Dekat Support ✓, VCP, HTF, Breakout, Uptrend Fase 2) and "Peringkat Aliran Dana" (Retail Jualan, Local Serap Foreign, Bandarmology); 2-row result table | – |
| 4,067 | click Breakout → 1 result (TEBE) | – |
| 4,1–5,9 | cursor travel to Uptrend Fase 2 | cut |
| **5,967** | **Click Uptrend Fase 2** → 9 results (SINI, PACK, TINS…) | ✔ screener-presets |
| 6,0–8,8 | cursor travel to the Charts toggle | cut |
| **8,90** | **Click "Charts"** → results turn into cards whose mini charts load (8,95–9,8) | ✔ screener-charts |
| 9,87–10,13 | **scroll** down | cut (hidden in a whip-pan) |
| 10,13–11,6 | full card grid: 4 + 4 + 1 cards with price + MA lines (static) | ✔ screener-charts |
| 11,6–14,4 | scroll up, scroll, idle | cut |
| 15,40 | click "Composition" in the nav | – |
| 16–18,5 | Composition page of ASLI loads: small holder network, 100% donut | – |
| 19–28,5 | scroll through ASLI composition over time + float composition, back up | cut |
| 30,4–31,1 | search box: BBRI selected | cut |
| **31,47–32,6** | **BBRI Holder Network draws itself** (≈50 nodes, investors around the centre) + Ownership Composition donut 46,8% scripless, Local 43,9% / Foreign 56,1% | spare (cut 10 Okt) |
| 32,63–34,4 | **scroll** to Composition Over Time | cut |
| 34,4–35,8 | composition-over-time (Local vs Foreign, 2 lines), idle | – |
| **35,80** | **Click "Local"** → lines per local investor type (individu, reksadana, asuransi…) | spare (cut 10 Okt) |
| 36,9–39,7 | hover tooltips | cut |
| **39,833** | **Click "Foreign"** → lines per foreign investor type | spare (cut 10 Okt) |
| 40,2–42 | hover | – |
| 42–58 | scroll: Float Composition by Investor Type bars (43–53), Kepemilikan Signifikan (54), Perubahan Pemegang Saham timeline (55–57) | spare (names everywhere) |
| 58–61 | back to top (BBRI network) | – |
| 61,1 | click "Per Investor" → investor list (UOB Kay Hian, Bank of Singapore…) | – |
| 62–66,5 | idle | cut |
| 66,5–69 | types "lo khe", loading | cut |
| 70,0 | expand DRS LO KHENG HONG → holdings table (DILD, GJTL, BNTR, ABMM, SINP…), AUM Rp 1,70T | spare (a named individual: avoid) |
| 72–76 | scroll | cut |
| 76,6 | click "Perubahan" → loading until 77,6 | – |
| 77,6–79,6 | Ownership changes table: date, stock, investor, ADDED/SOLD, Δ shares, % before/after | spare (tickers + investor names in every row) |
| 79,6–86 | scroll the table | cut |
| 86,5–89,9 | back at top, idle | cut |

---

## The edit (EDL) · v2, 10 Okt 2026 (superseded by v3; built from A and B, whose clips no longer exist)

User feedback on v1 (8 shots, ~2,4 s each, many jump cuts and whip-pans): *"a long video compressed into a short
one, very much rushed"*. v2 keeps only **chart + indicators → broker activity → screener with charts**,
drops broker summary, Drivers and the whole composition page, and is paced to feel calm:

- **5 shots, average 3,2 s** (v1: 8 shots, 2,4 s). 2 jump cuts in total, each removing dead time.
- **Footage near real time:** 0,92–1,12× at the standard script's timing. No whip-pans; every camera
  move is one slow eased push spanning the whole shot; shots change with a 12-frame eased crossfade.
- **Headline first:** each group's first shot holds its first frame 1 s while the headline and chips land.
- **One highlight at a time**, 5 labels in total, each on screen ≥ 1,2 s; a shot's highlights clear as
  the next shot fades in.

Three beat groups, one per voice line `outro-1…outro-3`; `outro-4` (the URL line) brings the end card.
Times at the standard script's estimated timing (scene 19,5 s):

| # | Shot | Source · segments (jump cuts) | On screen · speed | Camera | Highlights | Blur | Headline · chips | Voice |
|---|---|---|---|---|---|---|---|---|
| 1 | **flow-menu**: the toggle, close up | A · 10,90–12,52 | 0,0–2,8 s (1 s hold) · 0,92× | Flow menu at 2,9× → slow push to 3,25× on the Foreign row | click ripple on Foreign (11,30) + ring with the rest dimmed; no label | stock id (logo, ASLI, company name), account | **Chart & Indikator** · Indikator, Aliran Dana | outro-1 |
| 2 | **flow-chart**: the same click replayed on the chart | A · 11,08–12,52 · 13,45–14,98 (1 jump cut: skips 0,9 s with no line on) | 2,8–5,9 s · 0,95× | chart 1,95× → 2,3×, one continuous push | ring on the new axis tag + label "Investor asing" (Foreign line), then "Pemain besar lokal" (SM Local line) | stock id, account | (same) | outro-1 |
| 3 | **broker-activity**: the chart below the broker summary | A · 114,2–118,2 (static) | 5,9–10,9 s (1 s hold) · 1,0× | 1,75× → 2,1×, push toward the climbing broker lines | ring on the broker tags (XL…CC) + label "Tiap garis = 1 broker" | account | **Broker Activity** · Beli / jual per broker | outro-2 |
| 4 | **screener-presets**: pick a pattern | B · 5,30–6,95 | 10,9–13,4 s (1 s hold) · 1,12× | presets 1,9× → 2,12× on Uptrend Fase 2 | ring + label "Uptrend = lagi naik", click ripple (5,967) | result-table logos + tickers, account | **Screener** · Saring otomatis, Mode Chart | outro-3 |
| 5 | **screener-charts**: chart mode → card grid | B · 8,55–9,85 · 10,15–11,55 (1 jump cut: skips the page scroll) | 13,4–16,0 s · 1,01× | Charts toggle + first card row 2,05× → 2,15×, then the card grid 1,85× → 2,02× | ring + label "Tampilkan chart", click ripple (8,90) | table tickers until 8,93, card ticker labels before and after the scroll (timed), account | (same) | outro-3 |
| – | **End card** | – | 16,0–19,5 s (≥ 3 s guaranteed) | logo, "Tools analisis saham", **hakabot.com** pill, 7 feature chips | – | – | – | outro-4 |

**What got cut:** in A everything but 10,9–15,0 and 114,2–118,2 (Tech menu, Drivers, BBK colouring,
broker summary, scrolls, idle); in B everything but the screener 5,3–11,55 (minus the 9,87–10,13 scroll),
including the whole composition page.

**Sound:** `whoosh` 0,35 when a new feature group starts, `whoosh-soft` 0,3 between the two angles of the
same feature, `pop` 0,3 when a group's chips land, `pop` 0,32 on each click ripple and 0,28 on each
labelled ring, never two cues within 6 frames; end card `shimmer` 0,4 + `pop` 0,35. The shell adds
`whoosh-soft` 0,3 at the scene start.

**Timing rules** (`planOutro` in `HakabotOutro.tsx`):
- The outro reads its own scene's lines `outro-1…outro-N`. The **last** one is the URL line: the end
  card starts 6 frames before it and always gets ≥ 3 s (it starts earlier if the scene is too short).
- With exactly `N − 1 = 3` tour lines, group *i* starts 4 frames before line `outro-i`. Any other
  count splits the tour across the groups by their designed lengths.
- Inside a group, shots split the group's time by their designed lengths; a group's first shot holds
  1 s (at most 45 % of the shot) for the headline; footage plays at `footage ÷ remaining time`, clamped
  to 0,5–2,5× (beyond that the start is trimmed or the last frame holds with a slow drift). With the
  standard script every shot plays at 0,9–1,15×; a much shorter voice speeds them up, so keep the lines.

## Spare material (not in the edit)

- A 35,5–42 Drivers range, A 96–103 broker summary DIST → ACC, A 16,3 Bandar line (v1 shots, cut at the
  user's request 10 Okt; the exact click frames and boxes are in the shot log above).
- A 47–73: BBK candle colouring modes (incl. VPA).
- B 31,5–32,6 holder network, B 35,8–40,9 composition over time (Local/Foreign): cut at the user's
  request (10 Okt). Investor names and tickers everywhere: heavy blur needed.
- B 77,6–79,6: ownership changes table (ADDED/SOLD). Every row has a ticker and an investor name.

---

## Recording C · `2026-10-12 11-56-49.mp4` (142,2 s, 1920×1080, 30 fps)

Logged 12 Okt 2026: decoded every frame, diffed consecutive frames (changed px + bounding box) to find
every click to the frame, 1 s overview sheets, then 1:1 full-res crops before/after each change.
Working images (not in git): `episodes/_outro/c-log/` (`ov-*.jpg` overview, `diff.csv` per-frame diffs,
`chart-*.jpg`, `bs-*.jpg`, `ba-*.jpg`, `comp-*.jpg`, `scr-*.jpg`, `clk-*.jpg`, `*-full-*.png`).

**Frame.** App full-screen, **no browser chrome** (no tab strip, no URL bar). App area `0, 4, 1920, 982`;
y ≥ 986 is a dark strip, y ≥ 1000 black: never show. Nav bar y 4–66 (y 4–56 after 61,233). The page is a
narrow centred column: x 283–1625 at 100 % browser zoom (0–61,2 s), x ≈ 364–1545 after the user zooms the
browser to 90 % at **61,233** (layout shrinks; everything from Broker Activity on is at 90 %). The content
column is only ~1340 px of the 1920 width, so zoom ≈ 1,45 (at the new FIT) is the least that fills the window with app.

### Identifiers

| What | Box (recording px) | When visible |
|---|---|---|
| Account "poppyzagamer" + avatar "PO" (nav, right) | `1764, 10, 154, 46` (covers both zoom states: `1768,18,142,32` before 61,233, `1792,14,122,30` after) | every frame |
| Stock page header, scrolled off: only "+ Watchlist" and an unreadable sliver of the price change | `1530, 56, 100, 14` | 0–37 · keep the camera below y ≈ 90 on the stock page |
| Price axis / prices (chart axis 6.000–13.000, Drivers and broker-summary AVG ≈ 11.8xx) | axis `1228, 215, 72, 490` | 0–61. Not a name, but together with the screener table (AADI 11.800) a keen viewer could tell the stock is **AADI**. Left visible in v2 (same situation): user decision |
| Broker codes (AK, YU, CC, DX, BK, LG, ZP…) in Drivers, broker summary, Broker Activity | – | brokerage codes, not identifiers: left visible (as in v2) |
| POSITION (broker summary): broker codes, lots, %, P/L, average prices ("Adding on 11.881") | – | 46,3–61: no tickers or names; nothing to blur (prices as above) |
| Composition: search box ticker badge "AADI" | `622, 112, 46, 22` | 85–93,4 (page top) |
| Composition header: logo + "AADI" + "IDX · Composition" | `428, 204, 150, 52` | 85–93,4 |
| Holder Network: every node is labelled with a ticker (centre **AADI**, TAPG, DSNG, MDKA, MBMA, PALM…) or a holder name (PT Trinugraha Thohir, Edwin Soeryadjaya, Garibaldi Thohir, Saratoga…) | `432, 322, 514, 345` | 89,43–92,07; after the scroll its bottom strip `432, 56, 514, 70` stays on screen until 98,8 |
| Kepemilikan Signifikan table (investor names: Adaro Strategic Investments, Garibaldi Thohir, Saratoga, Edwin Soeryadjaya…) | top edge at y ≈ 690 at 100,3 s: `432, 686, 1045, 300` | from 99,4 below the float card; fills the frame 107,7–112,2 · **not used** |
| Perubahan Pemegang Saham (dates + investor names) | – | 104–112,2 · **not used** |
| Per Investor view of **GARIBALDI THOHIR** (a named individual) + his holdings (tickers, logos) | – | 112,23–120,7 · **not used** |
| Screener result table: stock logos + tickers (Dekat Support: ITMG, MDKA · VCP: 11 rows · Uptrend Fase 2: SINI, PACK, TINS, SRSN, ERAA, ULTJ, AADI, PTBA, EMAS) | `436, 500, 84, 440` | 121,43–130,77 and 134,07–142,2 |
| Screener chart cards: ticker label of each card | `x ∈ {444, 703, 961, 1220}`, `y ∈ {488, 660, 832}`, `76 × 26` | 130,77–134,07 |
| Screener presets **not used** in the edit (user: blur them): Dekat Support, VCP, HTF, Breakout (row 1) · Retail Jualan, Local Serap Foreign, Bandarmology (row 2), name + description + count | row 1 `x ∈ {430, 694, 958, 1222}, 180, 260, 72` · row 2 `x ∈ {430, 694, 958}, 384, 260, 72` | 121,43–142,2. The column shifts 4 px left at 126,83 (page scrollbar appears): boxes are 260 wide to cover both |

### Shot log

| Time | On screen / action | Use? |
|---|---|---|
| 0–2,1 | Stock page: chart (1D, Breakout on = "Tech 1"), toolbar Tech / Flow / Stats / BBK, Stock Health panel, volume + Bandar oscillator. 0,73–1,2 crosshair hover | cut |
| **2,133** (f64) | **Click Tech** → menu: MA50, MA100, MA200, Vol MA50, AVWAP, IHSG, S/R, Trend, Breakout ✓ (menu `418, 196, 162, 268`) | ✔ menus |
| 2,2–4,2 | cursor down the list | cut |
| **4,200** (f126) | **Trend on**: resistance lines (purple/yellow) + support line (blue) across the chart; click at `463, 420` on the Trend row `425, 405, 148, 22` | ✔ toggles |
| 5,767 (f173) | Trend off | – |
| 5,8–9,8 | idle in the menu; 9,267 menu closes | cut |
| **9,833** (f295) | **Click Flow** → menu Bandar / Retail / Foreign / SM Local (menu `500, 198, 160, 120`) | ✔ menus |
| **11,233** (f337) | **Bandar on** → purple line + "Bandar" axis tag; click `585, 228` | ✔ toggles |
| 12,167 | Bandar off | – |
| **12,567** (f377) | **Retail on** → yellow line + tag; click `585, 245` | ✔ toggles |
| 13,400 | Retail off | – |
| **13,767** (f413) | **Foreign on** → blue line + tag; click `590, 279` | ✔ toggles |
| 14,600 | Foreign off | – |
| **15,000** (f450) | **SM Local on** → teal line + tag; click `595, 315` | ✔ toggles |
| 16,133 | SM Local off; 16,933 menu closes | – |
| **17,533** (f526) | **Click Stats** → HB Signals / Drivers / Insider | ✔ menus |
| 17,6–19,5 | hover | cut |
| **19,533** (f586) | **Drivers on**: yellow shaded range (14 Agu → 9 Okt, 39 hari) + Drivers panel `300, 260, 342, 137` (AK TAKING PROFIT, YU AKUMULASI, CC DISTRIBUSI, BK AKUMULASI, RX CUT LOSS); click `660, 255` | ✔ drivers |
| 22,033 / 23,433 / 25,833 | Drivers off / on / off (same picture) | spare |
| 26,533 | Stats closes | – |
| **27,000** (f810) | **Click BBK** → None ✓ / Pentil / GIFT / VPA; 28,433 closes, nothing picked | ✔ menus |
| 28,8–31,2 | crosshair hover | cut |
| **31,233** (f937) | Data-flow pill **Retail** → the bottom oscillator `284, 712, 1014, 152` switches to yellow Retail bars; click `470, 888` (pills: Bandar `375,872,68,23`, Retail `448,872,68,23`, Foreign `520,872,75,23`, SM Local `598,872,80,23`) | ✔ oscillator |
| **32,033** (f961) | **Foreign** → blue bars; click `568, 890` | ✔ oscillator |
| **32,867** (f986) | **SM Local** → teal/orange bars; click `642, 894` | ✔ oscillator |
| 33,2–36,4 | crosshair over the oscillator | cut |
| 36,500 (f1095) | back to Bandar | – |
| 37,0–38,2 | scroll to Broker Summary | cut |
| 38,2–43,5 | date pickers: cursor travel, typing | cut |
| 43,567 (f1307) | START RANGE table refills (08/09→10/09): TOP 1/3/5 DIST | spare |
| 43,6–46,1 | POSITION (below the two tables, `300, 800, 1310, 186` at 100 %) shows "Rentang tanggal tidak valid" while START overlaps END | – |
| 44,7–46,1 | start date changed | cut |
| **46,167** (f1385) | **START table refills** (08/01→10/09); POSITION header + spinner (46,133) | ✔ ranges |
| **46,300** (f1389) | **POSITION fills**: BROKER · START LOT · END LOT · EXIT/ADD(%) · P/L%. Rows AK 135,6K → −2,7K, −2 %, **+14,42 % (3,2b)**; YU −0,7 % +8,95 % (813,2m); BK −0,1 % +11,54 % (99,0m): brokers **exiting, with their P/L** | ✔ ranges |
| 47,633 (f1429) / 47,733 (f1432) | START refill (08/01→09/01) / POSITION recalculates: AK −2,8 % +20,43 % (3,2b), ZP +7,7 % "(Adding on 11.772)", BB 0 → "0 %, N/A" (fully out) | spare |
| **49,300** (f1479) / **49,400** (f1482) | POSITION recalculates / **END RANGE table refills** (09/09→10/09): numbers snap, TOP 1 DIST, TOP 3/5 ACC (table `1004, 160, 580, 540`). POSITION now: **AK 97,4K → −16,4K, −16,9 %, +20,57 % (21,9b)** (exiting, profit), **ZP +125,3 % (Adding on 11.881)**, **BB +103 % (Adding on 12.057)**; rows at y 915 / 946 / 978 (BB half cut by the frame bottom), EXIT/ADD column x 1105–1175, P/L x 1468–1576 | ✔ ranges, position |
| 49,4–50,5 | static (cursor only): the POSITION state above holds | ✔ position |
| **50,567** (f1517) | **END RANGE refills** (09/02→10/09): TOP 1/3/5 all **ACC** (+37,5B / +64,3B / +73,7B), badges `1528, 586, 48, 76`; POSITION (50,533) all adding: AK +9,4 % (Adding on 11.616), ZP +94,3 %, BB +172,8 % | spare |
| 54,17–56,0 | scroll: POSITION moves up to y 582 with 5 rows (AK, ZP, BB, PD, YU, all adding) | spare |
| 51,4–61,2 | idle, scroll (Position, Huge Nego) | cut |
| 61,233 (f1837) | browser zoom 100 % → 90 % | cut |
| 62,1–67,2 | scroll to Broker Activity | cut |
| 67,2–70,8 | Broker Activity `364, 440, 1182, 503`: candles + cumulative line per broker (DX climbing, BK, RX, LG, KZ), broker chips row y ≈ 528–548 | – |
| **70,800** (f2124) | **Chip AK on** → AK's orange line dives (a seller), chart rescales; click `754, 545` on chip `730, 528, 52, 20` | ✔ broker-activity |
| 71,600 | AK off | – |
| **72,300** (f2169) | **Chip ZP on** → line falls; click ≈ `822, 538` | ✔ broker-activity |
| 72,833 | ZP off | – |
| **73,467** (f2204) | **Chip CC on** → teal line; click ≈ `892, 538` | ✔ broker-activity |
| 73,967 | CC off | – |
| 74,7–76,8 | KZ off/on, LG off/on (small changes) | spare |
| 77–83,5 | 79,0 Foreign filter (spinner, chart unchanged), 81,8 / 82,1 All: no visible change | cut |
| 83,5–84,9 | scroll up; **84,933** click Composition (nav) | cut |
| 85–89,4 | Composition skeleton, "Loading…" | cut |
| **89,433** (f2683) | **AADI composition renders**: Holder Network springs out from a tight cluster (89,57–90,7) + Ownership Composition donut (100 % scripless, Local 90,9 % / Foreign 9,1 %) | ✔ network |
| 90,7–92,0 | idle | cut |
| 92,07–93,37 | scroll to Composition Over Time (card `432, 150, 1045, 457` after the scroll) | cut |
| **94,500** (f2835) | **Click Local** → lines per local investor type (Perusahaan, Individual, Asuransi, Reksadana…); click `505, 268` | ✔ comp-time |
| **95,967** (f2879) | **Click Foreign** → foreign types (Reksadana, Bank, Lainnya…), lines climbing; click `553, 268` | ✔ comp-time |
| 96,5–98,3 | hover tooltips | cut |
| 98,8–99,4 | scroll to Float Composition by Investor Type (card `432, 160, 1045, 512`) | cut |
| **99,867** (f2996) | **Corporate & Strategic expands** into 8 sub-types (Corporate 61,22 %, Firm…); generic categories, no names | ✔ float (optional) |
| 100,6–105,3 | small scroll; next categories expanded/collapsed one by one (101,833 · 102,6 · 103,5 · 104,37 · 105,23) | spare |
| 107,7–112,2 | scroll to Kepemilikan Signifikan + Perubahan Pemegang Saham | not used (names) |
| 112,233–120,7 | click a holder → Per Investor: GARIBALDI THOHIR's holdings | not used (named individual) |
| 120,767 | click Screener (nav); 121,43 page renders (Dekat Support ✓, 2 results) | cut |
| 123,867 (f3716) | VCP → 11 results | spare |
| 125,000 (f3750) | Dekat Support again | – |
| **126,867** (f3806) | **Click Uptrend Fase 2** → 9 results (table rows refill, card ring turns gold); click `605, 327` on card `432, 262, 254, 80` | ✔ screener-preset |
| 127–130,7 | hover rows, idle | cut |
| **130,767** (f3923) | **Click "Charts"** (`1287, 110, 73, 28`, click `1303, 125`) → results turn into 9 cards; mini charts draw in 130,8–131,3 | ✔ screener-charts |
| 131,3–134,0 | card grid static (3 rows × 4) | ✔ screener-charts |
| 134,067 | Charts off → table; 135,9 small scroll; idle to the end | cut |

---

## Recording D · `2026-10-13 12-16-36.mp4` (6,9 s, 1920×1080, 30 fps) + `POSITION.png`

Made by the user on 13 Okt so POSITION can be shown in full (in C it only ever sits at the bottom edge, cut in
half). Same app, same 100 % browser zoom and layout as Recording C (bounds `0, 4, 1920, 982`, nav y 4–66,
y ≥ 986 dark/black). Logged by decoding every frame (`episodes/_outro/d-log/`: `diff.csv`, `ov.jpg`, `full-*.png`).

| Time | On screen / action | Use? |
|---|---|---|
| 0–1,2 | Broker summary of the same stock, already filled (START 08/20 → 09/22, END 09/23 → 10/12): both tables, TOP 1/3/5 (START all ACC, END all DIST), POSITION header + first rows at the bottom edge. Static (cursor parked at right, x ≈ 1720) | ✔ tables-position |
| **1,200–2,400** (f36–f72) | **The page scrolls** down 230 px: POSITION comes fully into frame (card `283, 255, 1342, 335`, rows y 405 / 437 / 468 / 500 / 532), Huge Nego below (y 640–900) | ✔ tables-position |
| 2,4–6,9 | static: TOP rows (y 87–181), POSITION with all 5 rows, Huge Nego, Broker Activity title at the bottom edge | ✔ (to 3,6) |

POSITION in D (and in the screenshot): RX 95,0K → −70,6K, **−74,3 %, −6,58 % (81,2b)**; BK 104,3K → 62,7K,
**+60,1 % (Adding on 11.542)**; AK 97,3K → −76,4K, **−78,5 %, −0,19 % (89,9b)**; BB 69,9K → 19,9K, +28,4 %
(Adding on 11.365); KZ 66,1K → −34,3K, −51,8 %, −6,49 % (38,5b). Columns: BROKER x 332 · START LOT ≈ 715 ·
END LOT ≈ 903 · EXIT/ADD(%) 1105–1175 · P/L% 1468–1576.

**Identifiers in D:** the account "poppyzagamer" + avatar (`1768, 18, 142, 32`, inside C's account box
`1764, 10, 154, 46`, applied to D too). No tickers, logos or names: broker codes, lots, prices and Huge Nego
dates only (left visible, as in C). The price level (≈ 11.5xx) is the same accepted exception as C's price axis.

**`outro_raw/POSITION.png`** (3278×1286, a crisp screenshot of the same POSITION state): bottom of the TOP 5 /
BROKER rows of both tables, POSITION ("+ Broker", the 5 rows above), "Huge Nego" heading. No identifiers.
Copied to `public/outro/position.png` and drawn **1920 × 753** in the outro (so its coordinates read like
recording px): POSITION card `50, 173, 1822, 454`; header y 335; rows y 375 / 419 / 462 / 505 / 549;
BROKER x 116, EXIT/ADD x 1205–1260, P/L x 1659–1806.

---

## The edit · v3.3 (current, 13 Okt 2026)

The user approved v3.2's content and asked for it faster: *"The contents are good enough, but it can be
1.5x and still watchable … change the voiceover and subtitles to make it fit."* v3.3 is v3.2 at ≈ 1,5×:

- **Speed rule (changed, user request):** footage plays at **≈ 1,5× (1,4–1,6×**, `MIN_RATE`/`MAX_RATE` in
  `HakabotOutro.tsx`). Shot lengths and camera key times are v3.2's ÷ 1,5; holds are shorter (8 frames min,
  20 max at a beat's start); crossfades 9 frames. Shots may now run under 2,5 s.
- **Still in force:** the same 7 shots in the same order, no punch-ins / zoom bounces / drift, at most one
  slow eased move per shot, crossfades between shots, one highlight per shot, end card ≥ 3 s.
- **Voice is not sped up:** the lines are shorter instead (captions follow). `pauseBefore` 0,35 on lines
  2–5, `tailSec` 1,6.

Times at the draft lines (scene **≈ 21,5 s**):

| Beat · shot | Footage | On screen | Speed |
|---|---|---|---|
| **Indikator** · `tech-trend` (Tech menu → Trend lines) | C 2,03–5,40 | 0,0–2,6 s | 1,42× (+0,27 s start hold) |
| Indikator · `flow-retail` (Bandar line, then Retail on) | C 10,85–13,38 | 2,6–4,4 s | 1,41× |
| Indikator · `drivers` (Drivers range + broker panel) | C 19,00–21,65 | 4,4–6,3 s | 1,42× |
| **Bandarmology** · `tables-position` (tables → scroll → POSITION) | D 0,30–3,60 | 6,3–9,0 s | 1,40× (+0,33 s hold) |
| Bandarmology · `position-still` (pan to EXIT/ADD and P/L, P/L ringed) | position.png | 9,0–11,0 s | still, pan at 1,4× |
| **Komposisi** · `holder-network` | C 89,60–92,0 | 11,0–14,4 s | 1,40× (+0,67 s start, 0,96 s end hold) |
| **Screener** · `screener` (Uptrend → cards → grid) | C 126,35–127,80 · 130,55–133,60 | 14,4–18,3 s | 1,40× (+0,63 s hold) |
| **End card** | – | 18,3–21,5 s (3,3 s) | – |

**Voice budget at ≈ 1,5×** (15,5 chars/s; min = the footage at 1,6×, below it the start gets trimmed;
max = what the 1,4× floor plus short holds absorb before a beat feels padded):

| Line | Beat | Min–max chars | Line (approved 13 Okt) | Chars | Fits? |
|---|---|---|---|---|---|
| `outro-1` | Indikator | **78–95** | Hakabot punya banyak indikator racikan sendiri, tinggal klik langsung muncul di chart. | 86 | ✔ (1,42×) |
| `outro-2` | Bandarmology | **54–72** | Kelihatan broker mana yang nambah, keluar, sampai untung ruginya. | 65 | ✔ (1,40×) |
| `outro-3` | Komposisi | **25–50** | Pemilik saham tiap perusahaan, tampil rapi. | 43 | ✔ (1,40× + holds) |
| `outro-4` | Screener | **39–58** | Screener siap pakai, bantu nyaring saham yang jelek. | 52 | ✔ (1,40× + 0,6 s hold) |
| `outro-5` | End card | **20–30** | Cek di {hakabot.com\|hakabot dot com}. | 23 | ✔ (end card 3,3 s) |

## The edit · v3.2 (13 Okt 2026, superseded by v3.3 = the same edit at ≈ 1,5×)

The user liked v3.1's pacing ("seems better paced"); v3.2 keeps every v3.1 pacing rule and changes content:
the Indikator beat shows **Trend, Retail and Drivers** (3 shots, allowed for this beat only), the Bandarmology
beat uses **Recording D + the POSITION screenshot** so POSITION is whole and readable, and the Screener voice
line is longer (its footage stays, with more of the card grid). Times at the draft lines (scene **≈ 29,9 s**):

| Beat · shot | Source · footage | On screen | Speed · holds | Window h · camera (one eased move) | Highlight | Blur |
|---|---|---|---|---|---|---|
| **Indikator** · `tech-trend`: Tech menu opens, cursor down its 9 indicators, Trend on, lines appear | C chart-a 2,03–5,40 | 0,0–3,9 s | 0,96× · 0,4 s start hold | 660 · `660,395` z 2,3 → `675,400` z 2,42 | ripple on Trend (4,2) | account |
| Indikator · `flow-retail`: Flow menu open; Bandar's line appears and goes; **Retail** on, its line appears | C chart-a 10,85–13,38 | 3,9–6,5 s | 0,96× | 660 · `720,400` z 2,3 → `735,405` z 2,4 | ripple on Retail (12,567) | account |
| Indikator · `drivers`: Stats menu, **Drivers** on: shaded range + broker panel (TAKING PROFIT, AKUMULASI…) | C chart-b 19,00–21,65 | 6,5–9,3 s | 0,96× | 660 · `720,400` z 2,1 → `730,405` z 2,2 | ripple on Drivers (19,533) | account |
| **Bandarmology** · `tables-position`: the filled START/END tables, the page scrolls, POSITION arrives whole | D position-d 0,30–3,60 | 9,3–13,1 s | 0,98× · 0,4 s start hold | 460 · `955,430` z 1,44 → 1,5 (broker codes to P/L all in frame) | – (the scroll is the motion) | account |
| Bandarmology · `position-still`: POSITION close-up, one pan from broker codes and lots to EXIT/ADD and P/L | `public/outro/position.png` (still, 2,8 s) | 13,1–15,9 s | still · pan | 460 · `700,455` → `1250,455`, z 1,6 | ring on the P/L column `1648,356,168,212` from 1,4 s | none needed (no identifiers) |
| **Komposisi** · `holder-network` (unchanged) | C composition 89,60–92,0 | 15,9–20,3 s | 0,95× · 1,0 s start, 0,9 s end hold | 600 · `955,462` z 1,72 → 1,82 | – | badge, header, network soft blur |
| **Screener** · `screener`: Uptrend Fase 2 picked; jump over idle hover; results → chart cards; grid rests | C screener 126,35–127,80 · 130,55–133,60 | 20,3–26,0 s | 0,95× · 0,9 s start hold | 600 · patterns `760,360` z 1,9 held to 1,6 s, eased to the grid `955,700` z 1,74 by 3,4 s | ripple on Uptrend Fase 2 | 7 unused presets, table logos + tickers, 9 card labels |
| **End card** | – | 26,0–29,9 s (3,9 s) | – | logo, tagline, hakabot.com, 8 chips incl. Komposisi | – | – |

**Clips** (`outroClips.json`): `chart-a` C 1,9–13,5 · `chart-b` C 18,8–22,0 · `position-d` D 0,0–3,8 ·
`composition` C 89,3–92,2 · `screener` C 126,2–133,8 (+ the still `public/outro/position.png`).
Still shots: `still: {src, w, h}` on a shot (`outroConfig.ts`) draws an image instead of footage; `segs`
[[0, s]] only sets its length; blur boxes don't apply to stills, so a still must contain no identifiers.

**Voice budget per beat** (≈ 15,5 chars/s; `pauseBefore` 0,8 on lines 2–5, `tailSec` 2,2):

| Line | Beat | Footage needs | Fits | Draft in `outroScript.ts` | Chars |
|---|---|---|---|---|---|
| `outro-1` | Indikator (3 shots) | ≈ 9,0 s beat | **≈ 118–130 chars** (below ≈ 118 the Retail shot drops under 2,5 s; below ≈ 105 the shots hit 1,15× and get trimmed) | PLACEHOLDER: Hakabot punya banyak indikator racikan sendiri buat baca arah pasar, dari garis tren, dana retail, sampai broker penggeraknya. | 126 |
| `outro-2` | Bandarmology | ≈ 6,5 s beat | ≈ 80–95 chars | Kelihatan juga broker mana yang lagi nambah saham, udah keluar, sampai untung ruginya. | 86 |
| `outro-3` | Komposisi | ≥ 3,6 s | ≈ 40–60 chars | Pemilik saham tiap perusahaan, tampil rapi dan jelas. | 53 |
| `outro-4` | Screener | ≈ 4,9–5,7 s beat | ≈ 60–80 chars | Screener racikan Hakabot udah siap pakai, bantu nyaring saham yang jelek. | 73 |
| `outro-5` | End card | ≥ 3 s | ≈ 20–25 chars | Cek di {hakabot.com\|hakabot dot com}. | 23 |

**Pacing rules:** as v3.1 (below), with one exception: the Indikator beat may have 3 shots.

## The edit · v3.1 (13 Okt 2026, superseded by v3.2; its pacing rules still apply)

User feedback on v3 (13 Okt): *"Why is the scene switching way too fast? Even I can't comprehend what's
going on before another thing shows up … looks like it's playing at 2x speed. The short zooming in and
zooming out is way too much and overused."* Same verdict as v1 (10 Okt, "very much rushed"). v3.1 re-cuts
the same material calmer, and these rules are now the outro's hard limits:

**Outro pacing rules**
1. **At most 2 shots per beat** (1 is fine). Every shot is on screen **≥ 2,5 s**, with one thing happening
   that a first-time viewer can follow.
2. **Footage in real time: 0,95–1,15×** (`MIN_RATE`/`MAX_RATE` in `HakabotOutro.tsx`). Spare time becomes a
   hold at the start of the beat (12 frames minimum, up to 30), then a hold on the last frame of static UI;
   too little time trims the start. At most **one jump cut per shot**, only over dead time.
3. **Camera: no punch-ins, no zoom bounces, no drift.** At most one slow eased move per shot (or static),
   zoom change ≤ ~10 %. Camera keys are timed in seconds on screen, so a move can carry on through a hold.
4. **Crossfades** (12 frames) between every shot, inside a beat too.
5. **At most one highlight per shot** (a ring or a click ripple), on screen ≥ 1,2 s.
6. Length comes from **pauses between lines (0,8 s) and a longer tail (2,2 s)**, never from slowing footage.

Times at the draft standard lines (scene **24,5 s**):

| Beat · shot | Clip · footage | On screen | Speed · holds | Window h · camera (one eased move) | Highlight | Blur |
|---|---|---|---|---|---|---|
| **Indikator** · `tech-trend`: Tech menu opens (2,133), the cursor goes down its 9 indicators, Trend on (4,2), support/resistance lines appear | chart-a 2,03–5,70 (one take) | 0,0–5,6 s | 0,95× · 1,0 s start hold, 0,7 s end hold (lines on) | 660 · `660,395` z 2,3 → `675,400` z 2,45 | click ripple on Trend (4,2) | account |
| **Bandarmology** · `tables-position`: START table fills (46,167), POSITION fills with exits + P/L (46,3), recalculates (47,73), END fills (49,4) | broker-summary 45,95–49,65 (one take) | 5,6–9,4 s | 1,07× · 0,4 s start hold | 560 · START lower rows + ACC/DIST, END left half, POSITION to EXIT/ADD: `800,690` z 1,9 → `815,700` z 2,0 | ring on the POSITION rows 46,3–47,7 | account |
| Bandarmology · `position`: AK exiting −16,9 % with **+20,57 % (21,9b)**, ZP/BB adding | broker-summary 49,32–50,50 (still footage) | 9,4–12,1 s | 0,95× · 1,5 s end hold (still) | 560 · pan once `760,743` → `1168,743`, z 2,3 (broker codes → P/L) | ring on P/L from 49,95 | account |
| **Komposisi** · `holder-network`: the network springs open with the ownership donut, then rests | composition 89,60–92,0 (one take) | 12,1–16,6 s | 0,95× · 1,0 s start hold (the tight cluster), 0,9 s end hold | 600 · `955,462` z 1,72 → `955,470` z 1,82 | – | badge, header, network soft blur |
| **Screener** · `screener`: Uptrend Fase 2 picked (126,867), table refills; jump over idle hovering; results turn into chart cards (130,77) | screener 126,35–127,80 · 130,55–132,60 (1 jump cut over dead time) | 16,6–20,6 s | 0,95× · 0,4 s start hold | 600 · hold on the patterns `760,360` z 1,9 until 1,6 s, then one eased move to the grid `955,700` z 1,74 by 3,4 s | click ripple on Uptrend Fase 2 | all 7 unused presets, table logos + tickers until 130,8, the 9 card labels from 130,75 |
| **End card** | – | 20,6–24,5 s (3,9 s) | – | logo, tagline, **hakabot.com**, 8 chips incl. Komposisi | – | – |

**Clips** (`outroClips.json`): `chart-a` 1,9–5,9 · `broker-summary` 45,9–50,6 · `composition` 89,3–92,2 ·
`screener` 126,2–132,6 (all ≤ 16 s: see the clip-length note in the v3 section below).

**Cut from v3:** the menus montage (4 menus) and the 5-toggle train, Drivers + oscillator, the Broker
Activity shot, composition-over-time and the float card, the Charts-toggle close-up, all punch-ins,
drift and hard cuts. Blur boxes for the dropped shots are still listed in the v3 table above.

**Sound:** `whoosh` 0,35 into each new beat, `pop` on each beat's single click/ring, end card `shimmer` +
`pop`. The second shot of a beat crossfades in silently.

**Voice budget per beat** (at 15,5 chars/s; footage needs the beat to be about this long to stay at ≥ 0,95×):

| Line | Beat | Draft chars | Beat length at the draft | Fits |
|---|---|---|---|---|
| `outro-1` | Indikator | 68 | 5,6 s | ≈ 55–75 chars |
| `outro-2` | Bandarmology | 86 | 6,6 s | ≈ 75–90 chars (2 shots × ≥ 2,5 s need ≥ 5,6 s → ≥ ≈ 70 chars) |
| `outro-3` | Komposisi | 53 | 4,4 s | ≈ 40–60 chars |
| `outro-4` | Screener | 48 | 4,1 s | ≈ 45–60 chars (shorter trims the start of the pick) |
| `outro-5` | End card | 23 | 3,9 s | ≈ 20–25 chars |

## The edit · v3 (12 Okt 2026, superseded by v3.1: rejected as too fast)

User brief: an *outro*, not a demo. Generalise, no explaining what each indicator does; one plain line
per page; compact; more interactive (more visible clicks landing); cut the dead parts; speed up slow bits;
blur tickers, ticker logos and the screener presets that aren't used. Approved 12 Okt with one change:
beat 2 shows the broker-summary tables **after** the date picking is done, then the **POSITION** feature
(who is adding, who is exiting, and the P/L of those exiting). Built only from Recording C.

**Shape:** 4 beat groups (headline only, no chips, no explanatory labels), one voice line each, then
the URL line on the end card. 11 shots (8 without the three optional ones), ~20 visible clicks or
updates, footage 0,5–1,5×. Inside a group shots **hard-cut** (with a 3,5 % punch settling over 8
frames); between groups an **8-frame crossfade** + whoosh. A group's first shot holds its first frame
8 frames while the headline lands. Highlights: gold click ripples (+ `pop`) and three white rings.

Camera numbers: **FIT = 960 / 1920 = 0,5** (zoom 1 = the whole 1920 px recording in the 960 px window,
≈ 1,45 = the app column fills the window, 2 = 1 rec px per screen px).

Times are at the draft standard lines (`src/core/brand/outroScript.ts`, scene ≈ 21,9 s); the edit
itself is `OUTRO_GROUPS` in `src/core/brand/outroConfig.ts`.

| # | Group · shot | Clip · segments (each gap = jump cut) | On screen · speed | Window h · camera (centre x,y · zoom) | Highlights | Blur |
|---|---|---|---|---|---|---|
| 1 | **Indikator** · `menus`: Tech, Flow, Stats, BBK menus pop open | chart-a 2,10–2,55 · 9,80–10,25 · chart-b 17,50–17,95 · 26,97–27,42 | 0,0–1,5 s · 1,46× | 660 · one hard-cut key per menu: `500,318` → `580,300` → `640,292` → `700,296`, zoom 3,7 → 3,85 each | ripple on each button (@2,133 · 9,833 · 17,533 · 27,0) | account (per-rec) |
| 2 | Indikator · `toggles`: Trend, Bandar, Retail, Foreign, SM Local land on the chart | chart-a 4,05–4,55 · 11,10–11,60 · 12,45–12,95 · 13,65–14,15 · 14,90–15,40 | 1,5–3,7 s · 1,12× | 660 · `790,450` 1,9 → `760,430` 2,1 | ripple per toggle (@4,2 · 11,233 · 12,567 · 13,767 · 15,0) | account |
| 3 | Indikator · `drivers-osc` (*optional*): Drivers range + panel, oscillator flips ×3 | chart-b 19,45–20,05 · 31,15–31,50 · 31,95–32,30 · 32,80–33,15 | 3,7–5,0 s · 1,27× | 660 · `720,420` 2,0; hard cut at seg 2 to `650,740` 2,6 | ripples @19,533 · 31,233 · 32,033 · 32,867 | account |
| 4 | **Bandarmology** · `ranges`: START table + POSITION fill, then END table + POSITION recalc | broker-summary 46,05–46,50 · 49,22–49,62 | 5,0–6,3 s · 0,88× | 560 · `955,600` 1,43 → `955,620` 1,55 (both tables + POSITION) | – | account |
| 5 | Bandarmology · `position`: POSITION close up, AK exiting −16,9 % with **+20,57 % (21,9b)**, ZP/BB adding | broker-summary 49,32–50,45 | 6,3–8,3 s · 0,55× (static footage) | **400** (POSITION is at the bottom edge of the recording) · `760,800` 2,1 → pan to `1140,800` 2,12 (broker codes + lots + EXIT/ADD → P/L) | ring on EXIT/ADD `1092,903,94,80` 49,32–49,95, then on P/L `1452,903,130,80` 49,95–50,45 | account |
| 6 | Bandarmology · `broker-activity` (*optional*): AK, ZP, CC lines switched on | broker-activity 70,60–71,50 · 72,15–72,75 · 73,35–73,95 | 8,3–11,0 s · 0,78× | 560 · `955,680` 1,65 → `900,700` 1,85 | ripples on chips @70,8 · 72,3 · 73,467 | account |
| 7 | **Komposisi** · `holder-network`: network springs open, donut lands | composition 89,56–90,85 | 11,0–12,6 s · 1,0× | 600 · `955,460` 1,72 → `955,470` 1,8 | – | badge `616,106,58,34`, header `424,198,160,62`, network soft blur `434,324,510,340` (sigma 4, tint 0,08) |
| 8 | Komposisi · `comp-time`: Local, then Foreign | composition 94,40–94,90 · 95,90–96,50 | 12,6–14,1 s · 0,75× | 600 · `925,380` 1,85 → 1,95 | ripples @94,5 · 95,967 | network strip `432,50,516,76` (93,3–98,8, soft) |
| 9 | Komposisi · `float` (*optional*): Corporate & Strategic opens up | composition 99,87–100,55 | 14,1–14,9 s · 0,78× | 600 · `945,385` 1,78 → 1,84 | ripple @99,867 | holders table `430,486,1050,500` until 99,866, then `430,680,1050,306` |
| 10 | **Screener** · `screener-preset`: pick Uptrend Fase 2 | screener 126,40–127,40 | 14,9–16,2 s · 1,0× | 600 · `600,300` 2,6 → `575,310` 2,9 (tight on the card) | ripple @126,867, ring on the card `432,262,254,80` | Dekat Support, VCP, Retail Jualan, Local Serap Foreign (`262 × 74` boxes, sigma 7), table logos + tickers `432,498,92,446` |
| 11 | Screener · `screener-charts`: Charts on → cards with charts | screener 130,50–131,25 · 131,25–132,40 (zero-length jump = hard camera cut) | 16,2–18,4 s · 0,85× | 600 · `1180,260` 2,6 on the button → cut to the grid `955,700` 1,72 → `955,720` 1,84 | ripple @130,767 | all 7 unused presets, table until 130,8, the 9 card ticker labels from 130,75 |
| – | **End card** | – | 18,4–21,9 s (≥ 3 s) | logo, "Tools analisis saham", **hakabot.com** pill, 8 feature chips (+ **Komposisi**) | – | – |

**Clips** (`outroClips.json`, all Recording C): `chart-a` 1,9–15,6 · `chart-b` 17,3–33,4 ·
`broker-summary` 45,9–50,6 · `broker-activity` 70,4–74,1 · `composition` 89,2–100,7 · `screener` 126,2–132,6.
Keep clips ≤ ~16 s: in a single 31,5 s 1080p clip, Remotion's `OffthreadVideo` returned a stale frame for
every time past ≈ 24 s (seen 12 Okt: requests for 25–30 s all showed the 25,8 s picture; the file itself was
fine in ffmpeg). A shot can take a segment from another clip of the same recording: `[a, b, 'clip-name']`.

**Cut:** idle/hover stretches, date-picker typing (38–43,5), the other START refills, scrolls (37–38,
51–67, 83–89, 92–93, 98–99, 107–112), the browser-zoom jump (61,2), Broker Activity filter clicks with no
visible change (79–82), the named-holder tables and the Per Investor view (99,4–120,7), the VCP / Dekat
Support clicks (123,9 / 125,0), Charts off and the tail (134–142).

**Sound** (B/C library, see style guide → Sound): `b-rise` 0,35 starting 7 frames before each new group,
`b-click` 0,24 on every click ripple and `b-tap` 0,24 on each ring, `b-tap` 0,28 when a group's chips land
(never two cues within 6 frames), end card `b-mark` 0,36 at endAt − 4 + `b-tap` 0,35 with the URL pill. No
sound on hard cuts inside a group. The shell adds `b-air` 0,3 at the scene start. (Sections for earlier outro
versions above still name the old sounds; they're history.)

**Timing rules** (`planOutro` in `HakabotOutro.tsx`): the last outro line is the URL line (end card 6
frames before it, always ≥ 3 s). With exactly 4 tour lines, group *i* starts 4 frames before `outro-i`;
any other count (e.g. an episode still on the old 4-line outro) splits the tour by designed lengths.
Inside a group shots split its time by their designed lengths; footage plays at `footage ÷ time`, clamped
to 0,5–2,5×. Optional shots are dropped (last first) when a group gets < 80 % of its designed length.

### Voice: one short line per beat

| Line | Beat | Designed | Fits | Draft line (outroScript.ts, not yet approved for voicing) | Chars | Est. |
|---|---|---|---|---|---|---|
| `outro-1` | Indikator | 5,0 s | ≈ 60–75 chars | Hakabot punya banyak indikator racikan sendiri buat baca arah pasar. | 68 | 4,4 s |
| `outro-2` | Bandarmology | 5,8 s | **≈ 75–90 chars** keeps all 3 shots; below ≈ 65 Broker Activity drops (then ≈ 45–60 fits the 2 shots) | Kelihatan juga broker mana yang lagi nambah saham, udah keluar, sampai untung ruginya. | 86 | 5,5 s |
| `outro-3` | Komposisi | 4,0 s | ≈ 45–60 chars | Pemilik saham tiap perusahaan, tampil rapi dan jelas. | 53 | 3,4 s |
| `outro-4` | Screener | 3,6 s | ≈ 40–55 chars | Screener nyaring saham yang lagi naik, otomatis. | 48 | 3,1 s |
| `outro-5` | End card | ≥ 3 s | ≈ 20–25 chars | Cek di {hakabot.com\|hakabot dot com}. | 23 | 1,5 s |

Scene settings: `leadSec` 0.3, `tailSec` 1.8, `minSec` 12, `pauseBefore` 0.25 on `outro-2…outro-5`.
At the draft lines the outro runs ≈ **21,9 s** (estimated at speed 1.0).

## Spare material in Recording C

- 46,3 and 47,73 POSITION states (exits with P/L at 46,3; BB "0 %, N/A" = fully out at 47,73).
- 54,2–61: POSITION mid-frame with 5 rows (all adding).
- 22,0–25,8 Drivers off/on again; 74,7–76,8 more broker chips; 100,6–105,3 the other float categories expanding.
