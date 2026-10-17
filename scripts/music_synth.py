"""Compose an episode's original underscore in code -> public/music/<epNN>-score.wav (48 kHz, 16-bit stereo).

Usage: python -I scripts/music_synth.py [episode-id]     (npm run music -- ep01-ihsg-dca)

A curious, cinematic explainer underscore: felt piano, warm analog-style pads, a soft pulsing bass and a
plucked arpeggio that build momentum, light percussion only at the builds, a spacious synthetic hall.
Key: D major / B minor, which agrees with the B/C SFX (b-confirm pings G5 -> D6, b-mark A5/E6).

Every section boundary comes from the episode's real timing.json (scene starts, "Di puncaknya", the crash
fall, the end-card line), and each section is a whole number of bars, so the tempo flexes a little
(~87-106 BPM) to put every change on a bar line at its cut. Re-run after a re-voice. The file is exactly
the video's length, so MusicBed never loops it.

Mix rules baked in: the 1-4 kHz band is dipped ~8 dB while the voice speaks; the music dips under the
Covid and Twist impacts and collapses (tape-stop + closing filter) into silence for the 2026 crash.
Mastered to -16 LUFS integrated (the voice's level), so `music.level` reads directly as a gain against the
voice. Everything is synthesized from oscillators and noise: nothing to license.

The arrangement in score() is ep01's. A new episode copies score() and rewrites the sections.
ep03 (ep03-inflasi-tabungan) has its own load_anchors_ep03() / score_ep03() / main_ep03(): instead of a
tape-stop it builds into the -0,28% reveal and stops dead 30 ms before it (the b-hit lands in silence), and its
DBus declicks every note with 3 ms fades, and peak_guard() dips the score for a few 20 ms blocks where it would
lift the voice's true peak (it decodes the VO takes, so rebuild after any re-voice). main() dispatches on the episode id.
tut01 (tut01-hakabot-tutorial, 18 min) has load_anchors_tut() / score_tut() / main_tut(): a calm long-form bed that
changes progression and texture every ~1 min, lifts into each chapter card and resolves on the end card. It writes
public/music/tut01-hakabot-tutorial-score.wav (the full id), and its peak guard assumes music.level 0.2.
"""
import json
import sys
from pathlib import Path

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, fftconvolve, lfilter, sosfilt, sosfiltfilt

sys.stdout.reconfigure(encoding="utf-8")

SR = 48_000
ROOT = Path(__file__).resolve().parent.parent
TARGET_LUFS = -16.0
rng = np.random.default_rng(1729)

# ---------------------------------------------------------------------------------------------
# Timing anchors (seconds)
# ---------------------------------------------------------------------------------------------


def load_anchors(ep: str) -> dict:
    t = json.loads((ROOT / "src" / "episodes" / ep / "timing.json").read_text(encoding="utf-8"))
    if t.get("estimated"):
        print("WARNING: timing.json is estimated; re-run after the real voiceover lands.")
    fps = t["fps"]
    sc = {s["id"]: s["from"] / fps for s in t["scenes"]}
    lines = {l["id"]: l for l in t["lines"]}
    words = {}
    for c in t.get("captions", []):
        for w in c["words"]:
            key = (c["line"], w["text"].rstrip(",.!?").replace(" ", " "))
            words.setdefault(key, w["from"])

    def word(line, text, fallback):
        return words.get((line, text), fallback)

    # Mirrors Journey.tsx usePlan(): the fall starts at fallFrom, the crash lands at crashAt.
    peak = lines["j-peak"]
    crash_line = lines["j-crash"]
    y2026 = word("j-crash", "2026", crash_line["from"])
    anjlok = word("j-crash", "anjlok", crash_line["from"] + 60)
    crash_at = anjlok - 3
    fall_from = max(peak["from"] + peak["dur"] + 6, min(crash_at - 15, max(y2026 - 6, crash_at - 60)))
    juni = word("twist-1", "Juni", lines["twist-1"]["from"] + 70)
    return {
        "total": t["totalFrames"] / fps,
        "ihsg": sc["ihsg"], "journey": sc["journey"], "twist": sc["twist"], "result": sc["result"],
        "lesson": sc["lesson"], "outro": sc["hakabot-outro"],
        "lift": peak["from"] / fps,
        "fall": fall_from / fps, "crash": crash_at / fps,
        "covid": (lines["j-covid"]["from"] - 3) / fps,   # Journey covidAt
        "twist_hit": (juni + 56) / fps,                  # Twist DROP[1]
        "end": lines["outro-5"]["from"] / fps,           # end card line ("Cek di hakabot.com")
        "voiced": [(l["from"] / fps, (l["from"] + l["dur"]) / fps) for l in t["lines"]],
    }


# ---------------------------------------------------------------------------------------------
# Notes and chords
# ---------------------------------------------------------------------------------------------

NOTE = {"C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "G#": 8, "A": 9, "A#": 10, "B": 11}


def hz(name: str) -> float:
    p, o = name[:-1], int(name[-1])
    return 440.0 * 2 ** ((NOTE[p] + 12 * (o + 1) - 69) / 12)


def H(*names):
    return [hz(n) for n in names]


# name: (bass root, pad voicing, arpeggio tones low -> high)
CH = {
    "Gmaj9": (hz("G2"), H("G3", "B3", "D4", "F#4"), H("B3", "D4", "F#4", "A4")),
    "D/F#": (hz("F#2"), H("F#3", "A3", "D4", "E4"), H("D4", "F#4", "A4", "E5")),
    "Em9": (hz("E2"), H("E3", "G3", "B3", "D4"), H("G4", "B4", "D5", "F#5")),
    "Asus4": (hz("A2"), H("A3", "D4", "E4"), H("A4", "D5", "E5", "A5")),
    "A": (hz("A2"), H("A3", "C#4", "E4"), H("A4", "C#5", "E5", "A5")),
    "Bm": (hz("B1"), H("B3", "D4", "F#4"), H("B3", "D4", "F#4", "C#5")),
    "G": (hz("G2"), H("G3", "B3", "D4"), H("G4", "B4", "D5", "A5")),
    "D": (hz("D2"), H("D3", "F#3", "A3", "E4"), H("D4", "F#4", "A4", "E5")),
    "Em": (hz("E2"), H("E3", "G3", "B3"), H("E4", "G4", "B4", "D5")),
    "F#sus": (hz("F#2"), H("F#3", "B3", "C#4"), H("F#4", "B4", "C#5", "F#5")),
    "F#": (hz("F#2"), H("F#3", "A#3", "C#4"), H("F#4", "A#4", "C#5", "F#5")),
    "A/C#": (hz("C#2"), H("A3", "C#4", "E4"), H("E4", "A4", "C#5", "E5")),
    "Gmaj7#11": (hz("G2"), H("G3", "B3", "F#4", "C#5"), H("B3", "F#4", "C#5", "D5")),
    "Dadd9": (hz("D2"), H("D3", "A3", "E4", "F#4"), H("D4", "A4", "E5", "F#5")),
}

# ---------------------------------------------------------------------------------------------
# DSP helpers
# ---------------------------------------------------------------------------------------------


def tt(sec):
    return np.arange(int(SR * sec)) / SR


def lp(x, fc, order=2):
    return sosfilt(butter(order, fc, btype="low", fs=SR, output="sos"), x)


def hp(x, fc, order=2):
    return sosfilt(butter(order, fc, btype="high", fs=SR, output="sos"), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype="band", fs=SR, output="sos"), x)


def adsr(n, a, r, hold):
    """Linear attack over a s, sustain until `hold` s, then a squared release over r s."""
    x = np.arange(n) / SR
    e = np.clip(x / max(a, 1e-4), 0, 1)
    rel = np.clip(1 - (x - hold) / max(r, 1e-4), 0, 1) ** 2
    return e * np.where(x < hold, 1.0, rel)


def saw(f, sec, detune_cents=0.0):
    """PolyBLEP sawtooth (no aliasing hash under the low-pass)."""
    n = int(SR * sec)
    dt = f * 2 ** (detune_cents / 1200) / SR
    p = (np.arange(n) * dt + rng.uniform()) % 1.0
    y = 2 * p - 1
    a = p < dt
    ta = p[a] / dt
    y[a] -= 2 * ta - ta * ta - 1
    b = p > 1 - dt
    tb = (p[b] - 1) / dt
    y[b] -= tb * tb + 2 * tb + 1
    return y


class Bus:
    """Stereo dry bus + reverb send."""

    def __init__(self, sec):
        n = int(SR * sec) + SR * 5
        self.dry = np.zeros((2, n))
        self.send = np.zeros((2, n))

    def add(self, x, at, gain=1.0, pan=0.0, rev=0.3):
        i = int(round(at * SR))
        if i < 0:
            x, i = x[-i:], 0
        j = min(i + len(x), self.dry.shape[1])
        x = x[: j - i] * gain
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        self.dry[0, i:j] += x * l
        self.dry[1, i:j] += x * r
        self.send[0, i:j] += x * l * rev
        self.send[1, i:j] += x * r * rev


def make_ir(sec=3.2, pre=0.025):
    """Spacious, dark synthetic hall: decorrelated decaying noise per side, highs decaying faster."""
    n = int(SR * sec)
    x = np.arange(n) / SR
    irs = []
    for ch in range(2):
        noise = rng.standard_normal(n)
        ir = (lp(noise, 1800) * np.exp(-x / 0.75) + 0.35 * hp(noise, 1800) * np.exp(-x / 0.28)) * np.clip(x / 0.04, 0, 1)
        ir = np.concatenate([np.zeros(int(SR * (pre + 0.006 * ch))), ir])
        irs.append(ir / np.sqrt(np.sum(ir ** 2)))
    return irs


IR = make_ir()


def render(bus: Bus):
    out = bus.dry.copy()
    for c in range(2):
        out[c] += fftconvolve(bus.send[c], IR[c])[: out.shape[1]]
    return out


# ---------------------------------------------------------------------------------------------
# Instruments
# ---------------------------------------------------------------------------------------------


def piano(f, hold=1.2, vel=0.5):
    """Felt piano: slightly inharmonic partials, soft hammer, highs decay first, felt low-pass."""
    x = tt(hold + 2.2)
    y = np.zeros_like(x)
    tau0 = 2.6 * (261.0 / f) ** 0.45
    for k in range(1, 13):
        fk = k * f * np.sqrt(1 + 0.0004 * k * k)
        if fk > 6000:
            break
        amp = k ** -1.4 * np.exp(-fk / (900 + 1400 * vel))
        y += amp * np.sin(2 * np.pi * fk * x + rng.uniform(0, 6.28)) * np.exp(-x / (tau0 / (1 + 0.35 * (k - 1))))
    y *= np.clip(x / 0.006, 0, 1)
    thump = lp(rng.standard_normal(len(x)), 700) * np.exp(-x / 0.012) * 0.25
    y = lp(y + thump, 2400) * np.clip(x / 0.004, 0, 1)  # ramp the hammer noise too (it started as a step)
    return y * np.where(x < hold, 1.0, np.exp(-(x - hold) / 0.35)) * vel


def pad(freqs, sec, att=1.2, rel=1.6, cutoff=1100):
    """Warm analog pad: 3 detuned saws per note per side, low-passed, slow swell. Returns (2, n)."""
    tot = sec + rel
    out = []
    for side in (-1, 1):
        y = np.zeros(int(SR * tot))
        for f in freqs:
            for d in (-7, 0, 7):
                y += saw(f, tot, d + side * 2.5)
        y = lp(y / (len(freqs) * 3), cutoff, 2)
        out.append(y * adsr(len(y), att, rel, sec))
    return np.stack(out)


def pluck(f, vel=0.5, sec=0.55, bright=1.0):
    """Plucked synth: saw partials, each decaying faster the higher it is."""
    x = tt(sec)
    y = np.zeros_like(x)
    for k in range(1, 20):
        if k * f > 3200 * bright:
            break
        y += (1 / k) * np.sin(2 * np.pi * k * f * x) * np.exp(-x / (0.22 / (1 + 0.45 * k)))
    return y * np.clip(x / 0.003, 0, 1) * vel


def bass(f, sec, vel=0.6, pulse=False):
    x = tt(sec + 0.15)
    y = np.sin(2 * np.pi * f * x) + 0.28 * np.sin(4 * np.pi * f * x) + 0.08 * np.sin(6 * np.pi * f * x)
    e = np.exp(-x / 0.16) * np.clip(x / 0.004, 0, 1) if pulse else adsr(len(x), 0.05, 0.4, sec)
    return np.tanh(1.3 * y * e) * vel


def kick(vel=0.5):
    x = tt(0.45)
    f = 46 + 70 * np.exp(-x / 0.03)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x / 0.22) * np.clip(x / 0.002, 0, 1)
    return lp(np.tanh(1.2 * y), 300) * vel


def shaker(vel=0.12):
    x = tt(0.09)
    return hp(rng.standard_normal(len(x)), 6500, 4) * np.exp(-x / 0.018) * np.clip(x / 0.006, 0, 1) * vel


def tick(vel=0.08):
    x = tt(0.03)
    return bp(rng.standard_normal(len(x)), 6000, 11000) * np.exp(-x / 0.004) * np.clip(x / 0.001, 0, 1) * vel


def swell(freqs, sec, vel=0.4):
    """Reversed felt-piano chord that blooms into the downbeat it leads to."""
    n = int(SR * sec)
    y = np.zeros(n)
    for f in freqs:
        p = piano(f, hold=sec, vel=1.0)[:n]
        y[: len(p)] += p
    y = y[::-1] * (np.arange(n) / n) ** 1.5
    return y / (np.abs(y).max() + 1e-9) * vel


# ---------------------------------------------------------------------------------------------
# ep01 score
# ---------------------------------------------------------------------------------------------


def bars(start, end, n):
    b = (end - start) / n
    return [start + i * b for i in range(n)], b


def chord_pad(bus, ch, at, sec, gain, cutoff=1100, att=1.0, rel=1.8, rev=0.45):
    p = pad(CH[ch][1], sec, att=att, rel=rel, cutoff=cutoff)
    bus.add(p[0], at, gain, -0.6, rev)
    bus.add(p[1], at, gain, 0.6, rev)


def bass_8ths(bus, root, s, beat, vel):
    f = root * 2 if root < 70 else root
    for k in range(8):
        bus.add(bass(f, beat / 2, vel, pulse=True), s + k * beat / 2, 1.0, 0, 0.05)


def pluck_8ths(bus, arp, s, beat, vel, accent=0.05, octave=0.0):
    for k, idx in enumerate([0, 2, 1, 3, 0, 2, 1, 3]):
        at = s + k * beat / 2
        bus.add(pluck(arp[idx], vel + (accent if k % 2 == 0 else 0)), at, 1.0, 0.4 if k % 2 else -0.4, 0.4)
        if octave:
            bus.add(pluck(arp[idx] * 2, octave), at + 0.01, 1.0, -0.5 if k % 2 else 0.5, 0.6)


def score(A: dict):
    total = A["total"]
    early, late = Bus(total), Bus(total)  # `early` is everything that collapses at the crash
    sections = []

    # A · hook + rules: a curious question. Sparse piano, the pad creeps in, a low bass from bar 4.
    prog = ["Gmaj9", "D/F#", "Em9", "Asus4", "Gmaj9", "D/F#", "Em9", "A", "Asus4"]
    starts, bar = bars(0.0, A["ihsg"], len(prog))
    sections.append(("A curious", 0.0, A["ihsg"], 240 / bar, "piano quarter notes, pad from bar 2, piano 8ths + low bass from bar 4"))
    beat = bar / 4
    for i, (s, ch) in enumerate(zip(starts, prog)):
        arp = CH[ch][2]
        sparse = i < 3
        pattern = [0, 2, 1, 3] if sparse else [0, 1, 2, 3, 2, 1, 3, 2]
        step = beat if sparse else beat / 2
        for k, idx in enumerate(pattern):
            if sparse and k == 3 and i % 2 == 0:
                continue
            early.add(piano(arp[idx], hold=step * 1.6, vel=0.32 + 0.06 * (k == 0)), s + k * step, 1.0, -0.25 + idx / 6, 0.55)
        if i >= 1:
            chord_pad(early, ch, s, bar, 0.16 if sparse else 0.24, cutoff=900)
        if i >= 3:
            early.add(bass(CH[ch][0], bar * 0.95, 0.30), s, 1.0, 0, 0.1)

    # B · ihsg -> journey: momentum. Pulse bass from bar 3, pluck 8ths from bar 7 (journey), kick from bar 9;
    # Covid (Em, F#sus) thins out; the last climb gets kick on every beat + shaker, then a reversed-piano bloom.
    prog = ["Bm", "G", "D", "A", "Bm", "G", "D", "A", "Bm", "G", "Em", "F#sus", "Bm", "G", "A"]
    starts, bar = bars(A["ihsg"], A["lift"], len(prog))
    sections.append(("B build", A["ihsg"], A["lift"], 240 / bar, "pad + piano 8ths; pulse bass bar 3; pluck 8ths bar 7; kick bar 9; Covid dip; kick+shaker climb"))
    beat = bar / 4
    for i, (s, ch) in enumerate(zip(starts, prog)):
        root, _, arp = CH[ch]
        covid = ch in ("Em", "F#sus")
        chord_pad(early, ch, s, bar, 0.22 + 0.012 * i, cutoff=850 + 40 * i)
        if i < 6:
            for k, idx in enumerate([0, 1, 2, 3, 2, 1, 2, 3]):
                early.add(piano(arp[idx], hold=beat * 0.9, vel=0.3), s + k * beat / 2, 1.0, -0.3 + 0.2 * idx, 0.5)
        else:
            pluck_8ths(early, arp, s, beat, 0.15 + 0.012 * (i - 6), accent=0.04)
        if i >= 2:
            bass_8ths(early, root, s, beat, 0.2 if covid else 0.26)
        if i >= 8 and not covid:
            climb = i >= 12
            for k in range(4 if climb else 2):
                early.add(kick(0.42 if climb else 0.32), s + k * beat * (1 if climb else 2), 1.0, 0, 0.08)
        if i >= 12:
            for k in range(8):
                early.add(shaker(0.10 if k % 2 else 0.06), s + k * beat / 2, 1.0, 0.3, 0.2)
    early.add(swell(CH["D"][2] + [hz("D3")], bar, 0.30), A["lift"] - bar, 1.0, 0, 0.5)

    # C · the peak ("Di puncaknya"): D major opens up, octave plucks, kick on every beat. The fall starts mid-bar 3.
    for i, ch in enumerate(["D", "A/C#", "D"]):
        s = A["lift"] + i * bar
        root, _, arp = CH[ch]
        chord_pad(early, ch, s, bar, 0.32, cutoff=1400, att=0.3)
        pluck_8ths(early, arp, s, beat, 0.2, accent=0.04, octave=0.07)
        bass_8ths(early, root, s, beat, 0.3)
        for k in range(4):
            early.add(kick(0.45), s + k * beat, 1.0, 0, 0.08)
            early.add(shaker(0.1), s + k * beat + beat / 2, 1.0, 0.3, 0.2)
    sections.append(("C peak", A["lift"], A["fall"], 240 / bar, "D major opens: brighter pad, octave plucks, kick on every beat"))

    # D · twist: dark and sparse. A low B drone fades in after the crash; clock ticks above the voice band,
    # single low piano notes, a heartbeat bass.
    drone_from = A["crash"] + 1.3
    d = pad(H("B1", "F#2", "B2"), A["result"] - drone_from + 0.5, att=A["twist"] - drone_from + 0.3, rel=1.5, cutoff=420)
    late.add(d[0], drone_from, 0.55, -0.5, 0.4)
    late.add(d[1], drone_from, 0.55, 0.5, 0.4)
    prog = ["Bm", "Gmaj7#11", "Em", "F#sus"]
    starts, bar = bars(A["twist"], A["result"], len(prog))
    sections.append(("D twist", A["twist"], A["result"], 240 / bar, "low B drone, dark pad, single piano notes, ticks (6-11 kHz), heartbeat bass"))
    beat = bar / 4
    for i, (s, ch) in enumerate(zip(starts, prog)):
        root, _, arp = CH[ch]
        chord_pad(late, ch, s, bar, 0.14, cutoff=700, att=1.5)
        for k, idx in ((0, 0), (2, 2)) if i % 2 == 0 else ((0, 1), (3, 3)):
            late.add(piano(arp[idx] / 2, hold=beat * 2, vel=0.34), s + k * beat, 1.0, -0.2, 0.6)
        for k in range(8):
            late.add(tick(0.10 if k % 2 == 0 else 0.05), s + k * beat / 2, 1.0, 0.4, 0.15)
        late.add(bass(root, beat * 0.5, 0.22, pulse=True), s, 1.0, 0, 0.1)
        late.add(bass(root, beat * 0.5, 0.14, pulse=True), s + beat * 0.45, 1.0, 0, 0.1)

    # E · result: the pulse comes back, tension easing toward an answer; F#sus -> F# at the end.
    prog = ["Bm", "G", "D", "F#sus"]
    starts, bar = bars(A["result"], A["lesson"], len(prog))
    sections.append(("E result", A["result"], A["lesson"], 240 / bar, "pad, piano 8ths, soft pulse bass; F#sus -> F#"))
    beat = bar / 4
    for s, ch in zip(starts, prog):
        root, _, arp = CH[ch]
        chord_pad(late, ch, s, bar, 0.2, cutoff=850, att=0.8)
        for k, idx in enumerate([0, 1, 2, 3, 2, 1, 2, 3]):
            late.add(piano(arp[idx], hold=beat * 0.9, vel=0.28), s + k * beat / 2, 1.0, -0.3 + 0.2 * idx, 0.5)
        bass_8ths(late, root, s, beat, 0.2)
    late.add(piano(hz("A#4"), hold=bar / 4, vel=0.22), starts[-1] + bar * 0.75, 1.0, 0.1, 0.6)

    # F · lesson: reflective. Slower, rolled piano chords over the pad, no pulse; blooms into the outro.
    prog = ["Gmaj9", "Asus4"]
    starts, bar = bars(A["lesson"], A["outro"], len(prog))
    sections.append(("F lesson", A["lesson"], A["outro"], 240 / bar, "rolled piano chords + pad, no pulse; Asus4 -> A, reversed bloom into D"))
    for i, (s, ch) in enumerate(zip(starts, prog)):
        root, _, arp = CH[ch]
        chord_pad(late, ch, s, bar, 0.22, cutoff=900, att=0.6, rel=2.2)
        late.add(bass(root, bar, 0.26), s, 1.0, 0, 0.15)
        for k, f in enumerate([root * 2] + arp):
            late.add(piano(f, hold=bar, vel=0.3), s + k * 0.07, 1.0, -0.4 + 0.2 * k, 0.6)
        if i == 1:
            late.add(piano(hz("C#5"), hold=bar / 2, vel=0.22), s + bar / 2, 1.0, 0.2, 0.6)
    late.add(swell(CH["D"][2], bar * 0.75, 0.22), A["outro"] - bar * 0.75, 1.0, 0, 0.5)

    # G · Hakabot tour: lighter, confident, forward. Plucks from bar 1, bass bar 2, kick + shaker bar 3.
    prog = ["D", "A", "Bm", "G", "D", "A", "G"]
    starts, bar = bars(A["outro"], A["end"], len(prog))
    sections.append(("G outro", A["outro"], A["end"], 240 / bar, "D A Bm G D A G->A: plucks, pulse bass, kick (halves, then quarters) + shaker"))
    beat = bar / 4
    for i, (s, ch) in enumerate(zip(starts, prog)):
        root, _, arp = CH[ch]
        last = i == len(prog) - 1
        chord_pad(late, ch, s, bar, 0.22, cutoff=1200, att=0.4)
        if last:  # G for two beats, then A leading home
            for k, idx in enumerate([0, 2, 1, 3]):
                late.add(pluck(arp[idx], 0.2 if k % 2 == 0 else 0.17), s + k * beat / 2, 1.0, 0.4 if k % 2 else -0.4, 0.4)
                late.add(pluck(CH["A"][2][idx], 0.22 if k % 2 == 0 else 0.18), s + bar / 2 + k * beat / 2, 1.0, 0.4 if k % 2 else -0.4, 0.4)
        else:
            pluck_8ths(late, arp, s, beat, 0.17)
        if i >= 1:
            bass_8ths(late, root, s, beat, 0.26)
        if i >= 2:
            for k in range(0, 4, 2 if i < 4 else 1):
                late.add(kick(0.36), s + k * beat, 1.0, 0, 0.08)
            for k in range(8):
                late.add(shaker(0.09 if k % 2 else 0.05), s + k * beat / 2, 1.0, 0.3, 0.2)
    late.add(swell(CH["Dadd9"][2], beat * 2, 0.22), A["end"] - beat * 2, 1.0, 0, 0.5)

    # H · end card: home on D add9, ringing out under "Cek di hakabot.com".
    ring = total - A["end"]
    sections.append(("H end card", A["end"], total, None, "D add9: rolled piano + pad + low D, rings out"))
    root, _, arp = CH["Dadd9"]
    chord_pad(late, "Dadd9", A["end"], ring, 0.26, cutoff=1000, att=0.05, rel=1.5)
    late.add(bass(root, ring, 0.32), A["end"], 1.0, 0, 0.2)
    for k, f in enumerate([hz("D3")] + arp):
        late.add(piano(f, hold=ring, vel=0.34), A["end"] + k * 0.05, 1.0, -0.4 + 0.16 * k, 0.65)

    return early, late, sections


# ---------------------------------------------------------------------------------------------
# Mix
# ---------------------------------------------------------------------------------------------


def tape_stop(x, t0, dur):
    """From t0 everything slows to a stop over `dur` s, a low-pass closes (2.5 kHz -> 120 Hz), level falls to 0."""
    i0, n = int(t0 * SR), int(dur * SR)
    u = np.arange(n) / n
    pos = i0 + np.cumsum((1 - u) ** 1.6)
    idx = np.arange(x.shape[1])
    seg = np.stack([np.interp(pos, idx, x[c]) for c in range(2)]) * (1 - u) ** 1.2
    blk = 480
    for c in range(2):
        a0 = np.exp(-2 * np.pi * 2500 / SR)
        zi = np.array([a0 * seg[c, 0]])  # start the filter settled on the signal, not at 0 (that was a step)
        for b in range(0, n, blk):
            a = np.exp(-2 * np.pi * 2500 * (120 / 2500) ** (b / n) / SR)
            seg[c, b:b + blk], zi = lfilter([1 - a], [1, -a], seg[c, b:b + blk], zi=zi)
    k = int(0.004 * SR)  # 4 ms crossfade from the untouched signal into the stop
    seg[:, :k] = x[:, i0:i0 + k] * (1 - np.linspace(0, 1, k)) + seg[:, :k] * np.linspace(0, 1, k)
    out = x.copy()
    out[:, i0:i0 + n] = seg
    out[:, i0 + n:] = 0
    return out


def smooth_mask(spans, n, pad_s=0.2, ramp_s=0.25):
    m = np.zeros(n)
    for a, b in spans:
        m[max(0, int((a - pad_s) * SR)):min(n, int((b + pad_s) * SR))] = 1
    k = int(ramp_s * SR)
    c = np.concatenate([np.zeros(1), np.cumsum(m)])  # moving average via cumsum (a direct convolve takes minutes)
    i = np.arange(n)
    lo, hi = np.clip(i - k // 2, 0, n), np.clip(i + k - k // 2, 0, n)
    return (c[hi] - c[lo]) / k


# BS.1770 loudness (48 kHz K-weighting), used to master and by the balance check.
def k_weight(x):
    y = lfilter([1.53512485958697, -2.69169618940638, 1.19839281085285], [1, -1.69065929318241, 0.73248077421585], x)
    return lfilter([1, -2, 1], [1, -1.99004745483398, 0.99007225036621], y)


def block_power(x, win=0.4, hop=0.1):
    """x: (channels, n). K-weighted mean square per block, summed over channels; also block start times."""
    kw = np.stack([k_weight(c) for c in np.atleast_2d(x)])
    w, h = int(win * SR), int(hop * SR)
    cs = np.concatenate([np.zeros((kw.shape[0], 1)), np.cumsum(kw ** 2, axis=1)], axis=1)
    st = np.arange(0, kw.shape[1] - w + 1, h)
    return ((cs[:, st + w] - cs[:, st]) / w).sum(axis=0), st / SR


def lufs(p):
    return -0.691 + 10 * np.log10(np.asarray(p) + 1e-12)


def integrated(x):
    p, _ = block_power(x)
    p = p[lufs(p) > -70]
    p = p[lufs(p) > lufs(p.mean()) - 10]
    return float(lufs(p.mean()))


# ---------------------------------------------------------------------------------------------
# ep03 score (ep03-inflasi-tabungan): "Rp 10 juta di lemari", inflation, bank, the formula, the habit
# ---------------------------------------------------------------------------------------------

# Extra voicing for ep03 (same D major / B minor family).
CH["Bm/A"] = (hz("A2"), H("A3", "B3", "D4", "F#4"), H("B3", "D4", "F#4", "A4"))


class DBus(Bus):
    """Bus that declicks every clip it receives (3 ms fade in and out per note/layer), so no splice has a step."""

    def add(self, x, at, gain=1.0, pan=0.0, rev=0.3):
        x = np.array(x, dtype=float)
        k = min(int(0.003 * SR), len(x) // 2)
        if k > 0:
            r = np.linspace(0.0, 1.0, k)
            x[:k] *= r
            x[-k:] *= r[::-1]
        super().add(x, at, gain, pan, rev)


def load_anchors_ep03(ep: str) -> dict:
    t = json.loads((ROOT / "src" / "episodes" / ep / "timing.json").read_text(encoding="utf-8"))
    if t.get("estimated"):
        print("WARNING: timing.json is estimated; re-run after the real voiceover lands.")
    fps = t["fps"]
    sc = {s["id"]: s["from"] / fps for s in t["scenes"]}
    lines = {l["id"]: l for l in t["lines"]}
    words = {}
    for c in t.get("captions", []):
        for w in c["words"]:
            words.setdefault((c["line"], w["text"].rstrip(",.!?").replace(" ", " ")), w["from"])

    def word(line, text, fallback):
        return words.get((line, text), fallback)

    # Mirrors Formula.tsx: the red -0,28% term lands on `result` = "minus"; the b-hit fires at result - 3.
    minus = word("formula-3", "minus", lines["formula-3"]["from"] + 90)
    return {
        "total": t["totalFrames"] / fps,
        "shrink": sc["shrink"], "bank": sc["bank"], "formula": sc["formula"], "lesson": sc["lesson"],
        "outro": sc["hakabot-outro"],
        "reveal": (sc["formula"] * fps + max(minus - sc["formula"] * fps, 0) - 3) / fps,
        "tumbuh": word("lesson-2", "tumbuh", lines["lesson-2"]["from"] + 90) / fps,
        "end": lines["outro-5"]["from"] / fps,
        "voiced": [(l["from"] / fps, (l["from"] + l["dur"]) / fps) for l in t["lines"]],
    }


def score_ep03(A: dict):
    total = A["total"]
    pre, post = DBus(total), DBus(total)  # `pre` is everything up to the reveal; it stops dead just before it
    sections = []

    # A · hook: a curious question. Sparse piano quarters over a thin pad; Gmaj9 -> Asus4, left hanging.
    prog = ["Gmaj9", "Asus4"]
    starts, bar = bars(0.0, A["shrink"], len(prog))
    sections.append(("A hook", 0.0, A["shrink"], 240 / bar, "Gmaj9 -> Asus4: sparse piano quarters, thin pad (the question left open)"))
    beat = bar / 4
    for i, (s, ch) in enumerate(zip(starts, prog)):
        arp = CH[ch][2]
        for k, idx in enumerate([0, 2, 1, 3]):
            pre.add(piano(arp[idx], hold=beat * 1.6, vel=0.3 + 0.05 * (k == 0)), s + k * beat, 1.0, -0.25 + idx / 6, 0.55)
        chord_pad(pre, ch, s, bar, 0.13, cutoff=850, att=1.2)

    # B · shrink: a slow, uneasy drift. A falling piano figure each bar over a descending bass (B A G E F#), clock
    # ticks above the voice band ("tiap tahun"); F#sus -> F# leans into the bank question.
    prog = ["Bm", "Bm/A", "Gmaj7#11", "Em9", "F#sus", "F#"]
    starts, bar = bars(A["shrink"], A["bank"], len(prog))
    sections.append(("B shrink", A["shrink"], A["bank"], 240 / bar, "Bm Bm/A Gmaj7#11 Em9 F#sus F#: falling piano 8ths, low bass, clock ticks"))
    beat = bar / 4
    for i, (s, ch) in enumerate(zip(starts, prog)):
        root, _, arp = CH[ch]
        chord_pad(pre, ch, s, bar, 0.17 + 0.01 * i, cutoff=780, att=1.0)
        for k, idx in enumerate([3, 2, 1, 0, 3, 2, 1, 0]):
            if k in (3, 7) and i % 2 == 0:
                continue  # breathe
            pre.add(piano(arp[idx], hold=beat * 0.9, vel=0.26 + 0.04 * (k % 4 == 0)), s + k * beat / 2, 1.0, 0.3 - 0.2 * idx, 0.55)
        pre.add(bass(root, bar * 0.95, 0.24), s, 1.0, 0, 0.12)
        if i >= 1:
            for k in range(4):
                pre.add(tick(0.07 if k % 2 == 0 else 0.04), s + k * beat, 1.0, 0.4, 0.15)

    # C · bank: neutral, a light pulse. Soft pulse bass throughout, light plucked 8ths from bar 2, no drums.
    prog = ["Gmaj9", "D/F#", "Em9", "F#sus", "D", "A", "Asus4"]
    starts, bar = bars(A["bank"], A["formula"], len(prog))
    sections.append(("C bank", A["bank"], A["formula"], 240 / bar, "Gmaj9 D/F# Em9 F#sus D A Asus4: pad, soft pulse bass, light plucks from bar 2"))
    beat = bar / 4
    for i, (s, ch) in enumerate(zip(starts, prog)):
        root, _, arp = CH[ch]
        chord_pad(pre, ch, s, bar, 0.2, cutoff=950, att=0.8)
        bass_8ths(pre, root, s, beat, 0.17)
        if i >= 1:
            pluck_8ths(pre, arp, s, beat, 0.12, accent=0.03)
        else:
            for k, idx in enumerate([0, 2, 1, 3]):
                pre.add(piano(arp[idx], hold=beat * 1.2, vel=0.26), s + k * beat, 1.0, -0.25 + idx / 6, 0.5)

    # D · formula build: calm piano -> pulse bass -> plucks -> kick -> kick + shaker + octave plucks, a reversed
    # F# bloom, then a dead stop 30 ms before the red -0,28% lands (b-build + b-hit and the voice carry it alone).
    prog = ["Bm", "G", "D", "A", "Em9", "F#sus"]
    starts, bar = bars(A["formula"], A["reveal"], len(prog))
    sections.append(("D build", A["formula"], A["reveal"], 240 / bar, "Bm G D A Em9 F#sus: piano 8ths; pulse bass bar 2; plucks bar 3; kick bar 4; shaker bar 5; octaves + kick on every beat bar 6"))
    beat = bar / 4
    for i, (s, ch) in enumerate(zip(starts, prog)):
        root, _, arp = CH[ch]
        chord_pad(pre, ch, s, bar, 0.2 + 0.02 * i, cutoff=800 + 100 * i, att=0.6)
        if i < 2:
            for k, idx in enumerate([0, 1, 2, 3, 2, 1, 2, 3]):
                pre.add(piano(arp[idx], hold=beat * 0.9, vel=0.27), s + k * beat / 2, 1.0, -0.3 + 0.2 * idx, 0.5)
        else:
            pluck_8ths(pre, arp, s, beat, 0.14 + 0.015 * (i - 2), accent=0.04, octave=0.06 if i == 5 else 0.0)
        if i >= 1:
            bass_8ths(pre, root, s, beat, 0.2 + 0.02 * i)
        if i >= 3:
            for k in range(0, 4, 1 if i == 5 else 2):
                pre.add(kick(0.3 + 0.04 * (i - 3)), s + k * beat, 1.0, 0, 0.08)
        if i >= 4:
            for k in range(8):
                pre.add(shaker(0.09 if k % 2 else 0.05), s + k * beat / 2, 1.0, 0.3, 0.2)
    pre.add(swell(CH["F#"][2], bar * 0.75, 0.26), A["reveal"] - bar * 0.75, 1.0, 0, 0.5)

    # E · after the reveal: ~1 s of silence, then a low B drone creeps in; a dark pad and single low piano notes
    # under "saldonya kelihatan nambah, padahal nilainya sebenarnya turun"; the shrink's clock ticks return; a
    # reversed A bloom leads into the lesson's D.
    prog = ["Bm", "Gmaj7#11", "Em9"]
    starts, bar = bars(A["reveal"], A["lesson"], len(prog))
    sections.append(("E aftermath", A["reveal"], A["lesson"], 240 / bar, "Bm Gmaj7#11 Em9: silence ~1 s, low B drone, dark pad, single low piano notes, ticks; A bloom into D"))
    beat = bar / 4
    drone_from = A["reveal"] + 1.0
    d = pad(H("B1", "F#2", "B2"), A["lesson"] - drone_from + 0.3, att=1.6, rel=1.4, cutoff=420)
    post.add(d[0], drone_from, 0.5, -0.5, 0.4)
    post.add(d[1], drone_from, 0.5, 0.5, 0.4)
    for i, (s, ch) in enumerate(zip(starts, prog)):
        root, _, arp = CH[ch]
        if i == 0:
            continue
        chord_pad(post, ch, s, bar, 0.14, cutoff=700, att=1.2)
        for k, idx in ((0, 0), (2, 2)) if i % 2 == 0 else ((0, 1), (3, 3)):
            post.add(piano(arp[idx] / 2, hold=beat * 2, vel=0.32), s + k * beat, 1.0, -0.2, 0.6)
        for k in range(4):
            post.add(tick(0.07 if k % 2 == 0 else 0.04), s + k * beat, 1.0, 0.4, 0.15)
    post.add(swell(CH["A"][2], bar * 0.6, 0.18), A["lesson"] - bar * 0.6, 1.0, 0, 0.5)

    # F · lesson: warm, confident resolve. Rolled piano chords from D, piano 8ths from bar 2, soft pulse bass from
    # bar 3; a high C#5 on "tumbuh"; the A blooms home into the outro's D.
    prog = ["D", "Gmaj9", "Em9", "A"]
    starts, bar = bars(A["lesson"], A["outro"], len(prog))
    sections.append(("F lesson", A["lesson"], A["outro"], 240 / bar, "D Gmaj9 Em9 A: rolled piano + warm pad; 8ths bar 2; pulse bass bar 3; C#5 on 'tumbuh'; bloom into D"))
    beat = bar / 4
    for i, (s, ch) in enumerate(zip(starts, prog)):
        root, _, arp = CH[ch]
        chord_pad(post, ch, s, bar, 0.2 + 0.015 * i, cutoff=950 + 60 * i, att=0.6, rel=2.0)
        for k, f in enumerate([root * 2] + arp):
            post.add(piano(f, hold=bar * (1.0 if i == 0 else 0.5), vel=0.28), s + k * 0.07, 1.0, -0.4 + 0.2 * k, 0.6)
        if i >= 1:
            for k, idx in enumerate([0, 1, 2, 3, 2, 1, 2, 3]):
                if k == 0:
                    continue  # the rolled chord carries the downbeat
                post.add(piano(arp[idx], hold=beat * 0.9, vel=0.22), s + k * beat / 2, 1.0, -0.3 + 0.2 * idx, 0.5)
        if i >= 2:
            bass_8ths(post, root, s, beat, 0.17)
        else:
            post.add(bass(root, bar * 0.95, 0.26), s, 1.0, 0, 0.15)
    post.add(piano(hz("C#5"), hold=1.2, vel=0.24), A["tumbuh"], 1.0, 0.2, 0.6)
    post.add(swell(CH["D"][2], bar * 0.6, 0.22), A["outro"] - bar * 0.6, 1.0, 0, 0.5)

    # G · Hakabot tour: ep01's forward outro cue, re-fitted to this episode's outro timing.
    prog = ["D", "A", "Bm", "G", "D", "A", "G"]
    starts, bar = bars(A["outro"], A["end"], len(prog))
    sections.append(("G outro", A["outro"], A["end"], 240 / bar, "D A Bm G D A G->A: plucks, pulse bass, kick (halves, then quarters) + shaker (as ep01)"))
    beat = bar / 4
    for i, (s, ch) in enumerate(zip(starts, prog)):
        root, _, arp = CH[ch]
        last = i == len(prog) - 1
        chord_pad(post, ch, s, bar, 0.22, cutoff=1200, att=0.4)
        if last:  # G for two beats, then A leading home
            for k, idx in enumerate([0, 2, 1, 3]):
                post.add(pluck(arp[idx], 0.2 if k % 2 == 0 else 0.17), s + k * beat / 2, 1.0, 0.4 if k % 2 else -0.4, 0.4)
                post.add(pluck(CH["A"][2][idx], 0.22 if k % 2 == 0 else 0.18), s + bar / 2 + k * beat / 2, 1.0, 0.4 if k % 2 else -0.4, 0.4)
        else:
            pluck_8ths(post, arp, s, beat, 0.17)
        if i >= 1:
            bass_8ths(post, root, s, beat, 0.26)
        if i >= 2:
            for k in range(0, 4, 2 if i < 4 else 1):
                post.add(kick(0.36), s + k * beat, 1.0, 0, 0.08)
            for k in range(8):
                post.add(shaker(0.09 if k % 2 else 0.05), s + k * beat / 2, 1.0, 0.3, 0.2)
    post.add(swell(CH["Dadd9"][2], beat * 2, 0.22), A["end"] - beat * 2, 1.0, 0, 0.5)

    # H · end card: home on D add9 under "Cek di hakabot.com".
    ring = total - A["end"]
    sections.append(("H end card", A["end"], total, None, "D add9: rolled piano + pad + low D, rings out"))
    root, _, arp = CH["Dadd9"]
    chord_pad(post, "Dadd9", A["end"], ring, 0.26, cutoff=1000, att=0.05, rel=1.5)
    post.add(bass(root, ring, 0.32), A["end"], 1.0, 0, 0.2)
    for k, f in enumerate([hz("D3")] + arp):
        post.add(piano(f, hold=ring, vel=0.34), A["end"] + k * 0.05, 1.0, -0.4 + 0.16 * k, 0.65)

    return pre, post, sections


def voice_timeline(ep: str, n: int):
    """The episode's voiceover as Remotion plays it (mono takes at -3 dB per channel), on the master timeline.
    Decoded via temp WAVs: binary stdout doesn't survive the npx wrapper on Windows."""
    import subprocess
    import tempfile
    t = json.loads((ROOT / "src" / "episodes" / ep / "timing.json").read_text(encoding="utf-8"))
    v = np.zeros(n)
    with tempfile.TemporaryDirectory() as tmp:
        for take in t.get("voice") or []:
            if not take.get("audio"):
                continue
            wav = Path(tmp) / f"{take['id']}.wav"
            subprocess.run(["npx", "remotion", "ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i",
                            str(ROOT / "public" / take["audio"]), "-ac", "1", "-ar", str(SR), str(wav)],
                           capture_output=True, cwd=ROOT, shell=sys.platform == "win32")
            if not wav.exists():
                raise SystemExit(f"could not decode {take['audio']} (is Remotion's ffmpeg blocked?)")
            sr, x = wavfile.read(wav)
            x = x.astype(float) / 32768 * 10 ** (-3.01 / 20)
            i = int(round(take["from"] / t["fps"] * SR))
            j = min(n, i + len(x))
            v[i:j] += x[: j - i]
    return v


def peak_guard(mix, v, A, level=0.3, blk_s=0.02, depth_db=10.0, iters=4):
    """Dip the score only where it would push the voice's true peak higher (ep03 QA round 1).

    The final render normalizes to -14 LUFS with a gain capped by the true peak, and the voice is limited, so its
    loudest syllables already sit near that cap. A score 20 dB down still adds up to ~0.6 dB when it lines up in phase
    with one of them. This rebuilds what the viewer hears (voice as Remotion plays a mono take, score at `level` with
    MusicBed's duck), finds the 20 ms blocks whose 4x-oversampled peak is above the voice's own maximum, and dips
    the score `depth_db` there (+/-20 ms, 15 ms ramps). The dips are a few, each under a loud syllable, so inaudible.
    Returns the gain curve and the number of blocks dipped."""
    from scipy.signal import resample_poly
    n = mix.shape[1]
    fps = 30.0
    spans_v = [(a * fps, b * fps) for a, b in A["voiced"]]
    frames = np.arange(int(n / SR * fps) + 2)
    voiced = np.array([any(a - 6 <= f <= b + 6 for a, b in spans_v) for f in range(len(frames) + 16)])
    on = np.array([sum(voiced[max(0, f + k)] for k in range(-8, 9, 2)) for f in frames]) / 9
    env = level * (1 - 0.65 * on)
    heard_gain = np.interp(np.arange(n) / SR * fps, frames, env)
    blk = int(blk_s * SR)
    nb = n // blk

    def block_tp(x):
        up = np.abs(resample_poly(x, 4, 1, axis=-1))
        if up.ndim == 2:
            up = up.max(0)
        return up[: nb * blk * 4].reshape(nb, blk * 4).max(1)

    ceiling = block_tp(v).max()
    gain = np.ones(n)
    hot_blocks = set()
    for _ in range(iters):
        s = mix * gain * heard_gain + v
        hot = np.flatnonzero(block_tp(s) > ceiling)
        if not len(hot):
            break
        hot_blocks.update(hot.tolist())
        spans = [(b * blk_s, (b + 1) * blk_s) for b in sorted(hot_blocks)]
        mask = np.clip(smooth_mask(spans, n, pad_s=0.02, ramp_s=0.015), 0, 1)
        gain = 1 - (1 - 10 ** (-depth_db / 20)) * mask
        depth_db += 4  # deepen if a block survives
    return gain, len(hot_blocks)


def main_ep03(ep: str):
    A = load_anchors_ep03(ep)
    pre, post, sections = score_ep03(A)
    n = int(round(A["total"] * SR))
    tv = np.arange(n) / SR

    # The dead stop: the build (dry + its reverb) fades out over 20 ms, ending 30 ms before the reveal; then silence.
    cut_end = A["reveal"] - 0.03
    stop = np.clip((cut_end - tv) / 0.02, 0, 1)
    stop = 0.5 - 0.5 * np.cos(np.pi * stop)
    mix = render(pre)[:, :n] * stop + render(post)[:, :n]

    # Fader automation (dB): quiet question, a slow drift up through shrink and bank, the build swelling into the
    # reveal, the aftermath pulled right back, the lesson warming up, the outro forward, the end card settling.
    auto = [
        (0.0, -4.5), (A["shrink"] - 0.5, -4.5), (A["shrink"] + 0.5, -3.5), (A["bank"] - 0.5, -2.5),
        (A["bank"] + 0.5, -2.5), (A["formula"] - 0.5, -2.0), (A["formula"] + 0.5, -2.5),
        (A["reveal"] - 3.0, 1.5), (A["reveal"] - 0.05, 3.0), (A["reveal"], -6.0),
        (A["lesson"] - 0.5, -5.0), (A["lesson"] + 0.5, -3.0), (A["outro"] - 0.5, -2.0),
        (A["outro"] + 0.5, 3.8), (A["end"] - 0.3, 4.2), (A["end"] + 0.3, -2.5), (A["total"], -3.5),
    ]
    at, db = zip(*auto)
    mix *= 10 ** (np.interp(tv, at, db) / 20)

    # Speech-band dip: 1-4 kHz down ~8 dB while the voice speaks.
    band = sosfiltfilt(butter(2, [1000, 4000], btype="band", fs=SR, output="sos"), mix, axis=1)
    mix = mix - 0.6 * band * smooth_mask(A["voiced"], n)

    mix = hp(mix, 30)
    mix *= np.clip(tv / 0.4, 0, 1) * np.clip((A["total"] - tv) / 1.2, 0, 1)
    mix *= 10 ** ((TARGET_LUFS - integrated(mix)) / 20)
    # After mastering, so the dips don't nudge the -16 LUFS gain. Assumes music.level 0.3 in index.tsx.
    dip, hot = peak_guard(mix, voice_timeline(ep, n), A)
    mix *= dip
    if np.abs(mix).max() > 0.89:
        mix = np.tanh(mix / 0.89) * 0.89
    print(f"  peak guard: score dipped in {hot} x 20 ms blocks where it would lift the voice's true peak")

    out = ROOT / "public" / "music" / f"{ep.split('-')[0]}-score.wav"
    out.parent.mkdir(parents=True, exist_ok=True)
    wavfile.write(out, SR, (mix.T * 32767).astype(np.int16))
    print(f"{out.relative_to(ROOT)}  {n / SR:.3f} s  {integrated(mix):.1f} LUFS  peak {20 * np.log10(np.abs(mix).max()):.1f} dBFS")
    for name, a, b, bpm, what in sections:
        print(f"  {name:11s} {a:7.2f} -> {b:7.2f} s  " + (f"{bpm:5.1f} BPM  " if bpm else "            ") + what)
    print(f"  dead stop   {cut_end - 0.02:7.2f} -> {cut_end:7.2f} s  build out; b-hit at {A['reveal']:.2f} s lands in silence")


# ---------------------------------------------------------------------------------------------
# tut01 score (tut01-hakabot-tutorial): an 18-minute screen-recording tutorial, 8 chapters
# ---------------------------------------------------------------------------------------------
# Not a story arc but a long, calm bed: the house instruments (felt piano, warm pad, soft pulse bass, plucks) in
# low-key textures, a light lift into every chapter card (reversed-piano bloom + rolled chord + a small fader bump),
# a new progression and texture every ~1 min (sections cut on scene starts) so 18 minutes never feel like a loop,
# no drums, and a home cadence on D add9 for the end card. Harmonic rhythm is slow (one chord per 2 bars).

TUT_CHAPTERS = ["dash-1", "watch-1", "stock-1", "idx-1", "comp-1", "scr-1", "hb-1", "akun-1"]
TUT_FORCE_CUTS = ["fund-1"]  # the Fundamental tab gets its own colour inside the Stock chapter

# Per chapter: target BPM (bars flex to land on the cuts) and the (progression, texture) of each of its sections,
# cycled if a chapter has more sections. A chapter's first 4 bars are always "glow" (rolled chords: the lift).
TUT_PLAN = {
    "intro": (86, [(["Gmaj9", "D/F#", "Em9", "Asus4"], "intro")]),
    "dash-1": (84, [(["D", "Gmaj9", "Bm", "Asus4"], "keys")]),
    "watch-1": (86, [(["Gmaj9", "D/F#", "Em9", "A"], "flow"), (["Bm", "G", "D", "A"], "keys")]),
    "stock-1": (84, [(["D", "A/C#", "Bm", "G"], "keys"), (["Gmaj7#11", "Dadd9", "Em9", "A"], "flow"),
                     (["Bm", "Bm/A", "Gmaj9", "Asus4"], "air"), (["Em9", "D/F#", "Gmaj9", "A"], "pulse"),
                     (["D", "Gmaj9", "Bm", "A"], "keys"), (["Gmaj9", "A", "Bm", "D/F#"], "flow")]),
    "fund-1": (82, [(["Bm", "Bm/A", "Gmaj7#11", "F#sus"], "air"), (["Gmaj9", "D/F#", "Em9", "Asus4"], "keys")]),
    "idx-1": (88, [(["D", "A", "Bm", "G"], "pulse"), (["Gmaj9", "D/F#", "Em9", "A"], "keys")]),
    "comp-1": (84, [(["Em9", "Gmaj9", "Dadd9", "Asus4"], "flow"), (["Bm", "Gmaj7#11", "D", "A"], "keys")]),
    "scr-1": (88, [(["Gmaj9", "A", "Bm", "D/F#"], "pulse")]),
    "hb-1": (86, [(["Bm", "G", "D", "A"], "flow")]),
    "akun-1": (84, [(["D", "Gmaj9", "Em9", "Asus4"], "keys")]),
}

_PIANO_CACHE: dict = {}


def piano_c(f, hold=1.2, vel=0.5):
    """piano() with a cache (a few thousand notes over 18 min; identical notes are reused)."""
    key = (round(f, 3), round(hold, 2), round(vel, 3))
    if key not in _PIANO_CACHE:
        _PIANO_CACHE[key] = piano(f, hold, vel)
    return _PIANO_CACHE[key]


def load_anchors_tut(ep: str) -> dict:
    t = json.loads((ROOT / "src" / "episodes" / ep / "timing.json").read_text(encoding="utf-8"))
    if t.get("estimated"):
        print("WARNING: timing.json is estimated; re-run after the real voiceover lands.")
    fps = t["fps"]
    sc = [(s["id"], s["from"] / fps) for s in t["scenes"]]
    ids = dict(sc)
    return {
        "total": t["totalFrames"] / fps,
        "scenes": sc,
        "chapters": [(c, ids[c]) for c in TUT_CHAPTERS],
        "cuts": [(c, ids[c]) for c in TUT_FORCE_CUTS],
        "end": ids["end"],
        "voiced": [(l["from"] / fps, (l["from"] + l["dur"]) / fps) for l in t["lines"]],
    }


def tut_sections(A: dict):
    """(start, end, progression, texture, bpm, label, opens_chapter, closes_chapter) for the whole video."""
    heads = sorted([("intro", 0.0)] + A["chapters"] + A["cuts"], key=lambda h: h[1])
    bounds = [h[1] for h in heads] + [A["end"]]
    out = []
    for hi, (hid, a) in enumerate(heads):
        b = bounds[hi + 1]
        bpm, plan = TUT_PLAN[hid]
        # Cut the chapter into ~1-min sections on scene starts (>= 55 s each, the last >= 35 s).
        cuts, cur = [a], a
        for _, s in A["scenes"]:
            if a < s < b and s - cur >= 55 and b - s >= 35:
                cuts.append(s)
                cur = s
        cuts.append(b)
        chapter_end = hi + 1 == len(heads) or heads[hi + 1][0] not in TUT_FORCE_CUTS
        for k in range(len(cuts) - 1):
            prog, tex = plan[k % len(plan)]
            last = k == len(cuts) - 2
            opens = k == 0 and hid not in TUT_FORCE_CUTS and hid != "intro"
            out.append((cuts[k], cuts[k + 1], prog, tex, bpm, f"{hid}#{k + 1}", opens, last and chapter_end))
    return out


def rolled(bus, ch, at, hold, vel, spread=0.07, rev=0.6):
    root, _, arp = CH[ch]
    f0 = root * 2 if root < 70 else root
    for k, f in enumerate([f0] + arp[:3]):
        bus.add(piano_c(f, hold=hold, vel=vel * (1.0 if k else 0.9)), at + k * spread, 1.0, -0.4 + 0.25 * k, rev)


TUT_PAD = {"intro": (0.14, 820), "keys": (0.17, 900), "flow": (0.16, 900), "pulse": (0.18, 950), "glow": (0.19, 1050), "air": (0.15, 780)}


def score_tut(A: dict):
    total = A["total"]
    bus = DBus(total)
    sections = []
    for si, (a, b, prog, tex, bpm, label, opens, closes) in enumerate(tut_sections(A)):
        nb = max(2, int(round((b - a) / (240 / bpm))))
        starts, bar = bars(a, b, nb)
        beat = bar / 4
        srng = np.random.default_rng(100 + si)  # per-section "breathing" (which notes rest)
        # Two bars per chord; a closing section ends on the dominant (Asus4 / A) to lead into the next chapter card,
        # the very last one on A, leading into the end card's D.
        chords = [prog[(i // 2) % len(prog)] for i in range(nb)]
        if closes:
            final = b >= A["end"] - 0.01
            if final:
                chords[-1] = "A"
            elif chords[-1] not in ("A", "Asus4"):
                chords[-1] = "Asus4"
        spans = []
        for i, ch in enumerate(chords):
            if spans and spans[-1][0] == ch and i - spans[-1][1] < 2:
                spans[-1][2] += 1
            else:
                spans.append([ch, i, 1])
        texs = ["glow" if opens and i < 4 else tex for i in range(nb)]
        for ch, i0, n in spans:
            s, sec = starts[i0], bar * n
            tex = texs[i0]
            pad_gain, cutoff = TUT_PAD[tex]
            if tex == "intro" and i0 == 0:
                continue  # the first bar is piano alone
            chord_pad(bus, ch, s, sec, pad_gain, cutoff=cutoff, att=1.2 if tex in ("air", "intro") else 0.9, rel=2.0)
            root = CH[ch][0]
            if tex == "pulse":
                if i0 > 0 and texs[i0 - 1] == "pulse":
                    for j in range(n):
                        bass_8ths(bus, root, s + j * bar, beat, 0.13)
                rolled(bus, ch, s, sec * 0.6, 0.2)
            elif tex == "intro":
                if i0 >= 4:
                    bus.add(bass(root, sec * 0.95, 0.24), s, 1.0, 0, 0.12)
            else:
                bus.add(bass(root, sec * 0.95, 0.2 if tex == "air" else 0.22), s, 1.0, 0, 0.12)
            if tex == "glow":
                rolled(bus, ch, s, sec * 0.7, 0.27 if i0 else 0.31)
            if tex == "air":
                arp = CH[ch][2]
                bus.add(piano_c(root * 2 if root < 70 else root, hold=sec * 0.6, vel=0.3), s, 1.0, -0.2, 0.6)
                bus.add(piano_c(arp[1], hold=beat * 2, vel=0.17), s + 2 * beat, 1.0, 0.25, 0.65)
        for i, (s, ch) in enumerate(zip(starts, chords)):
            arp = CH[ch][2]
            tex = texs[i]
            if tex == "intro":
                for k, idx in enumerate([0, 2, 1, 3]):
                    if k == 3 and i % 2 == 0:
                        continue
                    bus.add(piano_c(arp[idx], hold=beat * 1.6, vel=0.27 + 0.05 * (k == 0)), s + k * beat, 1.0, -0.25 + idx / 6, 0.55)
            elif tex == "keys":
                for k, idx in enumerate([0, 2, 1, 3] if i % 2 == 0 else [3, 1, 2, 0]):
                    if k > 0 and srng.uniform() < 0.22:
                        continue  # breathe
                    bus.add(piano_c(arp[idx], hold=beat * 1.5, vel=0.23 + 0.04 * (k == 0)), s + k * beat, 1.0, -0.3 + idx / 5, 0.55)
            elif tex == "flow":
                for k, idx in enumerate([0, 1, 2, 3, 2, 1, 2, 3]):
                    if (k == 7 and i % 2 == 1) or (k > 0 and srng.uniform() < 0.15):
                        continue
                    bus.add(piano_c(arp[idx], hold=beat * 0.9, vel=0.19 + 0.03 * (k % 4 == 0)), s + k * beat / 2, 1.0, -0.3 + 0.2 * idx, 0.5)
            elif tex == "pulse" and i >= 1 and texs[i - 1] == "pulse":
                pluck_8ths(bus, arp, s, beat, 0.085, accent=0.025)
            elif tex == "glow":
                hi_note = arp[3] * (2 if arp[3] < 700 else 1)
                bus.add(piano_c(hi_note, hold=beat * 2, vel=0.12), s + 2 * beat, 1.0, 0.35, 0.7)
        if opens:
            # The lift into a chapter card: a reversed bloom of the chapter's first chord ending on its downbeat.
            sw = min(bar * 0.75, 2.2)
            bus.add(swell(CH[chords[0]][2], sw, 0.2), a - sw, 1.0, 0, 0.5)
        what = ("glow> " if opens else "") + f"{texs[-1]:5s} " + " ".join(prog) + ("  (lift in)" if opens else "") + ("  -> dominant" if closes else "")
        sections.append((label, a, b, 240 / bar, what))

    # End card: home. D add9 (rolled piano + pad + low D) under the recap line, a plagal G colour, then D add9 again
    # ringing out under the CTA.
    e = A["end"]
    ring = total - e
    bus.add(swell(CH["Dadd9"][2], 1.6, 0.22), e - 1.6, 1.0, 0, 0.5)
    t1, t2 = e + ring * 0.36, e + ring * 0.62
    for ch, s0, s1, v in (("Dadd9", e, t1, 0.31), ("Gmaj9", t1, t2, 0.24), ("Dadd9", t2, total, 0.27)):
        chord_pad(bus, ch, s0, s1 - s0 + (0.4 if s1 < total else 0), 0.21, cutoff=1000, att=0.15 if s0 == e else 0.8, rel=1.8)
        bus.add(bass(CH[ch][0], s1 - s0, 0.28), s0, 1.0, 0, 0.2)
        rolled(bus, ch, s0, s1 - s0, v, spread=0.06, rev=0.65)
    sections.append(("end card", e, total, None, "Dadd9 -> Gmaj9 -> Dadd9: rolled piano + pad + low D, rings out"))
    return bus, sections


def main_tut(ep: str):
    A = load_anchors_tut(ep)
    bus, sections = score_tut(A)
    n = int(round(A["total"] * SR))
    tv = np.arange(n) / SR
    mix = render(bus)[:, :n]

    # Fader automation (dB): the intro creeps in, then a flat bed with a small bump into every chapter card (the
    # voice pauses there) and a warm lift on the end card.
    auto = [(0.0, -3.5), (A["chapters"][0][1] - 6, -1.0)]
    for _, c in A["chapters"]:
        auto += [(c - 2.5, 0.0), (c + 0.2, 2.0), (c + 5.0, 0.0)]
    auto += [(A["end"] - 0.5, 0.0), (A["end"] + 0.4, 2.0), (A["total"], 1.0)]
    at, db = zip(*auto)
    mix *= 10 ** (np.interp(tv, at, db) / 20)

    # Speech-band dip: 1-4 kHz down ~8 dB while the voice speaks.
    band = sosfiltfilt(butter(2, [1000, 4000], btype="band", fs=SR, output="sos"), mix, axis=1)
    mix = mix - 0.6 * band * smooth_mask(A["voiced"], n)

    mix = hp(mix, 30)
    mix *= np.clip(tv / 0.4, 0, 1) * np.clip((A["total"] - tv) / 1.2, 0, 1)
    mix *= 10 ** ((TARGET_LUFS - integrated(mix)) / 20)
    # After mastering. Assumes music.level 0.2 in index.tsx.
    dip, hot = peak_guard(mix, voice_timeline(ep, n), A, level=0.2)
    mix *= dip
    if np.abs(mix).max() > 0.89:
        mix = np.tanh(mix / 0.89) * 0.89
    print(f"  peak guard: score dipped in {hot} x 20 ms blocks where it would lift the voice's true peak")

    out = ROOT / "public" / "music" / f"{ep}-score.wav"
    out.parent.mkdir(parents=True, exist_ok=True)
    wavfile.write(out, SR, (mix.T * 32767).astype(np.int16))
    print(f"{out.relative_to(ROOT)}  {n / SR:.3f} s  {integrated(mix):.1f} LUFS  peak {20 * np.log10(np.abs(mix).max()):.1f} dBFS")
    for name, a, b, bpm, what in sections:
        print(f"  {name:11s} {a:7.2f} -> {b:7.2f} s  " + (f"{bpm:5.1f} BPM  " if bpm else "            ") + what)


def main():
    ep = next((a for a in sys.argv[1:] if not a.startswith("-")), "ep01-ihsg-dca")
    if ep.startswith("ep03"):
        return main_ep03(ep)
    if ep.startswith("tut01"):
        return main_tut(ep)
    A = load_anchors(ep)
    early, late, sections = score(A)
    n = int(round(A["total"] * SR))
    e = tape_stop(render(early), A["fall"], max(0.6, A["crash"] - A["fall"] - 0.08))
    mix = e[:, :n] + render(late)[:, :n]
    tv = np.arange(n) / SR

    # Fader automation (dB, linear in dB between points) for the story's arc: quiet question, a long crescendo
    # through ihsg + journey into the peak, Twist and Lesson pulled back (their pads/drones are dense), the outro
    # forward. Points sit on the section cuts; measured per section so the arc holds regardless of arrangement density.
    auto = [
        (0.0, -4.0), (A["ihsg"] - 1.0, -4.4), (A["ihsg"] + 0.5, -3.5), (A["journey"] + 3.0, 2.5),
        (A["covid"] - 0.5, 2.6), (A["covid"] + 0.5, 1.6), (A["covid"] + 4.0, 1.8),
        (A["lift"] - 0.5, 3.0), (A["lift"] + 0.3, 4.4), (A["crash"], 4.4), (A["crash"] + 0.5, -5.0),
        (A["result"] - 0.5, -5.0), (A["result"] + 0.5, -2.0), (A["lesson"] - 0.3, -2.0), (A["lesson"] + 0.5, -5.0),
        (A["outro"] - 0.5, -4.5), (A["outro"] + 0.5, 3.8), (A["end"] - 0.3, 4.2), (A["end"] + 0.3, -2.5), (A["total"], -3.5),
    ]
    at, db = zip(*auto)
    mix *= 10 ** (np.interp(tv, at, db) / 20)

    # Make room for the Covid and Twist impacts (the 2026 crash already lands in silence).
    for hit in (A["covid"], A["twist_hit"]):
        mix *= 1 - 0.55 * np.exp(-0.5 * ((tv - hit - 0.2) / 0.3) ** 2)

    # Speech-band dip: 1-4 kHz down ~8 dB while the voice speaks (zero-phase band, so the subtraction is clean).
    band = sosfiltfilt(butter(2, [1000, 4000], btype="band", fs=SR, output="sos"), mix, axis=1)
    mix = mix - 0.6 * band * smooth_mask(A["voiced"], n)

    mix = hp(mix, 30)
    mix *= np.clip(tv / 0.4, 0, 1) * np.clip((A["total"] - tv) / 1.2, 0, 1)
    mix *= 10 ** ((TARGET_LUFS - integrated(mix)) / 20)
    if np.abs(mix).max() > 0.89:
        mix = np.tanh(mix / 0.89) * 0.89

    out = ROOT / "public" / "music" / f"{ep.split('-')[0]}-score.wav"
    out.parent.mkdir(parents=True, exist_ok=True)
    wavfile.write(out, SR, (mix.T * 32767).astype(np.int16))
    print(f"{out.relative_to(ROOT)}  {n / SR:.3f} s  {integrated(mix):.1f} LUFS  peak {20 * np.log10(np.abs(mix).max()):.1f} dBFS")
    for name, a, b, bpm, what in sections:
        print(f"  {name:11s} {a:7.2f} -> {b:7.2f} s  " + (f"{bpm:5.1f} BPM  " if bpm else "            ") + what)
    print(f"  collapse    {A['fall']:7.2f} -> {A['crash']:7.2f} s  tape-stop + closing filter to silence; crash SFX at {A['crash']:.2f} s")


if __name__ == "__main__":
    main()
