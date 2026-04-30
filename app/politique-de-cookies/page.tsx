import Link from 'next/link'
import Image from 'next/image'
import { Footer } from '../components/Footer'

export const metadata = { title: 'Politique de cookies — Anto Nail' }

export default function PolitiqueCookies() {
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
            Politique de cookies
          </h1>

          {[
            {
              title: 'Qu\'est-ce qu\'un cookie ?',
              content: [
                'Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, smartphone, tablette) lors de la consultation d\'un site web. Il permet de mémoriser des informations relatives à votre navigation.',
              ],
            },
            {
              title: 'Cookies utilisés sur ce site',
              content: [
                'Ce site utilise uniquement des cookies techniques strictement nécessaires à son bon fonctionnement :',
                '— Cookies de session : permettent la navigation fluide sur le site',
                '— Cookies de préférences : mémorisent vos choix de navigation',
                'Aucun cookie publicitaire ou de traçage tiers n\'est déposé sur votre terminal.',
              ],
            },
            {
              title: 'Cookies d\'hébergement',
              content: [
                'Notre hébergeur Vercel peut déposer des cookies techniques nécessaires à la livraison du site (gestion du cache, sécurité). Ces cookies ne collectent aucune donnée personnelle identifiable.',
              ],
            },
            {
              title: 'Durée de conservation',
              content: [
                'Les cookies techniques sont conservés pour une durée maximale de 13 mois à compter de leur dépôt sur votre terminal.',
              ],
            },
            {
              title: 'Gestion de vos préférences',
              content: [
                'Vous pouvez à tout moment configurer votre navigateur pour refuser les cookies ou être informé de leur dépôt. Voici comment procéder selon votre navigateur :',
                '— Chrome : Paramètres > Confidentialité et sécurité > Cookies',
                '— Firefox : Paramètres > Vie privée et sécurité',
                '— Safari : Préférences > Confidentialité',
                '— Edge : Paramètres > Confidentialité, recherche et services',
                'Notez que la désactivation des cookies peut affecter le bon fonctionnement du site.',
              ],
            },
            {
              title: 'Contact',
              content: [
                'Pour toute question relative à notre utilisation des cookies, contactez-nous via Instagram @antonail.',
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
