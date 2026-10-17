import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {Sfx} from '../../../core/audio';
import {C, MONO, SANS} from '../../../core/theme';
import {useTutorial} from '../../../core/tutorial/ScreenShot';
import {tutPalette} from '../../../core/tutorial/sfxPalettes';
import {useLine, useWordAt} from '../../../core/timing';
import {COPY} from '../copy';
import {FadeUp, SmallPrint, Stage, usePhase} from './Stage';

// end (full frame, matches the intro): logo; the takeaway in two lines during end-recap; then the hakabot.com pill
// (on "hakabot") and Telegram / Discord (on "Telegram") during end-cta. Disclaimer + source in the bottom margin.
// No standard outro (user decision for the tutorial).

const T = COPY.end;

/** Telegram mark: round badge with a paper plane (drawn in code). */
const TelegramIcon: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <circle cx="24" cy="24" r="24" fill="#2AABEE" />
    <path d="M11 23.4 L34.6 14.3 C35.7 13.9 36.6 14.6 36.3 16.2 L32.3 35 C32 36.3 31.2 36.6 30.1 36 L24 31.5 L21.1 34.3 C20.8 34.6 20.5 34.9 19.9 34.9 L20.3 28.7 L31.6 18.5 C32.1 18.1 31.5 17.8 30.8 18.3 L16.8 27.1 L10.8 25.2 C9.5 24.8 9.5 23.9 11 23.4 Z" fill="#fff" />
  </svg>
);

/** Discord mark: round badge with a simplified controller face (drawn in code). */
const DiscordIcon: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <circle cx="24" cy="24" r="24" fill="#5865F2" />
    <path d="M15 16.5 C17.5 15.3 19.6 14.8 21 14.6 L21.8 16.2 C23.3 16 24.7 16 26.2 16.2 L27 14.6 C28.4 14.8 30.5 15.3 33 16.5 C35.3 20 36.4 24.6 36 29.6 C33.8 31.3 31.6 32.3 29.6 32.9 L28.2 30.7 C29.3 30.3 30.3 29.8 31.2 29.2 C26.6 31.3 21.4 31.3 16.8 29.2 C17.7 29.8 18.7 30.3 19.8 30.7 L18.4 32.9 C16.4 32.3 14.2 31.3 12 29.6 C11.6 24.6 12.7 20 15 16.5 Z" fill="#fff" />
    <ellipse cx="19.6" cy="24.6" rx="2.4" ry="2.7" fill="#5865F2" />
    <ellipse cx="28.4" cy="24.6" rx="2.4" ry="2.7" fill="#5865F2" />
  </svg>
);

export const EndCard: React.FC = () => {
  const cta = useLine('end-cta');
  const urlAt = useWordAt('end-cta', 'hakabot');
  const commAt = useWordAt('end-cta', 'Telegram');
  const a = usePhase(0, cta.from - 2, false);
  const b = usePhase(cta.from + 6, 1e9);
  const {sfx, sfxPalette} = useTutorial();
  const pal = tutPalette(sfxPalette);
  return (
    <Stage>
      {/* Sound (the episode's tutorial palette): the logo cue as the card arrives (before the voice), the pill cue as hakabot.com lands. */}
      {sfx && <Sfx name={pal.logo.name} at={pal.logo.at} volume={pal.logo.volume} />}
      {sfx && <Sfx name={pal.pill.name} at={urlAt} volume={pal.pill.volume} />}
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 196}}>
        <Img src={staticFile('brand/hakabot-lockup-white.png')} style={{height: 46, opacity: 0.95}} />
      </AbsoluteFill>
      {a.o > 0 && (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: a.o}}>
          <div style={{textAlign: 'center', marginTop: -40, transform: `translateY(${(1 - a.rise) * 12}px)`}}>
            <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 92, letterSpacing: '-0.045em', color: C.text, lineHeight: 1.08}}>{T.line1}</div>
            <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 52, letterSpacing: '-0.03em', color: C.dim, marginTop: 18}}>{T.line2}</div>
          </div>
        </AbsoluteFill>
      )}
      {b.o > 0 && (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: b.o}}>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: -20}}>
            <FadeUp at={urlAt}>
              <div
                style={{
                  padding: '20px 60px 22px',
                  borderRadius: 999,
                  background: C.brand,
                  boxShadow: '0 22px 60px rgba(18,18,249,0.35)',
                  fontFamily: SANS,
                  fontWeight: 800,
                  fontSize: 76,
                  letterSpacing: '-0.03em',
                  color: '#fff',
                }}
              >
                {T.url}
              </div>
            </FadeUp>
            <FadeUp at={commAt} style={{marginTop: 70, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22}}>
              <div style={{fontFamily: MONO, fontWeight: 500, fontSize: 22, letterSpacing: '0.3em', color: C.dim}}>{T.community.toUpperCase()}</div>
              <div style={{display: 'flex', gap: 56, alignItems: 'center'}}>
                {[
                  {icon: <TelegramIcon size={46} />, label: T.telegram},
                  {icon: <DiscordIcon size={46} />, label: T.discord},
                ].map((x) => (
                  <div key={x.label} style={{display: 'flex', alignItems: 'center', gap: 16}}>
                    {x.icon}
                    <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 38, color: C.text}}>{x.label}</div>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
        </AbsoluteFill>
      )}
      <SmallPrint lines={[T.disclaimer, T.source]} />
    </Stage>
  );
};
