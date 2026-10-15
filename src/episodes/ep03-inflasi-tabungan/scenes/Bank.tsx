import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {CLAMP, ChangeChip, Kicker, Triangle, useIn} from '../../../core/components/ui';
import {C, MONO, SANS} from '../../../core/theme';
import {useLine, useWordAt} from '../../../core/timing';
import {Sfx} from '../../../core/audio';
import {T} from '../copy';
import {D, FULL_YEARS, yearsBeat} from '../data';

/**
 * One idea per line (user rework, 14 Okt):
 *   bank-1  the question, two options (Tabungan · Deposito)
 *   bank-2  Tabungan only: interest loses a 20% slice to tax, then the verdict "0 dari 16 tahun"
 *   bank-3  Deposito only: "12 dari 16 tahun", then "+0,7% setahun", menang tipis
 *   bank-4  a calm footnote: the rate used is the highest one LPS guarantees
 * The option pills stay as a header so the viewer always knows which product is on screen.
 */
const STAGE = 540;
const W_IN = 900;
/** Tick row and tax bar stop at x 970, clear of the right-side app buttons (x > 980 from y 700). */
const ROW_W = 880;
const TICK = 48;
const TICK_GAP = (ROW_W - 16 * TICK) / 15;

/** Fade/slide for a block that holds the stage between two frames. */
const useStage = (from: number, to: number) => {
  const frame = useCurrentFrame();
  const inP = interpolate(frame, [from, from + 14], [0, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});
  const outP = interpolate(frame, [to, to + 12], [0, 1], {...CLAMP, easing: Easing.in(Easing.cubic)});
  return {opacity: inP * (1 - outP), transform: `translateY(${(1 - inP) * 30 - outP * 30}px)`, on: inP * (1 - outP) > 0.001};
};

const Ticks: React.FC<{beat: number[]; fill: number}> = ({beat, fill}) => (
  <div style={{display: 'flex', gap: TICK_GAP}}>
    {FULL_YEARS.map((y, i) => {
      const on = fill > i;
      const won = beat.includes(y);
      const tone = won ? C.value : C.loss;
      return (
        <div
          key={y}
          style={{
            width: TICK,
            height: TICK,
            borderRadius: 10,
            boxSizing: 'border-box',
            border: `2px solid ${on ? tone : 'rgba(255,255,255,0.14)'}`,
            background: on ? tone : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {on && <Triangle up={won} size={20} color={C.bg} />}
        </div>
      );
    })}
  </div>
);

const Verdict: React.FC<{count: number; beat: number[]; fill: number; note?: string; noteOpacity?: number}> = ({count, beat, fill, note, noteOpacity = 1}) => (
  <div>
    <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 40, color: C.dim}}>{T.bank.verdictLabel}</div>
    <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 104, color: C.text, letterSpacing: '-0.04em', lineHeight: 1.1, fontVariantNumeric: 'tabular-nums', marginTop: 4}}>
      {T.bank.verdict(count)}
    </div>
    <div style={{marginTop: 26}}>
      <Ticks beat={beat} fill={fill} />
    </div>
    {note && <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 40, color: C.text, marginTop: 26, opacity: noteOpacity}}>{note}</div>}
  </div>
);

export const Bank: React.FC = () => {
  const frame = useCurrentFrame();
  const b2 = useLine('bank-2').from;
  const b3 = useLine('bank-3').from;
  const b4 = useLine('bank-4').from;
  const pajak = Math.max(b2 + 20, useWordAt('bank-2', 'pajak'));
  const nggak = Math.max(pajak + 40, useWordAt('bank-2', 'nggak'));
  const tabFillEnd = Math.max(nggak + 30, useWordAt('bank-2', 'inflasi'));
  const tapi = Math.max(b3 + 36, useWordAt('bank-3', 'tapi'));
  const edgeAt = Math.max(tapi + 30, useWordAt('bank-3', '0,7'));

  // Header: both options lit for the question, then only the one being discussed.
  const opts = [useIn(6, true), useIn(12, true)];
  const toTab = interpolate(frame, [b2 - 6, b2 + 6], [0, 1], CLAMP);
  const toDep = interpolate(frame, [b3 - 8, b3 + 4], [0, 1], CLAMP);
  const lit = [1 - 0.65 * toDep, 1 - 0.65 * toTab * (1 - toDep)];
  const ring = [toTab * (1 - toDep), toDep];

  // Stage blocks, one at a time.
  const tax = useStage(b2 + 4, nggak - 14);
  const bite = interpolate(frame, [pajak, pajak + 22], [0, 1], {...CLAMP, easing: Easing.in(Easing.quad)});
  const taxText = interpolate(frame, [pajak + 14, pajak + 26], [0, 1], CLAMP);
  const tab = useStage(nggak - 4, b3 - 8);
  const tabFill = interpolate(frame, [nggak, tabFillEnd], [0, 16], CLAMP);
  const tabNote = interpolate(frame, [tabFillEnd, tabFillEnd + 12], [0, 1], CLAMP);
  const dep = useStage(b3 + 2, 1e9);
  const depFill = interpolate(frame, [b3 + 10, tapi - 4], [0, 16], CLAMP);
  const depBeat = yearsBeat('deposito_lps');
  // Same rule as the ticks (a tick is lit when fill > its index), so the count always matches the lit ticks.
  const depCount = depBeat.filter((y) => depFill > FULL_YEARS.indexOf(y)).length;
  const edge = useIn(edgeAt - 4, true);
  const note = useIn(b4 + 4);

  const tones = [C.invested, C.value];

  // Deposito row: three data steps as it fills, then the count locks on 12 (c-lock peaks ~2 f in).
  const depFrom = b3 + 10;
  const depTo = tapi - 4;
  const depSteps = [0, 1, 2].map((k) => depFrom + 1 + ((depTo - depFrom - 8) * k) / 3);

  return (
    <AbsoluteFill>
      {/* The two option pills land (b-air is on frame 0, so the taps start at 8 and stay 7 apart). */}
      <Sfx name="b-tap" at={8} volume={0.28} />
      <Sfx name="b-tap" at={15} volume={0.3} />
      {/* Tabungan gets picked; the tax slice drops off on "20%"; the row fills red (a decline, so c-fall). */}
      <Sfx name="b-tap" at={b2 - 2} volume={0.26} />
      <Sfx name="b-dip" at={pajak + 14} volume={0.28} />
      <Sfx name="c-fall" at={nggak + 2} volume={0.26} />
      {/* Deposito gets picked; its row fills with data steps and the count locks on 12; the thin edge chip. */}
      <Sfx name="b-tap" at={b3 - 2} volume={0.26} />
      {depSteps.map((at, k) => (
        <Sfx key={k} name={(['c-chatter-2', 'c-chatter-4', 'c-chatter-1'] as const)[k]} at={at} volume={[0.15, 0.16, 0.14][k]} />
      ))}
      <Sfx name="c-lock" at={depTo - 2} volume={0.32} />
      <Sfx name="b-tap" at={edgeAt - 5} volume={0.26} />
      <div style={{position: 'absolute', left: 90, top: 200}}>
        <Kicker>{T.bank.kicker}</Kicker>
      </div>

      {/* Header: the two options */}
      <div style={{position: 'absolute', left: 90, right: 90, top: 280, display: 'flex', gap: 30}}>
        {T.bank.options.map((o, i) => (
          <div
            key={o}
            style={{
              flex: 1,
              height: 118,
              borderRadius: 24,
              boxSizing: 'border-box',
              border: `3px solid ${ring[i] > 0.5 ? tones[i] : C.panelBorder}`,
              background: ring[i] > 0.5 ? (i === 0 ? 'rgba(57,135,229,0.14)' : 'rgba(24,160,111,0.14)') : C.panel,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 18,
              opacity: Math.min(1, opts[i] * 2) * lit[i],
              transform: `scale(${0.85 + 0.15 * opts[i]})`,
            }}
          >
            <div style={{width: 22, height: 22, borderRadius: 6, background: tones[i]}} />
            <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 56, color: C.text, letterSpacing: '-0.02em'}}>{o}</div>
          </div>
        ))}
      </div>

      {/* bank-2a: interest loses its tax slice */}
      {tax.on && (
        <div style={{position: 'absolute', left: 90, width: W_IN, top: STAGE + 40, opacity: tax.opacity, transform: tax.transform}}>
          <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 28, letterSpacing: '0.14em', color: C.dim}}>{T.bank.tax.bar}</div>
          <div style={{position: 'relative', height: 90, marginTop: 18}}>
            <div style={{position: 'absolute', left: 0, top: 0, height: 90, width: ROW_W * (1 - D.tax) - 4, borderRadius: '16px 0 0 16px', background: C.invested}} />
            <div
              style={{
                position: 'absolute',
                left: ROW_W * (1 - D.tax) + 4,
                top: 0,
                height: 90,
                width: ROW_W * D.tax - 4,
                borderRadius: '0 16px 16px 0',
                background: C.loss,
                transform: `translate(${bite * -14}px, ${bite * 70}px) rotate(${bite * 7}deg)`,
              }}
            />
          </div>
          <div style={{marginTop: 110, opacity: taxText, textAlign: 'right', width: ROW_W}}>
            <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 80, color: C.text, letterSpacing: '-0.03em', lineHeight: 1.05}}>{T.bank.tax.bite}</div>
            <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 40, color: C.dim, marginTop: 6}}>{T.bank.tax.note}</div>
          </div>
        </div>
      )}

      {/* bank-2b: the tabungan verdict */}
      {tab.on && (
        <div style={{position: 'absolute', left: 90, width: W_IN, top: STAGE, opacity: tab.opacity, transform: tab.transform}}>
          <Verdict count={T.bank.tabBeat} beat={yearsBeat('tabungan')} fill={tabFill} note={T.bank.tabNote} noteOpacity={tabNote} />
        </div>
      )}

      {/* bank-3: the deposito verdict, then the thin edge */}
      {dep.on && (
        <div style={{position: 'absolute', left: 90, width: W_IN, top: STAGE, opacity: dep.opacity, transform: dep.transform}}>
          <Verdict count={depCount} beat={depBeat} fill={depFill} />
          <div style={{marginTop: 60, opacity: Math.min(1, edge * 2), transform: `translateY(${(1 - edge) * 20}px)`}}>
            <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 40, color: C.dim}}>
              {T.bank.edgeKicker[0]}
              <span style={{color: C.text, fontWeight: 800, textDecoration: `underline ${C.value}`, textDecorationThickness: 5, textUnderlineOffset: 8}}>{T.bank.edgeKicker[1]}</span>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 24, marginTop: 14}}>
              <ChangeChip x={T.bank.edge} size={64} />
              <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 38, color: C.text, lineHeight: 1.15}}>{T.bank.edgeLabel}</div>
            </div>
          </div>
        </div>
      )}

      {/* bank-4: footnote */}
      <div
        style={{
          position: 'absolute',
          left: 90,
          right: 90,
          top: 1250,
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 32,
          lineHeight: 1.3,
          color: C.dim,
          opacity: note,
          transform: `translateY(${(1 - note) * 16}px)`,
        }}
      >
        {T.bank.lps[0]}
        <br />
        {T.bank.lps[1]}
      </div>
    </AbsoluteFill>
  );
};
