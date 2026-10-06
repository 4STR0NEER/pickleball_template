import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { SITE, SPORTS } from '../../config/site.js'
import { pad, peso } from '../../utils/date.js'
import { Housing, Stencil } from '../board/Board.jsx'
import SplitFlap from '../intermediate/SplitFlap.jsx'
import PhotoSlot from '../intermediate/PhotoSlot.jsx'
import SlideTextButton from '../kokonutui/slide-text-button.jsx'
import RollingSeg from './RollingSeg.jsx'

const OUT = [0.23, 1, 0.32, 1]
const TRAVEL = [0.77, 0, 0.175, 1]
const BOARD_SLOTS = 10
const boardName = (sport) => {
  const word = sport.name.split(' /')[0].toUpperCase().slice(0, BOARD_SLOTS)
  const left = Math.floor((BOARD_SLOTS - word.length) / 2)
  return ' '.repeat(left) + word + ' '.repeat(BOARD_SLOTS - word.length - left)
}

/* The pinned board: everything on it updates when the active sport changes */
function Board({ sport, index }) {
  const hours = `${pad(SITE.hours.open)}-${pad(SITE.hours.close)}`
  const readouts = [
    { label: 'Courts', value: pad(sport.courts.length), sr: `${sport.courts.length} courts` },
    { label: 'Regular ₱', value: String(sport.rate), sr: `Regular ${peso(sport.rate)} per hour` },
    { label: 'Peak ₱', value: String(sport.peakRate), sr: `Peak ${peso(sport.peakRate)} per hour` },
    { label: 'Open', value: hours, sr: SITE.hours.label },
  ]
  return (
    <Housing className="flex h-full flex-col rounded-[2rem] px-6 pb-6 pt-9 sm:px-8">
      <div className="flex items-center justify-between">
        <Stencil className="text-[0.72rem] text-on-stage/60">Courts</Stencil>
        <div className="flex gap-1.5" aria-hidden="true">
          {SPORTS.map((s, i) => (
            <span
              key={s.id}
              className="h-2 w-2 rounded-full transition-[background-color,box-shadow] duration-300 ease-out"
              style={{
                background: i === index ? 'var(--c-lamp)' : 'color-mix(in srgb, var(--c-lamp) 15%, transparent)',
                boxShadow: i === index ? '0 0 8px color-mix(in srgb, var(--c-lamp) 60%, transparent)' : 'none',
              }}
            />
          ))}
        </div>
      </div>

      <h3 className="mt-5 text-[clamp(1.6rem,2.6vw,2.4rem)]">
        <span className="sr-only">{sport.name}</span>
        <SplitFlap text={boardName(sport)} active settleBase={180} step={45} />
      </h3>

      <dl className="mt-7 grid grid-cols-2 gap-x-5 gap-y-5">
        {readouts.map((r) => (
          <div key={r.label}>
            <dt className="stencil text-[0.7rem] text-on-stage/60">{r.label}</dt>
            <dd className="readout mt-2 inline-flex rounded-lg px-3 py-2 text-2xl xl:text-3xl">
              <RollingSeg value={r.value} label={r.sr} />
            </dd>
          </div>
        ))}
      </dl>

      <ul key={sport.id} className="mt-7 space-y-2 border-t border-on-stage/10 pt-5 text-sm">
        {sport.courts.map((c, i) => (
          <motion.li
            key={c.id}
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.15 + i * 0.05, ease: OUT }}
          >
            <span className="h-2 w-2 shrink-0 rounded-full bg-lamp shadow-[0_0_6px_color-mix(in_srgb,var(--c-lamp)_60%,transparent)]" />
            <span className="font-semibold">{c.name}</span>
            <span className="ml-auto text-on-stage/60">{c.detail}</span>
          </motion.li>
        ))}
      </ul>

      <div className="mt-auto pt-7">
        <SlideTextButton
          to={`/booking?sport=${sport.id}`}
          text={`Book ${sport.name.split(' /')[0].toLowerCase()}`}
          hoverText="Pick a time"
          className="w-full"
        />
      </div>
    </Housing>
  )
}

/* One scrolling chapter per sport on the right */
function Chapter({ sport, index, onActive }) {
  const reduce = useReducedMotion()
  const ref = useRef(null)
  const ltr = index % 2 === 0
  // Active when the chapter crosses the middle of the screen
  const active = useInView(ref, { margin: '-45% 0px -45% 0px' })
  useEffect(() => {
    if (active) onActive(index)
  }, [active, index, onActive])

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const photoY = useTransform(scrollYProgress, [0, 1], ['-6%', '6%'])
  const ghostX = useTransform(scrollYProgress, [0, 1], ltr ? ['8%', '-22%'] : ['-22%', '8%'])

  const wipe = {
    hidden: { clipPath: ltr ? 'inset(0% 100% 0% 0% round 1.75rem)' : 'inset(0% 0% 0% 100% round 1.75rem)' },
    shown: { clipPath: 'inset(0% 0% 0% 0% round 1.75rem)', transition: { duration: 0.9, ease: TRAVEL } },
  }
  const line = (i) => ({
    hidden: { opacity: 0, y: 18 },
    shown: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.35 + i * 0.07, ease: OUT } },
  })

  return (
    <motion.article
      ref={ref}
      id={`court-${sport.id}`}
      className="relative flex min-h-[100svh] flex-col justify-center py-16"
      initial={reduce ? false : 'hidden'}
      whileInView="shown"
      viewport={{ once: true, amount: 0.35 }}
    >
      {/* Ghost lettering sliding with scroll */}
      <motion.p
        aria-hidden="true"
        className="display pointer-events-none absolute left-0 top-10 whitespace-nowrap text-[clamp(5rem,14vw,11rem)] text-ink/[0.06]"
        style={reduce ? undefined : { x: ghostX }}
      >
        {sport.name}
      </motion.p>

      <motion.div variants={wipe} className="relative aspect-[16/11] overflow-hidden rounded-[1.75rem]">
        <motion.div className="absolute -inset-y-[8%] inset-x-0" style={reduce ? undefined : { y: photoY }}>
          <PhotoSlot sport={sport.id} label={`Photo: ${sport.name.toLowerCase()} courts`} className="h-full" />
        </motion.div>
      </motion.div>

      <motion.h3 variants={line(0)} className="display mt-8 text-5xl sm:text-6xl">
        {sport.name}
      </motion.h3>
      <motion.p variants={line(1)} className="mt-4 max-w-xl text-lg leading-relaxed text-ink/75">
        {sport.summary}
      </motion.p>
      <motion.ul variants={line(2)} className="mt-6 flex flex-wrap gap-2">
        {sport.features.map((f) => (
          <li key={f} className="rounded-full bg-soft px-3 py-1.5 text-xs font-medium text-ink/85">
            {f}
          </li>
        ))}
      </motion.ul>
    </motion.article>
  )
}

/* Phone layout: swipe sideways through sports; the board strip follows the card in view */
function MobileCourts() {
  const trackRef = useRef(null)
  const [index, setIndex] = useState(0)
  const sport = SPORTS[index]

  const onScroll = () => {
    const el = trackRef.current
    const i = Math.round(el.scrollLeft / el.firstElementChild.offsetWidth)
    setIndex(Math.min(SPORTS.length - 1, Math.max(0, i)))
  }
  const goTo = (i) => {
    const el = trackRef.current
    el.scrollTo({ left: el.children[i].offsetLeft - el.offsetLeft - 16, behavior: 'smooth' })
  }

  return (
    <div className="pb-8 pt-10 lg:hidden">
      <div className="px-4 sm:px-6">
        <Housing screws={false} className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3">
          <div className="text-[1.15rem]">
            <SplitFlap text={boardName(sport)} active settleBase={180} step={45} />
          </div>
          <div className="readout rounded-md px-2.5 py-1.5 text-xl">
            <RollingSeg value={String(sport.rate)} label={`From ${peso(sport.rate)}`} />
          </div>
        </Housing>
      </div>

      <div
        ref={trackRef}
        onScroll={onScroll}
        className="mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-px-4 px-4 pb-2 [scrollbar-width:none] sm:scroll-px-6 sm:px-6 [&::-webkit-scrollbar]:hidden"
        aria-label="Sports"
      >
        {SPORTS.map((s) => (
          <article
            key={s.id}
            className="flex w-[86%] max-w-md shrink-0 snap-start flex-col overflow-hidden rounded-[1.75rem] border border-line bg-raised"
          >
            <PhotoSlot sport={s.id} label={`Photo: ${s.name.toLowerCase()} courts`} className="aspect-[16/11]" />
            <div className="flex flex-1 flex-col p-5">
              <h3 className="display text-4xl">{s.name}</h3>
              <p className="mt-3 text-base leading-relaxed text-ink/75">{s.summary}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {s.features.map((f) => (
                  <li key={f} className="rounded-full bg-soft px-3 py-1.5 text-xs font-medium text-ink/85">
                    {f}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-ink/70">
                {s.courts.length} courts · {peso(s.rate)}/hr · peak {peso(s.peakRate)}
              </p>
              <Link
                to={`/booking?sport=${s.id}`}
                className="mt-auto inline-flex items-center gap-1.5 pt-5 font-semibold text-primary"
              >
                Book {s.name.split(' /')[0].toLowerCase()}
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-4 flex justify-center gap-1" role="tablist" aria-label="Choose a sport">
        {SPORTS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={s.name}
            onClick={() => goTo(i)}
            className="flex h-8 w-8 items-center justify-center"
          >
            <span
              className="h-2 rounded-full transition-[width,background-color] duration-300 ease-out"
              style={{
                width: i === index ? '1.25rem' : '0.5rem',
                background: i === index ? 'var(--c-primary)' : 'color-mix(in srgb, var(--c-ink) 20%, transparent)',
              }}
            />
          </button>
        ))}
      </div>
    </div>
  )
}

/*
  Pro "sticky scoreboard": the board stays pinned while each sport's
  chapter scrolls past; readouts roll, the name flaps and court lamps
  relight whenever the active sport changes.
*/
export default function ScoreboardCourts() {
  const [index, setIndex] = useState(0)
  const onActive = useCallback((i) => setIndex(i), [])
  const sport = SPORTS[index]

  return (
    <section id="sports" className="relative bg-bg [overflow-anchor:none]">
      <div className="mx-auto max-w-7xl px-4 pt-24 sm:px-6 lg:pl-24">
        <h2 className="display text-6xl sm:text-7xl">The courts</h2>
        <p className="mt-5 max-w-xl text-lg text-ink/70">
          <span className="lg:hidden">Swipe</span><span className="hidden lg:inline">Scroll</span> through each sport. The board keeps score of courts, rates and hours as you go.
        </p>
      </div>

      {/* Phones: a board readout over a horizontal swipe, one card per sport */}
      <MobileCourts />

      <div className="mx-auto hidden max-w-7xl gap-14 px-6 pl-24 lg:grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        {/* Board: pinned beside the chapters */}
        <div className="sticky top-24 z-10 h-[calc(100svh-7.5rem)]">
          <Board sport={sport} index={index} />
        </div>

        <div id="courts">
          {SPORTS.map((s, i) => (
            <Chapter key={s.id} sport={s} index={i} onActive={onActive} />
          ))}
        </div>
      </div>
    </section>
  )
}
