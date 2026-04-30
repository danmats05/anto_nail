'use client'

import { ReactLenis, useLenis } from 'lenis/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect } from 'react'
import type { ReactNode } from 'react'

gsap.registerPlugin(ScrollTrigger)

function GSAPSync() {
  const lenis = useLenis()

  useEffect(() => {
    if (!lenis) return

    const update = (time: number) => {
      lenis.raf(time * 1000)
    }

    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(0)
    lenis.on('scroll', ScrollTrigger.update)

    const handleAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null
      if (!anchor) return
      const href = anchor.getAttribute('href')
      if (!href || href === '#') return
      e.preventDefault()
      lenis.scrollTo(href, { duration: 1.2 })
    }

    document.addEventListener('click', handleAnchorClick)

    return () => {
      gsap.ticker.remove(update)
      lenis.off('scroll', ScrollTrigger.update)
      document.removeEventListener('click', handleAnchorClick)
    }
  }, [lenis])

  return null
}

export function LenisProvider({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root options={{ autoRaf: false }}>
      <GSAPSync />
      {children}
    </ReactLenis>
  )
}
