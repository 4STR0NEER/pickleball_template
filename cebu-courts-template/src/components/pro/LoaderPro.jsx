import { useEffect, useRef, useState } from 'react'
import { animate, motion, useReducedMotion } from 'motion/react'
import { SITE } from '../../config/site.js'
import Pickleball from './Pickleball.jsx'

const OUT = [0.23, 1, 0.32, 1]
const GRAVITY_IN = [0.55, 0, 1, 0.45] // falling: speeds up, the one honest ease-in
const GRAVITY_OUT = [0.17, 0.84, 0.44, 1] // rising: slows to the apex

/*
  Pro loader on a light stage. A rendered pickleball carrying the logo sits
  left of the business name. When loading completes the ball drops to the
  floor, bounces, and its rise carries the logo up to the header slot, where
  the ball fades away and only the logo lands.
*/
export default function LoaderPro({ onDone, duration = 5000 }) {
  const reduce = useReducedMotion()
  const [leaving, setLeaving] = useState(false)
  // Floor sits a quarter screen below the ball
  const [drop] = useState(() => Math.min(window.innerHeight * 0.26, 240))
  const stageRef = useRef(null)
  const flyRef = useRef(null)
  const squashRef = useRef(null)
  const shadowRef = useRef(null)
  const logoRef = useRef(null)
  const bodyRef = useRef([])
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  useEffect(() => {
    let cancelled = false
    const finish = async () => {
      setLeaving(true)
      const slot = document.getElementById('header-logo-slot')
      const dst = slot?.getBoundingClientRect()

      if (reduce || !dst?.width) {
        await animate(stageRef.current, { opacity: 0 }, { duration: 0.35, ease: OUT })
        return doneRef.current()
      }

      // 1. Drop to the floor, shadow tightening as it nears
      animate(shadowRef.current, { scale: [0.55, 1], opacity: [0.16, 0.55] }, { duration: 0.46, ease: GRAVITY_IN })
      await animate(flyRef.current, { y: drop }, { duration: 0.46, ease: GRAVITY_IN })
      if (cancelled) return

      // 2. Contact: squash from the bottom
      await animate(squashRef.current, { scaleX: 1.14, scaleY: 0.84 }, { duration: 0.07, ease: 'easeOut' })
      if (cancelled) return

      // 3. Bounce: the rise is the flight, with its apex at the header slot
      const src = logoRef.current.getBoundingClientRect()
      const x = dst.left + dst.width / 2 - (src.left + src.width / 2)
      const y = drop + dst.top + dst.height / 2 - (src.top + src.height / 2)
      const scale = dst.width / src.width
      const T = 0.9
      animate(squashRef.current, { scaleX: [1.14, 0.93, 1], scaleY: [0.84, 1.09, 1] }, { duration: 0.34, ease: 'easeOut' })
      animate(shadowRef.current, { scale: 0.4, opacity: 0 }, { duration: 0.35, ease: OUT })
      animate(bodyRef.current, { opacity: 0 }, { duration: T * 0.5, delay: T * 0.5, ease: 'linear' })
      animate(logoRef.current, { color: getComputedStyle(slot).color }, { duration: T * 0.5, delay: T * 0.4, ease: 'linear' })
      animate(stageRef.current, { opacity: 0 }, { duration: 0.55, delay: T * 0.35, ease: OUT })
      await animate(
        flyRef.current,
        { x, y, scale },
        { x: { duration: T, ease: [0.3, 0.1, 0.7, 0.9] }, y: { duration: T, ease: GRAVITY_OUT }, scale: { duration: T, ease: [0.25, 0.7, 0.4, 1] } }
      )
      if (!cancelled) doneRef.current()
    }
    const id = setTimeout(finish, duration)
    return () => {
      cancelled = true
      clearTimeout(id)
    }
  }, [duration, reduce, drop])

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="status" aria-live="polite">
      <span className="sr-only">Loading {SITE.businessName}</span>

      {/* Light stage, tinted by the palette */}
      <div
        ref={stageRef}
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(85% 70% at 38% 42%, #ffffff 0%, color-mix(in srgb, var(--c-glow-2) 16%, #fbfaf5) 55%, color-mix(in srgb, var(--c-glow-2) 32%, #f1eee4) 100%)',
        }}
      >
        <div className="matte-noise opacity-[0.12]!" />
      </div>

      <div className="relative grid h-full grid-cols-2 items-center gap-5 sm:gap-10">
        {/* Ball, right-aligned in the left half */}
        <div className="relative flex justify-end">
          <div className="relative">
            <span
              ref={shadowRef}
              aria-hidden="true"
              className="absolute left-[12%] h-[14%] w-[76%] rounded-full bg-[#2d2a14] blur-md"
              style={{ top: `calc(100% + ${drop}px - 7%)`, transform: 'scale(0.55)', opacity: reduce ? 0 : 0.16 }}
            />
            <motion.div
              initial={reduce ? false : { opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: OUT }}
            >
              <div ref={flyRef} className="relative">
                <div ref={squashRef} style={{ transformOrigin: '50% 100%' }}>
                  <Pickleball logoRef={logoRef} bodyRef={bodyRef} spin={!reduce} className="w-[clamp(7.5rem,17vw,13.5rem)]" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Name and headline, right half near the middle */}
        <motion.div
          className="pr-5 text-stage sm:pr-10"
          initial={false}
          animate={leaving ? { opacity: 0, y: -8 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: [0.4, 0, 1, 1] }}
        >
          {[
            <p key="n" className="display text-[clamp(2.25rem,7vw,5.75rem)]">{SITE.businessName}</p>,
            <p key="h" className="mt-3 max-w-sm text-balance text-sm text-stage/65 sm:mt-4 sm:text-lg">{SITE.headline}</p>,
          ].map((el, i) => (
            <motion.div
              key={el.key}
              initial={reduce ? false : { opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.07, ease: OUT }}
            >
              {el}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
