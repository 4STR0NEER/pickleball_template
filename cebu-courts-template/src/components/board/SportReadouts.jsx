import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { SPORTS } from '../../config/site.js'
import { nextOpening } from '../../data/availability.js'
import { formatHour } from '../../utils/date.js'
import { Seg, Stencil } from './Board.jsx'

/*
  First viewport proof: how many courts are free at the next open hour,
  per sport. Each module is the way into booking for that sport.
*/
export default function SportReadouts({ fx = false, className = '' }) {
  return (
    <ul className={`grid gap-2.5 sm:grid-cols-3 sm:gap-3 ${className}`}>
      {SPORTS.map((sport) => {
        const next = nextOpening(sport.id)
        const count = String(next?.count ?? 0).padStart(2, '0')
        const when = next ? `${next.isToday ? 'today' : 'tomorrow'}, ${formatHour(next.hour)}` : 'fully booked'
        return (
          <li key={sport.id}>
            <Link
              to={`/booking?sport=${sport.id}`}
              aria-label={`${sport.name}: ${next?.count ?? 0} courts open ${when}. Book`}
              className={`group readout flex items-center justify-between gap-4 rounded-2xl px-5 py-4 text-left active:scale-[0.98] ${
                fx ? 'transition-[transform,background-color] duration-200 ease-out hover:bg-black/10' : ''
              }`}
            >
              <span className="min-w-0">
                <Stencil className="block truncate text-sm text-on-stage/80">{sport.name}</Stencil>
                <span className="mt-1.5 block text-xs text-on-stage/60">Courts open {when}</span>
              </span>
              <span className="flex items-center gap-3">
                <Seg value={count} className="text-4xl" />
                <ArrowUpRight
                  size={18}
                  aria-hidden="true"
                  className={`text-on-stage/50 ${fx ? 'transition-[transform,color] duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-lamp' : ''}`}
                />
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
