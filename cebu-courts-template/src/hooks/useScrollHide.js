import { useEffect, useState } from 'react'

/* Hides on scroll down, shows on scroll up. `scrolled` is true once off the very top.
   Phones keep it put: toggling on every direction change (while the URL bar also
   slides) reads as a jarring snap. */
export default function useScrollHide(threshold = 120) {
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    let last = window.scrollY
    let ticking = false
    const phone = window.matchMedia('(max-width: 1023px)')

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const y = window.scrollY
        setScrolled(y > 8)
        if (Math.abs(y - last) > 6) {
          setHidden(!phone.matches && y > last && y > threshold)
          last = y
        }
        ticking = false
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return { hidden, scrolled }
}
