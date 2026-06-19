# Référence animations — état de référence stable

> Ce fichier documente l'état qui FONCTIONNE. Si un composant est cassé, revenir à cette logique.

---

## Ordre des sections dans `app/page.tsx` — CRITIQUE

```jsx
<Hero />
<ServicesIntro />
<TestimonialsSection />   ← DOIT être juste après ServicesIntro
<GallerySection />        ← APRÈS TestimonialsSection, jamais entre les deux
<FAQSection />
<ContactSection />
<Footer />
```

**NE PAS** insérer GallerySection entre ServicesIntro et TestimonialsSection.
Le `marginTop: '-100vh'` de TestimonialsSection est calibré pour glisser par-dessus ServicesIntro.
Si on insère un élément entre les deux, ServicesIntro sort de sticky avant que testimonials arrive → heading "Parce que vos mains" défile. CASSÉ.

---

## `app/layout.tsx` — CRITIQUE

```jsx
// PAS de h-full sur <html> — provoque un mauvais calcul de scroll height par Lenis sur mobile
<html lang="fr" className={`${cormorant.variable} ${dmSans.variable}`}>
<body className="min-h-full flex flex-col antialiased">
```

`h-full` sur `<html>` = `height: 100%` = Lenis pense que la page fait 100vh → scroll bloqué sur mobile.

---

## `app/providers/LenisProvider.tsx` — Scroll fluide global

Handler global qui intercepte tous les `<a href="#...">` et scrolle via Lenis :

```ts
const handleAnchorClick = (e: MouseEvent) => {
  const anchor = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null
  if (!anchor) return
  const href = anchor.getAttribute('href')
  if (!href || href === '#') return
  e.preventDefault()
  lenis.scrollTo(href, { duration: 1.2 })
}
document.addEventListener('click', handleAnchorClick)
```

Couvre : liens footer, boutons Hero CTA, boutons Réserver, liens Galerie, etc.
Les liens du menu Navbar appellent `close()` en plus via leur `onClick` — les deux coexistent.

---

## ServicesIntro (`app/components/ServicesIntro.tsx`)

### Constantes wheel (NE PAS MODIFIER sans raison)
```
THUMB_TOP = 40
THUMB_H   = 148
WHEEL_W   = 700
WHEEL_H   = 700
CROP      = 0.62
ITEM_W    = 300
ITEM_H    = 420
RADIUS    = 460
TURNS     = 1
```

### Images services
```js
{ src: '/Pose%20gel.jpeg',               label: 'Pose Gel',       subtitle: 'Dès 39 000 FCFA' }
{ src: '/Nail%20art.jpeg',               label: 'Nail Art',       subtitle: 'Dès 52 000 FCFA' }
{ src: '/Baby%20boomer.jpeg',            label: 'Baby Boomer',    subtitle: 'Dès 49 000 FCFA' }
{ src: '/D%C3%A9pose%20et%20soin.jpeg', label: 'Dépose & Soin',  subtitle: 'Dès 23 000 FCFA' }
{ src: '/Manicure.jpeg',                 label: 'Manucure',       subtitle: 'Dès 30 000 FCFA' }
{ src: '/pink2.png',                     label: 'Semi-Permanent', subtitle: 'Dès 33 000 FCFA' }
```

### Structure JSX — ordre des layers (sticky inner, zIndex implicite)
```
zIndex 1   → whiteBgRef      (cream bg + grille)
zIndex 2   → imageContainerRef (image plein écran → thumbnail)
zIndex 3   → overlayRef      (gradient + heading overlay, se fade out)
zIndex 4   → contentRef      (heading "Parce que vos mains" + wheel, opacity 0 au départ)
zIndex 300 → darkOverlayRef  (noir, opacity 0 au départ, monte avec scroll)
```

### Section hauteur
```
height: '800vh'   ← NE PAS CHANGER (calibré pour tous les triggers)
```

### Sticky inner
```jsx
<div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>
```
Pas de zIndex explicite → root stacking: auto (en dessous de testimonials zIndex: 20)

### Breakpoint mobile / desktop
```
< 1024px  → MobileSwipeServices (swipe carousel)
≥ 1024px  → wheel GSAP
```

### useImageShrink — timeline (dans useImageShrink.ts)
```
scrub: 1
start: 'top top'  /  end: 'bottom bottom'  (toute la section 800vh)
Timeline totale: 2.6 unités

t=0    → image plein écran, overlay visible
t=1.2  → overlay fade out termine
t=1.4  → whiteBg commence à fade in
t=1.8  → contentRef commence à apparaître  (= ~69% du scroll)
t=2.0  → contentRef pleinement visible     (= ~77% du scroll)
t=2.6  → whiteBg stable à opacity 1

Image: left: 0 → finalLeft (pixel centré), width: 100% → 220px, height: 100% → 148px
IMPORTANT: pas de xPercent, utiliser left en pixels pour éviter trajectoire courbe
```

### Wheel rotation ScrollTrigger
```js
ScrollTrigger.create({
  trigger: outer,
  start: '60% top',
  end:   '80% top',
  scrub: 1,
  onUpdate: (self) => applyState(self.progress),
})
```

### Dark overlay ScrollTrigger
```js
gsap.set(darkOverlayRef.current, { opacity: 0 })
gsap.to(darkOverlayRef.current, {
  opacity: 0.72,
  ease: 'none',
  scrollTrigger: {
    trigger: '#avis',
    start: 'top bottom',
    end:   'top top',
    scrub: 1.5,
  },
})
```

### Flash fix — opacités initiales JSX (IMPORTANT)
```jsx
// whiteBgRef  → opacity: 0  dans le style JSX
// contentRef  → opacity: 0  dans le style JSX
// darkOverlay → opacity: 0  dans le style JSX
```
Sans ça : flash visible du heading et du background au premier rendu.

### Mobile swipe carousel (MobileSwipeServices)
```
Cards: flex 0 0 80vw, height 110vw
scroll-snap-type: x mandatory / scroll-snap-align: center
padding: 0 10vw
Dot indicators: actif = 20px / inactif = 6px
```

---

## useImageShrink (`app/lib/hooks/useImageShrink.ts`)

```ts
// Guard mobile — NE PAS SUPPRIMER
if (window.innerWidth < 1024) return

// Calcul centrage thumbnail — NE PAS utiliser left:'50%' + xPercent:-50
const finalLeft = Math.round((containerW - thumbW) / 2)

// Set initial
gsap.set(imageContainerRef.current, {
  position: 'absolute', top: 0, left: 0, xPercent: 0,
  width: '100%', height: '100%', borderRadius: 0, overflow: 'hidden',
})

// Animation: xPercent reste 0 TOUT le temps (évite trajectoire courbe)
tl.to(imageContainerRef.current, {
  top: thumbTop, left: finalLeft, xPercent: 0,
  width: thumbW, height: thumbH,
  ease: 'power1.inOut', duration: 2, force3D: true,
}, 0)
```

---

## TestimonialsSection (`app/components/TestimonialsSection.tsx`)

### marginTop — CRITIQUE, NE PAS METTRE À 0 (desktop)
```jsx
// Sur la section #avis :
marginTop: '-100vh'
zIndex: 20
```
`-100vh` = testimonials glisse PAR-DESSUS la section services sticky AVANT qu'elle se déstickifie.
Si mis à 0 → la section services défile et le heading "Parce que vos mains" se déplace. CASSÉ.

```css
/* Mobile uniquement — reset marginTop */
@media (max-width: 1023px) {
  .testimonials-section { margin-top: 0 !important; }
}
```

### Hiérarchie stacking root (explication du slide-over)
```
Services sticky (position:sticky, pas de zIndex) = root z: auto
Testimonials    (position:relative, zIndex:20)    = root z: 20   ← AU-DESSUS
```
→ Les testimonials glissent visuellement par-dessus les services.

### Scroll horizontal — touch-action (IMPORTANT mobile)
```jsx
// wrapperRef : le conteneur de cards
style={{
  overflowX: 'scroll',
  overflowY: 'hidden',
  WebkitOverflowScrolling: 'touch',
  touchAction: 'pan-x',   // ← NE PAS SUPPRIMER
}}
```
`touchAction: 'pan-x'` empêche le conteneur de capturer les swipes verticaux sur mobile.
Sans ça : le scroll de page se bloque quand le doigt passe sur ce conteneur.

### Galerie déroulante
```js
// Toggle onClick
const [galleryOpen, setGalleryOpen] = useState(false)

// Animation GSAP
if (galleryOpen) gsap.fromTo(el, { height: 0 }, { height: 'auto', duration: 0.65, ease: 'power2.inOut' })
else             gsap.to(el,              { height: 0,      duration: 0.5,  ease: 'power2.inOut' })

// Images galerie (encodées URL)
'/pink1.png', '/pink2.png', '/pink3.png', '/pink4.png', '/hero.png',
'/Pose%20gel.jpeg', '/Nail%20art.jpeg', '/Baby%20boomer.jpeg',
'/D%C3%A9pose%20et%20soin.jpeg', '/Manicure.jpeg'
```

### Boutons — animation hover (identique à tous les boutons du site)
```css
.gallery-cta { transition: background 0.25s ease, transform 0.2s ease !important; }
.gallery-cta:hover { background: var(--lavender-dark) !important; transform: translateY(-2px); }
```

---

## GallerySection (`app/components/GallerySection.tsx`)

- id : `#galerie` (cible du lien Galerie dans le menu)
- Cachée sur mobile / tablette :
```css
@media (max-width: 1023px) { #galerie { display: none !important; } }
```
- Contient actuellement des dégradés placeholder → à remplacer par de vraies photos

---

## Navbar (`app/components/Navbar.tsx`)

### FlipText sur les liens du menu
Les 4 liens (Services, Galerie, Avis, Contact) utilisent le composant `FlipText` local.
Animation déclenchée par `.menu-nav-link:hover` (pas `.flip-word:hover`) pour couvrir toute la zone cliquable.

```css
.flip-front span, .flip-back span { transition: transform 0.3s ease-in-out; }
.flip-front span { transform: translateY(0); }
.flip-back span { transform: translateY(110%); }
.menu-nav-link:hover .flip-front span { transform: translateY(-110%); }
.menu-nav-link:hover .flip-back span { transform: translateY(0); }
```

### Boutons — animation hover
```css
/* Bouton menu (croix) */
.nav-toggle-btn { transition: background 0.25s ease, transform 0.2s ease !important; }
.nav-toggle-btn:hover { background: var(--lavender-dark) !important; transform: translateY(-2px); }

/* Bouton Réserver dans le menu */
.nav-reserve-btn { transition: background 0.25s ease, transform 0.2s ease !important; }
.nav-reserve-btn:hover { background: var(--lavender-dark) !important; transform: translateY(-2px); }
```

---

## Hero (`app/components/Hero.tsx`)

### FlipText — animation lettre par lettre
```css
.flip-front span, .flip-back span { transition: transform 0.3s ease-in-out; }
.flip-front span { transform: translateY(0); }
.flip-word:hover .flip-front span { transform: translateY(-110%); }
.flip-back span { transform: translateY(110%); }
.flip-word:hover .flip-back span { transform: translateY(0); }
```
Délai entre lettres : `transitionDelay: ${i * 22}ms`

### Bouton CTA
```css
.hero-btn-cta { transition: background 0.25s ease, transform 0.2s ease !important; }
.hero-btn-cta:hover { background: var(--lavender-dark) !important; transform: translateY(-2px); }
```

---

## CSS responsive — règle générale

Tous les paddings horizontaux utilisent `clamp` pour fluidité totale :
```css
padding: clamp(20px, 5vw, 48px)   /* horizontal standard */
padding: clamp(20px, 4vw, 48px)   /* logo / navbar */
```
Pas de breakpoints fixes pour les paddings — `clamp` couvre tout du plus petit au plus grand.

Breakpoints conservés uniquement pour :
- Affichage mobile vs desktop (wheel / carousel) : `max-width: 1023px`
- Grid collapse (contact, footer) : `max-width: 900px` / `max-width: 960px`

---

## btnPrimary (app/lib/hooks/design.ts)
```ts
background: '#C9A8E0'  (lavande)
color:      '#FFFFFF'
padding:    '18px 36px'
borderRadius: 0  // toujours carré, jamais de border-radius
```

---

## Règle globale UI
**Zéro border-radius** sur tous les éléments UI du projet.
