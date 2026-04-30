import Link from 'next/link'
import Image from 'next/image'
import { Footer } from '../components/Footer'

export const metadata = { title: 'Politique de confidentialité — Anto Nail' }

export default function PolitiqueConfidentialite() {
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
            Politique de<br />confidentialité
          </h1>

          {[
            {
              title: 'Responsable du traitement',
              content: [
                'Anto Nail — prothésiste ongulaire indépendante, Dakar, Sénégal.',
                'Contact : via Instagram @antonail',
              ],
            },
            {
              title: 'Données collectées',
              content: [
                'Dans le cadre de la prise de rendez-vous, les informations suivantes peuvent être collectées :',
                '— Nom et prénom',
                '— Numéro de téléphone',
                '— Historique des prestations réalisées',
                'Aucune donnée bancaire n\'est collectée ni conservée.',
              ],
            },
            {
              title: 'Finalités du traitement',
              content: [
                'Les données collectées sont utilisées exclusivement pour :',
                '— La gestion des rendez-vous et le suivi clientèle',
                '— La communication concernant vos prestations',
                'Elles ne sont transmises à aucun tiers.',
              ],
            },
            {
              title: 'Durée de conservation',
              content: [
                'Vos données sont conservées pendant la durée de la relation commerciale, et au maximum 3 ans après le dernier rendez-vous.',
              ],
            },
            {
              title: 'Vos droits',
              content: [
                'Conformément à la loi n° 2008-12 du 25 janvier 2008 sur la protection des données personnelles au Sénégal, vous disposez des droits suivants :',
                '— Droit d\'accès à vos données',
                '— Droit de rectification',
                '— Droit à l\'effacement',
                'Pour exercer ces droits, contactez-nous via Instagram @antonail.',
              ],
            },
            {
              title: 'Sécurité',
              content: [
                'Anto Nail met en œuvre les mesures techniques et organisationnelles appropriées pour protéger vos données personnelles contre tout accès non autorisé, perte ou divulgation.',
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
