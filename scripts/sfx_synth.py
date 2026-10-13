"""Synthesize the license-free SFX library into public/sfx/*.wav (48 kHz, 16-bit mono).

Usage: python -I scripts/sfx_synth.py            (everything: legacy, round-1 palette, alt palettes A-D, chatter steps)
       python -I scripts/sfx_synth.py --palette  (everything except the legacy sounds)
       python -I scripts/sfx_synth.py --alts     (alt palettes A-D + c-chatter-1..4 only)

The live library is palette B (Premium UI) mixed with C (Terminal); see docs/style-guide.md (Sound).

Every sound is generated from noise and oscillators, so there is nothing to license.
Names are what scenes reference: <Sfx name="whoosh" />. See docs/style-guide.md (Sound).
"""
from pathlib import Path

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 48_000
OUT = Path(__file__).resolve().parent.parent / "public" / "sfx"
rng = np.random.default_rng(7)


def t(sec: float) -> np.ndarray:
    return np.arange(int(SR * sec)) / SR


def env(n: int, attack: float, decay_pow: float = 2.0) -> np.ndarray:
    a = max(1, int(SR * attack))
    up = np.linspace(0, 1, a) if a < n else np.linspace(0, 1, n)
    down = np.linspace(1, 0, max(0, n - a)) ** decay_pow
    return np.concatenate([up, down])[:n]


def sweep_band(noise: np.ndarray, f0: float, f1: float, steps: int = 48, q: float = 1.2) -> np.ndarray:
    """Band-pass noise whose centre glides f0→f1 (processed in short blocks)."""
    out = np.zeros_like(noise)
    edges = np.linspace(0, len(noise), steps + 1, dtype=int)
    for k in range(steps):
        fc = f0 * (f1 / f0) ** (k / (steps - 1))
        lo, hi = fc / (1 + 1 / q), min(fc * (1 + 1 / q), SR / 2 - 100)
        sos = butter(2, [lo, hi], btype="band", fs=SR, output="sos")
        seg = slice(max(0, edges[k] - 256), edges[k + 1])
        filtered = sosfilt(sos, noise[seg])
        out[edges[k]:edges[k + 1]] = filtered[-(edges[k + 1] - edges[k]):]
    return out


def chirp(f0: float, f1: float, sec: float, curve: float = 3.0) -> np.ndarray:
    x = t(sec)
    f = f1 + (f0 - f1) * np.exp(-curve * x / sec)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def lowpass(x: np.ndarray, fc: float) -> np.ndarray:
    return sosfilt(butter(4, fc, fs=SR, output="sos"), x)


def highpass(x: np.ndarray, fc: float) -> np.ndarray:
    return sosfilt(butter(2, fc, btype="high", fs=SR, output="sos"), x)


def save(name: str, x: np.ndarray, peak: float = 0.7) -> None:
    fade = min(len(x), int(SR * 0.004))
    x = x.copy()
    x[-fade:] *= np.linspace(1, 0, fade)
    x = x / (np.abs(x).max() + 1e-9) * peak
    wavfile.write(OUT / f"{name}.wav", SR, (x * 32767).astype(np.int16))
    print(f"{name}.wav  {len(x) / SR:.2f}s")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)

    n = rng.standard_normal(int(SR * 0.6))
    save("whoosh", sweep_band(n, 350, 4200) * env(len(n), 0.22, 1.6), 0.6)
    n = rng.standard_normal(int(SR * 0.45))
    save("whoosh-soft", lowpass(sweep_band(n, 250, 1800), 3000) * env(len(n), 0.18, 1.8), 0.45)
    n = rng.standard_normal(int(SR * 0.7))
    save("swoosh-down", sweep_band(n, 3500, 220) * env(len(n), 0.05, 1.3), 0.6)

    x = chirp(1100, 380, 0.14, 6) * env(int(SR * 0.14), 0.002, 3)
    save("pop", x + 0.15 * highpass(rng.standard_normal(len(x)), 3000) * env(len(x), 0.001, 8), 0.55)

    x = np.sin(2 * np.pi * 2300 * t(0.035)) * env(int(SR * 0.035), 0.0005, 4)
    save("tick", x, 0.35)

    body = chirp(110, 42, 1.1, 4) * env(int(SR * 1.1), 0.004, 2.2)
    crack = lowpass(rng.standard_normal(len(body)), 1800) * env(len(body), 0.002, 14)
    save("impact", np.tanh(1.8 * (body + 0.6 * crack)), 0.3)

    x = t(1.5)
    tone = np.sin(2 * np.pi * np.cumsum(220 + 700 * (x / x[-1]) ** 2) / SR)
    hiss = highpass(rng.standard_normal(len(x)), 2500)
    ramp = (x / x[-1]) ** 2.2
    save("riser", (0.5 * tone + 0.35 * hiss) * ramp, 0.5)

    x = t(1.0)
    bell = sum(a * np.sin(2 * np.pi * f * x) * np.exp(-x * d) for f, a, d in [(1318, 1, 4), (1976, 0.5, 6), (2637, 0.35, 8), (3951, 0.2, 11)])
    save("ding", bell * env(len(x), 0.003, 1), 0.5)

    x = chirp(620, 70, 0.75, 2.5) * env(int(SR * 0.75), 0.01, 1.2)
    save("drop", np.tanh(2.2 * x) + 0.2 * lowpass(rng.standard_normal(len(x)), 900) * env(len(x), 0.01, 3), 0.25)

    x = t(0.4)
    hit = sum(np.sin(2 * np.pi * f * x) * np.exp(-x * d) for f, d in [(2489, 18), (3720, 24), (5113, 30), (6702, 36)])
    second = np.concatenate([np.zeros(int(SR * 0.07)), hit[: len(x) - int(SR * 0.07)]])
    save("coin", hit + 0.6 * second, 0.4)

    x = t(0.28)
    sq = np.sign(np.sin(2 * np.pi * rng.choice([180, 360, 720], len(x)) * x))
    gate = (np.floor(x * 40) % 2).astype(float)
    save("glitch", lowpass(sq * gate, 4000) * env(len(x), 0.002, 1.5), 0.35)

    x = t(1.3)
    notes = [1047, 1319, 1568, 2093]
    sparkle = sum(np.sin(2 * np.pi * f * x) * np.exp(-np.clip(x - k * 0.08, 0, None) * 5) * (x >= k * 0.08) for k, f in enumerate(notes))
    save("shimmer", sparkle * env(len(x), 0.01, 1.2) + 0.08 * highpass(rng.standard_normal(len(x)), 6000) * env(len(x), 0.3, 2), 0.45)


# =============================================================================================
# Musical palette (2026-10): a signature sound identity instead of generic UI foley.
# Every tonal cue is tuned to D major pentatonic (D E F# A B); the dark cues (decline, crash,
# shock) borrow from D minor (D F A, plus a sour Eb/Ab) so they still resolve to the same home
# note. Mallets/kalimba for small things, glass FM bells for milestones and reveals, warm sub
# "doom" for impacts, tonal swells (not filtered noise) for transitions. All cues share one small
# synthetic room so they sound like parts of one piece. Each file is loudness-matched (max
# momentary K-weighted loudness, BS.1770) to the slot it replaces, so the style-guide volume
# table keeps its meaning; peaks are capped at 0.9.
# =============================================================================================

prng = np.random.default_rng(2026)  # separate generator: the legacy sounds above stay bit-identical

PENT = {"D": 0, "E": 2, "F#": 4, "F": 3, "G": 5, "A": 7, "B": 9, "C": 10, "Eb": 1, "Ab": 6}


def hz(name: str) -> float:
    """'A4' / 'F#5' / 'Eb5' → frequency (A4 = 440 Hz)."""
    pitch, octave = name[:-1], int(name[-1])
    midi = 12 * (octave + 1) + 2 + PENT[pitch]  # D is MIDI 2 within each octave
    return 440.0 * 2 ** ((midi - 69) / 12)


def pad_to(x: np.ndarray, sec: float) -> np.ndarray:
    n = int(SR * sec)
    return np.pad(x, (0, max(0, n - len(x))))[:n]


def place(buf: np.ndarray, x: np.ndarray, at: float, gain: float = 1.0) -> None:
    """Mix x into buf at `at` seconds; the placed segment always ends with a 20 ms fade (no end clicks)."""
    i = int(SR * at)
    n = min(len(x), len(buf) - i)
    if n > 0:
        seg = x[:n].copy()
        f = min(n, int(SR * 0.02))
        seg[-f:] *= np.linspace(1, 0, f) ** 2
        buf[i:i + n] += gain * seg


def soft_attack(n: int, attack: float) -> np.ndarray:
    """Raised-cosine attack (no click), then flat; multiply with a decay."""
    a = max(2, int(SR * attack))
    e = np.ones(n)
    e[:min(a, n)] = 0.5 - 0.5 * np.cos(np.pi * np.arange(min(a, n)) / a)
    return e


def mallet(f: float, sec: float = 0.6, tau: float = 0.18, bright: float = 1.0) -> np.ndarray:
    """Soft marimba-like bar: fundamental plus the bar's 3.9x/9.2x partials, felt attack."""
    x = t(sec)
    y = np.sin(2 * np.pi * f * x) * np.exp(-x / tau)
    y += 0.16 * bright * np.sin(2 * np.pi * f * 3.93 * x) * np.exp(-x / (tau * 0.3))
    y += 0.04 * bright * np.sin(2 * np.pi * f * 9.2 * x) * np.exp(-x / (tau * 0.12))
    y += 0.25 * np.sin(2 * np.pi * f * 0.5 * x) * np.exp(-x / (tau * 0.6)) * (f > 400)  # wooden body below
    felt = lowpass(prng.standard_normal(len(x)), 1400) * np.exp(-x / 0.006) * 0.12
    return (y + felt) * soft_attack(len(x), 0.003)


def kalimba(f: float, sec: float = 0.45, tau: float = 0.13) -> np.ndarray:
    """Thumb-piano tine: round fundamental, faint inharmonic 5.4x ring, quick decay."""
    x = t(sec)
    y = np.sin(2 * np.pi * f * x) * np.exp(-x / tau)
    y += 0.10 * np.sin(2 * np.pi * f * 2.0 * x) * np.exp(-x / (tau * 0.5))
    y += 0.06 * np.sin(2 * np.pi * f * 5.4 * x) * np.exp(-x / (tau * 0.15))
    return y * soft_attack(len(x), 0.002)


def glass(f: float, sec: float = 1.0, tau: float = 0.45, index: float = 1.3, ratio: float = 2.0) -> np.ndarray:
    """Glassy FM bell: brightness (mod index) decays faster than the tone, so it rings pure."""
    x = t(sec)
    mod = index * np.exp(-x / 0.08) * np.sin(2 * np.pi * f * ratio * x)
    y = np.sin(2 * np.pi * f * x + mod) * np.exp(-x / tau)
    y += 0.12 * np.sin(2 * np.pi * f * 2.76 * x) * np.exp(-x / (tau * 0.25))  # glockenspiel shimmer partial
    return y * soft_attack(len(x), 0.002)


def warm(f: float, sec: float, harmonics: int = 5, detune: float = 0.0) -> np.ndarray:
    """Soft saw-ish pad voice (few harmonics, 1/k^1.5), optionally a detuned pair."""
    x = t(sec)
    y = np.zeros_like(x)
    for d in ([0.0] if detune == 0 else [-detune, detune]):
        ff = f * 2 ** (d / 1200)
        for k in range(1, harmonics + 1):
            y += np.sin(2 * np.pi * ff * k * x + k) / k ** 1.5
    return y


def swell_env(n: int, peak_at: float, rise: float, tau: float) -> np.ndarray:
    """Exponential swell into peak_at (reversed-bell feel), exponential decay after it."""
    x = np.arange(n) / SR
    up = np.exp((x - peak_at) / rise)
    down = np.exp(-(x - peak_at) / tau)
    return np.where(x < peak_at, up, down)


def room(x: np.ndarray, sec: float = 0.7, mix: float = 0.18) -> np.ndarray:
    """One shared small, darkish room (synthetic decaying-noise IR) for the whole palette."""
    from scipy.signal import fftconvolve
    r = np.random.default_rng(11)
    ir_t = t(sec)
    ir = lowpass(r.standard_normal(len(ir_t)), 4500) * np.exp(-ir_t / (sec / 5))
    ir = np.concatenate([np.zeros(int(SR * 0.012)), ir])
    ir /= np.sqrt(np.sum(ir ** 2))
    wet = fftconvolve(x, ir)[:len(x)]
    wet *= np.sqrt(np.mean(x ** 2) / (np.mean(wet ** 2) + 1e-12))
    return x + mix * wet


def k_momentary_max(x: np.ndarray) -> float:
    """Max momentary loudness (400 ms, K-weighted, BS.1770 coefficients at 48 kHz) in LUFS."""
    from scipy.signal import lfilter
    y = lfilter([1.53512485958697, -2.69169618940638, 1.19839281085285], [1, -1.69065929318241, 0.73248077421585], x)
    y = lfilter([1.0, -2.0, 1.0], [1, -1.99004745483398, 0.99007225036621], y)
    w = int(0.4 * SR)
    c = np.concatenate([[0.0], np.cumsum(np.concatenate([y, np.zeros(w)]) ** 2)])
    return -0.691 + 10 * np.log10((c[w:] - c[:-w]).max() / w + 1e-12)


def save_lufs(name: str, x: np.ndarray, target: float, tail: float = 0.03, max_sec: float = 1.95) -> None:
    """Fade the tail, then scale to `target` momentary LUFS (peak capped at 0.9). <Sfx> plays 60 frames (2 s)."""
    x = x[: int(SR * max_sec)].copy()
    fade = min(len(x), int(SR * tail))
    x[-fade:] *= np.linspace(1, 0, fade) ** 2
    x = x - np.mean(x)
    x = highpass(x, 28)
    g = 10 ** ((target - k_momentary_max(x)) / 20)
    x *= g
    peak = np.abs(x).max()
    if peak > 0.9:
        x *= 0.9 / peak
    wavfile.write(OUT / f"{name}.wav", SR, (x * 32767).astype(np.int16))
    print(f"{name}.wav  {len(x) / SR:.2f}s  peak {np.abs(x).max():.2f}  M-max {k_momentary_max(x):.1f} LUFS")


# Loudness targets = the max momentary loudness of the legacy sound in the same slot, so a cue
# swapped in at the same <Sfx volume> lands at about the same perceived level.
PALETTE_TARGETS = {
    "bloom": -22.0,       # whoosh-soft
    "swell": -18.0,       # whoosh
    "pluck": -23.0,       # pop
    "pluck-low": -23.0,
    "pluck-high": -23.5,
    "step": -28.0,        # tick (steps ring longer than a 35 ms tick, so they sit a bit under)
    "chime": -18.0,       # ding
    "glint": -24.5,       # coin
    "ascend": -17.0,      # riser
    "descend": -18.0,     # swoosh-down (tonal mallets, so 2 dB under: they often run under words)
    "sink": -16.5,        # drop
    "thud": -16.8,        # impact
    "sour": -24.5,        # glitch
    "bell-bloom": -17.0,  # shimmer
    "signature": -16.5,   # shimmer on the end card (logo)
}

STEP_NOTES = ["A4", "B4", "D5", "E5", "F#5", "A5", "B5", "D6"]


def palette() -> None:
    T = PALETTE_TARGETS

    # bloom · scene change: a soft open D chord swelling in like a reversed bell, peak ~5 frames in.
    sec, pk = 0.8, 0.16
    n = int(SR * sec)
    y = np.zeros(n)
    for note, g in [("D4", 1.0), ("A4", 0.8), ("E5", 0.45), ("D3", 0.6)]:
        y += g * warm(hz(note), sec, harmonics=4, detune=4)
    y = lowpass(y, 2200) * swell_env(n, pk, 0.045, 0.16)
    save_lufs("bloom", room(y, mix=0.25), T["bloom"])

    # swell · big entrance: rolled reversed-glass D add9 rising into a mallet D5 hit + a low felt D2, peak ~7 frames.
    sec, pk = 1.1, 0.23
    n = int(SR * sec)
    y = np.zeros(n)
    for k, (note, g) in enumerate([("D4", 1.0), ("A4", 0.8), ("D5", 0.7), ("F#5", 0.45), ("E5", 0.35)]):
        tone = glass(hz(note), sec, tau=10, index=0.6)  # sustained tone, shaped by the swell envelope
        y += g * tone * swell_env(n, pk, 0.05 + 0.012 * k, 0.22)
    y = lowpass(y, 3200)
    place(y, mallet(hz("D5"), 0.8, tau=0.25, bright=0.6), pk, 0.7)
    place(y, np.sin(2 * np.pi * hz("D2") * t(0.9)) * np.exp(-t(0.9) / 0.25) * soft_attack(int(SR * 0.9), 0.01), pk - 0.01, 0.9)
    save_lufs("swell", room(y, mix=0.22), T["swell"])

    # pluck family · labels, chips, callouts: soft mallet notes on the pentatonic (vary them in a scene).
    save_lufs("pluck", room(mallet(hz("A4"), 0.55, tau=0.15), 0.5, 0.15), T["pluck"])
    save_lufs("pluck-low", room(mallet(hz("D4"), 0.6, tau=0.17), 0.5, 0.15), T["pluck-low"])
    save_lufs("pluck-high", room(lowpass(mallet(hz("D5"), 0.5, tau=0.13, bright=0.7), 3000), 0.5, 0.15), T["pluck-high"])

    # step-1..8 · counters and grid fills: kalimba run up the scale, so a fill plays a melody.
    for i, note in enumerate(STEP_NOTES, start=1):
        save_lufs(f"step-{i}", room(lowpass(kalimba(hz(note), 0.4, 0.11), 3500), 0.5, 0.12), T["step"])

    # chime · milestone, and the Hakabot motif: A5 → D6 (rising fourth, 5 → 1), glass bells over a soft D5.
    sec = 1.5
    y = np.zeros(int(SR * sec))
    place(y, glass(hz("A5"), 1.2, tau=0.4, index=1.0), 0.0, 0.8)
    place(y, glass(hz("D6"), 1.4, tau=0.5, index=1.0), 0.10, 1.0)
    place(y, np.sin(2 * np.pi * hz("D5") * t(1.3)) * np.exp(-t(1.3) / 0.4) * soft_attack(int(SR * 1.3), 0.01), 0.10, 0.5)
    save_lufs("chime", room(lowpass(y, 5000), 0.8, 0.2), T["chime"])

    # glint · money landing: a tiny two-note glass sparkle (D6 → A6), short and quiet.
    sec = 0.45
    y = np.zeros(int(SR * sec))
    place(y, glass(hz("D6"), 0.35, tau=0.07, index=0.8), 0.0, 0.8)
    place(y, glass(hz("A6"), 0.35, tau=0.08, index=0.6), 0.045, 0.6)
    save_lufs("glint", room(lowpass(y, 6000), 0.4, 0.12), T["glint"])

    # ascend · build-up before a reveal: accelerating pentatonic arpeggio + a pad whose filter opens; ends on A (unresolved).
    sec = 1.5
    n = int(SR * sec)
    notes = ["D4", "E4", "F#4", "A4", "B4", "D5", "E5", "F#5", "A5", "B5"]
    y = np.zeros(n)
    for k, note in enumerate(notes):
        at = sec * 0.92 * (1 - (1 - k / (len(notes) - 1)) ** 1.6)
        place(y, kalimba(hz(note), 0.5, 0.12), at, 0.35 + 0.65 * k / (len(notes) - 1))
    padv = sum(g * warm(hz(nt), sec, 5, 5) for nt, g in [("D3", 1.0), ("A3", 0.8), ("E4", 0.5)])
    ramp = (t(sec) / sec) ** 2
    # Filter sweeps open 300 → 2400 Hz: crossfade between fixed low-passed copies (no block-edge clicks).
    cutoffs = [300 * 2 ** (k / 2) for k in range(7)]
    versions = [lowpass(padv, fc) for fc in cutoffs]
    pos = (t(sec) / sec) * (len(cutoffs) - 1)
    opened = np.zeros(n)
    for k, v in enumerate(versions):
        opened += v * np.clip(1 - np.abs(pos - k), 0, 1)
    save_lufs("ascend", room(lowpass(y, 4000) + 0.5 * opened * ramp, 0.6, 0.2), T["ascend"], tail=0.04)

    # descend · a decline starting: falling D-minor mallet figure (A4 F4 D4 A3), each note sagging a little.
    sec = 1.0
    y = np.zeros(int(SR * sec))
    for k, note in enumerate(["A4", "F4", "D4", "A3"]):
        f = hz(note)
        x = t(0.6)
        sag = f * (1 - 0.02 * (1 - np.exp(-x / 0.15)))
        tone = np.sin(2 * np.pi * np.cumsum(sag) / SR) * np.exp(-x / 0.18)
        tone += 0.12 * np.sin(2 * np.pi * np.cumsum(sag * 3.93) / SR) * np.exp(-x / 0.05)
        place(y, tone * soft_attack(len(x), 0.003), 0.11 * k, 1.0 - 0.1 * k)
    save_lufs("descend", room(lowpass(y, 2500), 0.6, 0.2), T["descend"])

    # sink · the fall itself: a low D-minor chord on a tape that slows to a stop (pitch and level sag together).
    sec = 0.95
    x = t(sec)
    speed = np.clip(1 - (x / sec) ** 1.3, 0.02, 1)
    y = np.zeros_like(x)
    for note, g in [("D2", 1.0), ("D3", 0.8), ("F3", 0.55), ("A3", 0.5)]:
        ph = 2 * np.pi * np.cumsum(hz(note) * speed) / SR
        y += g * sum(np.sin(k * ph) / k ** 1.6 for k in range(1, 6))
    y = lowpass(y * speed ** 0.7 * soft_attack(len(x), 0.008), 1400)
    save_lufs("sink", room(np.tanh(1.3 * y / np.abs(y).max()), 0.6, 0.15), T["sink"])

    # thud · the crash lands: felt "doom" on D (sub glide G2 → D2 + D1), dark D/F mallet cluster, soft noise bloom.
    sec = 1.6
    x = t(sec)
    f = hz("D2") + (hz("G2") - hz("D2")) * np.exp(-x / 0.03)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x / 0.45)
    sub = np.sin(2 * np.pi * hz("D1") * x) * np.exp(-x / 0.6)
    bloom_n = lowpass(prng.standard_normal(len(x)), 500) * swell_env(len(x), 0.012, 0.004, 0.18)
    y = body + 0.7 * sub + 0.35 * bloom_n
    y = np.tanh(1.6 * y * soft_attack(len(x), 0.004))
    place(y, mallet(hz("D3"), 1.2, tau=0.4, bright=0.4), 0.0, 0.35)
    place(y, mallet(hz("F3"), 1.2, tau=0.35, bright=0.4), 0.0, 0.25)
    save_lufs("thud", room(lowpass(y, 1800), 0.9, 0.2), T["thud"], tail=0.1)

    # sour · shock accent with the thud: a detuned, wobbling D/Eb/Ab glass cluster (minor second + tritone).
    sec = 0.55
    x = t(sec)
    y = np.zeros_like(x)
    for note, g, rate in [("D5", 1.0, 6.0), ("Eb5", 0.8, 7.3), ("Ab4", 0.7, 5.1)]:
        fr = hz(note) * 2 ** (0.25 / 12 * np.sin(2 * np.pi * rate * x))
        y += g * np.sin(2 * np.pi * np.cumsum(fr) / SR + 0.8 * np.exp(-x / 0.05) * np.sin(2 * np.pi * hz(note) * 2 * x))
    y = lowpass(y * np.exp(-x / 0.14) * soft_attack(len(x), 0.003), 2800)
    save_lufs("sour", room(y, 0.5, 0.2), T["sour"])

    # bell-bloom · peak reveal: a rolled D add9 glass chord up the scale (D5 F#5 A5 E6), bright body front-loaded.
    sec = 1.6
    y = np.zeros(int(SR * sec))
    for k, (note, g) in enumerate([("D5", 1.0), ("F#5", 0.8), ("A5", 0.75), ("E6", 0.55)]):
        place(y, glass(hz(note), 1.5, tau=0.38, index=1.1), 0.055 * k, g)
    place(y, np.sin(2 * np.pi * hz("D4") * t(1.4)) * np.exp(-t(1.4) / 0.45) * soft_attack(int(SR * 1.4), 0.01), 0.0, 0.5)
    save_lufs("bell-bloom", room(lowpass(y, 6000), 0.8, 0.22), T["bell-bloom"], tail=0.08)

    # signature · Hakabot sonic logo (end card / logo reveal): the chime motif A4 → D5 one octave lower,
    # mallet + glass doubled, landing on a warm D add9 bloom with a felt D2 underneath.
    sec = 1.9
    y = np.zeros(int(SR * sec))
    place(y, mallet(hz("A4"), 0.8, tau=0.2, bright=0.6) + 0.6 * glass(hz("A5"), 0.8, tau=0.25, index=0.8), 0.0, 0.8)
    place(y, mallet(hz("D5"), 1.4, tau=0.35, bright=0.6) + 0.6 * glass(hz("D6"), 1.4, tau=0.4, index=0.8), 0.13, 1.0)
    chord = sum(g * warm(hz(nt), 1.75, 4, 4) for nt, g in [("D3", 1.0), ("A3", 0.8), ("F#4", 0.6), ("E5", 0.35)])
    chord = lowpass(chord, 1800) * swell_env(int(SR * 1.75), 0.06, 0.02, 0.45)
    place(y, chord, 0.13, 0.3)
    place(y, np.sin(2 * np.pi * hz("D2") * t(1.2)) * np.exp(-t(1.2) / 0.35) * soft_attack(int(SR * 1.2), 0.01), 0.13, 0.5)
    save_lufs("signature", room(y, 0.9, 0.22), T["signature"], tail=0.15)


# =============================================================================================
# Round 2 (2026-10-13): four alternative palettes to compare, prefixed a-/b-/c-/d-.
#   A · Desk (tactile, close-miked): mouse switch, pen tap, paper slide, card flick, rubber stamp, coins on wood.
#   B · Premium UI (minimal fintech): very short crisp taps, haptic-like low thumps, a subtle air puff.
#   C · Terminal (trading desk): square-wave blips, relay clicks, data chatter, lock-in, tape-stop crash.
#   D · Tape (analog lo-fi): cassette buttons, tape rewind / start / slow-down, muffled e-piano, crackle + hiss.
# Every palette fills the same 12 slots; each file is loudness-matched to its slot (SLOT_TARGETS), like round 1.
# =============================================================================================

SLOT_TARGETS = {
    "transition": -22.0,  # whoosh-soft
    "entrance": -18.0,    # whoosh
    "label": -23.0,       # pop
    "step": -28.0,        # tick
    "milestone": -18.0,   # ding
    "money": -24.5,       # coin
    "buildup": -17.0,     # riser
    "decline": -16.5,     # drop / swoosh-down
    "crash": -16.8,       # impact
    "shock": -24.5,       # glitch
    "logo": -16.5,        # shimmer on the end card
    "click": -23.0,       # pop on the outro's click ripples
}


def bandpass(x: np.ndarray, lo: float, hi: float, order: int = 2) -> np.ndarray:
    return sosfilt(butter(order, [lo, min(hi, SR / 2 - 100)], btype="band", fs=SR, output="sos"), x)


def modes(spec: list, sec: float) -> np.ndarray:
    """Modal synthesis of a struck object: [(freq, amp, decay seconds), ...]."""
    x = t(sec)
    y = np.zeros_like(x)
    for f, a, d in spec:
        y += a * np.sin(2 * np.pi * f * x + prng.uniform(0, 2 * np.pi)) * np.exp(-x / d)
    return y * soft_attack(len(x), 0.0004)


def burst(sec: float, decay: float, lo: float, hi: float) -> np.ndarray:
    x = t(sec)
    return bandpass(prng.standard_normal(len(x)), lo, hi) * np.exp(-x / decay)


def mixdown(sec: float, *parts) -> np.ndarray:
    y = np.zeros(int(SR * sec))
    for x, at_, g in parts:
        place(y, x, at_, g)
    return y


def gate(x: np.ndarray, a: float = 0.001, r: float = 0.003) -> np.ndarray:
    n = len(x)
    e = np.ones(n)
    ia, ir = max(1, int(SR * a)), max(1, int(SR * r))
    e[:ia] = np.linspace(0, 1, ia)
    e[-ir:] = np.minimum(e[-ir:], np.linspace(1, 0, ir))
    return x * e


def square(f, sec: float, top: float = 6000) -> np.ndarray:
    """Band-limited square (odd harmonics below `top`); f may be an array (glides)."""
    x = t(sec)
    fa = np.broadcast_to(np.asarray(f, dtype=float), x.shape)
    ph = 2 * np.pi * np.cumsum(fa) / SR
    y = np.zeros_like(x)
    for k in range(1, 40, 2):
        y += np.where(k * fa < top, np.sin(k * ph) / k, 0)
    return y


def blip(f: float, sec: float) -> np.ndarray:
    return gate(lowpass(square(f, sec), 5000) * 0.6)


def save_slot(name: str, slot: str, x: np.ndarray, tail: float = 0.01) -> None:
    """Loudness-match to the slot. Transient-heavy sounds (clicks, slaps) would hit the 0.9 peak cap
    before reaching the target, so their peaks are soft-limited first (up to 6 passes of tanh)."""
    target = SLOT_TARGETS[slot]
    x = x / (np.abs(x).max() + 1e-9)
    for _ in range(6):
        g = 10 ** ((target - k_momentary_max(x)) / 20)
        if np.abs(x * g).max() <= 0.9:
            break
        x = np.tanh(x * g / 0.9)  # 0.9 maps to tanh(1): peaks above it bend, quiet detail stays linear
    save_lufs(name, x, target, tail=tail)


def wow(x: np.ndarray, depth_ms: float = 1.5, rate: float = 0.9, flutter_ms: float = 0.12, frate: float = 9.0) -> np.ndarray:
    """Tape wow + flutter as a modulated delay."""
    n = np.arange(len(x))
    tt = n / SR
    d = (depth_ms * np.sin(2 * np.pi * rate * tt) + flutter_ms * np.sin(2 * np.pi * frate * tt)) * SR / 1000
    return np.interp(n - (d - d.min()), n, x, left=0)


def crackle(n: int, rate: float, level: float) -> np.ndarray:
    y = np.zeros(n)
    hits = prng.random(n) < rate / SR
    y[hits] = prng.uniform(-1, 1, hits.sum())
    return bandpass(y, 700, 6000) * level


def hiss(n: int, level: float) -> np.ndarray:
    return bandpass(prng.standard_normal(n), 2500, 9000) * level


def epiano(freqs: list, sec: float, tau: float = 0.6, speed=None, strum: float = 0.0) -> np.ndarray:
    """Soft tine e-piano voices; `speed` (array) plays them on a tape running at that speed."""
    x = t(sec)
    sp = np.ones_like(x) if speed is None else speed
    y = np.zeros_like(x)
    for k, f in enumerate(freqs):
        ph = 2 * np.pi * np.cumsum(f * sp) / SR
        v = (np.sin(ph) + 0.25 * np.sin(2 * ph) * np.exp(-x / (tau * 0.4)) + 0.08 * np.sin(7 * ph) * np.exp(-x / 0.03)) * np.exp(-x / tau)
        y += np.roll(v * soft_attack(len(x), 0.004), int(SR * strum * k)) * (np.arange(len(x)) >= int(SR * strum * k))
    return y


def lofi(x: np.ndarray, fc: float = 3800, drive: float = 1.4, hiss_lvl: float = 0.012, crackle_rate: float = 25) -> np.ndarray:
    peak = np.abs(x).max() + 1e-9
    y = np.tanh(drive * x / peak) / np.tanh(drive)
    y = highpass(lowpass(y, fc), 90)
    return y + hiss(len(y), hiss_lvl) + crackle(len(y), crackle_rate, 0.15)


def palette_a() -> None:
    """A · Desk: physical objects on a wooden desk, close-miked, almost dry."""
    def dry(x):
        return room(x, 0.25, 0.08)

    def pen(r=1.0):
        return modes([(2800 * r, 1, 0.004), (4300 * r, 0.5, 0.003), (900 * r, 0.4, 0.006)], 0.06)

    press = modes([(3100, 1, 0.004), (4700, 0.6, 0.003), (6900, 0.3, 0.002), (950, 0.5, 0.008), (190, 0.4, 0.012)], 0.06) + 0.5 * burst(0.06, 0.0012, 2000, 9000)
    release = 0.55 * modes([(3600, 1, 0.003), (5200, 0.5, 0.002), (1100, 0.4, 0.006)], 0.05) + 0.3 * burst(0.05, 0.001, 2500, 9000)
    save_slot("a-click", "click", dry(mixdown(0.2, (press, 0, 1), (release, 0.075, 1))))

    tap = modes([(520, 1, 0.025), (1180, 0.5, 0.012), (1890, 0.35, 0.008), (2650, 0.2, 0.005), (140, 0.6, 0.03)], 0.25) + 0.4 * burst(0.25, 0.002, 500, 4000)
    save_slot("a-tap", "label", dry(mixdown(0.3, (tap, 0, 1), (tap, 0.045, 0.25))))

    tick = modes([(1900, 1, 0.004), (3300, 0.5, 0.003), (650, 0.5, 0.006)], 0.08) + 0.3 * burst(0.08, 0.0008, 1500, 8000)
    save_slot("a-tick", "step", dry(tick))

    # paper slid across the desk: friction-modulated band noise, peak ~4 frames, soft stop
    sec = 0.5
    n = int(SR * sec)
    x = t(sec)
    fr = lowpass(np.abs(prng.standard_normal(n)), 60)
    fr = 0.55 + 0.45 * fr / fr.max()
    e = np.where(x < 0.14, (x / 0.14) ** 1.2, np.exp(-(x - 0.14) / 0.09))
    sparse = (prng.random(n) < 260 / SR) * prng.uniform(-1, 1, n)
    y = bandpass(prng.standard_normal(n), 900, 6500) * fr * e + 0.5 * bandpass(sparse, 3000, 9000) * e
    stop = modes([(180, 0.6, 0.02), (420, 0.3, 0.01)], 0.1)
    save_slot("a-slide", "transition", dry(lowpass(mixdown(sec, (y, 0, 1), (stop, 0.28, 0.25)), 7000)))

    # card flicked off a thumb, flutters, slaps down (~6 frames)
    snap = burst(0.03, 0.0015, 2500, 10000) + modes([(2400, 0.5, 0.004)], 0.03)
    fx = t(0.18)
    flutter = bandpass(prng.standard_normal(len(fx)), 1200, 5000) * (0.5 + 0.5 * np.sin(2 * np.pi * 38 * fx) ** 2) * np.exp(-fx / 0.09) * soft_attack(len(fx), 0.02)
    slap = burst(0.2, 0.006, 200, 3000) + modes([(210, 0.8, 0.03), (480, 0.5, 0.02), (1100, 0.2, 0.008)], 0.2)
    save_slot("a-flick", "entrance", dry(mixdown(0.6, (snap, 0, 0.7), (flutter, 0.02, 0.35), (slap, 0.21, 1.0))))

    # rubber stamp: spring "chk", then the "THUNK" of rubber on paper on wood
    thunk = modes([(110, 1, 0.06), (240, 0.6, 0.03), (520, 0.3, 0.015)], 0.4) + 0.5 * lowpass(burst(0.4, 0.012, 60, 1500), 1500)
    save_slot("a-stamp", "milestone", dry(mixdown(0.55, (tick, 0, 0.35), (thunk, 0.07, 1.0))))

    def coin(f0):
        return modes([(f0, 1, 0.12), (f0 * 1.83, 0.7, 0.08), (f0 * 2.9, 0.5, 0.05), (f0 * 4.1, 0.3, 0.03)], 0.4)

    c = mixdown(0.6, (coin(3200), 0, 1), (tap, 0, 0.15), (coin(3550), 0.06, 0.8), (coin(3550), 0.11, 0.3), (coin(3550), 0.14, 0.15))
    save_slot("a-coins", "money", dry(highpass(c, 1200)))

    # wind-up ratchet speeding up, spring tension underneath; stops dead at 1.5 s
    sec = 1.5
    y = np.zeros(int(SR * sec))
    at_, gap = 0.0, 0.12
    while at_ < sec - 0.02:
        r = prng.uniform(0.95, 1.05)
        place(y, modes([(2100 * r, 1, 0.003), (3900 * r, 0.4, 0.002), (700, 0.4, 0.005)], 0.05), at_, 0.3 + 0.7 * at_ / sec)
        at_ += gap
        gap = max(0.022, gap * 0.9)
    ramp = (t(sec) / sec) ** 2
    y += 0.35 * bandpass(prng.standard_normal(len(y)), 200, 900) * ramp
    save_slot("a-wind", "buildup", dry(y), tail=0.02)

    # a stack of paper slumping/dragging down: band sweeps 1800 → 350 Hz with stick-slip grain
    sec = 0.9
    n = int(SR * sec)
    x = t(sec)
    imp = np.zeros(n)
    k = 0.0
    while k < sec:
        imp[int(k * SR)] = prng.uniform(0.5, 1)
        k += 1 / (40 - 28 * k / sec)
    am = 0.35 + np.convolve(imp, np.exp(-t(0.02) / 0.006), "full")[:n]
    y = sweep_band(prng.standard_normal(n), 1800, 350) * am * soft_attack(n, 0.03) * (1 - x / sec) ** 0.8
    save_slot("a-slump", "decline", dry(y), tail=0.05)

    # heavy book dropped flat on the desk, pens rattle after it
    sec = 1.3
    body = modes([(62, 1, 0.2), (105, 0.8, 0.14), (170, 0.5, 0.09), (310, 0.35, 0.05), (640, 0.2, 0.02)], sec)
    body = np.tanh(1.4 * (body + 0.6 * lowpass(burst(sec, 0.008, 80, 2500), 2500)))
    y = mixdown(sec, (body, 0, 1), *[(pen(prng.uniform(0.9, 1.1)), a, g) for a, g in [(0.07, 0.18), (0.12, 0.12), (0.16, 0.1), (0.24, 0.07), (0.3, 0.05)]])
    save_slot("a-drop", "crash", room(y, 0.4, 0.12), tail=0.1)

    # shock: everything on the desk rattles (pens + a ringing cup)
    sec = 0.45
    parts = []
    at_ = 0.0
    for i in range(12):
        parts.append((pen(prng.uniform(0.85, 1.2)), at_, 1.0 * 0.85 ** i))
        at_ += prng.uniform(0.012, 0.04)
    parts.append((modes([(1450, 1, 0.06), (3900, 0.5, 0.04)], 0.3), 0.01, 0.25))
    save_slot("a-rattle", "shock", dry(lowpass(mixdown(sec, *parts), 6000)))

    # logo: a hardback notebook shut on the desk ("thup" with a little air), then its elastic snaps
    sec = 0.9
    air = lowpass(prng.standard_normal(int(SR * 0.17)), 900) * (t(0.17) / 0.17) ** 2
    thup = modes([(95, 1, 0.08), (190, 0.6, 0.05), (420, 0.3, 0.02)], 0.6) + 0.6 * burst(0.6, 0.01, 80, 1200)
    latch = modes([(2600, 0.7, 0.004), (4100, 0.4, 0.003), (1300, 0.3, 0.006)], 0.06)
    save_slot("a-close", "logo", dry(mixdown(sec, (air, 0, 0.5), (thup, 0.17, 1), (latch, 0.36, 0.35))), tail=0.05)


def palette_b() -> None:
    """B · Premium UI: short, crisp, quiet; haptic-like low thumps; one subtle air puff."""
    def tiny(x):
        return room(x, 0.3, 0.06)

    def haptic(f=150, d=0.02, sec=0.15):
        x = t(sec)
        return np.sin(2 * np.pi * f * x) * np.exp(-x / d) * soft_attack(len(x), 0.002)

    def tone(f, d, sec=0.3):
        x = t(sec)
        return np.sin(2 * np.pi * f * x) * np.exp(-x / d) * soft_attack(len(x), 0.002)

    click = 0.7 * burst(0.06, 0.0009, 1500, 7000) + modes([(1650, 1, 0.004), (180, 0.5, 0.006)], 0.06)
    save_slot("b-click", "click", tiny(click))

    x = t(0.15)
    f = 850 + 300 * np.exp(-x / 0.004)
    tap = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x / 0.018) * soft_attack(len(x), 0.0008) + 0.8 * haptic(160, 0.012, 0.15) + 0.2 * burst(0.15, 0.001, 1000, 6000)
    save_slot("b-tap", "label", tiny(tap))

    save_slot("b-tick", "step", tiny(modes([(3200, 1, 0.0025), (5100, 0.4, 0.0015)], 0.04) + 0.3 * burst(0.04, 0.0006, 4000, 12000)))

    def air(sec, peak, f0, f1, rise=2.0, fall=0.07):
        n = int(SR * sec)
        xx = t(sec)
        e = np.where(xx < peak, (xx / peak) ** rise, np.exp(-(xx - peak) / fall))
        return lowpass(sweep_band(prng.standard_normal(n), f0, f1, q=0.9), 2600) * e

    save_slot("b-air", "transition", tiny(air(0.38, 0.13, 500, 1600)))
    save_slot("b-rise", "entrance", tiny(mixdown(0.6, (air(0.6, 0.22, 400, 2000, 2.5, 0.08), 0, 1), (haptic(75, 0.05, 0.4), 0.215, 1.2), (tap, 0.22, 0.4))))
    save_slot("b-confirm", "milestone", tiny(mixdown(0.6, (haptic(150, 0.02), 0, 0.8), (tone(784, 0.09), 0, 0.7), (haptic(150, 0.02), 0.09, 0.8), (tone(1175, 0.11), 0.09, 0.8))))
    save_slot("b-pay", "money", tiny(mixdown(0.3, (haptic(140, 0.015), 0, 0.8), (tone(1760, 0.035), 0, 0.6), (tone(2349, 0.035), 0.03, 0.5), (tone(2960, 0.04), 0.06, 0.45))))

    sec = 1.5
    y = air(sec, sec - 0.01, 300, 3000, 2.2, 0.01)
    at_, gap = 0.1, 0.25
    while at_ < sec - 0.03:
        place(y, haptic(65, 0.03, 0.12), at_, 0.6 + 1.2 * at_ / sec)
        at_ += gap
        gap = max(0.05, gap * 0.82)
    save_slot("b-build", "buildup", tiny(y), tail=0.02)

    x = t(0.5)
    glide = np.sin(2 * np.pi * np.cumsum(230 + 470 * np.exp(-x / 0.12)) / SR) * np.exp(-x / 0.14) * soft_attack(len(x), 0.003)
    save_slot("b-dip", "decline", tiny(mixdown(0.5, (glide, 0, 1), (haptic(120, 0.03), 0, 0.8), (air(0.3, 0.05, 1200, 400), 0, 0.15))))

    x = t(0.8)
    f = 48 + 50 * np.exp(-x / 0.03)
    ph = 2 * np.pi * np.cumsum(f) / SR
    hit = (np.sin(ph) + 0.25 * np.sin(2 * ph)) * np.exp(-x / 0.16) * soft_attack(len(x), 0.002) + 0.4 * lowpass(burst(0.8, 0.03, 40, 400), 400)
    save_slot("b-hit", "crash", tiny(np.tanh(1.5 * hit)), tail=0.05)

    pulse = gate(lowpass(square(170, 0.04, 1500), 900), 0.003, 0.003)
    save_slot("b-buzz", "shock", tiny(mixdown(0.25, (pulse, 0, 1), (pulse, 0.07, 0.9), (pulse, 0.14, 0.8))))

    xx = t(0.6)
    tail = lowpass(prng.standard_normal(len(xx)), 2000) * swell_env(len(xx), 0.06, 0.02, 0.18)
    save_slot("b-mark", "logo", tiny(mixdown(0.8, (haptic(80, 0.07, 0.5), 0, 1), (tone(880, 0.05), 0, 0.6), (tone(1320, 0.12, 0.5), 0.08, 0.8), (tail, 0.05, 0.12))), tail=0.05)


def palette_c() -> None:
    """C · Terminal: a trading desk's square-wave blips, relay clicks and data chatter."""
    def tight(x):
        return room(x, 0.2, 0.05)

    def relay(s=1.0):
        hit = modes([(1250 * s, 1, 0.004), (2850 * s, 0.7, 0.003), (4600 * s, 0.4, 0.002), (7200, 0.2, 0.0015), (320 * s, 0.5, 0.008)], 0.06)
        hit += 0.5 * burst(0.06, 0.0008, 2000, 10000)
        return mixdown(0.07, (hit, 0, 1), (hit, 0.004, 0.4))

    save_slot("c-click", "click", tight(relay()))
    save_slot("c-blip", "label", tight(mixdown(0.12, (blip(660, 0.035), 0, 1), (blip(990, 0.035), 0.05, 0.9))))

    pitches = [440, 550, 660, 880, 990, 1320]
    parts, at_ = [], 0.0
    for _ in range(7):
        parts.append((blip(float(prng.choice(pitches)), 0.01), at_, prng.uniform(0.6, 1)))
        at_ += 0.014
    save_slot("c-chatter", "step", tight(lowpass(mixdown(0.12, *parts), 3500)))

    parts = [(blip(300 * (1600 / 300) ** (k / 11), 0.009), 0.16 * k / 11, 0.4 + 0.6 * k / 11) for k in range(12)]
    save_slot("c-scan", "transition", tight(mixdown(0.4, *parts, (relay(), 0.17, 0.8))))

    x = t(0.22)
    glide = gate(lowpass(square(110 * 4 ** (x / 0.22), 0.22), 1500) * (x / 0.22), 0.002, 0.004)
    hum = lowpass(square(55, 0.4), 300) * np.exp(-t(0.4) / 0.25)
    save_slot("c-boot", "entrance", tight(mixdown(0.7, (glide, 0, 0.6), (relay(0.8), 0.22, 1), (relay(0.7), 0.235, 0.6), (hum, 0.22, 0.8))))

    dyad = lowpass(square(330, 0.25) + square(495, 0.25), 2000) * np.exp(-t(0.25) / 0.1)
    sub = np.sin(2 * np.pi * 82 * t(0.3)) * np.exp(-t(0.3) / 0.08)
    save_slot("c-lock", "milestone", tight(mixdown(0.45, (blip(990, 0.04), 0, 0.7), (gate(dyad), 0.06, 0.8), (relay(), 0.06, 0.6), (sub, 0.06, 0.9))))

    parts = [(blip(f, 0.025), 0.03 * k, 0.8) for k, f in enumerate([660, 880, 1108, 1318])]
    last = blip(1760, 0.045) * np.exp(-t(0.045) / 0.02)
    save_slot("c-cash", "money", tight(mixdown(0.25, *parts, (last, 0.12, 0.6))))

    sec = 1.5
    y = np.zeros(int(SR * sec))
    at_, gap = 0.0, 0.15
    while at_ < sec - 0.015:
        place(y, blip(300 * 4 ** (at_ / sec), 0.012), at_, 0.35 + 0.65 * at_ / sec)
        at_ += gap
        gap = max(0.02, gap * 0.88)
    x = t(sec)
    drone = lowpass(square(55 * 2 ** (x / sec), sec), 700) * (x / sec) ** 2
    save_slot("c-charge", "buildup", tight(y + 0.4 * drone), tail=0.02)

    parts, at_, gap = [], 0.0, 0.04
    for k in range(10):
        f0 = 990 * (165 / 990) ** (k / 9)
        xx = t(0.03)
        parts.append((gate(lowpass(square(f0 * (1 - 0.06 * xx / 0.03), 0.03), 4000)), at_, 1 - 0.04 * k))
        at_ += gap
        gap *= 1.12
    save_slot("c-fall", "decline", tight(mixdown(0.95, *parts)), tail=0.05)

    sec = 1.3
    x = t(sec)
    hit = np.sin(2 * np.pi * np.cumsum(45 + 75 * np.exp(-x / 0.03)) / SR) * np.exp(-x / 0.2) * soft_attack(len(x), 0.002)
    crunch = lowpass(burst(sec, 0.01, 100, 6000), 1500)
    hold = np.repeat(prng.standard_normal(int(SR * 0.15) // 12 + 1), 12)[: int(SR * 0.15)]
    static = lowpass(hold, 3000) * np.exp(-t(0.15) / 0.05)
    speed = np.clip(1 - (x / 0.9) ** 1.2, 0, 1)
    ph = 2 * np.pi * np.cumsum(110 * speed) / SR
    drone = sum(np.sign(np.sin(k * ph)) for k in (1, 1.5))  # 110 + 165 square, tape-stopped
    drone = lowpass(drone * speed ** 0.6, 1200)
    save_slot("c-crash", "crash", tight(mixdown(sec, (np.tanh(1.5 * hit), 0, 1), (crunch, 0, 0.5), (static, 0, 0.25), (drone, 0, 0.25))), tail=0.1)

    beep = gate(lowpass(square(740, 0.055) + 0.7 * square(698, 0.055), 2500))
    save_slot("c-alarm", "shock", tight(mixdown(0.25, (beep, 0, 1), (beep, 0.1, 1))))

    pad = lowpass(square(495, 0.8) + 0.8 * square(742, 0.8), 1500) * np.exp(-t(0.8) / 0.35) * soft_attack(int(SR * 0.8), 0.003)
    sub = np.sin(2 * np.pi * 124 * t(0.6)) * np.exp(-t(0.6) / 0.3)
    save_slot("c-logo", "logo", tight(mixdown(1.1, (relay(), 0, 0.8), (blip(495, 0.045), 0, 0.7), (blip(660, 0.045), 0.07, 0.7),
                                              (blip(990, 0.045), 0.14, 0.7), (pad, 0.21, 0.6), (sub, 0.21, 0.7), (relay(0.9), 0.21, 0.5))), tail=0.05)


def palette_d() -> None:
    """D · Tape: cassette deck buttons, tape rewind / start / slow-down, muffled e-piano, crackle and hiss."""
    def clack(s=1.0):
        return modes([(720 * s, 1, 0.01), (1500 * s, 0.6, 0.007), (2600 * s, 0.35, 0.005), (260 * s, 0.5, 0.015)], 0.1) + 0.5 * burst(0.1, 0.0015, 800, 5000)

    def latch():
        return modes([(420, 0.6, 0.02), (900, 0.4, 0.01)], 0.12) + 0.3 * lowpass(burst(0.12, 0.004, 100, 2000), 2000)

    save_slot("d-click", "click", lofi(clack(), 3500, hiss_lvl=0.004, crackle_rate=0))
    save_slot("d-button", "label", lofi(mixdown(0.22, (clack(0.9), 0, 1), (latch(), 0.03, 0.8)), 3500, hiss_lvl=0.004, crackle_rate=0))
    save_slot("d-tick", "step", lofi(lowpass(burst(0.06, 0.001, 300, 3000), 3000) + modes([(1200, 0.6, 0.003)], 0.06), 3000, hiss_lvl=0.003, crackle_rate=0))

    # tape rewind: a garbled snippet of music racing faster, peak ~4-5 frames, motor whine, stop clunk
    sec = 0.5
    x = t(sec)
    speed = 3 + 6 * (x / sec) ** 0.7
    seg = (x * 40).astype(int)
    notes = prng.choice([hz(nm) for nm in ["D3", "F#3", "A3", "B3", "D4", "E4"]], seg.max() + 1)
    ph = 2 * np.pi * np.cumsum(notes[seg] * speed) / SR
    garble = bandpass(np.sin(ph) + 0.4 * np.sin(2 * ph), 500, 3500)
    whine = 0.15 * np.sin(2 * np.pi * np.cumsum(150 * speed) / SR)
    e = np.where(x < 0.15, (x / 0.15) ** 1.5, np.exp(-(x - 0.15) / 0.1))
    save_slot("d-rewind", "transition", lofi(mixdown(sec, ((garble + whine) * e, 0, 1), (clack(0.6), 0.36, 0.25)), 3500))

    # PLAY: big clunk, then the deck's chord comes up to speed (~7 frames)
    sec = 0.9
    x = t(sec)
    sp = 1 - 0.8 * np.exp(-x / 0.07)
    chord = epiano([hz("D3"), hz("F#3"), hz("A3")], sec, tau=0.35, speed=sp) * (1 - np.exp(-x / 0.08))
    save_slot("d-clunk-in", "entrance", lofi(mixdown(sec, (clack(0.7), 0, 0.9), (latch(), 0.025, 0.7), (chord, 0.02, 0.8)), 3000), tail=0.05)

    chord = wow(epiano([hz("D4"), hz("F#4"), hz("A4"), 554.37, hz("E5")], 1.4, tau=0.5, strum=0.015), 2.0, 0.8)
    save_slot("d-chord", "milestone", lofi(chord, 3000, hiss_lvl=0.01), tail=0.08)

    bell = modes([(2100, 1, 0.25), (5400, 0.3, 0.08), (2950, 0.4, 0.12)], 0.6)
    drawer = modes([(140, 0.8, 0.06), (300, 0.4, 0.03)], 0.3) + 0.4 * lowpass(burst(0.3, 0.01, 80, 2000), 2000)
    coin = modes([(3300, 1, 0.08), (6000, 0.5, 0.05)], 0.25)
    reg = mixdown(0.9, (clack(1.2), 0, 0.4), (clack(1.25), 0.04, 0.35), (clack(1.3), 0.08, 0.3), (bell, 0.12, 0.6), (drawer, 0.18, 0.8), (coin, 0.22, 0.15), (coin, 0.26, 0.1))
    save_slot("d-register", "money", lofi(reg, 4000, hiss_lvl=0.006), tail=0.05)

    sec = 1.5
    x = t(sec)
    sp = 0.25 + 0.75 * (x / sec) ** 1.5
    chord = epiano([hz("D3"), hz("A3"), hz("D4"), hz("F#4")], sec, tau=3.0, speed=sp) * (0.2 + 0.8 * (x / sec) ** 1.5)
    save_slot("d-speedup", "buildup", lofi(chord, 3200, hiss_lvl=0.02), tail=0.02)

    sec = 0.95
    x = t(sec)
    sp = np.clip(1 - 0.55 * (x / sec) ** 1.2, 0.3, 1)
    sag = epiano([hz("D3"), hz("F3"), hz("A3")], sec, tau=1.0, speed=sp) * sp
    save_slot("d-slow", "decline", lofi(wow(sag, 3.0, 2.2, 0.3), 2500, hiss_lvl=0.015), tail=0.05)

    sec = 1.1
    x = t(sec)
    kick = np.tanh(2.5 * np.sin(2 * np.pi * np.cumsum(52 + 98 * np.exp(-x / 0.025)) / SR) * np.exp(-x / 0.22) * soft_attack(len(x), 0.002))
    duck = 1 - 0.9 * np.exp(-x / 0.25)
    y = lowpass(kick, 700) + hiss(len(x), 0.03) * duck + crackle(len(x), 60, 0.3) * duck
    save_slot("d-thump", "crash", highpass(y, 35), tail=0.08)

    war = wow(epiano([hz("D4"), hz("Ab4")], 0.45, tau=0.18), 6.0, 7.0, 0.5, 13)
    save_slot("d-warble", "shock", lofi(war + crackle(len(war), 300, 0.4), 3000))

    sec = 1.9
    drop_ = lowpass(np.sin(2 * np.pi * 70 * t(0.3)) * np.exp(-t(0.3) / 0.06), 500) + crackle(int(SR * 0.3), 400, 0.6)
    chord = wow(epiano([hz("D4"), hz("F#4"), hz("A4"), 554.37, hz("E5")], 1.75, tau=0.7, strum=0.02), 1.5, 0.7)
    save_slot("d-outro", "logo", lofi(mixdown(sec, (drop_, 0, 0.5), (chord, 0.12, 1)), 2800, hiss_lvl=0.012), tail=0.2)


def chatter_steps() -> None:
    """c-chatter-1..4: four different data bursts for a grid/counter fill, cycled per step so a fill
    never repeats the same burst back to back. Same blip voice and room as c-chatter, different
    pitch runs, lengths and speeds. Own generator, so nothing else in the library changes."""
    r = np.random.default_rng(4141)

    def tight(x):
        return room(x, 0.2, 0.05)

    runs = [
        ([550, 660, 880, 990], 0.014, 0.011),            # short climb
        ([880, 660, 990, 550, 1320, 880], 0.012, 0.009),  # busy scatter
        ([660, 990, 1320], 0.019, 0.012),                 # three slower blips
        ([990, 880, 660, 880, 1100], 0.013, 0.010),       # dip and back up
    ]
    for k, (pitches, gap, dur) in enumerate(runs, 1):
        parts = [(blip(float(f), dur), i * gap, r.uniform(0.65, 1)) for i, f in enumerate(pitches)]
        sec = len(pitches) * gap + 0.04
        save_slot(f"c-chatter-{k}", "step", tight(lowpass(mixdown(sec, *parts), 3500)))


ALT_PALETTES = {"a": palette_a, "b": palette_b, "c": palette_c, "d": palette_d, "chatter": chatter_steps}


if __name__ == "__main__":
    import sys

    picked = [a[2:] for a in sys.argv[1:] if a.startswith("--") and a[2:] in ALT_PALETTES]
    if picked or "--alts" in sys.argv:
        for k in picked or ALT_PALETTES:
            ALT_PALETTES[k]()
    else:
        if "--palette" not in sys.argv:
            main()
        palette()
        # The alt palettes (B + C are the live library) were generated by a `--alts` run, i.e. starting
        # from a fresh generator. Reset it so a full run reproduces those files bit for bit.
        prng = np.random.default_rng(2026)
        for f in ALT_PALETTES.values():
            f()
