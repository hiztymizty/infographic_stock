"""Synthesize the license-free SFX library into public/sfx/*.wav (48 kHz, 16-bit mono).

Usage: python -I scripts/sfx_synth.py

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


if __name__ == "__main__":
    main()
