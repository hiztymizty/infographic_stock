"""Derive video-ready Hakabot logo files from brand_logo/ into public/brand/.

Usage: python -I scripts/brand_assets.py

Sources (3150px squares with padding):
  PNG-07  blue icon          PNG-08  dark wordmark
  PNG-09  black icon+wordmark lockup   PNG-11  black icon
Outputs are cropped to content and recoloured for dark backgrounds.
"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "brand_logo"
OUT = ROOT / "public" / "brand"
BRAND_BLUE = (18, 18, 249)


def load(name: str) -> Image.Image:
    im = Image.open(SRC / name).convert("RGBA")
    return im.crop(im.getbbox())


def recolor(im: Image.Image, rgb: tuple[int, int, int]) -> Image.Image:
    alpha = im.getchannel("A")
    solid = Image.new("RGBA", im.size, rgb + (255,))
    solid.putalpha(alpha)
    return solid


def save(im: Image.Image, name: str, width: int) -> None:
    h = round(im.height * width / im.width)
    im.resize((width, h), Image.LANCZOS).save(OUT / name, optimize=True)
    print(f"{name}: {width}x{h}")


OUT.mkdir(parents=True, exist_ok=True)
lockup = load("PNG-09.png")
icon = load("PNG-11.png")
wordmark = load("PNG-08.png")

save(recolor(lockup, (255, 255, 255)), "hakabot-lockup-white.png", 1200)
save(recolor(icon, (255, 255, 255)), "hakabot-icon-white.png", 600)
save(recolor(icon, BRAND_BLUE), "hakabot-icon-blue.png", 600)
save(recolor(wordmark, (255, 255, 255)), "hakabot-wordmark-white.png", 1200)
