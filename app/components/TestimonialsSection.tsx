'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { btnPrimary } from '../lib/hooks'

gsap.registerPlugin(ScrollTrigger)

const CARD = 460

const GALLERY_IMAGES = [
  '/temoignages/1.jpeg',
  '/temoignages/2.jpeg',
  '/temoignages/3.jpeg',
  '/temoignages/4.jpeg',
  '/temoignages/5.jpeg',
  '/Pose%20gel.jpeg',
  '/temoignages/6.jpeg',
  '/Baby%20boomer.jpeg',
  '/depose-et-soin.jpeg',
  '/Manicure.jpeg',
]
const GAP  = 20

const TESTIMONIALS = [
  {
    name: 'Léa M.',
    sub: 'Cliente Anto Nail',
    initials: 'LM',
    avatarBg: '#E8D8F5',
    image: '/temoignages/1.jpeg',
    text: "Anto est une vraie artiste. J'avais des ongles abîmés depuis des années, en 3 séances elle les a complètement transformés. Le baby boomer est parfait.",
  },
  {
    name: 'Camille R.',
    sub: 'Cliente Anto Nail',
    initials: 'CR',
    avatarBg: '#F2C8D8',
    image: '/temoignages/2.jpeg',
    text: "Ambiance chaleureuse, très pro. Elle prend le temps d'expliquer chaque étape et adapte vraiment les soins. Le résultat dure bien plus longtemps.",
  },
  {
    name: 'Sofia T.',
    sub: 'Cliente Anto Nail',
    initials: 'ST',
    avatarBg: '#D4A853',
    image: '/temoignages/3.jpeg',
    text: "J'ai demandé un nail art assez complexe, des fleurs en relief avec des dégradés, et le rendu était absolument bluffant. Je ne vais plus nulle part ailleurs.",
  },
  {
    name: 'Aissatou B.',
    sub: 'Cliente Anto Nail',
    initials: 'AB',
    avatarBg: '#C9A8E0',
    image: '/temoignages/4.jpeg',
    text: "Les ongles en gel qu'elle pose tiennent vraiment longtemps. Elle est minutieuse, propre, et le résultat est toujours impeccable. Je recommande à 100%.",
  },
  {
    name: 'Mariame K.',
    sub: 'Cliente Anto Nail',
    initials: 'MK',
    avatarBg: '#F2C8D8',
    image: '/temoignages/5.jpeg',
    text: "La séance manucure était un vrai moment de détente. Anto a une main légère et un sens esthétique incroyable. Mes ongles n'ont jamais été aussi beaux.",
  },
  {
    name: 'Inès D.',
    sub: 'Cliente Anto Nail',
    initials: 'ID',
    avatarBg: '#9B72C8',
    image: '/temoignages/6.jpeg',
    text: "Le semi-permanent tient plus de 3 semaines sans éclat. Anto prend soin de la santé de l'ongle avant tout, c'est rare et précieux. Merci infiniment !",
  },
]

export function TestimonialsSection() {
  const sectionRef  = useRef<HTMLElement>(null)
  const wrapperRef  = useRef<HTMLDivElement>(null)
  const headRef     = useRef<HTMLDivElement>(null)
  const galleryRef  = useRef<HTMLDivElement>(null)
  const [galleryOpen, setGalleryOpen] = useState(false)

  useEffect(() => {
    const el = galleryRef.current
    if (!el) return
    if (galleryOpen) {
      gsap.fromTo(el, { height: 0 }, { height: 'auto', duration: 0.65, ease: 'power2.inOut' })
    } else {
      gsap.to(el, { height: 0, duration: 0.5, ease: 'power2.inOut' })
    }
  }, [galleryOpen])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headRef.current, {
        y: 32, opacity: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: headRef.current, start: 'top 80%', once: true },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    // Mobile: intercept touch direction — horizontal → carrousel, vertical → Lenis
    let startX = 0
    let startY = 0

    const onTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
    }

    const onTouchMove = (e: TouchEvent) => {
      const dx = Math.abs(e.touches[0].clientX - startX)
      const dy = Math.abs(e.touches[0].clientY - startY)
      if (dx > dy && dx > 5) e.stopPropagation()
    }

    wrapper.addEventListener('touchstart', onTouchStart, { passive: true })
    wrapper.addEventListener('touchmove', onTouchMove, { passive: true })

    if (window.innerWidth < 1024) {
      return () => {
        wrapper.removeEventListener('touchstart', onTouchStart)
        wrapper.removeEventListener('touchmove', onTouchMove)
      }
    }

    const MAX_SPEED = 18
    const DEAD_ZONE = 0.04

    let active = false
    let norm   = 0.5
    let raf    = 0

    const tick = () => {
      if (active) {
        const raw  = norm - 0.5
        const abs  = Math.abs(raw)
        const sign = Math.sign(raw)
        if (abs > DEAD_ZONE) {
          const t = (abs - DEAD_ZONE) / (0.5 - DEAD_ZONE)
          wrapper.scrollLeft += sign * t * MAX_SPEED
        }
      }
      raf = requestAnimationFrame(tick)
    }

    const onMove = (e: MouseEvent) => {
      const rect = wrapper.getBoundingClientRect()
      norm = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    }

    wrapper.addEventListener('mouseenter', () => { active = true })
    wrapper.addEventListener('mouseleave', () => { active = false })
    wrapper.addEventListener('mousemove', onMove)

    raf = requestAnimationFrame(tick)

    return () => {
      wrapper.removeEventListener('touchstart', onTouchStart)
      wrapper.removeEventListener('touchmove', onTouchMove)
      wrapper.removeEventListener('mouseenter', () => { active = true })
      wrapper.removeEventListener('mouseleave', () => { active = false })
      wrapper.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      id="avis"
      className="testimonials-section"
      style={{ background: 'var(--cream)', padding: 'clamp(60px, 10vw, 120px) 0', overflow: 'hidden', position: 'relative', zIndex: 20, marginTop: '-100vh' }}
    >
      {/* Heading */}
      <div ref={headRef} style={{ textAlign: 'center', marginBottom: '64px', padding: '0 clamp(20px, 5vw, 48px)' }}>
        <p style={{
          fontFamily: 'var(--font-dm-sans)', fontSize: '11px', fontWeight: 700,
          letterSpacing: '0.28em', textTransform: 'uppercase',
          color: 'var(--grey)', margin: '0 0 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
        }}>
          <span style={{ width: '28px', height: '1px', background: 'var(--grey-light)', flexShrink: 0 }} />
          Témoignages
          <span style={{ width: '28px', height: '1px', background: 'var(--grey-light)', flexShrink: 0 }} />
        </p>
        <h2 style={{
          fontFamily: 'var(--font-dm-sans)', fontSize: 'clamp(32px, 4vw, 60px)',
          fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.03em',
          color: 'var(--noir)', margin: '0 0 12px',
        }}>
          Elles parlent<br />mieux que moi
        </h2>
        <p style={{
          fontFamily: 'var(--font-dm-sans)', fontSize: '14px',
          fontWeight: 400, color: 'var(--grey)', margin: 0,
        }}>
          +100 clientes satisfaites · Note moyenne 4,5/5
        </p>
      </div>

      {/* Drag strip */}
      <div style={{ position: 'relative' }}>
        {/* Edge fadeleft */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: '80px', zIndex: 2,
          background: 'linear-gradient(to right, var(--cream) 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />
        {/* Edge faderight */}
        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: '80px', zIndex: 2,
          background: 'linear-gradient(to left, var(--cream) 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />

        {/* Scrollable wrapper */}
        <div
          ref={wrapperRef}
          style={{
            overflowX: 'scroll',
            overflowY: 'hidden',
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-x',
          }}
        >
          <div style={{
            display: 'flex',
            gap: GAP,
            padding: '16px clamp(20px, 5vw, 48px) 24px',
            width: 'max-content',
          }}>
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="testimonial-card"
                style={{
                  width: CARD, height: CARD, flexShrink: 0,
                  background: 'var(--white)',
                  display: 'flex', flexDirection: 'column',
                  border: '1px solid rgba(0,0,0,0.06)',
                  overflow: 'hidden',
                }}
              >
                {/* Top: avatar + name + text */}
                <div style={{ padding: '22px 22px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: 36, height: 36,
                      background: t.avatarBg, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{
                        fontFamily: 'var(--font-dm-sans)', fontSize: '12px',
                        fontWeight: 700, color: 'var(--white)',
                      }}>
                        {t.initials}
                      </span>
                    </div>
                    <div>
                      <p style={{
                        fontFamily: 'var(--font-dm-sans)', fontSize: '13px',
                        fontWeight: 600, color: 'var(--noir)', margin: '0 0 1px',
                      }}>
                        {t.name}
                      </p>
                      <p style={{
                        fontFamily: 'var(--font-dm-sans)', fontSize: '11px',
                        fontWeight: 400, color: 'var(--grey)', margin: 0,
                      }}>
                        {t.sub}
                      </p>
                    </div>
                  </div>
                  <p style={{
                    fontFamily: 'var(--font-dm-sans)', fontSize: '12.5px',
                    fontWeight: 400, lineHeight: 1.6,
                    color: 'var(--noir-soft)', margin: 0,
                  }}>
                    &ldquo;{t.text}&rdquo;
                  </p>
                </div>

                {/* Bottom: image */}
                <div style={{ position: 'relative', flex: 1 }}>
                  <Image
                    src={t.image}
                    alt={`Avis de ${t.name}`}
                    fill
                    style={{ objectFit: 'cover', objectPosition: 'center' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA galerie */}
      <div style={{ textAlign: 'center', marginTop: '56px' }}>
        <button
          onClick={() => setGalleryOpen(o => !o)}
          style={{ ...btnPrimary, display: 'inline-flex', alignItems: 'center', gap: '10px' }}
          className="gallery-cta"
        >
          Voir la galerie
          <span style={{ fontSize: '14px', transition: 'transform 0.3s ease', transform: galleryOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>↓</span>
        </button>
      </div>

      {/* Galerie déroulante */}
      <div ref={galleryRef} style={{ overflow: 'hidden', height: 0 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '8px',
          padding: '40px clamp(20px, 5vw, 48px) 0',
        }}>
          {GALLERY_IMAGES.map((src, i) => (
            <div
              key={i}
              style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden' }}
            >
              <Image
                src={src}
                alt={`Réalisation Anto Nail ${i + 1}`}
                fill
                style={{ objectFit: 'cover', objectPosition: 'center' }}
              />
            </div>
          ))}
        </div>
        <div style={{
          textAlign: 'center', padding: '40px 0 8px',
          opacity: galleryOpen ? 1 : 0,
          transition: 'opacity 0.4s ease',
          pointerEvents: galleryOpen ? 'auto' : 'none',
        }}>
          <button
            onClick={() => setGalleryOpen(false)}
            style={{ ...btnPrimary, display: 'inline-flex', alignItems: 'center', gap: '10px' }}
            className="gallery-cta"
          >
            Fermer la galerie
            <span style={{ fontSize: '14px' }}>↑</span>
          </button>
        </div>
      </div>

      <style>{`
        .gallery-cta { transition: background 0.25s ease, transform 0.2s ease !important; }
        .gallery-cta:hover { background: var(--lavender-dark) !important; transform: translateY(-2px); }
        .testimonial-card { width: min(460px, calc(100vw - 56px)) !important; height: min(460px, calc(100vw - 56px)) !important; }
        @media (max-width: 1023px) {
          .testimonials-section { margin-top: 0 !important; }
        }
      `}</style>
    </section>
  )
}
