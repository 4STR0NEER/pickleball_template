import SiteHeader from '../components/intermediate/SiteHeader.jsx'
import AmenityBoard from '../components/intermediate/AmenityBoard.jsx'
import VideoHero from '../components/pro/VideoHero.jsx'
import ScoreboardCourts from '../components/pro/ScoreboardCourts.jsx'
import { Location, FinalCta, Footer } from './Landing.jsx'

/* Pro tier landing page: video hero, sticky scoreboard courts, then the shared sections */
export default function ProLanding() {
  return (
    <>
      <SiteHeader overlay />
      <main>
        <VideoHero />
        <ScoreboardCourts />
        <AmenityBoard />
        <Location />
        <FinalCta showRates={false} />
        <Footer showRates={false} />
      </main>
    </>
  )
}
