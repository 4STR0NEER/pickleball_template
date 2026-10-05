import { useEffect, useState } from 'react'
import { LogoMark } from './Brand.jsx'
import { SITE } from '../config/site.js'
import LampBar from './board/LampBar.jsx'
import { Seg } from './board/Board.jsx'

/* Basic tier: the board powering up. Lamps fill with progress; nothing else moves. */
export default function Loader({ onDone, duration = 5000 }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let raf
    const start = performance.now()
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration)
      setProgress(p)
      if (p < 1) raf = requestAnimationFrame(tick)
      else onDone()
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [duration, onDone])

  const pct = Math.round(progress * 100)

  return (
    <div
      className="loader-stage fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-on-stage"
      role="status"
      aria-live="polite"
    >
      <LogoMark size="lg" tone="current" />
      <p className="display mt-6 text-3xl">{SITE.businessName}</p>
      <LampBar progress={progress} className="mt-8 w-64" />
      <Seg value={String(pct).padStart(3, '0')} label={`${pct}% loaded`} className="mt-4 text-lg" />
    </div>
  )
}
