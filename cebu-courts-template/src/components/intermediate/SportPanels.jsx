import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { SPORTS } from '../../config/site.js'
import { peso } from '../../utils/date.js'
import useMediaQuery from '../../hooks/useMediaQuery.js'
import PhotoSlot from './PhotoSlot.jsx'
import { Seg, Stencil } from '../board/Board.jsx'

// Panels travel on screen: ease-in-out
const EASE = 'cubic-bezier(0.77, 0, 0.175, 1)'

function courtTypes(sport) {
  const counts = {}
  sport.courts.forEach((c) => (counts[c.detail] = (counts[c.detail] ?? 0) + 1))
  return Object.entries(counts).map(([detail, n]) => `${n} ${detail.toLowerCase()}`)
}

function SportPanel({ sport, state, onActivate, interactive }) {
  const expanded = state === 'expanded'
  const compressed = state === 'compressed'
  const grow = expanded ? 2.7 : compressed ? 0.62 : 1

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  return (
    <Link
      to={`/booking?sport=${sport.id}`}
      onMouseEnter={onActivate}
      onFocus={onActivate}
      onMouseMove={interactive ? onMove : undefined}
      aria-label={`${sport.name}: ${sport.courts.length} courts from ${peso(sport.rate)} per hour. Book now`}
      className="group relative block h-[30rem] min-w-0 overflow-hidden rounded-[1.75rem] bg-stage text-on-stage md:h-auto"
      // Flex sizing only applies to the desktop row; stacked mobile panels keep their fixed height
      style={interactive ? { flexGrow: grow, flexBasis: 0, transition: `flex-grow 850ms ${EASE}` } : undefined}
    >
      <div className="absolute inset-0">
        <PhotoSlot sport={sport.id} label={`Photo: ${sport.name.toLowerCase()} courts`} className="h-full" />
      </div>

      {/* Legibility wash */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(to top, color-mix(in srgb, var(--c-stage) 94%, transparent) 0%, color-mix(in srgb, var(--c-stage) 55%, transparent) 45%, transparent 80%)',
        }}
      />

      {/* Cursor light */}
      {interactive && (
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              'radial-gradient(520px circle at var(--mx, 50%) var(--my, 50%), color-mix(in srgb, var(--c-glow-1) 28%, transparent), transparent 65%)',
          }}
        />
      )}

      {/* Vertical name shown while squeezed */}
      <span
        className="display absolute bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-3xl [writing-mode:vertical-rl] rotate-180 transition-opacity duration-500"
        style={{ opacity: compressed ? 1 : 0, transitionDelay: compressed ? '250ms' : '0ms' }}
        aria-hidden="true"
      >
        {sport.name}
      </span>

      <div
        className="absolute inset-x-0 bottom-0 p-7 transition-opacity duration-500 lg:p-10"
        style={{ opacity: compressed ? 0 : 1, transitionDelay: compressed ? '0ms' : '200ms' }}
      >
        <Stencil className="block text-xs text-on-stage/70">
          {sport.courts.length} {sport.courts.length === 1 ? 'court' : 'courts'}
        </Stencil>
        <h3 className="display mt-2 max-w-[30rem] text-5xl lg:text-6xl">{sport.name}</h3>

        {/* Details open with a height transition; fixed width so text never reflows mid-animation */}
        <div
          className="grid transition-[grid-template-rows,opacity] duration-700"
          style={{
            gridTemplateRows: expanded ? '1fr' : '0fr',
            opacity: expanded ? 1 : 0,
            transitionTimingFunction: EASE,
            transitionDelay: expanded ? '180ms' : '0ms',
          }}
        >
          <div className="overflow-hidden">
            <div className="w-[min(30rem,calc(100vw-5rem))] pt-5">
              <p className="leading-relaxed opacity-80">{sport.summary}</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {courtTypes(sport).map((t) => (
                  <li key={t} className="rounded-full bg-on-stage/12 px-3 py-1.5 text-xs font-medium ring-1 ring-on-stage/15">
                    {t}
                  </li>
                ))}
              </ul>
              <div className="mt-7 flex flex-wrap items-center gap-5">
                <span className="inline-flex items-center gap-2 rounded-full bg-lamp px-5 py-3 text-sm font-semibold text-stage shadow-[inset_0_-3px_0_rgb(0_0_0/0.22)] transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-active:scale-[0.97]">
                  Book now
                  <ArrowUpRight size={16} aria-hidden="true" />
                </span>
                <span className="flex items-center gap-3">
                  <Stencil className="text-xs text-on-stage/70">From ₱</Stencil>
                  <span className="readout inline-flex rounded-md px-2.5 py-1.5 text-xl">
                    <Seg value={sport.rate} label={`${peso(sport.rate)} per hour`} />
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function SportPanels() {
  const [active, setActive] = useState(null)
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const stateFor = (i) => {
    if (!isDesktop) return 'expanded'
    if (active === null) return 'idle'
    return active === i ? 'expanded' : 'compressed'
  }

  return (
    <section id="sports" className="bg-bg pb-4 pt-24 [overflow-anchor:none]">
      <div className="mx-auto max-w-7xl px-6 lg:pl-24">
        <h2 className="display text-6xl sm:text-7xl">Pick your game</h2>
        <p className="mt-4 max-w-xl text-lg text-ink/70">
          {isDesktop
            ? 'Hover a sport to see what is waiting on court. Click to check open times.'
            : 'Tap a sport to check open times.'}
        </p>
      </div>

      <div
        className="mt-12 flex flex-col gap-3 px-3 sm:px-4 md:h-[82vh] md:min-h-[34rem] md:flex-row"
        onMouseLeave={() => setActive(null)}
      >
        {SPORTS.map((sport, i) => (
          <SportPanel
            key={sport.id}
            sport={sport}
            state={stateFor(i)}
            interactive={isDesktop}
            onActivate={() => isDesktop && setActive(i)}
          />
        ))}
      </div>
    </section>
  )
}
