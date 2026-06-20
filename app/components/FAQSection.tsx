'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const FAQS = [
  {
    q: 'Comment prendre rendez-vous ?',
    a: "Via Instagram @antonail ou par téléphone. Les disponibilités s'affichent en temps réel. Je réponds sous 24h.",
  },
  {
    q: 'Combien de temps dure une séance ?',
    a: "Comptez 1h30 pour une pose gel complète, 2h pour un nail art élaboré, 45 min pour une manucure simple. Les délais peuvent varier selon la complexité de votre demande.",
  },
  {
    q: 'Combien de temps tient la pose gel ?',
    a: "Entre 3 et 6 semaines selon votre hygiène de vie. Un entretien est recommandé toutes les 4 semaines pour maintenir un résultat impeccable.",
  },
  {
    q: "Faut-il préparer ses ongles avant la séance ?",
    a: "Non, arrivez les ongles naturels. Évitez simplement d'appliquer de l'huile ou de la crème le jour même, cela peut affecter l'adhérence du produit.",
  },
  {
    q: 'Vous déplacez-vous à domicile ?',
    a: "Non, les séances se déroulent exclusivement dans mon studio à Abidjan. L'adresse exacte vous est communiquée lors de la confirmation de rendez-vous.",
  },
  {
    q: 'Quels produits utilisez-vous ?',
    a: "Exclusivement des marques professionnelles certifiées : OPI, CND Shellac, IBX System. Aucun produit MMA, néfaste pour la santé de l'ongle naturel.",
  },
]

export function FAQSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headRef    = useRef<HTMLDivElement>(null)
  const listRef    = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState<number | null>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headRef.current, {
        y: 32, opacity: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: headRef.current, start: 'top 80%', once: true },
      })

      const items = listRef.current?.querySelectorAll('.faq-item')
      if (items?.length) {
        gsap.from(Array.from(items), {
          y: 20, opacity: 0, duration: 0.55, ease: 'power3.out', stagger: 0.07,
          scrollTrigger: { trigger: listRef.current, start: 'top 80%', once: true },
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="faq"
      style={{ background: 'var(--cream)', padding: '120px 0 120px', position: 'relative', zIndex: 25 }}
    >
      {/* Heading */}
      <div ref={headRef} style={{ textAlign: 'center', marginBottom: '72px', padding: '0 clamp(20px, 5vw, 48px)' }}>
        <p style={{
          fontFamily: 'var(--font-dm-sans)', fontSize: '11px', fontWeight: 700,
          letterSpacing: '0.28em', textTransform: 'uppercase',
          color: 'var(--grey)', margin: '0 0 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
        }}>
          <span style={{ width: '28px', height: '1px', background: 'var(--grey-light)', flexShrink: 0 }} />
          Questions fréquentes
          <span style={{ width: '28px', height: '1px', background: 'var(--grey-light)', flexShrink: 0 }} />
        </p>
        <h2 style={{
          fontFamily: 'var(--font-dm-sans)', fontSize: 'clamp(32px, 4vw, 60px)',
          fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.03em',
          color: 'var(--noir)', margin: 0,
        }}>
          Tout ce que vous<br />voulez savoir
        </h2>
      </div>

      {/* FAQ list */}
      <div ref={listRef} style={{ maxWidth: '800px', margin: '0 auto', padding: '0 clamp(20px, 5vw, 48px)' }}>
        {FAQS.map((faq, i) => (
          <div
            key={i}
            className="faq-item"
            style={{
              borderTop: i === 0 ? '1px solid rgba(0,0,0,0.1)' : 'none',
              borderBottom: '1px solid rgba(0,0,0,0.1)',
            }}
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', gap: '24px',
                padding: '28px 0', background: 'none', border: 'none',
                cursor: 'pointer', textAlign: 'left',
              }}
            >
              <span style={{
                fontFamily: 'var(--font-dm-sans)', fontSize: 'clamp(15px, 1.4vw, 17px)',
                fontWeight: 600, lineHeight: 1.3, letterSpacing: '-0.01em',
                color: open === i ? 'var(--lavender-dark)' : 'var(--noir)',
                transition: 'color 0.3s ease',
              }}>
                {faq.q}
              </span>
              <span style={{
                fontSize: '22px', fontWeight: 300, lineHeight: 1,
                color: open === i ? 'var(--lavender-dark)' : 'var(--grey)',
                transform: open === i ? 'rotate(45deg)' : 'rotate(0deg)',
                transition: 'transform 0.35s ease, color 0.3s ease',
                flexShrink: 0, display: 'block',
              }}>
                +
              </span>
            </button>

            <div style={{
              maxHeight: open === i ? '300px' : '0',
              overflow: 'hidden',
              transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            }}>
              <p style={{
                fontFamily: 'var(--font-dm-sans)', fontSize: '14px',
                fontWeight: 400, lineHeight: 1.8, color: 'var(--grey)',
                margin: '0 0 28px', paddingRight: 'clamp(0px, 4vw, 48px)',
              }}>
                {faq.a}
              </p>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .faq-item button:focus-visible { outline: 2px solid var(--lavender); outline-offset: 4px; }
      `}</style>
    </section>
  )
}
