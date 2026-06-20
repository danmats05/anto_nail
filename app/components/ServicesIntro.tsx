'use client'

import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import { useImageShrink } from '../lib/hooks'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const SERVICES = [
  { src: '/Pose%20gel.jpeg',              label: 'Pose Gel',      subtitle: 'Dès 39 000 FCFA' },
  { src: '/Nail%20art.jpeg',              label: 'Nail Art',      subtitle: 'Dès 52 000 FCFA' },
  { src: '/Baby%20boomer.jpeg',           label: 'Baby Boomer',   subtitle: 'Dès 49 000 FCFA' },
  { src: '/depose-et-soin.jpeg', label: 'Dépose & Soin', subtitle: 'Dès 23 000 FCFA' },
  { src: '/Manicure.jpeg',                label: 'Manucure',      subtitle: 'Dès 30 000 FCFA' },
  { src: '/pink2.png',                    label: 'Semi-Permanent', subtitle: 'Dès 33 000 FCFA' },
]

const THUMB_TOP = 40
const THUMB_H  = 148
const WHEEL_W  = 700
const WHEEL_H  = 700
const CROP     = 0.62
const ITEM_W   = 300
const ITEM_H   = 420
const RADIUS   = 460
const TURNS    = 1

function shortAngle(a: number, b: number) {
  const full = Math.PI * 2
  let d = ((a - b) % full + full) % full
  if (d > Math.PI) d -= full
  return Math.abs(d)
}

// ─── Mobile swipe carousel ───────────────────────────────────────────────────
function MobileSwipeServices() {
  const [activeIdx, setActiveIdx] = useState(0)
  const stripRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const strip = stripRef.current
    if (!strip) return

    const onScroll = () => {
      const stride = strip.clientWidth * 0.8 + 12
      const idx = Math.round(strip.scrollLeft / stride)
      setActiveIdx(Math.min(Math.max(0, idx), SERVICES.length - 1))
    }

    strip.addEventListener('scroll', onScroll, { passive: true })
    return () => strip.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section style={{ background: 'var(--cream)', padding: '80px 0 60px', overflow: 'hidden' }}>
      {/* Heading */}
      <div style={{ textAlign: 'center', marginBottom: '40px', padding: '0 24px' }}>
        <p style={{
          fontFamily: 'var(--font-dm-sans)', fontSize: '11px', fontWeight: 700,
          letterSpacing: '0.28em', textTransform: 'uppercase',
          color: 'var(--grey)', margin: '0 0 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
        }}>
          <span style={{ width: '28px', height: '1px', background: 'var(--grey-light)', flexShrink: 0 }} />
          Mes prestations
          <span style={{ width: '28px', height: '1px', background: 'var(--grey-light)', flexShrink: 0 }} />
        </p>
        <h2 style={{
          fontFamily: 'var(--font-dm-sans)', fontSize: 'clamp(26px, 7.5vw, 42px)',
          fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.035em',
          color: 'var(--noir)', margin: 0,
        }}>
          Parce que vos mains<br />méritent le meilleur
        </h2>
      </div>

      {/* Swipe strip */}
      <div
        ref={stripRef}
        id="svc-strip"
        className="svc-strip"
        style={{
          display: 'flex',
          overflowX: 'scroll',
          scrollSnapType: 'x mandatory',
          gap: '12px',
          padding: '0 10vw',
          WebkitOverflowScrolling: 'touch',
        } as React.CSSProperties}
      >
        {SERVICES.map((svc, i) => (
          <div
            key={i}
            style={{
              flex: '0 0 80vw',
              height: '110vw',
              scrollSnapAlign: 'center',
              overflow: 'hidden',
              position: 'relative',
              flexShrink: 0,
            }}
          >
            <div style={{
              backgroundImage: `url(${svc.src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              width: '100%',
              height: '100%',
              filter: 'brightness(0.88) saturate(1.15)',
            }} />
            {/* Label overlay */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 60%)',
              padding: '48px 20px 20px',
            }}>
              <p style={{
                fontFamily: 'var(--font-dm-sans)', fontSize: '10px', fontWeight: 700,
                letterSpacing: '0.22em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.65)', margin: '0 0 4px',
              }}>
                {svc.subtitle}
              </p>
              <p style={{
                fontFamily: 'var(--font-dm-sans)', fontSize: '22px',
                fontWeight: 700, letterSpacing: '-0.02em',
                color: 'var(--white)', margin: 0, lineHeight: 1.2,
              }}>
                {svc.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '20px' }}>
        {SERVICES.map((_, i) => (
          <div key={i} style={{
            width: i === activeIdx ? '20px' : '6px',
            height: '6px',
            background: i === activeIdx ? 'var(--noir)' : 'rgba(0,0,0,0.2)',
            transition: 'width 0.3s ease, background 0.3s ease',
          }} />
        ))}
      </div>

      <style>{`
        .svc-strip { scrollbar-width: none; }
        .svc-strip::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────
export function ServicesIntro() {
  const outerRef          = useRef<HTMLDivElement>(null)
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const overlayRef        = useRef<HTMLDivElement>(null)
  const whiteBgRef        = useRef<HTMLDivElement>(null)
  const contentRef        = useRef<HTMLDivElement>(null)
  const wheelRef          = useRef<HTMLDivElement>(null)
  const wheelAreaRef      = useRef<HTMLDivElement>(null)
  const captionRef        = useRef<HTMLDivElement>(null)
  const darkOverlayRef    = useRef<HTMLDivElement>(null)
  const [activeIdx, setActiveIdx] = useState(0)

  useImageShrink({ outerRef, imageContainerRef, overlayRef, whiteBgRef, contentRef, triggerEnd: '38% top' })

  useEffect(() => {
    const outer = outerRef.current
    const wheel = wheelRef.current
    if (!outer || !wheel) return

    const vw     = window.innerWidth
    const mobile = vw < 1024
    if (mobile) return  // mobile/tablet uses swipe carousel instead

    const iw = ITEM_W
    const ih = ITEM_H
    const r  = RADIUS
    wheel.style.width  = `${WHEEL_W}px`
    wheel.style.height = `${WHEEL_H}px`
    wheel.style.bottom = `-${Math.round(WHEEL_H * CROP)}px`

    const cards = Array.from(wheel.querySelectorAll<HTMLElement>('.svc-card'))
    if (!cards.length) return

    gsap.set(cards, { width: iw, height: ih })

    let prev = -1

    const applyState = (p: number) => {
      const rot = -p * TURNS * Math.PI * 2
      let minD = Infinity
      let focused = 0

      cards.forEach((card, i) => {
        const theta = (i / cards.length) * Math.PI * 2 - Math.PI / 2 + rot
        const x = Math.cos(theta) * r
        const y = Math.sin(theta) * r
        const dist = shortAngle(theta, -Math.PI / 2)
        const t = Math.min(dist / (Math.PI * 0.34), 1)

        gsap.set(card, {
          x, y,
          xPercent: -50,
          yPercent: -50,
          scale: 1 - t * 0.06,
          filter: `blur(${t * 4}px)`,
          zIndex: Math.round((1 - t) * 100),
        })

        if (dist < minD) { minD = dist; focused = i }
      })

      if (focused !== prev) { prev = focused; setActiveIdx(focused) }
    }

    const ctx = gsap.context(() => {
      applyState(0)

      // Wheel + caption appear automatically once the title is fully visible (~38% of outer div)
      // 45% gives a safe margin for scrub=1 settling time before the wheel pops in
      ScrollTrigger.create({
        trigger: outer,
        start: '45% top',
        once: true,
        onEnter: () => {
          gsap.to([wheelAreaRef.current, captionRef.current], {
            opacity: 1,
            duration: 0.55,
            ease: 'power2.out',
          })
        },
      })

      // Rotation: scrub:true = direct 1:1 mapping, no lag.
      // 46% → 72% of 800vh = 368→576vh = 208vh for 6 cards (≈34vh/card)
      // #avis (marginTop:-100vh) enters viewport at 800-200=600vh = 75% → 24vh buffer after rotation ✓
      ScrollTrigger.create({
        trigger: outer,
        start: '46% top',
        end: '72% top',
        scrub: true,
        onUpdate: (self) => applyState(self.progress),
      })

      // Dark overlay fades in when rotation ends (72%) and completes when #avis reaches viewport top
      gsap.set(darkOverlayRef.current, { opacity: 0 })
      gsap.to(darkOverlayRef.current, {
        opacity: 0.72,
        ease: 'none',
        scrollTrigger: {
          trigger: outer,
          start: '72% top',
          endTrigger: '#avis',
          end: 'top top',
          scrub: 1.5,
        },
      })
    })

    return () => ctx.revert()
  }, [])

  return (
    <div id="prestations">
      {/* Mobile swipe carousel */}
      <div className="svc-mobile-wrap">
        <MobileSwipeServices />
      </div>

      {/* Desktop wheel */}
      <div ref={outerRef} className="svc-desktop-wrap" style={{ height: '800vh', position: 'relative' }}>
        <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>

          {/* Layer 1 — cream bg + grid (starts hidden, GSAP fades it in) */}
          <div
            ref={whiteBgRef}
            style={{ position: 'absolute', inset: 0, zIndex: 1, backgroundColor: 'var(--cream)', opacity: 0 }}
          >
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.07) 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }} />
          </div>

          {/* Dark overlay — fades in as testimonials slide over */}
          <div
            ref={darkOverlayRef}
            style={{ position: 'absolute', inset: 0, background: '#000', zIndex: 300, pointerEvents: 'none', opacity: 0 }}
          />

          {/* Layer 2 — full-screen image → thumbnail */}
          <div
            ref={imageContainerRef}
            style={{ position: 'absolute', top: 0, left: 0, zIndex: 2, overflow: 'hidden', borderRadius: 0 }}
          >
            <Image
              src="/pink1.png"
              alt="Prestations Anto Nail"
              fill
              style={{ objectFit: 'cover', objectPosition: 'center' }}
              priority
            />
          </div>

          {/* Layer 3 — overlay heading (fades out) */}
          <div
            ref={overlayRef}
            style={{
              position: 'absolute', inset: 0, zIndex: 3,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              paddingBottom: '50vh',
              background: 'linear-gradient(to bottom, rgba(10,6,6,0.25) 0%, rgba(10,6,6,0.45) 50%, rgba(10,6,6,0.20) 100%)',
            }}
          >
            <p style={{
              fontFamily: 'var(--font-dm-sans)', fontSize: '11px', fontWeight: 700,
              letterSpacing: '0.28em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.60)', margin: '0 0 20px',
              display: 'flex', alignItems: 'center', gap: '12px',
            }}>
              <span style={{ width: '28px', height: '1px', background: 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
              Mes prestations
              <span style={{ width: '28px', height: '1px', background: 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
            </p>
            <h2 style={{
              fontFamily: 'var(--font-dm-sans)', fontSize: 'clamp(44px, 7vw, 116px)',
              fontWeight: 700, lineHeight: 0.95, letterSpacing: '-0.035em',
              textTransform: 'uppercase', color: 'var(--white)', margin: 0, textAlign: 'center',
              maxWidth: 'calc(100vw - 40px)',
            }}>
              L&apos;art<br />de vos mains
            </h2>
          </div>

          {/* Layer 4 — revealed content: heading + wheel + caption (starts hidden, GSAP reveals) */}
          <div
            ref={contentRef}
            style={{
              position: 'absolute', inset: 0, zIndex: 4,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'flex-start',
              paddingTop: `${THUMB_TOP + THUMB_H + 28}px`,
              opacity: 0,
            }}
          >
            <h2 style={{
              fontFamily: 'var(--font-dm-sans)', fontSize: 'clamp(28px, 4.8vw, 68px)',
              fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.035em',
              color: 'var(--noir)', margin: 0, textAlign: 'center', flexShrink: 0,
              position: 'relative', zIndex: 200,
              maxWidth: 'calc(100vw - 40px)',
            }}>
              Parce que vos mains<br />méritent le meilleur
            </h2>

            {/* Wheel area */}
            <div ref={wheelAreaRef} style={{ position: 'relative', width: '100%', flex: 1, marginTop: '24px', opacity: 0 }}>
              <div
                ref={wheelRef}
                style={{
                  position: 'absolute',
                  left: '50%', transform: 'translateX(-50%)',
                  width: WHEEL_W, height: WHEEL_H,
                  bottom: -(WHEEL_H * CROP),
                }}
              >
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  {SERVICES.map((svc, i) => (
                    <div
                      key={i}
                      className="svc-card"
                      style={{
                        position: 'absolute', left: '50%', top: '50%',
                        width: ITEM_W, height: ITEM_H,
                        overflow: 'hidden',
                      }}
                    >
                      <div style={{
                        backgroundImage: `url(${svc.src})`,
                        backgroundSize: 'cover', backgroundPosition: 'center',
                        width: '100%', height: '100%',
                        filter: 'brightness(0.92) saturate(1.15)',
                      }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Active service caption */}
            <div ref={captionRef} style={{
              position: 'absolute', bottom: '5vh', left: 0, right: 0,
              textAlign: 'center', pointerEvents: 'none', zIndex: 10, opacity: 0,
            }}>
              <p style={{
                fontFamily: 'var(--font-dm-sans)', fontSize: '11px', fontWeight: 700,
                letterSpacing: '0.28em', textTransform: 'uppercase',
                color: 'var(--grey)', margin: '0 0 8px',
              }}>
                {SERVICES[activeIdx].subtitle}
              </p>
              <p style={{
                fontFamily: 'var(--font-dm-sans)', fontSize: 'clamp(1.4rem, 2.6vw, 2.2rem)',
                fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--noir)', margin: 0,
              }}>
                {SERVICES[activeIdx].label}
              </p>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        .svc-mobile-wrap { display: none; }
        @media (max-width: 1023px) {
          .svc-mobile-wrap { display: block; }
          .svc-desktop-wrap { display: none !important; }
        }
      `}</style>
    </div>
  )
}
