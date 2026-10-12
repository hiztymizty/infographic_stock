# Outro recordings: shot log and EDL

Source material for the shared Hakabot outro (`hakabot-outro`). Both recordings are 1280×720, 30 fps,
in `outro_raw/` (source, don't edit). All times are seconds in the raw recording and all boxes are
`x, y, w, h` in recording pixels. Times were found by stepping through the footage (1 s overview,
0.25 s full-res around interactions, then frame-exact 30 fps diffs of the regions that change), so
click times are accurate to one frame.

The cut list lives in `src/core/brand/outroClips.json` (read by `scripts/outro_clips.py`, which
cuts `public/outro/<clip>.mp4`, and by `outroConfig.ts`). The edit itself (segments, speed, camera,
highlights, blur) is `OUTRO_GROUPS` in `src/core/brand/outroConfig.ts`.

---

## Recording A · `2026-10-09 18-35-30.mp4` (124,2 s)

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

## Recording B · `2026-10-10 11-54-43.mp4` (89,9 s, NEW)

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

## The edit (EDL) · v2, 10 Okt 2026

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
