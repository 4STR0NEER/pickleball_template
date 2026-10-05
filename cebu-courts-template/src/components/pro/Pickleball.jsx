/*
  A rendered outdoor pickleball for the Pro loader. 40 holes sit on a real
  sphere and are projected each frame, so they foreshorten and slide around
  the limb as the ball turns. Lighting comes from the upper left.
  The logo is printed on the face and is the only part that leaves the ball.
*/
import { useEffect, useRef } from 'react'
import { LogoMark } from '../Brand.jsx'

const N = 40
const HOLE = 11.5 // hole radius in viewBox units (ball radius is 100), about a real 74mm ball's 8.5mm holes
const TILT = 0.42 // spin axis leans toward the viewer
const SPEED = 2.6 // radians per second

// Even spread over the sphere (Fibonacci lattice)
const HOLES = Array.from({ length: N }, (_, i) => {
  const y = 1 - ((i + 0.5) * 2) / N
  const r = Math.sqrt(1 - y * y)
  const phi = i * Math.PI * (3 - Math.sqrt(5))
  return [Math.cos(phi) * r, y, Math.sin(phi) * r]
})

function project(els, angle) {
  const ca = Math.cos(angle), sa = Math.sin(angle), ct = Math.cos(TILT), st = Math.sin(TILT)
  HOLES.forEach(([x, y, z], i) => {
    const el = els[i]
    if (!el) return
    const x1 = x * ca + z * sa
    const z1 = -x * sa + z * ca
    const y2 = y * ct - z1 * st
    const z2 = y * st + z1 * ct
    if (z2 <= 0.02) {
      el.setAttribute('opacity', '0')
      return
    }
    const deg = (Math.atan2(y2, x1) * 180) / Math.PI
    el.setAttribute('transform', `translate(${100 + x1 * 100} ${100 + y2 * 100}) rotate(${deg})`)
    el.setAttribute('rx', (HOLE * z2).toFixed(2)) // squashed along the radius near the edge
    el.setAttribute('opacity', Math.min(1, z2 / 0.22).toFixed(2))
  })
}

export default function Pickleball({ logoRef, bodyRef, spin = true, className = '' }) {
  const holes = useRef([])
  const parts = useRef([]) // shell and gloss: everything that fades when the logo flies off
  if (bodyRef) bodyRef.current = parts.current

  useEffect(() => {
    let angle = 0.6
    project(holes.current, angle)
    if (!spin) return
    let raf
    let last = performance.now()
    const tick = (now) => {
      angle += ((now - last) / 1000) * SPEED
      last = now
      project(holes.current, angle)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [spin])

  return (
    <div className={`relative aspect-square ${className}`}>
      {/* Body: shell and holes, under the print */}
      <div ref={(el) => (parts.current[0] = el)} className="absolute inset-0">
        <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
          <defs>
            <radialGradient id="pb-shell" cx="36%" cy="30%" r="78%">
              <stop offset="0%" stopColor="#f7ff9e" />
              <stop offset="30%" stopColor="#e2f23f" />
              <stop offset="68%" stopColor="#c1d424" />
              <stop offset="100%" stopColor="#7e8d0c" />
            </radialGradient>
            {/* Through a hole you see the hollow ball's shaded inner wall; the rim casts a crescent on the lit side */}
            <radialGradient id="pb-hole" cx="50%" cy="50%" r="50%" fx="66%" fy="50%">
              <stop offset="0%" stopColor="#7d8d0a" />
              <stop offset="62%" stopColor="#5b6703" />
              <stop offset="100%" stopColor="#323a00" />
            </radialGradient>
            <radialGradient id="pb-core" cx="72%" cy="80%" r="70%">
              <stop offset="0%" stopColor="#1d2100" stopOpacity="0.38" />
              <stop offset="100%" stopColor="#1d2100" stopOpacity="0" />
            </radialGradient>
            <clipPath id="pb-clip">
              <circle cx="100" cy="100" r="100" />
            </clipPath>
            <filter id="pb-grain" x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="7" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
          </defs>
          <circle cx="100" cy="100" r="100" fill="url(#pb-shell)" />
          <g clipPath="url(#pb-clip)">
            {HOLES.map((_, i) => (
              <ellipse key={i} ref={(el) => (holes.current[i] = el)} rx={HOLE} ry={HOLE} fill="url(#pb-hole)" stroke="#f4ffa8" strokeOpacity="0.45" strokeWidth="0.9" opacity="0" />
            ))}
          </g>
        </svg>
      </div>

      {/* Print: the client's logo, upright on the face */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span ref={logoRef} className="inline-flex scale-[0.72] text-[#2c3200] sm:scale-100">
          <LogoMark size="lg" tone="current" />
        </span>
      </div>

      {/* Light over everything on the ball: core shadow, grain, gloss */}
      <svg
        viewBox="0 0 200 200"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
        ref={(el) => (parts.current[1] = el)}
      >
        <g clipPath="url(#pb-clip)">
          <circle cx="100" cy="100" r="100" fill="url(#pb-core)" />
          <rect width="200" height="200" filter="url(#pb-grain)" opacity="0.07" style={{ mixBlendMode: 'multiply' }} />
          {/* Bounce light off the floor along the lower rim */}
          <circle cx="100" cy="100" r="98" fill="none" stroke="#fbffd0" strokeOpacity="0.28" strokeWidth="3" strokeDasharray="120 600" strokeDashoffset="-150" />
        </g>
        <ellipse cx="66" cy="54" rx="34" ry="22" transform="rotate(-32 66 54)" fill="white" opacity="0.32" style={{ filter: 'blur(6px)' }} />
        <ellipse cx="62" cy="50" rx="11" ry="6.5" transform="rotate(-32 62 50)" fill="white" opacity="0.85" style={{ filter: 'blur(1.6px)' }} />
      </svg>
    </div>
  )
}
