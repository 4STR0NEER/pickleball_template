import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { Play } from 'lucide-react'
import { SITE, TOUR } from '../../config/site.js'
import { useShowcase } from '../../context/ShowcaseContext.jsx'
import { Stencil } from '../board/Board.jsx'
import SlideTextButton from '../kokonutui/slide-text-button.jsx'
import useMediaQuery from '../../hooks/useMediaQuery.js'

const OUT = [0.23, 1, 0.32, 1]
const TRAVEL = [0.77, 0, 0.175, 1]
const EXIT = [0.4, 0, 1, 1]

const chapterAt = (t) => {
  let idx = 0
  TOUR.chapters.forEach((c, i) => {
    if (t >= c.from) idx = i
  })
  return idx
}

/*
  Pro hero: the venue video is the hero. Its stage stays pinned for the
  first stretch of scrolling. The first scroll (or "Take the tour") plays
  the tour once as flair: letterbox bars and timed annotations over the
  footage. Nothing is ever blocked; the page scrolls normally throughout.
*/
export default function VideoHero() {
  const { loading } = useShowcase()
  // Phones skip the scroll-linked drift: the URL bar resizing the viewport mid-scroll makes it jump
  const phone = useMediaQuery('(max-width: 1023px)')
  const reduce = useReducedMotion() || phone
  const sectionRef = useRef(null)
  const videoRef = useRef(null)
  const startedRef = useRef(false)
  const [playing, setPlaying] = useState(false)
  const [t, setT] = useState(0)

  // Headline drifts up and fades as the page starts to move
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })
  const introY = useTransform(scrollYProgress, [0, 0.45], ['0%', '-18%'])
  const introOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0])
  const stageScale = useTransform(scrollYProgress, [0, 1], [1, 1.08])

  const play = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    startedRef.current = true
    v.currentTime = TOUR.start
    v.defaultPlaybackRate = v.playbackRate = TOUR.rate
    setT(0)
    setPlaying(true)
    v.play().catch(() => setPlaying(false))
  }, [])

  // First scroll plays the tour once, without holding the page. The tour is
  // content, so it still plays under reduced motion; only the drift is cut.
  useEffect(() => {
    if (loading || startedRef.current) return
    const onScroll = () => {
      if (window.scrollY > 4 && !startedRef.current) play()
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [loading, play])

  // Smooth progress for the chapter bar
  useEffect(() => {
    if (!playing) return
    let raf
    const tick = () => {
      const v = videoRef.current
      if (v && v.duration) setT(Math.max(0, (v.currentTime - TOUR.start) / (v.duration - TOUR.start)))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing])

  const chapter = chapterAt(t)
  const current = TOUR.chapters[chapter]

  return (
    <section ref={sectionRef} className="relative h-[100svh] min-h-[34rem] bg-stage lg:h-[150svh]" aria-label="Venue">
      <div className="sticky top-0 h-[100svh] min-h-[34rem] overflow-hidden text-white">
        <motion.div className="absolute inset-0" style={reduce ? undefined : { scale: stageScale }}>
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            poster={TOUR.poster}
            muted
            playsInline
            preload="auto"
            onEnded={() => setPlaying(false)}
            aria-label="Walkthrough of the venue"
          >
            <source src={TOUR.video} type="video/mp4" />
            <source src={TOUR.videoWebm} type="video/webm" />
          </video>
        </motion.div>

        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgb(0 0 0 / 0.55) 0%, transparent 22%, transparent 45%, rgb(0 0 0 / 0.78) 100%), linear-gradient(90deg, rgb(0 0 0 / 0.45) 0%, transparent 60%)',
          }}
        />

        {/* Letterbox bars while the tour plays */}
        {['top-0 origin-top', 'bottom-0 origin-bottom'].map((pos) => (
          <motion.div
            key={pos}
            aria-hidden="true"
            className={`absolute inset-x-0 z-10 h-[8svh] bg-black ${pos}`}
            initial={false}
            animate={{ scaleY: playing ? 1 : 0 }}
            transition={{ duration: playing ? 0.5 : 0.4, ease: TRAVEL }}
          />
        ))}

        {/* Headline */}
        <motion.div
          className="absolute inset-x-0 bottom-0 z-20 px-6 pb-14 sm:px-12 sm:pb-16 lg:pl-28"
          style={reduce ? undefined : { y: introY, opacity: introOpacity }}
        >
          <AnimatePresence>
            {!playing && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 16 }}
                animate={loading ? { opacity: 0, y: 16 } : { opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10, transition: { duration: 0.22, ease: EXIT } }}
                transition={{ duration: 0.8, delay: 0.1, ease: OUT }}
              >
                <h1 className="display max-w-4xl text-balance text-[clamp(3.25rem,8.5vw,6rem)]">{SITE.headline}</h1>
                <p className="mt-6 max-w-xl text-balance text-lg leading-relaxed text-white/80 sm:text-xl">
                  {SITE.subheadline}
                </p>
                <div className="mt-9 flex flex-wrap items-center gap-3">
                  <SlideTextButton to="/booking" text="Book a court" hoverText="Pick a time" />
                  <SlideTextButton onClick={play} variant="ghostLight" icon={Play} text="Take the tour" hoverText="Roll the tape" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Annotations */}
        {playing && (
          <>
            <div className="absolute inset-x-0 bottom-[8svh] z-20 px-6 pb-8 sm:px-12 lg:pl-28" aria-live="polite">
              <AnimatePresence mode="wait">
                <motion.div
                  key={chapter}
                  className="max-w-xl"
                  initial={{ opacity: 0, x: -24, clipPath: 'inset(0% 100% 0% 0%)' }}
                  animate={{ opacity: 1, x: 0, clipPath: 'inset(0% 0% 0% 0%)' }}
                  exit={{ opacity: 0, x: 12, transition: { duration: 0.18, ease: EXIT } }}
                  transition={{ duration: 0.45, ease: OUT }}
                >
                  <Stencil className="block text-xs text-lamp">{current.label}</Stencil>
                  <p className="display mt-3 text-5xl sm:text-6xl">{current.title}</p>
                  <p className="mt-3 max-w-md text-base text-white/80 sm:text-lg">{current.detail}</p>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="absolute inset-x-0 bottom-0 z-20 flex h-[8svh] items-center gap-2 px-6 sm:px-12 lg:pl-28" aria-hidden="true">
              {TOUR.chapters.map((c, i) => {
                const end = TOUR.chapters[i + 1]?.from ?? 1
                const fill = Math.min(1, Math.max(0, (t - c.from) / (end - c.from)))
                return (
                  <div key={c.label} className="h-[3px] overflow-hidden rounded-full bg-white/20" style={{ flexGrow: end - c.from }}>
                    <div className="h-full origin-left bg-lamp" style={{ transform: `scaleX(${fill})` }} />
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
