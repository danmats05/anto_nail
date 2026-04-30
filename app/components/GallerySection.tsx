'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const galleryItems = [
  { id: 1, ratio: '3/4', bg: 'linear-gradient(135deg, #C9A8E0 0%, #9B72C8 100%)', label: 'Baby Boomer', tag: 'Gel' },
  { id: 2, ratio: '4/5', bg: 'linear-gradient(135deg, #F2C8D8 0%, #D4A853 100%)', label: 'Nude Élégant', tag: 'Nail Art' },
  { id: 3, ratio: '2/3', bg: 'linear-gradient(135deg, #1A1A1A 0%, #444 100%)', label: 'French Moderne', tag: 'Gel' },
  { id: 4, ratio: '3/4', bg: 'linear-gradient(135deg, #E8D8F5 0%, #C9A8E0 100%)', label: 'Lilas Pastel', tag: 'Nail Art' },
  { id: 5, ratio: '5/6', bg: 'linear-gradient(135deg, #D4A853 0%, #F2C8D8 100%)', label: 'Caramel Doré', tag: 'Manucure' },
  { id: 6, ratio: '3/4', bg: 'linear-gradient(135deg, #9B72C8 0%, #1A1A1A 100%)', label: 'Violet Nuit', tag: 'Nail Art' },
  { id: 7, ratio: '4/5', bg: 'linear-gradient(135deg, #FAF8F4 0%, #E8D8F5 100%)', label: 'Blanc Nacré', tag: 'Gel' },
  { id: 8, ratio: '3/5', bg: 'linear-gradient(135deg, #C9A8E0 0%, #F2C8D8 100%)', label: 'Rose Quartz', tag: 'Nail Art' },
]

export function GallerySection() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Heading entrance
      gsap.from(headingRef.current, {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: headingRef.current,
          start: 'top 80%',
          once: true,
        },
      })

      // Horizontal scroll marquee effect on desktop
      const track = trackRef.current
      if (!track) return

      // Cards stagger entrance
      const cards = track.querySelectorAll('.gallery-card')
      gsap.from(cards, {
        y: 60,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: {
          trigger: track,
          start: 'top 75%',
          once: true,
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="galerie"
      style={{
        background: 'var(--white)',
        padding: '120px 0',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        ref={headingRef}
        style={{
          padding: '0 48px',
          maxWidth: '1400px',
          margin: '0 auto 64px',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '24px',
          flexWrap: 'wrap',
        }}
      >
        <div>
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
              marginBottom: '20px',
            }}
          >
            <span style={{ width: '32px', height: '1px', background: 'var(--lavender-dark)', flexShrink: 0 }} />
            Portfolio
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 'clamp(36px, 4.5vw, 72px)',
              fontWeight: 300,
              lineHeight: 1.05,
              color: 'var(--noir)',
              margin: 0,
            }}
          >
            Chaque pose,<br />
            <em style={{ fontStyle: 'italic', color: 'var(--lavender-dark)' }}>une signature</em>
          </h2>
        </div>
        <a
          href="#contact"
          style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '13px',
            fontWeight: 400,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--noir)',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            paddingBottom: '4px',
            borderBottom: '1px solid var(--grey-light)',
            transition: 'gap 0.3s ease, border-color 0.3s ease',
          }}
          className="gallery-link"
        >
          Voir toute la galerie
          <span style={{ fontSize: '16px' }}>→</span>
        </a>
      </div>

      {/* Scrollable track */}
      <div
        ref={trackRef}
        style={{
          display: 'flex',
          gap: '16px',
          paddingLeft: '48px',
          paddingRight: '48px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
          cursor: 'grab',
          userSelect: 'none',
        }}
        className="gallery-track"
        onMouseDown={(e) => {
          const el = e.currentTarget
          el.style.cursor = 'grabbing'
          let startX = e.pageX - el.offsetLeft
          let scrollLeft = el.scrollLeft

          const onMouseMove = (ev: MouseEvent) => {
            const x = ev.pageX - el.offsetLeft
            const walk = (x - startX) * 1.5
            el.scrollLeft = scrollLeft - walk
          }
          const onMouseUp = () => {
            el.style.cursor = 'grab'
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('mouseup', onMouseUp)
          }
          window.addEventListener('mousemove', onMouseMove)
          window.addEventListener('mouseup', onMouseUp)
        }}
      >
        {galleryItems.map((item, i) => (
          <div
            key={item.id}
            className="gallery-card"
            style={{
              flexShrink: 0,
              width: i % 3 === 0 ? '280px' : i % 3 === 1 ? '220px' : '260px',
              height: '380px',
              borderRadius: '4px',
              background: item.bg,
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.4s ease',
            }}
          >
            {/* Overlay on hover */}
            <div
              className="gallery-overlay"
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(26,26,26,0)',
                transition: 'background 0.4s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '20px',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '10px',
                  fontWeight: 500,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--white)',
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(8px)',
                  padding: '4px 10px',
                  borderRadius: '100px',
                  width: 'fit-content',
                  marginBottom: '8px',
                }}
              >
                {item.tag}
              </span>
              <p
                style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontSize: '18px',
                  fontWeight: 400,
                  fontStyle: 'italic',
                  color: 'var(--white)',
                  margin: 0,
                  opacity: 0,
                  transform: 'translateY(8px)',
                  transition: 'opacity 0.3s ease, transform 0.3s ease',
                }}
                className="gallery-label"
              >
                {item.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .gallery-track::-webkit-scrollbar { display: none; }
        .gallery-card:hover { transform: scale(1.02); }
        .gallery-card:hover .gallery-overlay { background: rgba(26,26,26,0.35) !important; }
        .gallery-card:hover .gallery-label { opacity: 1 !important; transform: translateY(0) !important; }
        .gallery-link:hover { gap: 16px !important; border-color: var(--lavender-dark) !important; }
        @media (max-width: 1023px) { #galerie { display: none !important; } }
      `}</style>
    </section>
  )
}
