/**
 * Central GSAP setup — import dari sini, bukan langsung dari 'gsap'.
 * Plugin hanya diregister sekali di sini, tidak perlu registerPlugin
 * berulang di setiap komponen.
 *
 * Usage:
 *   import { gsap, ScrollTrigger } from '../lib/gsap'
 *   import { useGSAP } from '@gsap/react'
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin)

export { gsap, ScrollTrigger, MotionPathPlugin }
