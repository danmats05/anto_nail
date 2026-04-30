import { useEffect } from 'react'
import type { RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface ImageShrinkOptions {
  /** Scroll container that creates the scroll space (height: Xvh) */
  outerRef: RefObject<HTMLElement | null>
  /** The image container to shrink from fullscreen → thumbnail */
  imageContainerRef: RefObject<HTMLElement | null>
  /** Overlay text/gradient that fades out */
  overlayRef: RefObject<HTMLElement | null>
  /** White background that fades in */
  whiteBgRef: RefObject<HTMLElement | null>
  /** Content revealed after shrink (heading, cards…) */
  contentRef: RefObject<HTMLElement | null>
  /** Thumbnail width in px (default: 220) */
  thumbW?: number
  /** Thumbnail height in px (default: 148) */
  thumbH?: number
  /** Thumbnail top offset in px (default: 40) */
  thumbTop?: number
  /** GSAP scrub value — higher = more lag/smoothing (default: 1) */
  scrub?: number
}

/**
 * Scroll-driven animation: fullscreen image → centered thumbnail.
 *
 * Effect:
 *  - Image container shrinks from 100vw×100vh to thumbnail at top-center
 *  - Overlay text fades out simultaneously
 *  - White background fades in behind
 *  - Revealed content fades in once image is small
 *
 * Requires the outer container to be `position: relative` with enough
 * height (e.g. 380vh) and an inner sticky div (height: 100vh) for pinning.
 * Uses top/left/width/height animation — the `next/image fill` child
 * scales automatically with the container.
 *
 * No border-radius is applied. `overflow: hidden` is set only on the
 * image container, NOT on the sticky parent (avoids Safari paint artifact).
 */
export function useImageShrink({
  outerRef,
  imageContainerRef,
  overlayRef,
  whiteBgRef,
  contentRef,
  thumbW = 220,
  thumbH = 148,
  thumbTop = 40,
  scrub = 1,
}: ImageShrinkOptions) {
  useEffect(() => {
    if (window.innerWidth < 1024) return
    if (!outerRef.current) return

    // Pixel center so the image travels straight down (no left→right arc)
    const containerW = outerRef.current.clientWidth
    const finalLeft  = Math.round((containerW - thumbW) / 2)

    gsap.set(imageContainerRef.current, {
      position: 'absolute',
      top: 0,
      left: 0,
      xPercent: 0,
      width: '100%',
      height: '100%',
      borderRadius: 0,
      overflow: 'hidden',
    })

    gsap.set(whiteBgRef.current, { opacity: 0 })
    gsap.set(contentRef.current, { opacity: 0, y: 24 })

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: outerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub,
        },
      })

      // Image shrinks straight down to center — pure left/width/height, no xPercent
      tl.to(
        imageContainerRef.current,
        {
          top: thumbTop,
          left: finalLeft,
          xPercent: 0,
          width: thumbW,
          height: thumbH,
          borderRadius: 0,
          ease: 'power1.inOut',
          duration: 2,
          force3D: true,
        },
        0,
      )

      // Overlay fades out
      tl.to(overlayRef.current, { opacity: 0, ease: 'none', duration: 1.2 }, 0)

      // White bg fades in
      tl.to(whiteBgRef.current, { opacity: 1, ease: 'none', duration: 1.4 }, 0.4)

      // Content appears once image is ~90% shrunk (tl.time 1.8→2.0)
      tl.to(
        contentRef.current,
        { opacity: 1, y: 0, ease: 'power2.out', duration: 0.2 },
        1.8,
      )
      // pad timeline to 2.6 so image shrink still completes at ~77% of scroll
      tl.set(whiteBgRef.current, { opacity: 1 }, 2.6)
    })

    return () => ctx.revert()
  }, [outerRef, imageContainerRef, overlayRef, whiteBgRef, contentRef, thumbW, thumbH, thumbTop, scrub])
}
