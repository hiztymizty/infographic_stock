// Illustrations shared by ep03's scenes: a stylised (not replica) stack of red 100k bundles and a
// shopping basket. Drawn in CSS/SVG, no images.
import React from 'react';
import {C, MONO} from '../../core/theme';

/**
 * Bundles of red notes seen from the front, stacked. `keep` (0–1) is the part that still has buying
 * power: the rest, from the top down, turns into a dashed ghost.
 */
export const MoneyStack: React.FC<{width: number; layers: number; layerH?: number; keep?: number; style?: React.CSSProperties}> = ({
  width,
  layers,
  layerH = 40,
  keep = 1,
  style,
}) => {
  const gap = 4;
  const h = layers * (layerH + gap) - gap;
  const solidH = h * keep;
  const offset = (i: number) => [6, -10, 4, -6, 10, -3, 7, -8, 2, -5, 9, -2][i % 12];
  const layer = (i: number, ghost: boolean) => (
    <div
      key={i}
      style={{
        position: 'absolute',
        left: offset(i),
        bottom: i * (layerH + gap),
        width,
        height: layerH,
        borderRadius: 7,
        background: ghost ? 'transparent' : 'linear-gradient(180deg, #EC6A7E 0%, #C83A55 60%, #9E2440 100%)',
        border: ghost ? '2px dashed rgba(229,83,79,0.45)' : 'none',
        boxShadow: ghost ? 'none' : '0 6px 14px rgba(0,0,0,0.35)',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {!ghost && (
        <>
          {/* paper edges */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'repeating-linear-gradient(180deg, rgba(255,255,255,0.10) 0 2px, transparent 2px 6px)',
            }}
          />
          {/* bank band */}
          <div
            style={{
              position: 'absolute',
              left: width * 0.42,
              top: 0,
              bottom: 0,
              width: width * 0.16,
              background: 'linear-gradient(90deg, #E9E2CF, #F7F2E4 50%, #DCD3BD)',
            }}
          />
        </>
      )}
    </div>
  );
  return (
    <div style={{position: 'relative', width: width + 20, height: h, ...style}}>
      {/* the ghost of everything, then the solid part clipped from the bottom up */}
      {Array.from({length: layers}, (_, i) => layer(i, true))}
      <div style={{position: 'absolute', left: -30, right: -30, bottom: -20, height: solidH + 20, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 30, bottom: 20, width: width + 20, height: h}}>
          {Array.from({length: layers}, (_, i) => layer(i, false))}
        </div>
      </div>
    </div>
  );
};

/** A woven basket with generic groceries (sack, bottle, eggs, greens). Size by width; height = 0.8 × width. */
export const Basket: React.FC<{width: number; tint?: number; style?: React.CSSProperties}> = ({width, tint = 0, style}) => {
  const stroke = C.index;
  return (
    <svg width={width} height={width * 0.8} viewBox="0 0 400 320" style={style}>
      {/* handle */}
      <path d="M95,150 C95,40 305,40 305,150" fill="none" stroke={stroke} strokeWidth={10} strokeLinecap="round" opacity={0.75} />
      {/* groceries */}
      <path d="M120,165 L130,85 Q170,70 205,88 L212,165 Z" fill="#C9B48A" opacity={0.95} />
      <path d="M140,100 Q170,90 196,102" fill="none" stroke="#9C8660" strokeWidth={5} />
      <rect x={222} y={70} width={38} height={95} rx={10} fill="#E8C14A" opacity={0.95} />
      <rect x={232} y={52} width={18} height={22} rx={4} fill="#3A7D44" />
      <ellipse cx={290} cy={140} rx={22} ry={28} fill="#F1E6D0" />
      <ellipse cx={318} cy={150} rx={20} ry={25} fill="#E9DCC2" />
      <path d="M100,160 Q92,110 118,96 Q120,130 112,160 Z" fill="#4C9A5B" />
      {/* basket body */}
      <path d="M60,150 L340,150 L310,300 L90,300 Z" fill="#2A3346" stroke={stroke} strokeWidth={8} strokeLinejoin="round" />
      {[0, 1, 2, 3].map((i) => (
        <line key={`h${i}`} x1={68 + i * 7} x2={332 - i * 7} y1={185 + i * 32} y2={185 + i * 32} stroke={stroke} strokeWidth={4} opacity={0.35} />
      ))}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const t = (i + 1) / 7;
        return <line key={`v${i}`} x1={60 + 280 * t} x2={90 + 220 * t} y1={150} y2={300} stroke={stroke} strokeWidth={4} opacity={0.35} />;
      })}
      <rect x={50} y={140} width={300} height={22} rx={8} fill="#38435A" stroke={stroke} strokeWidth={6} />
      {/* rising-price tint */}
      <path d="M60,150 L340,150 L310,300 L90,300 Z" fill={C.loss} opacity={0.22 * tint} />
    </svg>
  );
};

/** Round check mark that draws itself as p goes 0 → 1. */
export const Check: React.FC<{p: number; size: number; color: string}> = ({p, size, color}) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <circle cx={20} cy={20} r={18} fill={p > 0 ? color : 'transparent'} opacity={Math.min(1, p * 2)} />
    <circle cx={20} cy={20} r={18} fill="none" stroke={p > 0 ? color : 'rgba(255,255,255,0.25)'} strokeWidth={3} />
    <path
      d="M11,21 L17.5,27.5 L29.5,14"
      fill="none"
      stroke={C.bg}
      strokeWidth={4.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={30}
      strokeDashoffset={30 * (1 - p)}
    />
  </svg>
);

/** Small mono label used across scenes. */
export const Label: React.FC<{children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties}> = ({
  children,
  color = C.dim,
  size = 24,
  style,
}) => (
  <div style={{fontFamily: MONO, fontWeight: 700, fontSize: size, letterSpacing: '0.12em', color, ...style}}>{children}</div>
);
