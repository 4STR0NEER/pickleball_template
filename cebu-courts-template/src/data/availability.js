/*
  Mock availability. Front-end only: every sport + date gets a deterministic,
  seeded set of bookings so the calendar looks realistic and stays consistent
  between renders. Replace getDay() with a real API call when a backend exists.
*/
import { SITE, SPORTS } from '../config/site.js'
import { addDays, fromKey, toKey } from '../utils/date.js'

export const HOURS = Array.from({ length: SITE.hours.close - SITE.hours.open }, (_, i) => SITE.hours.open + i)

/* Status levels. Colours are fixed traffic-light tones so they read the same on every palette. */
export const STATUS = {
  open: { label: 'Wide open', range: '80% or more free', color: '#3E9E63' },
  half: { label: 'Half booked', range: '50–79% free', color: '#E2B33A' },
  low: { label: 'Filling up', range: 'Under 50% free', color: '#E0782F' },
  full: { label: 'Fully booked', range: 'No slots left', color: '#C8423B' },
}

export function statusFor(ratio) {
  if (ratio <= 0) return 'full'
  if (ratio < 0.5) return 'low'
  if (ratio < 0.8) return 'half'
  return 'open'
}

export const getSport = (id) => SPORTS.find((s) => s.id === id) ?? SPORTS[0]

export function isPeak(dateKey, hour) {
  const dow = fromKey(dateKey).getDay()
  const weekend = dow === 0 || dow === 6
  return (SITE.peak.weekends && weekend) || hour >= SITE.peak.fromHour
}

export const priceFor = (sport, dateKey, hour) => (isPeak(dateKey, hour) ? sport.peakRate : sport.rate)

/* ---------- seeded random ---------- */

function hashString(str) {
  let h = 1779033703 ^ str.length
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return h >>> 0
}

function mulberry32(seed) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const cache = new Map()

export function getDay(sportId, dateKey) {
  const now = new Date()
  const isToday = dateKey === toKey(now)
  const cacheKey = `${sportId}|${dateKey}|${isToday ? now.getHours() : ''}`
  if (cache.has(cacheKey)) return cache.get(cacheKey)

  const sport = getSport(sportId)
  const rand = mulberry32(hashString(`${sportId}|${dateKey}`))
  const dow = fromKey(dateKey).getDay()
  const weekend = dow === 0 || dow === 6

  // Roughly one day in ten is fully booked; weekends run busier.
  const load = rand() < 0.1 ? 1 : rand() * 0.62 + (weekend ? 0.16 : 0)

  const slots = HOURS.map((hour) => {
    const weight = hour >= 17 && hour <= 20 ? 1.35 : hour >= 11 && hour <= 14 ? 0.6 : 1
    const free = sport.courts
      .filter(() => {
        const booked = load >= 1 || rand() < load * weight
        const past = isToday && hour <= now.getHours()
        return !booked && !past
      })
      .map((c) => c.id)
    return { hour, free }
  })

  const total = HOURS.length * sport.courts.length
  const freeCount = slots.reduce((n, s) => n + s.free.length, 0)
  const ratio = freeCount / total
  const day = { slots, total, freeCount, ratio, status: statusFor(ratio) }

  cache.set(cacheKey, day)
  return day
}

/* The next hour with a free court for a sport, looking up to three days ahead */
export function nextOpening(sportId) {
  const now = new Date()
  for (let d = 0; d < 3; d++) {
    const dateKey = toKey(addDays(now, d))
    const slot = getDay(sportId, dateKey).slots.find((s) => s.free.length > 0)
    if (slot) return { dateKey, hour: slot.hour, count: slot.free.length, isToday: d === 0 }
  }
  return null
}
