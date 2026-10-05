import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getDay } from '../../data/availability.js'
import { formatMonth, toKey } from '../../utils/date.js'
import { useShowcase } from '../../context/ShowcaseContext.jsx'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function Calendar({ sportId, month, onMonthChange, selectedKey, onSelect, firstKey, lastKey }) {
  const fx = useShowcase().tier !== 'basic'
  const y = month.getFullYear()
  const m = month.getMonth()
  const offset = new Date(y, m, 1).getDay()
  const daysInMonth = new Date(y, m + 1, 0).getDate()

  const firstMonth = firstKey.slice(0, 7)
  const lastMonth = lastKey.slice(0, 7)
  const thisMonth = toKey(month).slice(0, 7)
  const canPrev = thisMonth > firstMonth
  const canNext = thisMonth < lastMonth

  const cells = [...Array(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="display text-2xl sm:text-3xl">{formatMonth(month)}</h2>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onMonthChange(-1)}
            disabled={!canPrev}
            className="rounded-full p-2 text-ink/75 hover:bg-ink/10 hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent"
            aria-label="Previous month"
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onMonthChange(1)}
            disabled={!canNext}
            className="rounded-full p-2 text-ink/75 hover:bg-ink/10 hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent"
            aria-label="Next month"
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-1.5 sm:gap-2" role="grid">
        {WEEKDAYS.map((d) => (
          <div key={d} className="pb-1 text-center text-xs font-medium text-ink/55" role="columnheader">
            {d}
          </div>
        ))}

        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />
          const key = toKey(new Date(y, m, day))
          const outside = key < firstKey || key > lastKey

          if (outside) {
            return (
              <div
                key={key}
                className="flex aspect-square items-start justify-start rounded-xl border border-line/60 p-2 text-sm text-ink/30 sm:aspect-[1/0.9]"
                aria-disabled="true"
              >
                {day}
              </div>
            )
          }

          const info = getDay(sportId, key)
          const selected = key === selectedKey
          const full = info.status === 'full'

          // Full days are greyed out and can't be picked. Intermediate adds hover motion.
          return (
            <button
              key={key}
              type="button"
              role="gridcell"
              disabled={full}
              aria-selected={selected}
              onClick={() => onSelect(key)}
              aria-label={`${key}, ${full ? 'fully booked' : `${info.freeCount} slots open`}`}
              className={`flex aspect-square flex-col justify-between rounded-xl border p-2 text-left sm:aspect-[1/0.9] ${
                fx ? 'transition-[transform,background-color,border-color,box-shadow] duration-300 ease-out' : ''
              } ${
                full
                  ? 'cursor-not-allowed border-transparent bg-ink/5 text-ink/30'
                  : selected
                    ? `border-primary bg-primary text-on-primary ${fx ? 'shadow-[0_12px_24px_-14px_var(--c-primary)]' : ''}`
                    : `border-line bg-raised hover:border-ink/40 ${
                        fx ? 'hover:-translate-y-0.5 hover:shadow-[0_10px_20px_-12px_rgb(0_0_0/0.35)]' : ''
                      }`
              }`}
            >
              <span className="text-sm font-semibold">{day}</span>
              <span className={`hidden text-[0.7rem] leading-none sm:block ${full || selected ? 'opacity-80' : 'text-ink/55'}`}>
                {full ? 'Full' : `${info.freeCount} open`}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
