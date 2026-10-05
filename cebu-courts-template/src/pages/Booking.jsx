import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { SITE, SPORTS } from '../config/site.js'
import { BrandLockup } from '../components/Brand.jsx'
import SportTabs from '../components/booking/SportTabs.jsx'
import Calendar from '../components/booking/Calendar.jsx'
import SlotTable from '../components/booking/SlotTable.jsx'
import { getDay } from '../data/availability.js'
import { addDays, toKey } from '../utils/date.js'
import { useShowcase } from '../context/ShowcaseContext.jsx'
import SiteHeader from '../components/intermediate/SiteHeader.jsx'
import WeekBooking from '../components/pro/WeekBooking.jsx'

export default function Booking() {
  const { tier } = useShowcase()
  const fx = tier !== 'basic'
  const [params, setParams] = useSearchParams()
  const requested = params.get('sport')
  const sportId = SPORTS.some((s) => s.id === requested) ? requested : SPORTS[0].id

  const { firstKey, lastKey } = useMemo(() => {
    const today = new Date()
    return { firstKey: toKey(today), lastKey: toKey(addDays(today, SITE.bookingWindowDays)) }
  }, [])

  // Open on next month when fewer than a week of bookable days remain in this one
  const [month, setMonth] = useState(() => {
    const t = new Date()
    const daysLeft = new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate() - t.getDate() + 1
    return new Date(t.getFullYear(), t.getMonth() + (daysLeft < 7 ? 1 : 0), 1)
  })
  const [selectedKey, setSelectedKey] = useState(firstKey)
  const panelRef = useRef(null)

  const setSport = (id) => setParams({ sport: id }, { replace: true })

  const changeMonth = (delta) => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1))

  const selectDate = (key) => {
    setSelectedKey(key)
    if (window.innerWidth < 1024) {
      requestAnimationFrame(() => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    }
  }

  // Full days can't be picked, so step forward to the next open one
  useEffect(() => {
    if (getDay(sportId, selectedKey).status !== 'full') return
    for (let d = new Date(); toKey(d) <= lastKey; d = addDays(d, 1)) {
      const k = toKey(d)
      if (getDay(sportId, k).status !== 'full') {
        setSelectedKey(k)
        return
      }
    }
  }, [sportId, selectedKey, lastKey])

  useEffect(() => {
    document.title = `Book a court | ${SITE.businessName}`
    return () => {
      document.title = `${SITE.businessName} | Courts & Booking`
    }
  }, [])

  return (
    <>
    {fx && <SiteHeader />}
    <main className="min-h-screen bg-bg pb-28">
      <div className={`mx-auto max-w-7xl px-6 lg:pl-24 ${fx ? 'pt-28' : 'pt-8'}`}>
        {!fx && (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <BrandLockup size="sm" />
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-ink/70 hover:text-ink">
              <ArrowLeft size={16} aria-hidden="true" />
              Back to home
            </Link>
          </div>
        )}

        <h1 className={`display text-5xl sm:text-6xl ${fx ? 'mt-6' : 'mt-14'}`}>Book a court</h1>
        <p className="mt-4 max-w-xl text-lg text-ink/70">
          Choose a sport, pick a day, then add the times and courts you want to your cart.
        </p>

        <div className="mt-10">
          <SportTabs value={sportId} onChange={setSport} />
        </div>

        {tier === 'pro' ? (
          <WeekBooking sportId={sportId} firstKey={firstKey} lastKey={lastKey} />
        ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-start">
          <div className="rounded-3xl border border-line bg-raised p-5 sm:p-7">
            <div className="flex flex-col gap-8 md:flex-row">
              <div className="flex-1">
                <Calendar
                  sportId={sportId}
                  month={month}
                  onMonthChange={changeMonth}
                  selectedKey={selectedKey}
                  onSelect={selectDate}
                  firstKey={firstKey}
                  lastKey={lastKey}
                />
              </div>
            </div>
          </div>

          <div
            ref={panelRef}
            className="flex scroll-mt-6 flex-col overflow-hidden rounded-3xl border border-line bg-raised lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)]"
          >
            <SlotTable sportId={sportId} dateKey={selectedKey} />
          </div>
        </div>
        )}
      </div>
    </main>
    </>
  )
}
