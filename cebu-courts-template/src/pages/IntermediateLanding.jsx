import { useState } from 'react'
import { motion } from 'motion/react'
import { SITE, SPORTS } from '../config/site.js'
import { useShowcase } from '../context/ShowcaseContext.jsx'
import Button from '../components/Button.jsx'
import SiteHeader from '../components/intermediate/SiteHeader.jsx'
import SplitFlap from '../components/intermediate/SplitFlap.jsx'
import SportPanels from '../components/intermediate/SportPanels.jsx'
import PullOut from '../components/intermediate/PullOut.jsx'
import AmenityBoard from '../components/intermediate/AmenityBoard.jsx'
import { Location, FinalCta, Footer, BoardStatus } from './Landing.jsx'
import { Housing } from '../components/board/Board.jsx'
import SportReadouts from '../components/board/SportReadouts.jsx'

const SOFT = [0.22, 1, 0.36, 1]

function Hero({ active }) {
  const [settled, setSettled] = useState(false)
  const reveal = (delay) => ({
    initial: { opacity: 0, transform: 'translateY(14px)' },
    animate: settled ? { opacity: 1, transform: 'translateY(0px)' } : { opacity: 0, transform: 'translateY(14px)' },
    transition: { duration: 0.7, delay, ease: SOFT },
  })

  return (
    <section className="p-3 pt-24 sm:p-4 sm:pt-24">
      <Housing className="flex min-h-[calc(100svh-7rem)] flex-col rounded-[2rem] px-5 pb-6 pt-8 sm:px-10 sm:pb-10">
        <BoardStatus />

        <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
          <h1 className="w-full max-w-6xl text-[clamp(1.9rem,9vw,3rem)] sm:text-[clamp(2rem,5.6vw,5.5rem)]">
            <span className="sr-only">{SITE.headline}</span>
            <SplitFlap text={SITE.headline} active={active} onSettled={() => setSettled(true)} />
          </h1>

          <motion.p
            {...reveal(0)}
            className="mt-9 max-w-[36rem] text-balance text-lg leading-relaxed text-on-stage/75 sm:text-xl"
          >
            {SITE.subheadline}
          </motion.p>

          <motion.div {...reveal(0.08)} className="mt-9 flex flex-wrap justify-center gap-3">
            <Button to="/booking" variant="lamp">
              Book a court
            </Button>
            <Button href="#sports" variant="ghostStage">
              See the courts
            </Button>
          </motion.div>
        </div>

        <motion.div {...reveal(0.16)}>
          <SportReadouts fx />
        </motion.div>
      </Housing>
    </section>
  )
}

/* Intermediate tier landing page */
export default function IntermediateLanding() {
  const { loading, loaderKey } = useShowcase()

  return (
    <>
      <SiteHeader />
      <main>
        {/* Keyed to the loader so a replay re-runs the split-flap */}
        <Hero key={loaderKey} active={!loading} />
        <SportPanels />
        <div id="courts" className="overflow-x-clip bg-bg">
          {SPORTS.map((sport, i) => (
            <PullOut key={sport.id} sport={sport} index={i} />
          ))}
        </div>
        <AmenityBoard />
        <Location />
        <FinalCta showRates={false} />
        <Footer showRates={false} />
      </main>
    </>
  )
}
