'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { btnPrimary, btnSecondaryInverted } from '../lib/hooks'

gsap.registerPlugin(ScrollTrigger)

const certifications = [
  'CQP Prothésiste Ongulaire',
  'Certifiée OPI Pro',
  'Formation IBX System',
  'Nail Artist Pro, Paris',
  'Membre CNEP',
]

export function PressSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const marqueeRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Continuous marquee
      const track = marqueeRef.current
      if (track) {
        const totalWidth = track.scrollWidth / 2
        gsap.to(track, {
          x: -totalWidth,
          duration: 24,
          ease: 'none',
          repeat: -1,
        })
      }

      gsap.from(ctaRef.current, {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: ctaRef.current,
          start: 'top 75%',
          once: true,
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const items = [...certifications, ...certifications]

  return (
    <section ref={sectionRef} id="certifications">

      {/* Certifications marquee */}
      <div
        style={{
          background: 'var(--white)',
          borderTop: '1px solid rgba(0,0,0,0.06)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          padding: '24px 0',
          overflow: 'hidden',
        }}
      >
        <div
          ref={marqueeRef}
          style={{
            display: 'flex',
            gap: '0',
            whiteSpace: 'nowrap',
            willChange: 'transform',
          }}
        >
          {items.map((cert, i) => (
            <span
              key={i}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '24px',
                padding: '0 40px',
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '12px',
                fontWeight: 400,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: i % 2 === 0 ? 'var(--grey)' : 'var(--lavender-dark)',
                flexShrink: 0,
              }}
            >
              {cert}
              <span
                style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: 'var(--lavender)',
                  flexShrink: 0,
                }}
              />
            </span>
          ))}
        </div>
      </div>

      {/* Full-width CTA section */}
      <div
        ref={ctaRef}
        id="contact"
        style={{
          background: 'var(--noir)',
          padding: '120px 48px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background gradient */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(155, 114, 200, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '800px', margin: '0 auto' }}>
          <p
            style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '11px',
              fontWeight: 400,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--lavender)',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
            }}
          >
            <span style={{ width: '32px', height: '1px', background: 'var(--lavender)', flexShrink: 0 }} />
            Prendre Rendez-vous
            <span style={{ width: '32px', height: '1px', background: 'var(--lavender)', flexShrink: 0 }} />
          </p>

          <h2
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 'clamp(40px, 6vw, 88px)',
              fontWeight: 300,
              lineHeight: 1.0,
              color: 'var(--white)',
              margin: '0 0 16px',
            }}
          >
            Vos mains méritent<br />
            <em style={{ fontStyle: 'italic', color: 'var(--lavender-light)' }}>le meilleur</em>
          </h2>

          <p
            style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '15px',
              fontWeight: 300,
              color: 'rgba(255,255,255,0.5)',
              margin: '0 0 48px',
            }}
          >
            Paris • Disponibilités limitées
          </p>

          <div
            style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <a
              href="tel:+33600000000"
              style={{ ...btnPrimary, background: '#FFFFFF', color: '#1A1A1A' }}
              className="contact-btn-primary"
            >
              Appeler
            </a>
            <a
              href="https://instagram.com/antonail"
              style={btnSecondaryInverted}
              className="contact-btn-secondary"
            >
              Instagram
            </a>
          </div>

          {/* Availability indicator */}
          <div
            style={{
              marginTop: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#4ADE80',
                animation: 'pulse 2s ease-in-out infinite',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '13px',
                fontWeight: 300,
                color: 'rgba(255,255,255,0.4)',
              }}
            >
              Prochaine disponibilité : cette semaine
            </span>
          </div>
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(0.8); }
          }
          .contact-btn-primary:hover { transform: translateY(-2px); background: var(--lavender-light) !important; }
          .contact-btn-secondary:hover { border-color: var(--lavender) !important; color: var(--lavender-light) !important; }
        `}</style>
      </div>
    </section>
  )
}
