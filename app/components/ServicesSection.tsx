'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { btnPrimary } from '../lib/hooks'

gsap.registerPlugin(ScrollTrigger)

const services = [
  {
    id: '01',
    name: 'Pose Gel',
    description: 'Pose complète sur ongles naturels ou capsules. Résultat brillant, tenue garantie 3 à 4 semaines.',
    price: 'À partir de 60€',
    duration: '1h30',
  },
  {
    id: '02',
    name: 'Nail Art',
    description: 'Motifs uniques, créations sur-mesure. Du minimaliste au détaillé — votre imagination comme seule limite.',
    price: 'À partir de 80€',
    duration: '2h',
  },
  {
    id: '03',
    name: 'Baby Boomer',
    description: 'La technique signature — dégradé naturel entre rose et blanc, effect ongles naturels sublimés.',
    price: 'À partir de 75€',
    duration: '1h45',
  },
  {
    id: '04',
    name: 'Dépose & Soin',
    description: 'Dépose en douceur, soin restructurant kératine, hydratation cuticules pour des ongles en pleine santé.',
    price: 'À partir de 35€',
    duration: '45min',
  },
  {
    id: '05',
    name: 'Manucure Classique',
    description: "Mise en forme, limage, soin des cuticules et vernis semi-permanent. L'essentiel, parfaitement exécuté.",
    price: 'À partir de 45€',
    duration: '1h',
  },
]

export function ServicesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(leftRef.current, {
        x: -40,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 65%',
          once: true,
        },
      })

      gsap.from(rightRef.current, {
        x: 40,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        delay: 0.15,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 65%',
          once: true,
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="prestations"
      style={{
        background: 'var(--cream)',
        padding: '120px 0',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0',
        }}
        className="services-grid"
      >
        {/* Left — sticky heading */}
        <div
          ref={leftRef}
          style={{
            padding: '0 48px 0 48px',
            position: 'sticky',
            top: '120px',
            alignSelf: 'start',
          }}
          className="services-left"
        >
          <p
            style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '11px',
              fontWeight: 400,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--lavender-dark)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '28px',
            }}
          >
            <span style={{ width: '32px', height: '1px', background: 'var(--lavender-dark)', flexShrink: 0 }} />
            Mes prestations
          </p>

          <h2
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 'clamp(36px, 4vw, 64px)',
              fontWeight: 300,
              lineHeight: 1.1,
              color: 'var(--noir)',
              margin: '0 0 32px',
            }}
          >
            Un soin,<br />
            <em style={{ fontStyle: 'italic', color: 'var(--lavender-dark)' }}>une œuvre</em>
          </h2>

          <p
            style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '15px',
              fontWeight: 300,
              lineHeight: 1.8,
              color: 'var(--grey)',
              margin: '0 0 48px',
              maxWidth: '380px',
            }}
          >
            Chaque prestation est pensée pour sublimer vos mains tout en prenant soin de vos ongles naturels.
          </p>

          {/* Visual accent */}
          <div
            style={{
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--lavender-light) 0%, var(--rose) 100%)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: '80px',
                lineHeight: 1,
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              ✦
            </span>
          </div>
        </div>

        {/* Right — services list */}
        <div
          ref={rightRef}
          style={{
            padding: '0 48px 0 0',
            display: 'flex',
            flexDirection: 'column',
          }}
          className="services-right"
        >
          {services.map((service, i) => (
            <div
              key={service.id}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
              style={{
                padding: '36px 0',
                borderBottom: '1px solid rgba(0,0,0,0.08)',
                cursor: 'pointer',
                transition: 'padding-left 0.3s ease',
                paddingLeft: activeIndex === i ? '16px' : '0',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                  gap: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-cormorant)',
                      fontSize: '13px',
                      fontStyle: 'italic',
                      color: 'var(--lavender-dark)',
                      opacity: 0.6,
                      flexShrink: 0,
                    }}
                  >
                    {service.id}
                  </span>
                  <h3
                    style={{
                      fontFamily: 'var(--font-cormorant)',
                      fontSize: 'clamp(22px, 2.5vw, 32px)',
                      fontWeight: 400,
                      color: 'var(--noir)',
                      margin: 0,
                      transition: 'color 0.3s ease',
                    }}
                  >
                    {service.name}
                  </h3>
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '18px',
                    fontWeight: 300,
                    color: activeIndex === i ? 'var(--lavender-dark)' : 'var(--noir)',
                    transition: 'transform 0.3s ease, color 0.3s ease',
                    transform: activeIndex === i ? 'translateX(4px)' : 'translateX(0)',
                    flexShrink: 0,
                  }}
                >
                  →
                </span>
              </div>

              <div
                style={{
                  overflow: 'hidden',
                  maxHeight: activeIndex === i ? '120px' : '0',
                  opacity: activeIndex === i ? 1 : 0,
                  transition: 'max-height 0.4s ease, opacity 0.3s ease',
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '14px',
                    fontWeight: 300,
                    lineHeight: 1.7,
                    color: 'var(--grey)',
                    margin: '0 0 12px',
                    maxWidth: '480px',
                  }}
                >
                  {service.description}
                </p>
                <div style={{ display: 'flex', gap: '24px' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '12px',
                      fontWeight: 500,
                      letterSpacing: '0.08em',
                      color: 'var(--lavender-dark)',
                      background: 'var(--lavender-light)',
                      padding: '4px 12px',
                      borderRadius: '100px',
                    }}
                  >
                    {service.price}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '12px',
                      fontWeight: 400,
                      color: 'var(--grey)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    ◷ {service.duration}
                  </span>
                </div>
              </div>
            </div>
          ))}

          <div style={{ paddingTop: '40px' }}>
            <a
              href="#contact"
              style={btnPrimary}
              className="services-cta"
            >
              Réserver une prestation
            </a>
          </div>
        </div>
      </div>

      <style>{`
        .services-cta:hover { background: var(--lavender-dark) !important; transform: translateY(-2px); }
        @media (max-width: 900px) {
          .services-grid { grid-template-columns: 1fr !important; }
          .services-left { position: static !important; padding: 0 24px 48px !important; }
          .services-right { padding: 0 24px !important; }
        }
      `}</style>
    </section>
  )
}
