# Bahasa guide

Everything viewers read or hear is in Bahasa Indonesia. The goal is the voice of a friend who gets
the market, explaining it over coffee: casual, clear, a little punchy. It should never sound like a
press release, and never like trying too hard.

## Clarity first: the viewer is not an investor

Write for a general Indonesian viewer who has never bought a stock. If a word might confuse them,
explain it or leave it out. Don't assume they'll "get it".

- **What needs clarity:** vocabulary that isn't familiar to Indonesian viewers, mostly English finance
  abbreviations and jargon. **What doesn't:** words every Indonesian knows, like IHSG, saham, modal,
  untung, rugi and anjlok. Don't expand or re-explain those.
- **Unfamiliar abbreviations are spelled out the first time**, in the voice AND on screen, then explained
  in plain words if needed: "DCA, singkatan dari Dollar Cost Averaging: beli rutin dengan jumlah yang sama"
  · "PER, Price to Earnings Ratio" · "IPO, waktu perusahaan pertama kali jual saham ke publik".
  After that, the short form is fine.
- **Unfamiliar jargon gets a plain-words explanation at first use**, or is replaced: *bandar* (pemain besar),
  *broker summary* (rekap broker mana yang beli/jual), *uptrend* (lagi naik), *cut loss*, *hold*…
  Keep-English terms are still allowed, but never unexplained.
- **One number per sentence**, and say what it means ("modal kamu jadi…", "kalau dirata-rata, cuma… setahun").
- **No unexplained jumps.** Each line should make sense to someone who only heard the previous line.
- Test every line: *would my non-investor friend understand this on the first listen?* If not, rewrite it.

## Write for the ear

The voice reads each scene as one continuous take, like a narrator reading a paragraph
(`scripts/voiceover.py`). So write every scene as a paragraph that sounds natural spoken aloud.
The text's punctuation directly shapes the pauses and the pitch:

- **Read the whole scene aloud as one paragraph** before you hand it in. Fix anything you stumble on.
- **Punctuation is direction for the voice.** A comma is a short breath with the pitch held up. A period
  is a full stop with the pitch falling. A question mark rises. "…" is a suspense pause. Put them only
  where a speaker would naturally pause or finish.
- **Never end a sentence before the thought is done.** A period mid-thought makes the pitch "resolve"
  too early. If the idea continues, use a comma or rephrase it as one sentence.
- **No colons, semicolons, parentheses, slashes or dashes in the spoken text.** TTS reads them as odd
  stops. Use a period, a comma, or a word like *artinya*, *yaitu*, *jadi*.
- **At most two commas per sentence.** Long comma chains make choppy micro-pauses.
- **Lines are only sync and caption units.** A sentence may run across two lines (the take keeps it
  flowing), so split lines where the animation needs an anchor, not where the grammar ends.
- **`pauseBefore` starts a new take**: use it only for a deliberate beat (a dramatic pause, a new
  topic). Everything else flows inside the take.
- **Spelled-out numbers flow better rounded** ("hampir satu koma dua miliar" over
  "satu koma satu tujuh miliar"), and "koma" inside a number is a word, not a pause.

## Tone

- Address the viewer as **kamu**. Not *Anda* (too formal), and not *lo/gue* (too Jakarta-specific for a broad audience).
- Use everyday forms:

  | Use | Instead of |
  |---|---|
  | nggak | tidak |
  | gimana | bagaimana |
  | udah | sudah |
  | aja | saja |
  | cuma | hanya |
  | kayak | seperti |
  | kalau | jika / apabila |
  | soalnya | karena / oleh karena itu |
  | bikin | membuat |
  | pakai | menggunakan |
  | terus / lalu | kemudian |
  | tapi | tetapi / namun |
  | banget | sangat |
  | gede | besar (when it sounds natural) |

- Particles (*nih, sih, ya, kok, dong*) are welcome, but use one per sentence at most and not every line.
- Avoid stiff words like *merupakan, adalah* (when they can be dropped), *para investor sekalian*,
  *oleh karena itu* and *sebagaimana*.
- Avoid alay or over-slang: *anjay, bestie, gaes* (more than once), *wkwk*. Avoid emoji in the voiceover.
- Keep sentences short, one idea each. The first line is the hook: a question or a surprising number.
- Be honest about losses and risk. Never hype, never promise returns.

## Keep these in English

These are the words Indonesian retail investors actually use, so use them as-is in captions and the voice:

market cap · free float · volume · value · foreign flow · net buy · net sell · broker summary ·
bandarmology · support · resistance · breakout · breakdown · trend · uptrend · downtrend · sideways ·
all time high (ATH) · cut loss · take profit · hold · average down · average up · DCA · buyback ·
stock split · right issue · IPO · dividend yield · payout ratio · PER · PBV · ROE · EPS · return ·
screener · signals · technical · fundamental · custom indicators · sell-off · rebound · rally · timing ·
price action · moving average (MA) · VWAP · plot twist

## Keep these in Indonesian

saham · harga · naik · turun · anjlok · cuan · untung · rugi · boncos · modal · laba bersih ·
pendapatan · utang · dividen · emiten · bursa · indeks · sektor · investor ritel · asing (for foreign
investors, e.g. "asing net buy") · bandar · gorengan · portofolio · akumulasi · distribusi ·
Analisa Kepentingan (a Hakabot feature name)

When unsure, ask: "What would a Stockbit/TikTok finance creator say?" Use that.

## Numbers on screen (display)

| What | Format | Example |
|---|---|---|
| Rupiah, exact | dot thousands | Rp 5.000.000 |
| Rupiah, rounded | juta / miliar / triliun, comma decimals | Rp 5 juta · Rp 1,17 miliar · Rp 2,3 triliun |
| Percent | comma decimal | 15,6% · −1,6% · +67,5% |
| Index, price, lots | dot thousands | IHSG 6.043 · 8.647 |
| Axis ticks | jt / M (miliar) / T (triliun) | 250 jt · 1,2 M |
| Dates | day + short month (Indonesian) | 9 Okt 2026 · Des 2025 · MEI 2010 |

Never use English B/M for amounts: "M" means *miliar* here. In code use `src/core/format.ts`
(`fmt.rp`, `fmt.num`, `fmt.pct`, `fmt.signedPct`, `fmt.axis`, `fmt.words`, `monthLabel`, `dateLabel`).
Months: JAN FEB MAR APR MEI JUN JUL AGU SEP OKT NOV DES.

## Numbers and acronyms in the voice (spoken)

The voice gets the **spoken** half of `{display|spoken}` markup (see `docs/script-format.md`).
Write anything a TTS could misread as words:

- Amounts: `{Rp 1,61 miliar|satu koma enam satu miliar}` (add "rupiah" on the first mention only)
- Percent: `{15,6%|lima belas koma enam persen}`
- Years: `{2026|dua ribu dua puluh enam}`
- Index levels: `{6.043|enam ribu empat puluh tiga}`, or round it in speech: `{8.600-an|delapan ribu enam ratusan}`
- Tickers: say them the way investors do. Most are spelled out with Indonesian letter names:
  `{BBCA|Bé Bé Cé A}` (spaces + é, see "Pronunciation rules" below), `{IHSG|I Ha És Gé}`. Some are said as words:
  `{TLKM|Telkom}`, `{GOTO|Goto}`, `{ANTM|Antam}`, `{ERAA|Era}`.
- Acronyms said as letters: `{PER|Pé É Ér}`, `{PBV|Pé Bé Fé}`, `{ROE|Ér O É}`, `{EPS|É Pé És}`, `{IPO|I Pé O}`.
  DCA is usually said in English letters, so leave it plain.
- URL: `{hakabot.com|hakabot dot com}`

Indonesian letter names: A a · B be · C ce · D de · E e · F ef · G ge · H ha · I i · J je · K ka ·
L el · M em · N en · O o · P pe · Q ki · R er · S es · T te · U u · V fe · W we · X eks · Y ye · Z zet.

### Pronunciation rules from the user (16 Okt 2026, tut01) — follow these every time

The speech-to-text check can't hear vowel colour, so these errors pass `vo:check`. The user caught them by ear.

- **Spell letters with SPACES and é (house rule, user's pick 16 Okt by ear).** Write spelled-out tickers and codes as
  separate letter names with spaces, never hyphens, and write the letter names that contain e with **é**:
  `{BBCA|Bé Bé Cé A}` · `{BBRI|Bé Bé Ér I}` · `{PTBA|Pé Té Bé A}` · `{IHSG|I Ha És Gé}`. Hyphens ("Be-Be-Ce-A") make
  eleven_v3 pause on every letter and say "be" like *Bekasi*; spaces + é give the "be" of *beda*, "pe" of *pengamen*,
  "te" of *tega* with an even rhythm. Reference clips the user approved: `episodes/tut01-hakabot-tutorial/qa/pron-test/`
  `bbca-3-Be-Be-Ce-A-spaces.mp3`, `bbri-3-Be-Be-Er-I-spaces.mp3`. Use this for every new script, every ticker, broker
  code and acronym. (Older takes with hyphens that the user heard as correct, e.g. tut01's BK, CP, PE, stay as they are;
  don't re-voice them just for the rule.)
  Letter names to use: A · Bé · Cé · Dé · É · Éf · Gé · Ha · I · Jé · Ka · Él · Ém · Én · O · Pé · Ki · Ér · És · Té · U ·
  Fé · Wé · Éks · Yé · Zét.
- **Say some tickers as words or names**, the way investors say them:
  `{ERAA|Era}` (never E-Er-A-A) · `{PTBA|Bukit Asam}` when the letter version still sounds off.
- **Avg RR** is read `{Avg RR|average ratio}`: "average" as the normal English word, RR as "ratio", never "Er-Er".
- **Test before you spend.** For any ticker or code not yet listed here (or in an episode's `vo-cache.json` as
  approved), voice a 2–3 variant test clip first and let the user pick by ear (`python -I scripts/voices.py` or a
  tiny scratch episode); a test costs ~20 characters per variant, a re-voiced scene costs hundreds.
- **Confirmed spellings** (update this list whenever the user approves one by ear):
  BBCA `Bé Bé Cé A` · BBRI `Bé Bé Ér I` · PTBA `Pé Té Bé A` · ERAA `Era` · Avg RR `average ratio` · LQ45 `El Kiu empat lima` ·
  TEBE `Tebe` · SM Local `Smart Money Local` · ANTM `Antam`. Test results: `episodes/tut01-hakabot-tutorial/qa/pron-test.md`.

After the voiceover is generated, `npm run vo:check -- <id>` transcribes it and flags lines that
were read wrong. Fix the spoken half and regenerate just those lines.
