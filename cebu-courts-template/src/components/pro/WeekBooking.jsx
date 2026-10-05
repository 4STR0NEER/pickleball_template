import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Check, CalendarX2 } from 'lucide-react'
import { motion } from 'motion/react'
import { useCart, slotId } from '../../context/CartContext.jsx'
import { getDay, getSport, priceFor, isPeak } from '../../data/availability.js'
import { addDays, fromKey, pad, peso, toKey } from '../../utils/date.js'
import { Housing, Seg, Stencil } from '../board/Board.jsx'
import SmoothTab from '../kokonutui/smooth-tab.jsx'

const OUT = [0.23, 1, 0.32, 1]
const hourLabel = (h) => `${h % 12 === 0 ? 12 : h % 12} ${h < 12 ? 'AM' : 'PM'}`

/* An open hour as a chip. Hover swipes colour in from the right edge; adding fills it. */
function HourChip({ hour, peak, price, inCart, onClick }) {
  return (
    <button
      type="button"
      aria-pressed={inCart}
      onClick={onClick}
      className={`group relative flex items-center justify-between gap-2 overflow-hidden rounded-xl border px-3 py-2.5 text-left active:scale-[0.97] transition-[border-color,transform] duration-160 ease-out ${
        inCart ? 'border-primary' : 'border-line hover:border-primary'
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-y-0 right-0 bg-primary transition-[width] ease-[cubic-bezier(0.65,0,0.35,1)] ${
          inCart ? 'w-full duration-[520ms]' : 'w-0 duration-[260ms] group-hover:w-8'
        }`}
      />
      <span className={`relative z-10 transition-colors duration-200 ${inCart ? 'text-on-primary delay-200' : 'text-ink'}`}>
        <span className="block text-sm font-semibold tabular-nums">{hourLabel(hour)}</span>
        <span className={`block text-[0.7rem] ${inCart ? 'opacity-80' : 'text-ink/55'}`}>
          {peso(price)}
          {peak ? ' peak' : ''}
        </span>
      </span>
      <span className={`relative z-10 transition-colors duration-200 ${inCart ? 'text-on-primary' : 'text-ink group-hover:text-on-primary'}`}>
        {inCart ? <Check size={15} aria-hidden="true" /> : <Plus size={15} aria-hidden="true" />}
      </span>
      <span className="sr-only">{inCart ? ', in cart. Select to remove' : ', add to cart'}</span>
    </button>
  )
}

function CourtCards({ sportId, dateKey }) {
  const { has, toggle } = useCart()
  const sport = getSport(sportId)
  const day = getDay(sportId, dateKey)
  const courts = sport.courts
    .map((c) => ({ ...c, hours: day.slots.filter((s) => s.free.includes(c.id)).map((s) => s.hour) }))
    .filter((c) => c.hours.length)

  if (!courts.length) {
    return (
      <div className="flex flex-col items-center rounded-3xl border border-line bg-raised px-8 py-16 text-center">
        <CalendarX2 size={32} className="text-accent" aria-hidden="true" />
        <p className="mt-4 font-semibold">No open times on this day</p>
        <p className="mt-2 text-sm text-ink/65">Pick another day in the strip.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {courts.map((c, i) => (
        <motion.section
          key={c.id}
          className="rounded-3xl border border-line bg-raised p-5"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 + i * 0.05, ease: OUT }}
          aria-label={c.name}
        >
          <div className="flex items-end justify-between gap-4">
            <div>
              <h3 className="display text-3xl">{c.name}</h3>
              <p className="mt-1 text-sm text-ink/60">{c.detail}</p>
            </div>
            <div className="housing rounded-lg px-2.5 py-1.5 text-right">
              <Stencil className="block text-[0.6rem] text-on-stage/60">Open</Stencil>
              <Seg value={pad(c.hours.length)} label={`${c.hours.length} open hours`} className="mt-1 text-lg" />
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {c.hours.map((h) => {
              const id = slotId({ sportId, dateKey, hour: h, courtId: c.id })
              const price = priceFor(sport, dateKey, h)
              return (
                <HourChip
                  key={h}
                  hour={h}
                  price={price}
                  peak={isPeak(dateKey, h)}
                  inCart={has(id)}
                  onClick={() => toggle({ id, sportId, dateKey, hour: h, courtId: c.id, courtName: c.name, price })}
                />
              )
            })}
          </div>
        </motion.section>
      ))}
    </div>
  )
}

/*
  Pro booking: a seven day strip (adapted Kokonut Smooth Tab) over court
  cards of open hours. Full days are greyed out and can't be picked.
*/
export default function WeekBooking({ sportId, firstKey, lastKey }) {
  const [weekStart, setWeekStart] = useState(firstKey)
  const [dayKey, setDayKey] = useState(null)

  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const key = toKey(addDays(fromKey(weekStart), i))
        const outside = key > lastKey
        const info = outside ? null : getDay(sportId, key)
        return { key, outside, full: outside || info.status === 'full', open: info?.freeCount ?? 0 }
      }),
    [weekStart, sportId, lastKey]
  )

  const selected = days.find((d) => d.key === dayKey && !d.full) ?? days.find((d) => !d.full)
  const canPrev = weekStart > firstKey
  const canNext = toKey(addDays(fromKey(weekStart), 7)) <= lastKey
  const shift = (n) => {
    setWeekStart((w) => {
      const next = toKey(addDays(fromKey(w), n * 7))
      return next < firstKey ? firstKey : next
    })
    setDayKey(null)
  }

  const range = `${fromKey(days[0].key).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })} to ${fromKey(days[6].key).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}`

  const items = days.map((d) => {
    const date = fromKey(d.key)
    return {
      id: d.key,
      disabled: d.full,
      label: (
        <>
          <span className="stencil text-[0.68rem] opacity-80">{date.toLocaleDateString('en-PH', { weekday: 'short' })}</span>
          <span className="display mt-1 text-2xl leading-none">{date.getDate()}</span>
        </>
      ),
      sub: <span className="mt-1 text-[0.65rem] opacity-75">{d.outside ? 'Closed' : d.full ? 'Full' : `${d.open} open`}</span>,
    }
  })

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="display text-3xl">{range}</p>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => shift(-1)}
            disabled={!canPrev}
            aria-label="Previous week"
            className="rounded-full p-2 text-ink/75 transition-colors duration-160 hover:bg-ink/10 hover:text-ink active:scale-[0.97] disabled:opacity-30"
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => shift(1)}
            disabled={!canNext}
            aria-label="Next week"
            className="rounded-full p-2 text-ink/75 transition-colors duration-160 hover:bg-ink/10 hover:text-ink active:scale-[0.97] disabled:opacity-30"
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>
      </div>

      {selected ? (
        <SmoothTab
          key={`${sportId}-${weekStart}`}
          ariaLabel="Day"
          items={items}
          value={selected.key}
          onChange={setDayKey}
          renderPanel={(key) => <CourtCards sportId={sportId} dateKey={key} />}
        />
      ) : (
        <p className="rounded-3xl border border-line bg-raised p-8 text-center text-ink/70">
          Every day this week is fully booked. Try the next week.
        </p>
      )}
    </div>
  )
}
