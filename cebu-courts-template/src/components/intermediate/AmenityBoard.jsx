import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react'
import { AMENITIES } from '../../config/site.js'
import { Housing, Stencil } from '../board/Board.jsx'

const CYCLE_MS = 1500
const LAG_MS = 190

/* One flip-chart card. The old page lifts over the top rings to reveal the next. */
function FlipCard({ word, flipKey, tone }) {
  const reduce = useReducedMotion()
  const colours = tone === 'a' ? 'bg-flip-a text-on-flip-a' : 'bg-flip-b text-on-flip-b'

  return (
    <div
      className="relative h-[clamp(7.5rem,19vw,13.5rem)] w-[clamp(9.5rem,37vw,24rem)]"
      style={{ perspective: '1200px' }}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={flipKey}
          className={`absolute inset-0 flex items-center justify-center rounded-xl ${colours}`}
          style={{
            transformOrigin: 'top center',
            backfaceVisibility: 'hidden',
            zIndex: 1,
            boxShadow: 'inset 0 -14px 22px -16px rgb(0 0 0 / 0.45), inset 0 1px 0 rgb(255 255 255 / 0.12)',
          }}
          exit={
            reduce
              ? { opacity: 0, transition: { duration: 0.2 } }
              : {
                  rotateX: 100,
                  zIndex: 5,
                  transition: { duration: 0.6, ease: [0.77, 0, 0.175, 1], zIndex: { duration: 0 } },
                }
          }
        >
          <span className="display select-none px-4 text-center uppercase leading-none tracking-tight text-[clamp(1.2rem,4.1vw,3.1rem)]">
            {word}
          </span>
        </motion.div>
      </AnimatePresence>

      {/* Binder rings */}
      <div className="pointer-events-none absolute inset-x-0 -top-4 z-10 flex justify-around px-[18%]" aria-hidden="true">
        {[0, 1, 2].map((r) => (
          <span key={r} className="h-6 w-3.5 rounded-full border-[3px] border-on-stage/55" />
        ))}
      </div>
    </div>
  )
}

export default function AmenityBoard() {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.2 })
  const [left, setLeft] = useState(0)
  const [right, setRight] = useState(0)

  // Auto-cycle every CYCLE_MS while on screen. Restarts the timer after a manual jump.
  useEffect(() => {
    if (!inView) return
    const t = setTimeout(() => setLeft((i) => (i + 1) % AMENITIES.length), CYCLE_MS)
    return () => clearTimeout(t)
  }, [left, inView])

  useEffect(() => {
    const t = setTimeout(() => setRight(left), LAG_MS)
    return () => clearTimeout(t)
  }, [left])

  const current = AMENITIES[left]

  return (
    <section id="amenities" className="overflow-hidden bg-surface py-28">
      <div className="mx-auto max-w-7xl px-6 text-center lg:pl-24">
        <h2 className="display text-6xl sm:text-7xl">What's here for you</h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-ink/70">
          Everything players and their companions need before, during, and after a game.
        </p>

        <div
          ref={ref}
          className="mt-16 flex flex-col items-center"
        >
          {/* Scoreboard stand */}
          <div className="relative">
            <Housing className="rounded-[1.6rem] px-3 pb-3 pt-11 sm:px-4 sm:pb-4 sm:pt-14">
              <Stencil className="absolute left-1/2 top-3.5 -translate-x-1/2 text-[0.7rem] text-on-stage/55 sm:top-4.5">
                Amenities
              </Stencil>
              <div className="flex gap-2 sm:gap-3">
                <FlipCard tone="a" flipKey={left} word={AMENITIES[left].board[0]} />
                <FlipCard tone="b" flipKey={right} word={AMENITIES[right].board[1]} />
              </div>
            </Housing>
            <div
              className="mx-auto h-5 w-[94%] bg-stage brightness-75"
              style={{ clipPath: 'polygon(3% 0, 97% 0, 100% 100%, 0 100%)' }}
              aria-hidden="true"
            />
          </div>

          {/* Caption for the amenity on the board */}
          <div className="mt-10 min-h-[4.5rem] max-w-md" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.div
                key={left}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
              >
                <p className="flex items-center justify-center gap-2 font-semibold">
                  <current.icon size={18} className="text-accent" aria-hidden="true" />
                  {current.name}
                  <span className="rounded-full border border-line px-2.5 py-0.5 text-xs font-normal text-ink/70">
                    {current.status}
                  </span>
                </p>
                <p className="mt-2 text-ink/70">{current.detail}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Jump to any amenity */}
          <div className="mt-6 flex flex-wrap justify-center gap-2" role="tablist" aria-label="Amenities">
            {AMENITIES.map((a, i) => (
              <button
                key={a.name}
                type="button"
                role="tab"
                aria-selected={i === left}
                aria-label={a.name}
                onClick={() => setLeft(i)}
                className={`h-2.5 rounded-full transition-[width,background-color] duration-300 ease-out ${
                  i === left ? 'w-8 bg-primary' : 'w-2.5 bg-ink/25 hover:bg-ink/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
