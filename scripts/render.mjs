// Render an episode. Bundles once, then renders what you ask for.
//
//   node scripts/render.mjs <episode-id>                 final.mp4 + clean.mp4 into episodes/<id>/out/ (audio normalized to -14 LUFS)
//   node scripts/render.mjs <episode-id> --final         only final.mp4 (captions burned in)
//   node scripts/render.mjs <episode-id> --clean         only clean.mp4 (no captions)
//   node scripts/render.mjs <episode-id> --stills 3.5 20 61.2      stills at those seconds → episodes/<id>/qa/
//   node scripts/render.mjs <episode-id> --stills scenes             one still from the middle of every scene
//   node scripts/render.mjs <episode-id> --range 92 107               preview of a time range → episodes/<id>/qa/preview-92-107.mp4
import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const [id, ...rest] = process.argv.slice(2);
if (!id) {
  console.error('usage: node scripts/render.mjs <episode-id> [--final|--clean|--stills <sec...>|scenes]');
  process.exit(1);
}
const epDir = path.join(root, 'episodes', id);
const timing = JSON.parse(fs.readFileSync(path.join(root, 'src', 'episodes', id, 'timing.json'), 'utf8'));
if (timing.estimated) console.warn('⚠ timing.json is ESTIMATED (no voiceover yet): output is a preview, not a final cut.');

const flag = (f) => rest.includes(f);
// Each concurrent frame is a Chrome tab; 3 keeps memory modest on a 16 GB machine (override: RENDER_CONCURRENCY=6).
const concurrency = Number(process.env.RENDER_CONCURRENCY || 3);
// Per-frame timeout. The default (~30 s) was too short for 4K tutorial clips under load: tut01 renders died on
// "delayRender() … Fetching …/tutorial/tut01/*.mp4 … not cleared after 28000ms" three times (16–17 Okt).
const RENDER_TIMEOUT = 120000;
const stillsAt = flag('--stills') ? rest.slice(rest.indexOf('--stills') + 1).filter((a) => !a.startsWith('--')) : null;
// Tutorials: SFX_PALETTE=t1..t4 renders with that SFX palette (input prop, see src/core/tutorial/sfxPalettes.ts).
const inputProps = process.env.SFX_PALETTE ? {sfxPalette: process.env.SFX_PALETTE} : {};
const range = flag('--range') ? rest.slice(rest.indexOf('--range') + 1, rest.indexOf('--range') + 3).map(Number) : null;

// Pre-flight: Remotion's ffmpeg must actually run (when Windows blocks it, it exits 0 silently).
const probe = spawnSync('npx', ['remotion', 'ffmpeg', '-hide_banner', '-version'], {cwd: root, encoding: 'utf8', shell: process.platform === 'win32'});
if (!stillsAt && !`${probe.stdout}${probe.stderr}`.includes('ffmpeg version')) {
  console.error(
    "Remotion's ffmpeg won't run, so videos can't be encoded. On Windows this is usually Smart App Control " +
      'blocking node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe. See CLAUDE.md -> Gotchas.',
  );
  process.exit(1);
}

const serveUrl = await bundle({entryPoint: path.join(root, 'src', 'index.ts')});

if (stillsAt) {
  const comp = await selectComposition({serveUrl, id, inputProps});
  const frames =
    stillsAt[0] === 'scenes'
      ? timing.scenes.map((s) => ({frame: s.from + Math.floor(s.dur * 0.6), name: s.id}))
      : stillsAt.map((sec) => ({frame: Math.min(comp.durationInFrames - 1, Math.round(Number(sec) * timing.fps)), name: `t${sec}s`}));
  const qa = path.join(epDir, 'qa');
  fs.mkdirSync(qa, {recursive: true});
  for (const {frame, name} of frames) {
    const output = path.join(qa, `still-${name}.jpg`);
    await renderStill({composition: comp, serveUrl, inputProps, frame, output, imageFormat: 'jpeg', jpegQuality: 88});
    console.log(`still ${path.relative(root, output)} (frame ${frame}, ${(frame / timing.fps).toFixed(1)}s)`);
  }
  process.exit(0);
}

/** Two-pass EBU R128 loudness normalization of the audio track (video stream copied untouched). */
const LOUDNORM = 'I=-14:TP=-2:LRA=11';
const ffmpeg = (args) =>
  spawnSync('npx', ['remotion', 'ffmpeg', ...args], {cwd: root, encoding: 'utf8', shell: process.platform === 'win32'});
const normalizeLoudness = (file) => {
  const q = (p) => `"${p}"`;
  const probe = ffmpeg(['-hide_banner', '-nostats', '-i', q(file), '-vn', '-af', `loudnorm=${LOUDNORM}:print_format=json`, '-f', 'null', '-']);
  const m = JSON.parse(probe.stderr.slice(probe.stderr.lastIndexOf('{'), probe.stderr.lastIndexOf('}') + 1));
  const tmp = file.replace(/\.mp4$/, '.norm.mp4');
  // Plain linear gain, capped so true peak stays ≤ −2 dBTP before the AAC encode (the encode adds up to ~0,6 dB:
  // tut01 clean.mp4 landed at −0,9 dBTP with a −1,5 cap, 16 Okt). loudnorm's own linear mode silently
  // falls back to dynamic gain riding when the peak doesn't fit, which made openings ~1 dB quiet.
  const gain = Math.min(-14 - Number(m.input_i), -2 - Number(m.input_tp));
  const res = ffmpeg(['-v', 'error', '-y', '-i', q(file), '-c:v', 'copy', '-af', `volume=${gain.toFixed(2)}dB`, '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', q(tmp)]);
  if (res.status !== 0) throw new Error(`loudness gain failed: ${res.stderr}`);
  fs.renameSync(tmp, file);
  const landed = (Number(m.input_i) + gain).toFixed(1);
  console.log(`loudness ${path.basename(file)}: ${m.input_i} LUFS +${gain.toFixed(2)} dB → ${landed} LUFS (true peak ${(Number(m.input_tp) + gain).toFixed(1)} dBTP)`);
};

if (range) {
  const composition = await selectComposition({serveUrl, id, inputProps});
  const [a, b] = range;
  const frameRange = [Math.round(a * timing.fps), Math.min(composition.durationInFrames - 1, Math.round(b * timing.fps) - 1)];
  const outputLocation = path.join(epDir, 'qa', `preview-${a}-${b}${process.env.SFX_PALETTE ? `-${process.env.SFX_PALETTE}` : ''}.mp4`);
  fs.mkdirSync(path.dirname(outputLocation), {recursive: true});
  await renderMedia({composition, serveUrl, inputProps, codec: 'h264', crf: 20, concurrency, frameRange, outputLocation, timeoutInMilliseconds: RENDER_TIMEOUT});
  console.log(`preview ${path.relative(root, outputLocation)} (${a}s–${b}s)`);
  process.exit(0);
}

const out = path.join(epDir, 'out');
fs.mkdirSync(out, {recursive: true});
const jobs = [];
if (!flag('--clean')) jobs.push({compId: id, file: 'final.mp4'});
if (!flag('--final')) jobs.push({compId: `${id}-clean`, file: 'clean.mp4'});
for (const {compId, file} of jobs) {
  const composition = await selectComposition({serveUrl, id: compId, inputProps});
  const outputLocation = path.join(out, file);
  let last = -1;
  await renderMedia({
    composition,
    serveUrl,
    inputProps,
    codec: 'h264',
    crf: 18,
    concurrency,
    outputLocation,
    timeoutInMilliseconds: RENDER_TIMEOUT,
    onProgress: ({progress}) => {
      const pct = Math.floor(progress * 10) * 10;
      if (pct !== last) {
        last = pct;
        process.stdout.write(`${file} ${pct}%\n`);
      }
    },
  });
  console.log(`rendered ${path.relative(root, outputLocation)}`);
  // Previews have no voice, so normalizing would just pump the SFX up.
  if (!timing.estimated) normalizeLoudness(outputLocation);
}
