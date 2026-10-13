import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {Sfx} from '../../../core/audio';
import {CLAMP, Kicker, Panel, useIn} from '../../../core/components/ui';
import {fmt} from '../../../core/format';
import {C, MONO, SANS} from '../../../core/theme';
import {useLine, useWordAt} from '../../../core/timing';
import {T} from '../copy';
import {DCA, MONTHS} from '../data';

const YEARS = Array.from({length: 17}, (_, i) => 2010 + i);
const CELL = 34;
const GAP = 8;
const LABEL_W = 110;
const GRID_W = LABEL_W + 12 * (CELL + GAP) - GAP;
const CHIPS_W = 1080 - 2 * 90;
const CHIP_GAP = 24;
const CHIP_W = (CHIPS_W - CHIP_GAP) / 2;

/** Every monthly buy as a cell, filling like a contribution graph. */
export const Rules: React.FC = () => {
  const frame = useCurrentFrame();
  // The grid fills while the rules are read and completes as the total is spoken.
  const FILL_FROM = useLine('rules-1').from + 20;
  const FILL_TO = Math.max(FILL_FROM + 60, useWordAt('rules-2', 'Rp'));
  const filled = interpolate(frame, [FILL_FROM, FILL_TO], [0, MONTHS.length], {
    ...CLAMP,
    easing: Easing.inOut(Easing.quad),
  });
  const count = Math.floor(filled);
  // Rule 1 is up from the start (the hook just said it); rule 2 arrives on "Satu lagi, nggak pernah jual",
  // and the first card makes room for it.
  const second = useLine('rules-2').from;
  const chip0 = useIn(8, true);
  const split = useIn(second - 8);
  const chip1 = useIn(second + 2, true);
  const total = useIn(FILL_FROM - 6);
  // When the last month lands, the newest cells' glow settles and the total gives one small bump.
  const settle = interpolate(frame, [FILL_TO, FILL_TO + 14], [1, 0], CLAMP);
  const bump = interpolate(frame, [FILL_TO, FILL_TO + 5, FILL_TO + 18], [1, 1.07, 1], {...CLAMP, easing: Easing.out(Easing.quad)});

  return (
    <AbsoluteFill>
      <Sfx name="b-tap" at={8} volume={0.35} />
      <Sfx name="b-tap" at={second + 2} volume={0.35} />
      {/* Data chatter on 8 steps of the fill (sparse: ~1 per second). The four bursts rotate in an order that never
          repeats back to back, and the level wobbles a little, so it reads as live data, not a machine gun.
          They run under rules-1/rules-2 and are ~30-40% speech band, so they stay at the bottom of the range. */}
      {Array.from({length: 8}, (_, k) => (
        <Sfx
          key={k}
          name={(['c-chatter-1', 'c-chatter-3', 'c-chatter-2', 'c-chatter-4'] as const)[k % 4]}
          at={FILL_FROM + ((FILL_TO - FILL_FROM) * k) / 8 - 1}
          volume={[0.16, 0.14, 0.17, 0.15][k % 4]}
        />
      ))}
      {/* The total locks in on the stressed "Rp 1,01 miliar". c-lock peaks ~2 frames in and is mostly below
          500 Hz, so it starts 2 frames early and can sit at its normal level on the word. */}
      <Sfx name="c-lock" at={FILL_TO - 2} volume={0.32} />
      <div style={{position: 'absolute', left: 90, top: 200}}>
        <Kicker>{T.rules.kicker}</Kicker>
      </div>

      <div style={{position: 'absolute', left: 90, right: 90, top: 270}}>
        {T.rules.chips.map((chip, i) => {
          const p = i === 0 ? chip0 : chip1;
          return (
            <Panel
              key={chip.big}
              style={{
                position: 'absolute',
                top: 0,
                [i === 0 ? 'left' : 'right']: 0,
                width: i === 0 ? CHIPS_W - (CHIP_W + CHIP_GAP) * split : CHIP_W,
                boxSizing: 'border-box',
                padding: '24px 30px',
                transform: `scale(${0.8 + p * 0.2})`,
                transformOrigin: i === 0 ? 'left center' : 'right center',
                opacity: Math.min(1, p * 2),
              }}
            >
              <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 46, color: i === 0 ? C.gold : C.text, letterSpacing: '-0.02em'}}>
                {chip.big}
              </div>
              <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 26, color: C.dim, marginTop: 6}}>{chip.small}</div>
            </Panel>
          );
        })}
      </div>

      <div style={{position: 'absolute', top: 500, left: (1080 - GRID_W) / 2, width: GRID_W}}>
        <div style={{display: 'flex', marginLeft: LABEL_W, gap: GAP, marginBottom: 12}}>
          {'JFMAMJJASOND'.split('').map((m, i) => (
            <div key={i} style={{width: CELL, textAlign: 'center', fontFamily: MONO, fontSize: 22, color: C.mute}}>
              {m}
            </div>
          ))}
        </div>
        {YEARS.map((y, r) => (
          <div key={y} style={{display: 'flex', alignItems: 'center', height: CELL + GAP}}>
            <div style={{width: LABEL_W, fontFamily: MONO, fontWeight: 500, fontSize: 24, color: C.dim}}>{y}</div>
            <div style={{display: 'flex', gap: GAP}}>
              {Array.from({length: 12}, (_, c) => {
                const k = r * 12 + c;
                const exists = k < MONTHS.length;
                const on = exists && k < count;
                // The newest buys glow and stand proud, fading over the last 6 cells.
                const glow = on ? Math.max(0, 1 - (filled - k - 1) / 6) * settle : 0;
                return (
                  <div
                    key={c}
                    style={{
                      width: CELL,
                      height: CELL,
                      borderRadius: 8,
                      background: on ? C.invested : 'transparent',
                      border: `2px ${exists ? 'solid' : 'dashed'} ${on ? C.invested : 'rgba(255,255,255,0.13)'}`,
                      boxShadow: glow > 0.02 ? `0 0 ${Math.round(22 * glow)}px ${C.invested}` : 'none',
                      transform: `scale(${1 + 0.12 * glow})`,
                    }}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={{position: 'absolute', top: 1268, width: '100%', textAlign: 'center', opacity: total}}>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 76, color: C.gold, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', transform: `scale(${bump})`}}>
          {fmt.rp(count * DCA.monthly)}
        </div>
        <div style={{fontFamily: MONO, fontWeight: 500, fontSize: 26, color: C.dim, letterSpacing: '0.12em', marginTop: 2}}>
          {T.rules.total(count)}
        </div>
      </div>
    </AbsoluteFill>
  );
};
