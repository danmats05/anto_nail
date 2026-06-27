'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useLenis } from 'lenis/react'

export function Preloader({ onComplete }: { onComplete?: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)
  const lenis = useLenis()

  useEffect(() => {
    // Skip preloader si on vient de la page admin
    const skip = sessionStorage.getItem('anto-skip-preloader')
    if (skip) {
      sessionStorage.removeItem('anto-skip-preloader')
      if (lenis) lenis.start()
      document.body.style.overflow = ''
      if (overlayRef.current) overlayRef.current.style.display = 'none'
      onComplete?.()
      return
    }

    // Lock scroll during loading
    if (lenis) lenis.stop()
    document.body.style.overflow = 'hidden'

    const obj = { val: 0 }
    const tl = gsap.timeline()

    // Counter 0 → 100
    tl.to(obj, {
      val: 100,
      duration: 1.6,
      ease: 'power2.inOut',
      onUpdate: () => {
        if (counterRef.current) {
          counterRef.current.textContent = String(Math.round(obj.val)) + '%'
        }
      },
    })

    // Brief pause at 100
    tl.to({}, { duration: 0.15 })

    // Wipe overlay UP
    tl.to(overlayRef.current, {
      yPercent: -100,
      duration: 1.0,
      ease: 'power4.inOut',
      onStart: () => {
        if (lenis) lenis.start()
        document.body.style.overflow = ''
      },
      onComplete: () => {
        if (overlayRef.current) {
          overlayRef.current.style.display = 'none'
        }
        onComplete?.()
      },
    })

    return () => {
      tl.kill()
      if (lenis) lenis.start()
      document.body.style.overflow = ''
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lenis])

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        inset: 0,
        background: '#FFFFFF',
        zIndex: 9999,
        pointerEvents: 'all',
      }}
    >
      {/* Counter — bottom right, exact same style as reference */}
      <span
        ref={counterRef}
        style={{
          position: 'absolute',
          bottom: '40px',
          right: '48px',
          fontFamily: 'var(--font-dm-sans)',
          fontSize: 'clamp(80px, 12vw, 140px)',
          fontWeight: 500,
          lineHeight: 1,
          color: '#555555',
          letterSpacing: '-0.03em',
          fontVariantNumeric: 'tabular-nums',
          userSelect: 'none',
        }}
      >
        0%
      </span>
    </div>
  )
}
