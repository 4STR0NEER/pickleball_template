import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { LogoMark } from '../Brand.jsx'
import { SITE } from '../../config/site.js'
import LampBar from '../board/LampBar.jsx'
import { Seg } from '../board/Board.jsx'

const EASE = [0.65, 0, 0.35, 1]

const PULSES = [
  { color: 'var(--c-glow-1)', left: '18%', top: '22%', size: '46vmax', dur: 3.6, delay: 0 },
  { color: 'var(--c-glow-2)', left: '78%', top: '30%', size: '38vmax', dur: 4.4, delay: 0.8 },
  { color: 'var(--c-glow-1)', left: '58%', top: '82%', size: '42vmax', dur: 5.2, delay: 1.6 },
]

/*
  Intermediate loader: floating logo with a drop shadow over a matte,
  textured stage with slow light pulses. When loading completes, the logo
  flies into its slot in the site header while the stage fades away.
*/
export default function LoaderIntermediate({ onDone, duration = 5000 }) {
  const reduce = useReducedMotion()
  const [progress, setProgress] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const [fly, setFly] = useState(null)
  const logoRef = useRef(null)
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  useEffect(() => {
    let raf
    let timer
    const start = performance.now()

    const leave = () => {
      const src = logoRef.current?.getBoundingClientRect()
      const dst = document.getElementById('header-logo-slot')?.getBoundingClientRect()
      if (src && dst && dst.width && !reduce) {
        setFly({
          x: dst.left + dst.width / 2 - (src.left + src.width / 2),
          y: dst.top + dst.height / 2 - (src.top + src.height / 2),
          scale: dst.width / src.width,
        })
      }
      setLeaving(true)
      timer = setTimeout(() => doneRef.current(), reduce ? 350 : 1150)
    }

    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration)
      setProgress(p)
      if (p < 1) raf = requestAnimationFrame(tick)
      else leave()
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(timer)
    }
  }, [duration, reduce])

  const pct = Math.round(progress * 100)

  return (
    <div className="fixed inset-0 z-50" role="status" aria-live="polite">
      {/* Stage */}
      <motion.div
        className="loader-stage absolute inset-0 overflow-hidden"
        initial={false}
        animate={{ opacity: leaving ? 0 : 1 }}
        transition={{ duration: 0.8, delay: leaving ? 0.3 : 0, ease: EASE }}
      >
        {!reduce &&
          PULSES.map((p, i) => (
            <motion.span
              key={i}
              className="absolute rounded-full"
              style={{
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                x: '-50%',
                y: '-50%',
                background: `radial-gradient(circle, ${p.color} 0%, transparent 65%)`,
                mixBlendMode: 'screen',
                filter: 'blur(30px)',
              }}
              animate={{ opacity: [0.08, 0.42, 0.08], scale: [0.85, 1.12, 0.85] }}
              transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        <div className="matte-noise" />
      </motion.div>

      {/* Content */}
      <div className="relative flex h-full flex-col items-center justify-center px-6">
        <motion.div
          ref={logoRef}
          initial={false}
          animate={fly ? { x: fly.x, y: fly.y, scale: fly.scale } : { x: 0, y: 0, scale: 1 }}
          transition={{ duration: 0.95, ease: EASE }}
          style={{
            color: leaving ? 'var(--c-accent)' : 'var(--c-on-stage)',
            transition: 'color 0.9s ease',
          }}
        >
          <motion.div
            animate={leaving || reduce ? { y: 0 } : { y: [0, -14, 0] }}
            transition={
              leaving || reduce ? { duration: 0.3 } : { duration: 3.2, repeat: Infinity, ease: 'easeInOut' }
            }
            style={{ filter: leaving ? 'none' : 'drop-shadow(0 22px 20px rgb(0 0 0 / 0.45))' }}
          >
            <LogoMark size="lg" tone="current" />
          </motion.div>
        </motion.div>

        {/* Ground shadow that breathes with the float */}
        <motion.span
          className="mt-5 block h-3 w-20 rounded-full bg-black/40 blur-md"
          animate={
            leaving ? { opacity: 0 } : reduce ? { opacity: 0.35 } : { scaleX: [1, 0.72, 1], opacity: [0.45, 0.22, 0.45] }
          }
          transition={leaving || reduce ? { duration: 0.3 } : { duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          className="mt-6 flex flex-col items-center text-on-stage"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: leaving ? 0 : 1, y: 0 }}
          transition={{ duration: leaving ? 0.35 : 0.8, delay: leaving ? 0 : 0.3 }}
        >
          <p className="display text-3xl">{SITE.businessName}</p>
          <LampBar progress={progress} className="mt-7 w-56" />
          <Seg value={String(pct).padStart(3, '0')} label={`${pct}% loaded`} className="mt-4 text-lg" />
        </motion.div>
      </div>
    </div>
  )
}
