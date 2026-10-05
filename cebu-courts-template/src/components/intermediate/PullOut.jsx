import { useEffect, useRef, useState } from 'react'
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react'
import { SITE } from '../../config/site.js'
import { peso } from '../../utils/date.js'
import Button from '../Button.jsx'
import PhotoSlot from './PhotoSlot.jsx'
import { Housing, Readout } from '../board/Board.jsx'
import { pad } from '../../utils/date.js'

const SOFT = [0.22, 1, 0.36, 1]
const PEEK = 25 // % of the panel that scrolling pulls out before it glides the rest of the way
const shortHour = (h) => `${h % 12 === 0 ? 12 : h % 12} ${h < 12 ? 'AM' : 'PM'}`

/*
  Full-screen detail panel for one sport.
  Scrolling pulls it out progressively (up to PEEK%). Once its top edge
  reaches the middle of the screen it glides out fully on its own, then
  the details settle in. Plays once per page load.
  Even index sweeps left to right, odd index right to left.
*/
export default function PullOut({ sport, index }) {
  const reduce = useReducedMotion()
  const ltr = index % 2 === 0
  const dir = ltr ? -1 : 1
  const sectionRef = useRef(null)
  const doneRef = useRef(false)
  const [done, setDone] = useState(false)

  // 0 when the section's top enters the bottom of the screen, 1 when it reaches the middle
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'start center'] })
  const smooth = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 })
  const reveal = useMotionValue(0) // 0 to 100, percent of the panel uncovered

  const finish = () => {
    if (doneRef.current) return
    doneRef.current = true
    setDone(true)
    animate(reveal, 100, reduce ? { duration: 0 } : { duration: 1.2, ease: SOFT })
  }

  // Scroll-linked pull, capped at PEEK
  useMotionValueEvent(smooth, 'change', (p) => {
    if (!doneRef.current) reveal.set(Math.min(Math.max(p, 0), 1) * PEEK)
  })

  // Near screen centre: glide out the rest of the way, once
  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    if (p >= 0.98) finish()
  })

  // Reduced motion, or a refresh partway down the page
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (reduce || scrollYProgress.get() >= 0.98) finish()
    })
    return () => cancelAnimationFrame(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce])

  const clipPath = useTransform(reveal, (r) =>
    ltr ? `inset(0% ${100 - r}% 0% 0% round 2rem)` : `inset(0% 0% 0% ${100 - r}% round 2rem)`
  )
  const x = useTransform(reveal, [0, 100], [dir * 70, 0])

  const photo = (i) => ({
    hidden: { scale: 1.06 },
    shown: { scale: 1, transition: { delay: i * 0.1, duration: 1.2, ease: SOFT } },
  })

  const detail = (i) => ({
    hidden: { opacity: 0, x: dir * 36 },
    shown: { opacity: 1, x: 0, transition: { delay: 0.55 + i * 0.09, duration: 0.8, ease: SOFT } },
  })

  return (
    <motion.section
      ref={sectionRef}
      className="flex min-h-[100svh] p-3 sm:p-4"
      aria-labelledby={`pullout-${sport.id}`}
      initial="hidden"
      animate={done ? 'shown' : 'hidden'}
    >
      <motion.div
        className="grid w-full overflow-hidden rounded-[2rem] border border-line bg-raised md:grid-cols-[1.12fr_1fr]"
        style={{ clipPath, x }}
      >
        {/* Photos */}
        <div className={`grid h-[60svh] grid-rows-[1.7fr_1fr] gap-3 p-3 md:h-auto ${ltr ? 'md:order-1' : 'md:order-2'}`}>
          <motion.div variants={photo(0)} className="min-h-0">
            <PhotoSlot sport={sport.id} label="Main court photo" centered className="h-full rounded-[1.5rem]" />
          </motion.div>
          <div className="grid min-h-0 grid-cols-2 gap-3">
            <motion.div variants={photo(1)} className="min-h-0">
              <PhotoSlot sport={sport.id} label="Detail photo" centered diagram={false} className="h-full rounded-[1.5rem]" />
            </motion.div>
            <motion.div variants={photo(2)} className="min-h-0">
              <PhotoSlot sport={sport.id} label="Players in action" centered diagram={false} className="h-full rounded-[1.5rem]" />
            </motion.div>
          </div>
        </div>

        {/* Details */}
        <div className={`flex flex-col justify-center p-8 sm:p-12 lg:p-16 ${ltr ? 'md:order-2' : 'md:order-1'}`}>
          <motion.h2 variants={detail(0)} id={`pullout-${sport.id}`} className="display text-6xl lg:text-8xl">
            {sport.name}
          </motion.h2>
          <motion.p variants={detail(1)} className="mt-5 max-w-lg text-lg leading-relaxed text-ink/75">
            {sport.summary}
          </motion.p>

          <motion.div variants={detail(2)}>
            <Housing screws={false} className="mt-9 grid grid-cols-2 gap-x-6 gap-y-6 rounded-2xl px-6 py-6">
              <Readout label="Regular ₱" value={sport.rate} caption="Per court, per hour" srLabel={`Regular ${peso(sport.rate)} per hour`} />
              <Readout label="Peak ₱" value={sport.peakRate} caption="From 5 PM and weekends" srLabel={`Peak ${peso(sport.peakRate)} per hour`} />
              <Readout
                label="Open"
                value={`${pad(SITE.hours.open)}-${pad(SITE.hours.close)}`}
                caption={`${shortHour(SITE.hours.open)} to ${shortHour(SITE.hours.close)}, every day`}
                srLabel={SITE.hours.label}
              />
              <Readout
                label="Courts"
                value={pad(sport.courts.length)}
                caption={sport.courts.length === 1 ? 'Full-size' : 'Bookable separately'}
              />
            </Housing>
          </motion.div>

          <motion.ul variants={detail(3)} className="mt-7 space-y-2.5 text-sm">
            {sport.courts.map((c) => (
              <li key={c.id} className="flex justify-between gap-4">
                <span className="font-semibold">{c.name}</span>
                <span className="text-ink/65">{c.detail}</span>
              </li>
            ))}
          </motion.ul>

          <motion.ul variants={detail(4)} className="mt-6 flex flex-wrap gap-2">
            {sport.features.map((f) => (
              <li key={f} className="rounded-full bg-soft px-3 py-1.5 text-xs font-medium text-ink/85">
                {f}
              </li>
            ))}
          </motion.ul>

          <motion.div variants={detail(5)} className="mt-9">
            <Button to={`/booking?sport=${sport.id}`}>Book {sport.name.split(' /')[0].toLowerCase()}</Button>
          </motion.div>
        </div>
      </motion.div>
    </motion.section>
  )
}
