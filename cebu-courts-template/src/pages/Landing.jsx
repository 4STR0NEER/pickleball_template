import { Clock, Car, Snowflake, UtensilsCrossed, MapPin, Phone, Mail, Globe, Navigation } from 'lucide-react'
import { SITE, SPORTS, AMENITIES, TOTAL_COURTS } from '../config/site.js'
import { BrandLockup } from '../components/Brand.jsx'
import Button from '../components/Button.jsx'
import PhotoPlaceholder from '../components/PhotoPlaceholder.jsx'
import { Housing, Readout, Seg, Stencil } from '../components/board/Board.jsx'
import SportReadouts from '../components/board/SportReadouts.jsx'
import { pad, peso } from '../utils/date.js'

/* Basic tier landing page: the scoreboard world with no motion. */

export const HOURS_VALUE = `${pad(SITE.hours.open)}-${pad(SITE.hours.close)}`

/* Small readouts for the top strip of a board */
export function BoardStatus({ className = '' }) {
  return (
    <div className={`flex gap-3 ${className}`}>
      <Readout size="sm" label="Open" value={HOURS_VALUE} srLabel={SITE.hours.label} />
      <Readout size="sm" label="Courts" value={pad(TOTAL_COURTS)} srLabel={`${TOTAL_COURTS} courts`} />
    </div>
  )
}

function Hero() {
  return (
    <section className="p-3 sm:p-4">
      <Housing className="flex min-h-[calc(100svh-1.5rem)] flex-col rounded-[2rem] px-5 pb-6 pt-8 sm:min-h-[calc(100svh-2rem)] sm:px-10 sm:pb-10">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <BrandLockup tone="stage" />
          <BoardStatus className="hidden sm:flex" />
        </div>

        <div className="flex flex-1 flex-col items-center justify-center py-14 text-center">
          <h1 className="display text-balance text-[clamp(3.5rem,10vw,6rem)]">{SITE.headline}</h1>
          <p className="mt-7 max-w-[36rem] text-balance text-lg leading-relaxed text-on-stage/75 sm:text-xl">
            {SITE.subheadline}
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button to="/booking" variant="lamp">
              Book a court
            </Button>
            <Button href="#courts" variant="ghostStage">
              See the courts
            </Button>
          </div>
        </div>

        <SportReadouts />
      </Housing>
    </section>
  )
}

function QuickFacts() {
  const facts = [
    { icon: Clock, text: SITE.hours.label },
    { icon: Car, text: 'Free parking on site' },
    { icon: Snowflake, text: 'Air-conditioned indoor courts' },
    { icon: UtensilsCrossed, text: 'Food stalls nearby' },
  ]
  return (
    <ul className="mx-auto grid max-w-6xl gap-x-8 gap-y-4 px-6 py-8 sm:grid-cols-2 lg:grid-cols-4 lg:pl-24">
      {facts.map(({ icon: Icon, text }) => (
        <li key={text} className="flex items-center gap-3 text-sm font-medium">
          <Icon size={18} className="shrink-0 text-accent" aria-hidden="true" />
          {text}
        </li>
      ))}
    </ul>
  )
}

function Courts() {
  return (
    <section id="courts" className="bg-bg pb-24 pt-20">
      <div className="mx-auto max-w-6xl px-6 lg:pl-24">
        <h2 className="display text-6xl sm:text-7xl">Our courts</h2>
        <p className="mt-5 max-w-xl text-lg text-ink/70">
          Every court can be booked by the hour. Check a sport to see which courts are open today.
        </p>

        <div className="mt-14">
          {SPORTS.map((sport) => (
            <article
              key={sport.id}
              className="grid gap-10 border-t border-line py-14 first:border-t-0 first:pt-0 md:grid-cols-[1.1fr_1fr] md:items-center"
            >
              <PhotoPlaceholder sport={sport.id} className="aspect-16/11" />

              <div>
                <h3 className="display text-5xl">{sport.name}</h3>
                <p className="mt-4 leading-relaxed text-ink/75">{sport.summary}</p>

                <Housing screws={false} className="mt-7 flex flex-wrap gap-x-7 gap-y-4 rounded-2xl px-5 py-4">
                  <Readout size="sm" label="Courts" value={pad(sport.courts.length)} />
                  <Readout size="sm" label="Regular ₱" value={sport.rate} srLabel={`Regular ${peso(sport.rate)} per hour`} />
                  <Readout size="sm" label="Peak ₱" value={sport.peakRate} srLabel={`Peak ${peso(sport.peakRate)} per hour`} />
                </Housing>

                <ul className="mt-6 space-y-2 text-sm">
                  {sport.courts.map((c) => (
                    <li key={c.id} className="flex justify-between gap-4">
                      <span className="font-semibold">{c.name}</span>
                      <span className="text-ink/65">{c.detail}</span>
                    </li>
                  ))}
                </ul>

                <ul className="mt-5 flex flex-wrap gap-2">
                  {sport.features.map((f) => (
                    <li key={f} className="rounded-full bg-soft px-3 py-1.5 text-xs font-medium text-ink/85">
                      {f}
                    </li>
                  ))}
                </ul>

                <Button to={`/booking?sport=${sport.id}`} className="mt-8">
                  Check {sport.name.split(' /')[0].toLowerCase()} times
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Amenities() {
  return (
    <section id="amenities" className="bg-surface py-24">
      <div className="mx-auto max-w-6xl px-6 lg:pl-24">
        <h2 className="display text-6xl sm:text-7xl">What's here for you</h2>
        <p className="mt-5 max-w-xl text-lg text-ink/70">
          Everything players and their companions need before, during, and after a game.
        </p>

        <ul className="mt-12 grid gap-x-14 sm:grid-cols-2">
          {AMENITIES.map(({ icon: Icon, name, detail, status }) => (
            <li key={name} className="flex gap-4 border-b border-line py-6">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-stage text-lamp">
                <Icon size={20} aria-hidden="true" />
              </span>
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{name}</p>
                  <span className="rounded-full border border-line px-2.5 py-0.5 text-xs text-ink/70">{status}</span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-ink/70">{detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* Rates as a board: one row per sport, prices in segments */
export function Rates() {
  return (
    <section id="rates" className="bg-bg py-24">
      <div className="mx-auto max-w-6xl px-6 lg:pl-24">
        <h2 className="display text-6xl sm:text-7xl">Hours and rates</h2>
        <p className="mt-5 max-w-xl text-lg text-ink/70">
          {SITE.hours.label}. {SITE.peak.label} All rates are per court, per hour.
        </p>

        <Housing className="mt-10 overflow-x-auto rounded-[2rem] px-5 py-8 sm:px-10">
          <table className="w-full min-w-[34rem] text-left">
            <thead>
              <tr className="text-[0.72rem] text-on-stage/65">
                <th className="stencil pb-4 font-bold">Sport</th>
                <th className="stencil pb-4 font-bold">Courts</th>
                <th className="stencil pb-4 font-bold">Regular ₱</th>
                <th className="stencil pb-4 font-bold">Peak ₱</th>
              </tr>
            </thead>
            <tbody>
              {SPORTS.map((s) => (
                <tr key={s.id} className="border-t border-on-stage/10">
                  <td className="py-4 pr-4">
                    <Stencil className="text-lg sm:text-xl">{s.name}</Stencil>
                  </td>
                  <td className="py-4 pr-4">
                    <span className="readout inline-flex rounded-md px-2.5 py-1.5 text-xl">
                      <Seg value={pad(s.courts.length)} label={`${s.courts.length} courts`} />
                    </span>
                  </td>
                  <td className="py-4 pr-4">
                    <span className="readout inline-flex rounded-md px-2.5 py-1.5 text-xl">
                      <Seg value={s.rate} label={peso(s.rate)} />
                    </span>
                  </td>
                  <td className="py-4">
                    <span className="readout inline-flex rounded-md px-2.5 py-1.5 text-xl">
                      <Seg value={s.peakRate} label={peso(s.peakRate)} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Housing>
      </div>
    </section>
  )
}

export function Location() {
  return (
    <section id="location" className="bg-surface py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-2 lg:items-center lg:pl-24">
        <div>
          <h2 className="display text-6xl sm:text-7xl">Find us</h2>
          <address className="mt-6 not-italic leading-relaxed">
            <span className="block text-lg font-semibold">{SITE.address.street}</span>
            <span className="block text-ink/75">{SITE.address.area}</span>
            <span className="block text-ink/75">{SITE.address.region}</span>
          </address>
          <p className="mt-3 text-sm text-ink/65">{SITE.landmark}</p>

          <ul className="mt-8 space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <Phone size={16} className="text-accent" aria-hidden="true" />
              {SITE.phone}
            </li>
            <li className="flex items-center gap-3">
              <Mail size={16} className="text-accent" aria-hidden="true" />
              {SITE.email}
            </li>
            <li className="flex items-center gap-3">
              <Globe size={16} className="text-accent" aria-hidden="true" />
              {SITE.social}
            </li>
          </ul>

          <div className="mt-9 flex flex-wrap gap-3">
            <Button href={SITE.mapsUrl} target="_blank" rel="noreferrer">
              <Navigation size={16} aria-hidden="true" />
              Get directions
            </Button>
            <Button href={`tel:${SITE.phone.replace(/\s/g, '')}`} variant="ghost">
              Call us
            </Button>
          </div>
        </div>

        <div
          className="relative flex aspect-4/3 items-center justify-center overflow-hidden rounded-3xl border border-line bg-raised"
          style={{
            backgroundImage:
              'linear-gradient(var(--c-line) 1px, transparent 1px), linear-gradient(90deg, var(--c-line) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        >
          <span className="flex flex-col items-center gap-2 rounded-2xl bg-bg/85 px-5 py-4 text-center">
            <MapPin size={28} className="text-accent" aria-hidden="true" />
            <span className="text-sm font-medium">Embed your Google Map here</span>
          </span>
        </div>
      </div>
    </section>
  )
}

export function FinalCta({ showRates = true }) {
  return (
    <section className="bg-bg p-3 sm:p-4">
      <Housing className="rounded-[2rem] px-6 py-16 sm:px-12 sm:py-20">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-10 lg:flex-row lg:items-end lg:justify-between lg:pl-12">
          <div>
            <h2 className="display max-w-2xl text-6xl sm:text-7xl">Your next game is a few taps away.</h2>
            <p className="mt-5 max-w-lg text-lg text-on-stage/75">
              See live court availability, pick your time, and lock it in before someone else does.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button to="/booking" variant="lamp">
              Book a court
            </Button>
            {showRates ? (
              <Button href="#rates" variant="ghostStage">
                View rates
              </Button>
            ) : (
              <Button href="#sports" variant="ghostStage">
                See the courts
              </Button>
            )}
          </div>
        </div>
      </Housing>
    </section>
  )
}

export function Footer({ showRates = true }) {
  return (
    <footer className="bg-bg py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 sm:flex-row sm:items-center sm:justify-between lg:pl-24">
        <BrandLockup size="sm" />
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink/70" aria-label="Footer">
          <a href="#courts" className="hover:text-ink">
            Courts
          </a>
          <a href="#amenities" className="hover:text-ink">
            Amenities
          </a>
          {showRates && (
            <a href="#rates" className="hover:text-ink">
              Rates
            </a>
          )}
          <a href="#location" className="hover:text-ink">
            Location
          </a>
        </nav>
        <p className="text-sm text-ink/55">
          © {new Date().getFullYear()} {SITE.businessName}
        </p>
      </div>
    </footer>
  )
}

export default function Landing() {
  return (
    <main>
      <Hero />
      <QuickFacts />
      <Courts />
      <Amenities />
      <Rates />
      <Location />
      <FinalCta />
      <Footer />
    </main>
  )
}
