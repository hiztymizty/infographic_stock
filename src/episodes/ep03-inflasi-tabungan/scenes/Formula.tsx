import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {CLAMP, Kicker, Panel, Triangle, useIn} from '../../../core/components/ui';
import {C, MONO, SANS} from '../../../core/theme';
import {useLine, useWordAt} from '../../../core/timing';
import {Sfx} from '../../../core/audio';
import {T} from '../copy';
import {Basket, Label} from '../parts';

const BOX_W = 236;
const OP_W = 66;
const SLOT_TOP = 640;
const SLOT_H = 400;

/** Gain/loss text chip with arrow + sign (fixed 2 decimals, which ChangeChip doesn't do). */
const Chip: React.FC<{up: boolean; text: string; size?: number}> = ({up, text, size = 36}) => {
  const tone = up ? C.value : C.loss;
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size * 0.3,
        padding: `${size * 0.2}px ${size * 0.5}px`,
        borderRadius: 999,
        background: up ? 'rgba(24,160,111,0.16)' : 'rgba(229,83,79,0.18)',
        border: `3px solid ${tone}`,
        fontFamily: SANS,
        fontWeight: 800,
        fontSize: size,
        color: C.text,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      <Triangle up={up} size={size * 0.62} color={tone} />
      {text}
    </div>
  );
};

const Term: React.FC<{label: string[]; value: string; show: number; fill: number; tone?: string}> = ({label, value, show, fill, tone}) => (
  <div
    style={{
      position: 'relative',
      width: BOX_W,
      height: 190,
      boxSizing: 'border-box',
      borderRadius: 20,
      border: `2px ${show > 0.5 ? 'solid' : 'dashed'} ${tone && fill > 0.5 ? tone : 'rgba(255,255,255,0.16)'}`,
      background: tone && fill > 0.5 ? 'rgba(229,83,79,0.14)' : 'rgba(255,255,255,0.03)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '18px 8px 20px',
    }}
  >
    <div style={{opacity: show, transform: `translateY(${(1 - show) * 14}px)`, textAlign: 'center'}}>
      {label.map((l) => (
        <div key={l} style={{fontFamily: SANS, fontWeight: 800, fontSize: 34, lineHeight: 1.1, color: C.text, letterSpacing: '-0.01em'}}>
          {l}
        </div>
      ))}
    </div>
    <div style={{position: 'relative', height: 66, width: '100%'}}>
      <div style={{position: 'absolute', inset: 0, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 52, color: C.mute, opacity: show * (1 - fill)}}>
        ?
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          textAlign: 'center',
          fontFamily: SANS,
          fontWeight: 800,
          fontSize: 54,
          color: C.text,
          letterSpacing: '-0.03em',
          fontVariantNumeric: 'tabular-nums',
          opacity: Math.min(1, fill * 2),
          transform: `scale(${0.7 + 0.3 * fill})`,
        }}
      >
        {value}
      </div>
    </div>
    {tone && (
      <div style={{position: 'absolute', right: 14, top: 14, opacity: fill}}>
        <Triangle up={false} size={26} color={tone} />
      </div>
    )}
  </div>
);

const Op: React.FC<{children: string; show: number}> = ({children, show}) => (
  <div style={{width: OP_W, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 64, color: C.dim, opacity: show}}>{children}</div>
);

const Row: React.FC<{i: number; show: number; value: number; active: boolean}> = ({i, show, value, active}) => {
  const r = T.formula.rows[i];
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '22px 0',
        borderTop: i === 2 ? `2px solid ${C.panelBorder}` : 'none',
        opacity: Math.min(1, show * 2) * (active ? 1 : 0.55),
        transform: `translateY(${(1 - show) * 20}px)`,
      }}
    >
      <div>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 40, color: C.text, letterSpacing: '-0.02em'}}>{r.label}</div>
        <Label size={22} style={{marginTop: 4}}>
          {r.sub}
        </Label>
      </div>
      <div
        style={{
          fontFamily: SANS,
          fontWeight: 800,
          fontSize: 64,
          color: C.text,
          letterSpacing: '-0.03em',
          fontVariantNumeric: 'tabular-nums',
          opacity: Math.min(1, value * 2),
          transform: `scale(${0.75 + 0.25 * value})`,
          transformOrigin: 'right center',
        }}
      >
        {r.value}
      </div>
    </div>
  );
};

export const Formula: React.FC = () => {
  const frame = useCurrentFrame();
  const f2 = useLine('formula-2').from;
  const f4 = useLine('formula-4').from;
  // The formula is read on formula-1: each term lands on its word.
  const hasil = Math.max(10, useWordAt('formula-1', 'hasil'));
  const defAt = Math.max(hasil + 12, useWordAt('formula-1', 'setelah'));
  const minusAt = Math.max(defAt + 12, useWordAt('formula-1', 'dikurangi'));
  const untungAt = Math.max(minusAt + 12, useWordAt('formula-1', 'untung'));
  // Then it fills in with today's numbers.
  const rate = Math.max(f2, useWordAt('formula-2', '3,75'));
  const after = Math.max(rate + 20, useWordAt('formula-2', 'setelah'));
  const net = Math.max(after + 12, useWordAt('formula-2', '3%'));
  const infl = Math.max(net + 20, useWordAt('formula-3', '3,28'));
  const result = Math.max(infl + 24, useWordAt('formula-3', 'minus'));
  const padahal = Math.max(f4 + 20, useWordAt('formula-4', 'padahal'));
  const turun = Math.max(padahal + 12, useWordAt('formula-4', 'turun'));

  const shell = useIn(4);
  const t1 = useIn(hasil - 4);
  const t2 = useIn(minusAt - 2);
  const t3 = useIn(untungAt - 4);
  const def = useIn(defAt);
  const fill1 = useIn(net + 6, true);
  const fill2 = useIn(infl + 8, true);
  const fill3 = useIn(result - 2, true);

  const rows = [useIn(rate - 8), useIn(after - 4), useIn(infl - 8)];
  const vals = [useIn(rate - 2, true), useIn(net - 2, true), useIn(infl - 2, true)];
  const activeRow = frame >= infl - 8 ? 2 : frame >= after - 4 ? 1 : 0;

  const workOut = interpolate(frame, [f4 - 6, f4 + 8], [1, 0], CLAMP);
  const saldo = useIn(f4 + 4, true);
  const nilai = useIn(padahal - 2, true);
  const shrink = interpolate(frame, [padahal, turun + 10], [0, 1], {...CLAMP, easing: Easing.inOut(Easing.cubic)});
  const caveat = useIn(f2 + 10);

  return (
    <AbsoluteFill>
      {/* The three terms of the formula appear on their words. */}
      <Sfx name="b-tap" at={hasil - 2} volume={0.28} />
      <Sfx name="b-tap" at={minusAt - 1} volume={0.28} />
      <Sfx name="b-tap" at={untungAt - 3} volume={0.26} />
      {/* Workings: each row's value lands with a soft tap; the two numbers that travel up into the card get one
          data step each (speech-band heavy, so at the bottom of the range). */}
      <Sfx name="b-tap" at={rate - 2} volume={0.26} />
      <Sfx name="b-tap" at={net - 2} volume={0.26} />
      <Sfx name="c-chatter-1" at={net + 6} volume={0.15} />
      <Sfx name="b-tap" at={infl - 2} volume={0.26} />
      <Sfx name="c-chatter-3" at={infl + 8} volume={0.15} />
      {/* The reveal, the one impact of the video: a haptic build (tops out ~44 f in) into a sub thump as the red
          -0,28% term lands, 3 frames ahead of "minus" so the thump's first cycle doesn't sit on the syllable.
          The score drops out just before it, so the thump and the voice land alone. */}
      <Sfx name="b-build" at={result - 2 - 45} volume={0.25} />
      <Sfx name="b-hit" at={result - 3} volume={0.45} />
      {/* formula-4: the balance grows, the real value panel arrives and its basket shrinks onto "turun". The rise
          starts 10 f early so its peak (frames 6-7) sits in the tail of "0,28%." and has decayed ~25 dB by the
          "Sal" onset: on the syllable it set the video's true peak and capped the loudness (QA round 1). */}
      <Sfx name="b-rise" at={f4 - 10} volume={0.24} />
      <Sfx name="b-tap" at={padahal - 2} volume={0.26} />
      <Sfx name="b-dip" at={turun + 2} volume={0.28} />
      <div style={{position: 'absolute', left: 90, top: 200}}>
        <Kicker>{T.formula.kicker}</Kicker>
      </div>

      <Panel
        style={{
          position: 'absolute',
          left: 90,
          right: 90,
          top: 268,
          padding: '28px 30px',
          display: 'flex',
          alignItems: 'center',
          opacity: shell,
          transform: `translateY(${(1 - shell) * 20}px)`,
        }}
      >
        <Term label={T.formula.terms[0]} value={T.formula.net} show={t1} fill={fill1} />
        <Op show={t2}>−</Op>
        <Term label={T.formula.terms[1]} value={T.formula.infl} show={t2} fill={fill2} />
        <Op show={t3}>=</Op>
        <Term label={T.formula.terms[2]} value={T.formula.resultText} show={t3} fill={fill3} tone={C.loss} />
      </Panel>

      <div style={{position: 'absolute', left: 90, right: 90, top: 540, opacity: def, fontFamily: SANS, fontWeight: 600, fontSize: 32, color: C.dim}}>
        {T.formula.def}
      </div>

      {/* Workings: today's deposito, after tax, vs inflation */}
      {workOut > 0 && (
        <Panel style={{position: 'absolute', left: 90, right: 90, top: SLOT_TOP, padding: '6px 36px', opacity: workOut * Math.min(1, rows[0] * 3)}}>
          {[0, 1, 2].map((i) => (
            <Row key={i} i={i} show={rows[i]} value={vals[i]} active={activeRow === i} />
          ))}
        </Panel>
      )}

      {/* formula-4: the balance goes up, the real value goes down */}
      <div style={{position: 'absolute', left: 90, right: 90, top: SLOT_TOP, height: SLOT_H, display: 'flex', gap: 30}}>
        <Panel
          style={{
            flex: 1,
            padding: '28px 30px',
            opacity: Math.min(1, saldo * 2),
            transform: `scale(${0.9 + 0.1 * saldo})`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Label size={22}>{T.formula.saldo.label}</Label>
          <svg width={200} height={170} viewBox="0 0 200 170" style={{alignSelf: 'center'}}>
            {[0, 1, 2, 3].map((i) => {
              const h = 50 + i * 28;
              return <rect key={i} x={10 + i * 48} y={160 - h * Math.min(1, saldo)} width={34} height={h * Math.min(1, saldo)} rx={6} fill={C.value} opacity={0.5 + i * 0.16} />;
            })}
          </svg>
          <div>
            <Chip up text={T.formula.saldo.value} />
            <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 30, color: C.dim, marginTop: 10}}>{T.formula.saldo.text}</div>
          </div>
        </Panel>
        <Panel
          style={{
            flex: 1,
            padding: '28px 30px',
            opacity: Math.min(1, nilai * 2),
            transform: `scale(${0.9 + 0.1 * nilai})`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Label size={22}>{T.formula.nilai.label}</Label>
          <div style={{height: 170, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Basket width={210 - 50 * shrink} tint={shrink} />
          </div>
          <div>
            <Chip up={false} text={T.formula.nilai.value} />
            <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 30, color: C.dim, marginTop: 10}}>{T.formula.nilai.text}</div>
          </div>
        </Panel>
      </div>

      <div style={{position: 'absolute', left: 90, right: 90, top: 1080, fontFamily: MONO, fontWeight: 500, fontSize: 23, lineHeight: 1.5, color: C.dim, opacity: caveat}}>
        {T.formula.caveat}
      </div>
    </AbsoluteFill>
  );
};
