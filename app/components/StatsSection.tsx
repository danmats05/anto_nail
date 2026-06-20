'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface Stat {
  value: number
  suffix: string
  label: string
  prefix?: string
}

const stats: Stat[] = [
  { value: 500, suffix: '+', label: 'Clientes satisfaites', prefix: '' },
  { value: 98, suffix: '%', label: 'Taux de satisfaction', prefix: '' },
  { value: 5, suffix: ' ans', label: "D'expérience", prefix: '' },
  { value: 30, suffix: '+', label: 'Techniques maîtrisées', prefix: '' },
]

function StatItem({ stat, index }: { stat: Stat; index: number }) {
  const numberRef = useRef<HTMLSpanElement>(null)
  const itemRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = numberRef.current
    if (!el) return

    const obj = { val: 0 }

    const trigger = ScrollTrigger.create({
      trigger: itemRef.current,
      start: 'top 75%',
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: stat.value,
          duration: 2.2,
          ease: 'power2.out',
          delay: index * 0.15,
          onUpdate: () => {
            if (el) {
              el.textContent = Math.round(obj.val).toString()
            }
          },
        })

        gsap.from(itemRef.current, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          delay: index * 0.1,
        })
      },
    })

    return () => trigger.kill()
  }, [stat.value, index])

  return (
    <div
      ref={itemRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '48px 40px',
        background: 'rgba(255,255,255,0.08)',
        borderRadius: '2px',
        border: '1px solid rgba(255,255,255,0.12)',
        backdropFilter: 'blur(4px)',
        transition: 'background 0.3s ease',
        flex: '1 1 200px',
      }}
      className="stat-card"
    >
      <div
        style={{
          fontFamily: 'var(--font-cormorant)',
          fontSize: 'clamp(64px, 8vw, 120px)',
          fontWeight: 300,
          lineHeight: 0.9,
          color: 'var(--white)',
          letterSpacing: '-0.02em',
          display: 'flex',
          alignItems: 'baseline',
          gap: '4px',
          marginBottom: '20px',
        }}
      >
        <span ref={numberRef}>0</span>
        <span style={{ fontSize: '0.5em', fontWeight: 300 }}>{stat.suffix}</span>
      </div>
      <p
        style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '13px',
          fontWeight: 400,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.6)',
          margin: 0,
          lineHeight: 1.4,
        }}
      >
        {stat.label}
      </p>
    </div>
  )
}

export function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headingRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: headingRef.current,
          start: 'top 80%',
          once: true,
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="stats"
      style={{
        position: 'relative',
        background: 'linear-gradient(135deg, var(--lavender-dark) 0%, #7B5EA7 50%, var(--lavender) 100%)',
        padding: '100px 48px',
        overflow: 'hidden',
      }}
    >
      {/* Background texture */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(ellipse 80% 80% at 50% -20%, rgba(255,255,255,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 2 }}>

        {/* Section label */}
        <div
          ref={headingRef}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '64px',
          }}
        >
          <span style={{ width: '40px', height: '1px', background: 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
          <span
            style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '11px',
              fontWeight: 400,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.6)',
            }}
          >
            En quelques chiffres
          </span>
        </div>

        {/* Stats grid */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '2px',
          }}
        >
          {stats.map((stat, i) => (
            <StatItem key={i} stat={stat} index={i} />
          ))}
        </div>

        {/* Bottom quote */}
        <div
          style={{
            marginTop: '80px',
            paddingTop: '40px',
            borderTop: '1px solid rgba(255,255,255,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '24px',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 'clamp(20px, 3vw, 32px)',
              fontStyle: 'italic',
              fontWeight: 300,
              color: 'rgba(255,255,255,0.9)',
              margin: 0,
              maxWidth: '600px',
            }}
          >
            "Chaque cliente mérite des mains sublimes, c'est ma promesse depuis 5 ans."
          </p>
          <span
            style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '12px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.4)',
            }}
          >
            Anto
          </span>
        </div>
      </div>

      <style>{`
        .stat-card:hover { background: rgba(255,255,255,0.13) !important; }
      `}</style>
    </section>
  )
}
