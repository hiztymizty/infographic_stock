import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {CLAMP, Kicker, Reveal, useIn} from '../../../core/components/ui';
import {C, MONO, SANS} from '../../../core/theme';
import {useLine} from '../../../core/timing';
import {Sfx} from '../../../core/audio';
import {T} from '../copy';
import {MoneyStack} from '../parts';
import {CoverA} from '../Cover';

/**
 * Frame 0 is the cover the platforms use as the thumbnail: cover A ("Uangmu dimakan inflasi?", user pick 14 Okt),
 * fully composed. It crossfades into the hook over COVER_FADE (done before the first word at ~frame 10).
 * The hook underneath is pre-rolled as before (reveals settled, wardrobe open), so it is in place when it shows.
 */
const PRE_ROLLED = -30;
const COVER_FADE: [number, number] = [2, 12];

const BODY = {x: 270, y: 770, w: 540, h: 500};
const WOOD = 'linear-gradient(160deg, #6B4A38 0%, #4F3628 55%, #3B281E 100%)';

const Door: React.FC<{side: 'left' | 'right'; angle: number}> = ({side, angle}) => (
  <div
    style={{
      position: 'absolute',
      top: BODY.y + 14,
      [side]: side === 'left' ? BODY.x + 14 : 1080 - (BODY.x + BODY.w - 14),
      width: (BODY.w - 28) / 2,
      height: BODY.h - 28,
      borderRadius: 10,
      background: 'linear-gradient(90deg, #5A3E2F, #46301F)',
      border: '3px solid rgba(255,255,255,0.08)',
      transformOrigin: side === 'left' ? 'left center' : 'right center',
      transform: `rotateY(${side === 'left' ? -angle : angle}deg)`,
      boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
    }}
  >
    <div style={{position: 'absolute', inset: 22, borderRadius: 8, border: '3px solid rgba(0,0,0,0.25)'}} />
  </div>
);

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const ask = useLine('hook-2');
  const q = useIn(ask.from, true);
  // The only motion before the question: the headline block settles and the doors finish swinging open.
  const rise = interpolate(frame, [0, 40], [44, 0], {...CLAMP, easing: Easing.out(Easing.cubic)});
  const door = interpolate(frame, [0, 45], [100, 114], {...CLAMP, easing: Easing.out(Easing.cubic)});
  // A slow light from inside the wardrobe, rising once.
  const glow = interpolate(frame, [0, 60], [0.55, 1], {...CLAMP, easing: Easing.inOut(Easing.cubic)});

  const shelfY = BODY.h - 150;
  // Cover → hook: one soft crossfade, the cover drifting up a little as it goes (no zoom).
  const hookIn = interpolate(frame, COVER_FADE, [0, 1], {...CLAMP, easing: Easing.inOut(Easing.cubic)});

  return (
    <AbsoluteFill>
      {hookIn < 1 && (
        <AbsoluteFill style={{opacity: 1 - hookIn, transform: `translateY(${-24 * hookIn}px)`}}>
          <CoverA />
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{opacity: hookIn}}>
        {/* The headline settles and the doors finish opening: one soft rise from frame 0 (peaks ~7 f in, under
          "Rp 10 juta"; it's ~10% speech band, so it keeps its level). The question pill gets one tap a frame
          ahead of its spring (b-tap peaks on its first frame). */}
        <Sfx name="b-rise" at={0} volume={0.28} />
        <Sfx name="b-tap" at={ask.from - 1} volume={0.36} />
        <div style={{position: 'absolute', left: 90, top: 230, right: 90, transform: `translateY(${rise}px)`}}>
          <Kicker delay={PRE_ROLLED}>{T.hook.kicker}</Kicker>
          <div style={{height: 26}} />
          <Reveal
            delay={PRE_ROLLED}
            style={{fontFamily: SANS, fontWeight: 800, fontSize: 150, color: C.gold, letterSpacing: '-0.04em', lineHeight: 1.02}}
          >
            {T.hook.amount}
          </Reveal>
          {T.hook.lines.map((line) => (
            <Reveal
              key={line}
              delay={PRE_ROLLED}
              style={{fontFamily: SANS, fontWeight: 800, fontSize: 112, color: C.text, letterSpacing: '-0.035em', lineHeight: 1.04}}
            >
              {line}
            </Reveal>
          ))}
        </div>

        {/* The wardrobe */}
        <div style={{position: 'absolute', inset: 0, perspective: 1600, perspectiveOrigin: '540px 1000px'}}>
          <div
            style={{
              position: 'absolute',
              left: BODY.x,
              top: BODY.y,
              width: BODY.w,
              height: BODY.h,
              borderRadius: 18,
              background: WOOD,
              boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 14,
                borderRadius: 10,
                background: '#120E12',
                boxShadow: 'inset 0 20px 40px rgba(0,0,0,0.8)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '45%',
                  width: 520,
                  height: 420,
                  transform: 'translate(-50%, -50%)',
                  background: 'radial-gradient(closest-side, rgba(242,179,61,0.22), transparent)',
                  opacity: glow,
                }}
              />
              {/* shelf */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: shelfY,
                  height: 18,
                  background: '#5A3E2F',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
                }}
              />
              <MoneyStack width={300} layers={7} layerH={34} style={{position: 'absolute', left: 95, top: shelfY - (7 * 38 - 4)}} />
              {/* year tag hanging off the stack */}
              <div
                style={{
                  position: 'absolute',
                  left: 340,
                  top: shelfY - 300,
                  padding: '6px 14px',
                  borderRadius: 8,
                  background: '#F1E8D4',
                  color: '#2A1E16',
                  fontFamily: MONO,
                  fontWeight: 700,
                  fontSize: 30,
                  letterSpacing: '0.08em',
                  transform: 'rotate(8deg)',
                  boxShadow: '0 6px 14px rgba(0,0,0,0.4)',
                }}
              >
                {T.hook.yearTag}
              </div>
              {/* label on the shelf edge */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: shelfY + 40,
                  textAlign: 'center',
                  fontFamily: MONO,
                  fontWeight: 700,
                  fontSize: 30,
                  letterSpacing: '0.1em',
                  color: C.dim,
                }}
              >
                {T.hook.stackTag}
              </div>
            </div>
          </div>
          <Door side="left" angle={door} />
          <Door side="right" angle={door} />
        </div>

        <div
          style={{
            position: 'absolute',
            top: 1306,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            transform: `scale(${q})`,
            opacity: Math.min(1, q * 2),
          }}
        >
          <div
            style={{
              padding: '18px 40px',
              borderRadius: 999,
              background: C.text,
              color: C.bg,
              fontFamily: SANS,
              fontWeight: 800,
              fontSize: 50,
              letterSpacing: '-0.01em',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            }}
          >
            {T.hook.question}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
