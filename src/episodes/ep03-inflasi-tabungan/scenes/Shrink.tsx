import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {CLAMP, ChangeChip, Kicker, Panel, Reveal, useIn} from '../../../core/components/ui';
import {fmt} from '../../../core/format';
import {C, MONO, SANS} from '../../../core/theme';
import {useLine, useWordAt} from '../../../core/timing';
import {Sfx} from '../../../core/audio';
import {T} from '../copy';
import {INF, P0} from '../data';
import {Basket, Label, MoneyStack} from '../parts';

const COL_W = 430;
const COL_TOP = 500;
const COL_H = 640;
const TRAVEL = {...CLAMP, easing: Easing.inOut(Easing.cubic)};

/** Price factor at a fractional point along the Dec-to-Dec path (0 = Jan 2010, last = Sep 2026). */
const pathFactor = (k: number) => {
  const p = INF.path;
  const c = Math.max(0, Math.min(p.length - 1, k));
  const i = Math.floor(c);
  const j = Math.min(p.length - 1, i + 1);
  return p[i].priceFactor + (p[j].priceFactor - p[i].priceFactor) * (c - i);
};

const Num: React.FC<{children: React.ReactNode; color?: string; size?: number}> = ({children, color = C.text, size = 50}) => (
  <div style={{fontFamily: SANS, fontWeight: 800, fontSize: size, color, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1}}>
    {children}
  </div>
);

export const Shrink: React.FC = () => {
  const frame = useCurrentFrame();
  const s1 = useLine('shrink-1').from;
  const s2 = useLine('shrink-2').from;
  const s3 = useLine('shrink-3').from;
  // Prices climb through "Belanjaan yang dulu Rp 10 juta, sekarang harganya…" and land on "Rp 19 juta".
  const priceFrom = s2 + 12;
  const priceTo = Math.max(priceFrom + 60, useWordAt('shrink-2', 'Rp', 1));
  // The stack loses its top on "Jadi uangmu tinggal setara…", landing on "Rp 5,3 juta"; the chip on "hampir".
  const fadeFrom = s3 + 6;
  const fadeTo = Math.max(fadeFrom + 36, useWordAt('shrink-3', 'Rp'));
  const hampir = Math.max(fadeTo + 20, useWordAt('shrink-3', 'hampir'));

  const left = useIn(8, true);
  const right = useIn(14, true);
  const priceChip = useIn(priceTo + 4, true);
  const lostChip = useIn(hampir - 2, true);
  const swap = interpolate(frame, [fadeFrom - 4, fadeFrom + 8], [0, 1], CLAMP);
  // Out, then in (never both at once), so the two labels don't garble while crossing.
  const swapOut = 1 - Math.min(1, swap * 2);
  const swapIn = Math.max(0, swap * 2 - 1);
  // Plain ramp (not the bouncy chip spring), so the note can't ghost back in behind the chip.
  const noteOut = interpolate(frame, [priceTo + 4, priceTo + 10], [1, 0], CLAMP);

  const k = interpolate(frame, [priceFrom, priceTo], [0, INF.path.length - 1], TRAVEL);
  const factor = pathFactor(k);
  // Scaled so the count lands exactly on the analyst's figure (Rp 19.032.983), not a re-rounded product.
  const price = P0 + (INF.needToday - P0) * ((factor - 1) / (INF.priceFactor - 1));
  // Path point i is the end of a year; show the year being lived through, then the as-of month at the end.
  const yearText = k >= INF.path.length - 1.01 ? T.shrink.yearTo : INF.path[Math.max(1, Math.ceil(k))].ym.slice(0, 4);

  const fade = interpolate(frame, [fadeFrom, fadeTo], [0, 1], TRAVEL);
  const keep = 1 - fade * (1 - T.shrink.real / P0);
  const power = P0 - fade * (P0 - T.shrink.real);

  // Three data steps while the basket's price counts up (sparse, rotating, level wobble), under shrink-2.
  const countSteps = [0, 1, 2].map((k) => priceFrom + 2 + ((priceTo - priceFrom - 8) * k) / 3);

  return (
    <AbsoluteFill>
      {/* The price count: chatter steps, then the total locks in on "Rp 19 juta" (c-lock peaks ~2 f in). */}
      {countSteps.map((at, k) => (
        <Sfx key={k} name={(['c-chatter-1', 'c-chatter-3', 'c-chatter-2'] as const)[k]} at={at} volume={[0.15, 0.14, 0.16][k]} />
      ))}
      <Sfx name="c-lock" at={priceTo - 2} volume={0.34} />
      {/* The stack drains: descending blips as it starts ("Jadi uangmu tinggal…"), a lock as it lands on "Rp 5,3 juta",
          and a small down-move for the "hampir setengahnya hilang" chip. All three sit mostly below 1 kHz. */}
      {/* fadeFrom + 8 at 0.16 (was + 2 at 0.22): there its blips stacked on "uangmu" and set the video's true peak
          (QA round 1); 6 frames later they fall between syllables. */}
      <Sfx name="c-fall" at={fadeFrom + 8} volume={0.16} />
      <Sfx name="c-lock" at={fadeTo - 2} volume={0.26} />
      <Sfx name="b-dip" at={hampir - 2} volume={0.28} />
      <div style={{position: 'absolute', left: 90, top: 200}}>
        <Kicker>{T.shrink.kicker}</Kicker>
      </div>
      <div style={{position: 'absolute', left: 90, right: 90, top: 270}}>
        {T.shrink.def.map((l, i) => (
          <Reveal key={l} delay={Math.max(4, s1) + i * 6} style={{fontFamily: SANS, fontWeight: 800, fontSize: 62, color: C.text, letterSpacing: '-0.03em', lineHeight: 1.12, whiteSpace: 'nowrap'}}>
            {l}
          </Reveal>
        ))}
      </div>

      {/* Left: the money, whose number never changes */}
      <Panel
        style={{
          position: 'absolute',
          left: 90,
          top: COL_TOP,
          width: COL_W,
          height: COL_H,
          boxSizing: 'border-box',
          padding: '30px 30px',
          opacity: Math.min(1, left * 2),
          transform: `scale(${0.9 + 0.1 * left})`,
        }}
      >
        <div style={{position: 'relative', height: 30}}>
          <Label style={{position: 'absolute', opacity: swapOut}}>{T.shrink.money}</Label>
          <Label color={C.loss} style={{position: 'absolute', opacity: swapIn}}>{T.shrink.power}</Label>
        </div>
        <div style={{height: 340, display: 'flex', alignItems: 'flex-end', justifyContent: 'center'}}>
          <MoneyStack width={300} layers={7} layerH={36} keep={keep} />
        </div>
        <div style={{marginTop: 34}}>
          <Num color={swap > 0.5 ? C.text : C.gold}>{fmt.rp(swap > 0 ? power : P0)}</Num>
          <div style={{position: 'relative', height: 60, marginTop: 10}}>
            <div style={{position: 'absolute', fontFamily: SANS, fontWeight: 500, fontSize: 32, color: C.dim, opacity: swapOut}}>{T.shrink.moneyNote}</div>
            <div style={{position: 'absolute', opacity: Math.min(1, lostChip * 2), transform: `scale(${0.8 + 0.2 * lostChip})`, transformOrigin: 'left center'}}>
              <ChangeChip x={T.shrink.lost} size={34} />
            </div>
          </div>
          <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 30, color: C.dim, marginTop: 8, opacity: interpolate(frame, [fadeTo, fadeTo + 10], [0, 1], CLAMP)}}>
            {T.shrink.realApprox}
          </div>
        </div>
      </Panel>

      {/* Right: the same basket of shopping, whose price keeps climbing */}
      <Panel
        style={{
          position: 'absolute',
          left: 90 + COL_W + 40,
          top: COL_TOP,
          width: COL_W,
          height: COL_H,
          boxSizing: 'border-box',
          padding: '30px 30px',
          opacity: Math.min(1, right * 2),
          transform: `scale(${0.9 + 0.1 * right})`,
        }}
      >
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', height: 30}}>
          <Label>{T.shrink.basket}</Label>
        </div>
        <div style={{height: 340, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end'}}>
          <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 34, letterSpacing: '0.08em', color: C.text, marginBottom: 12, fontVariantNumeric: 'tabular-nums'}}>
            {yearText}
          </div>
          <Basket width={330} tint={k / (INF.path.length - 1)} />
        </div>
        <div style={{marginTop: 34}}>
          <Num>{fmt.rp(price)}</Num>
          <div style={{position: 'relative', height: 60, marginTop: 10}}>
            <div style={{position: 'absolute', fontFamily: SANS, fontWeight: 500, fontSize: 32, color: C.dim, opacity: noteOut}}>{T.shrink.basketNote}</div>
            <div style={{position: 'absolute', opacity: Math.min(1, priceChip * 2), transform: `scale(${0.8 + 0.2 * priceChip})`, transformOrigin: 'left center'}}>
              <ChangeChip x={T.shrink.rise} size={34} />
            </div>
          </div>
          <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 30, color: C.dim, marginTop: 8, opacity: interpolate(frame, [priceTo, priceTo + 10], [0, 1], CLAMP)}}>
            {T.shrink.needApprox}
          </div>
        </div>
      </Panel>

      {/* Footnote: what the window is */}
      <div style={{position: 'absolute', left: 90, right: 90, top: COL_TOP + COL_H + 26, fontFamily: MONO, fontWeight: 500, fontSize: 24, color: C.mute, letterSpacing: '0.06em', opacity: right}}>
        {T.shrink.source}
      </div>
    </AbsoluteFill>
  );
};
