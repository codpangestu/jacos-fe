/**
 * useScrollReveal — hook sederhana untuk animasi "reveal on scroll"
 * menggunakan GSAP ScrollTrigger.
 *
 * Usage:
 *   const ref = useScrollReveal()
 *   <div ref={ref}>konten</div>
 *
 * Atau untuk multiple elemen sekaligus (stagger):
 *   const ref = useScrollReveal({ stagger: 0.1 })
 *   <div ref={ref}>
 *     <div className="reveal-item">...</div>
 *     <div className="reveal-item">...</div>
 *   </div>
 */
import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '../lib/gsap'

export function useScrollReveal({
  y = 32,
  opacity = 0,
  duration = 0.6,
  stagger = 0,
  ease = 'power2.out',
  start = 'top 88%',
  selector = '.reveal-item',
} = {}) {
  const containerRef = useRef(null)

  useGSAP(
    () => {
      const targets = stagger
        ? containerRef.current?.querySelectorAll(selector)
        : [containerRef.current]

      if (!targets?.length) return

      gsap.fromTo(
        targets,
        { y, opacity },
        {
          y: 0,
          opacity: 1,
          duration,
          stagger,
          ease,
          scrollTrigger: {
            trigger: containerRef.current,
            start,
            once: true, // animasi hanya sekali, tidak reset saat scroll balik
          },
        },
      )
    },
    { scope: containerRef, dependencies: [] },
  )

  return containerRef
}
