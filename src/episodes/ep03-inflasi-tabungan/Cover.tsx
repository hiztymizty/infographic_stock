// Thumbnail options for ep03 (a still composition, `ep03-inflasi-tabungan-cover`, prop `variant`).
// Key message sits in the y 440–1330 band so it survives the ~3:4 centre crop of phone grids.
// Every number comes from data/inflasi.json via data.ts and core/format.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Watermark} from '../../core/brand/Watermark';
import {Background} from '../../core/components/Background';
import {ChangeChip, Panel, Triangle} from '../../core/components/ui';
import {fmt} from '../../core/format';
import {C, MONO, SANS} from '../../core/theme';
import {D, INF, P0, SNAP, SUM} from './data';
import {Basket, MoneyStack} from './parts';

export type CoverVariant = 'a' | 'b' | 'c';

const startYear = D.start.slice(0, 4);
const endYear = D.end.slice(0, 4);
const head: React.CSSProperties = {fontFamily: SANS, fontWeight: 800, color: C.text, letterSpacing: '-0.045em', lineHeight: 1.0};

/**
 * A · "Uangmu dimakan inflasi?" with the half-ghosted stack and the −47,5% chip. Picked by the user (14 Okt):
 * it is also frame 0 of the video (Hook.tsx renders it as a layer that crossfades into the hook).
 */
export const CoverA: React.FC = () => (
  <>
    <div style={{position: 'absolute', left: 90, top: 430}}>
      {['Uangmu', 'dimakan', 'inflasi?'].map((l) => (
        <div key={l} style={{...head, fontSize: 150}}>
          {l}
        </div>
      ))}
    </div>
    <div style={{position: 'absolute', left: 80, top: 960}}>
      <MoneyStack width={320} layers={7} layerH={42} keep={INF.realValueOf10jt / P0} />
    </div>
    <div style={{position: 'absolute', left: 480, right: 110, top: 950}}>
      <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 56, color: C.mute, textDecoration: 'line-through', textDecorationThickness: 5}}>
        {fmt.words(P0)}
      </div>
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 92, color: C.gold, letterSpacing: '-0.04em', lineHeight: 1.05, marginTop: 6, whiteSpace: 'nowrap'}}>
        {fmt.juta(INF.realValueOf10jt, 1)}
      </div>
      <div style={{marginTop: 26}}>
        <ChangeChip x={SUM.kas.realChange} size={60} />
      </div>
    </div>
  </>
);

/** B · same basket, 2010 vs 2026: Rp 10 juta → Rp 19 juta. */
const BasketCard: React.FC<{year: string; price: string; tint: number; up?: boolean}> = ({year, price, tint, up}) => (
  <Panel style={{width: 430, height: 470, boxSizing: 'border-box', padding: '30px 26px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between'}}>
    <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 44, letterSpacing: '0.1em', color: C.dim}}>{year}</div>
    <Basket width={260} tint={tint} />
    <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
      {up && <Triangle up size={40} color={C.loss} />}
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 70, color: C.gold, letterSpacing: '-0.04em', whiteSpace: 'nowrap'}}>{price}</div>
    </div>
  </Panel>
);

const CoverB: React.FC = () => (
  <>
    <div style={{position: 'absolute', left: 90, top: 440}}>
      {['Inflasi bikin', 'uangmu nyusut'].map((l) => (
        <div key={l} style={{...head, fontSize: 122}}>
          {l}
        </div>
      ))}
    </div>
    <div style={{position: 'absolute', left: 90, right: 90, top: 740, fontFamily: SANS, fontWeight: 600, fontSize: 44, color: C.dim}}>
      Belanjaan yang sama:
    </div>
    <div style={{position: 'absolute', left: 90, top: 820, display: 'flex', gap: 40}}>
      <BasketCard year={startYear} price={fmt.words(P0)} tint={0} />
      <BasketCard year={endYear} price={fmt.juta(INF.needToday, 0)} tint={1} up />
    </div>
  </>
);

/** C · the formula hook: "Deposito 3,75% tapi malah rugi?" and the red −0,28% result. */
const CoverC: React.FC = () => (
  <>
    <div style={{position: 'absolute', left: 90, top: 430}}>
      <div style={{...head, fontSize: 118, whiteSpace: 'nowrap'}}>Deposito {fmt.pct(SNAP.lpsRate, 2)}</div>
      <div style={{...head, fontSize: 118}}>tapi malah</div>
      <div style={{...head, fontSize: 118}}>rugi?</div>
    </div>
    <div
      style={{
        position: 'absolute',
        left: 90,
        right: 110,
        top: 900,
        height: 400,
        boxSizing: 'border-box',
        borderRadius: 32,
        border: `4px solid ${C.loss}`,
        background: 'rgba(229,83,79,0.14)',
        padding: '34px 44px',
      }}
    >
      <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: '0.14em', color: C.dim}}>UNTUNG BENERAN</div>
      <div style={{display: 'flex', alignItems: 'center', gap: 24, marginTop: 14}}>
        <Triangle up={false} size={80} color={C.loss} />
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 172, color: C.text, letterSpacing: '-0.05em', lineHeight: 1}}>
          {fmt.signedPct(SNAP.lpsNetMinusInflation, 2)}
        </div>
      </div>
      <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 40, color: C.dim, marginTop: 18}}>
        {fmt.pct(SNAP.lpsNet, 2)} bersih − {fmt.pct(SNAP.inflationYoy, 2)} inflasi
      </div>
    </div>
  </>
);

export const Cover: React.FC<{variant: CoverVariant}> = ({variant}) => (
  <AbsoluteFill style={{backgroundColor: C.bg}}>
    <Background />
    {variant === 'a' ? <CoverA /> : variant === 'b' ? <CoverB /> : <CoverC />}
    <Watermark />
  </AbsoluteFill>
);
