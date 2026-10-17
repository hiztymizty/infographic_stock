"""Tutorial SRT that matches the burned-in subtitles (port of useSubtitles in src/core/tutorial/Overlays.tsx).
Usage (repo root): python -I scripts/tutorial_srt.py <episode-id> <out.srt>"""
import json, re, sys
sys.stdout.reconfigure(encoding="utf-8")
ep, outp = sys.argv[1], sys.argv[2]
t = json.load(open(f"src/episodes/{ep}/timing.json", encoding="utf-8"))
fps = t["fps"]; MAX = 84
J = lambda ws: " ".join(w["text"] for w in ws)
def split(ws):
    if len(J(ws)) <= MAX or len(ws) < 2: return [ws]
    tot = len(J(ws)); best = -1; bs = float("inf")
    for i in range(1, len(ws)):
        l = len(J(ws[:i])); r = tot - l - 1
        if l > MAX and r > MAX: continue
        comma = -0.5 * tot if re.search(r"[,;:]$", ws[i-1]["text"]) else 0
        stub = tot if i < 3 or len(ws) - i < 3 else 0
        pair = 2 * tot if re.fullmatch(r"[\d.,%]+[.,]?", ws[i]["text"]) or re.fullmatch(r"(lawan|vs\.?|banding|dari)", ws[i-1]["text"], re.I) else 0
        sc = abs(l - r) + comma + stub + pair
        if sc < bs: bs = sc; best = i
    if best < 0: best = -(-len(ws) // 2)
    return split(ws[:best]) + split(ws[best:])
by = {}
for c in t["captions"]: by.setdefault(c["line"], []).extend(c["words"])
subs = []
for words in by.values():
    sents, cur = [], []
    for w in words:
        cur.append(w)
        if re.search(r'[.?!]["”)]?$', w["text"]): sents.append(cur); cur = []
    if cur: sents.append(cur)
    merged = []
    for p in [p for s in sents for p in split(s)]:
        if merged and (len(J(merged[-1])) < 24 or len(J(p)) < 12) and len(J(merged[-1])) + 1 + len(J(p)) <= MAX: merged[-1] += p
        else: merged.append(list(p))
    subs += [{"from": m[0]["from"], "to": m[-1]["to"], "text": J(m)} for m in merged]
subs.sort(key=lambda s: s["from"])
for a, b in zip(subs, subs[1:]):
    if b["from"] - a["to"] < 12: a["to"] = b["from"]
def ts(f):
    ms = round(f * 1000 / fps)
    return f"{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}"
out = "\n".join(f"{i}\n{ts(s['from'])} --> {ts(s['to'])}\n{s['text'].replace(chr(160), ' ')}\n" for i, s in enumerate(subs, 1))
open(outp, "w", encoding="utf-8").write(out)
print(f"wrote {len(subs)} cues to {outp}")
