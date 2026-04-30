import Link from 'next/link'
import Image from 'next/image'
import { Footer } from '../components/Footer'

export const metadata = { title: 'Mentions légales — Anto Nail' }

export default function MentionsLegales() {
  return (
    <>
      <header style={{
        background: 'var(--white)', borderBottom: '1px solid rgba(0,0,0,0.07)',
        padding: '20px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link href="/">
          <Image src="/logo-anto.png" alt="Anto Nail" width={110} height={46} style={{ objectFit: 'contain' }} />
        </Link>
        <Link href="/" style={{
          fontFamily: 'var(--font-dm-sans)', fontSize: '12px', fontWeight: 500,
          letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--grey)',
          textDecoration: 'none',
        }}>
          ← Retour
        </Link>
      </header>

      <main style={{ background: 'var(--cream)', minHeight: '70vh', padding: '80px 48px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>

          <p style={{
            fontFamily: 'var(--font-dm-sans)', fontSize: '11px', fontWeight: 700,
            letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--grey)',
            margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <span style={{ width: '28px', height: '1px', background: 'var(--grey-light)' }} />
            Légal
          </p>

          <h1 style={{
            fontFamily: 'var(--font-dm-sans)', fontSize: 'clamp(32px, 4vw, 56px)',
            fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.05,
            color: 'var(--noir)', margin: '0 0 64px',
          }}>
            Mentions légales
          </h1>

          {[
            {
              title: 'Éditeur du site',
              content: [
                'Le présent site est édité par :',
                'Anto Nail — Activité d\'esthétique et prothésie ongulaire',
                'Dakar, Sénégal',
                'Contact : via Instagram @antonail',
              ],
            },
            {
              title: 'Responsable de publication',
              content: [
                'La responsable de publication est Anto Nail, prothésiste ongulaire indépendante.',
              ],
            },
            {
              title: 'Hébergement',
              content: [
                'Ce site est hébergé par Vercel Inc.',
                '340 Pine Street, Suite 701, San Francisco, CA 94104, États-Unis',
                'vercel.com',
              ],
            },
            {
              title: 'Propriété intellectuelle',
              content: [
                'L\'ensemble du contenu de ce site (textes, images, photographies, logo) est la propriété exclusive d\'Anto Nail et est protégé par les lois relatives à la propriété intellectuelle.',
                'Toute reproduction, représentation ou diffusion, totale ou partielle, sans autorisation écrite préalable est strictement interdite.',
              ],
            },
            {
              title: 'Limitation de responsabilité',
              content: [
                'Anto Nail s\'efforce de maintenir les informations de ce site à jour et exactes. Toutefois, elle ne saurait être tenue responsable d\'éventuelles inexactitudes ou omissions.',
              ],
            },
          ].map((section) => (
            <section key={section.title} style={{ marginBottom: '48px' }}>
              <h2 style={{
                fontFamily: 'var(--font-dm-sans)', fontSize: '15px', fontWeight: 700,
                color: 'var(--noir)', margin: '0 0 16px', letterSpacing: '-0.01em',
              }}>
                {section.title}
              </h2>
              {section.content.map((line, i) => (
                <p key={i} style={{
                  fontFamily: 'var(--font-dm-sans)', fontSize: '14px', fontWeight: 400,
                  lineHeight: 1.8, color: 'var(--grey)', margin: '0 0 6px',
                }}>
                  {line}
                </p>
              ))}
              <div style={{ marginTop: '32px', height: '1px', background: 'rgba(0,0,0,0.07)' }} />
            </section>
          ))}

        </div>
      </main>

      <Footer />
    </>
  )
}
