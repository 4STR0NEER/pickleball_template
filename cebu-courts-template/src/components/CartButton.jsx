import { useEffect, useRef, useState } from 'react'
import { ShoppingBag } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useAnimate } from 'motion/react'
import { useCart } from '../context/CartContext.jsx'
import { useShowcase } from '../context/ShowcaseContext.jsx'
import { peso } from '../utils/date.js'

export default function CartButton() {
  const { count, total, open, setOpen } = useCart()
  const { tier } = useShowcase()
  const fx = tier !== 'basic'
  const { pathname } = useLocation()
  const [scope, animate] = useAnimate()
  const [sweep, setSweep] = useState(0)
  const prev = useRef(count)

  // Intermediate: every add bumps the button and sweeps colour across it
  useEffect(() => {
    if (fx && count > prev.current) {
      setSweep((n) => n + 1)
      if (scope.current) animate(scope.current, { scale: [1, 1.12, 1] }, { duration: 0.5, ease: [0.22, 1, 0.36, 1] })
    }
    prev.current = count
  }, [count, fx, animate, scope])

  if (open) return null
  if (pathname !== '/booking' && count === 0) return null

  return (
    <button
      ref={scope}
      type="button"
      onClick={() => setOpen(true)}
      className={`fixed bottom-5 right-5 z-30 inline-flex items-center gap-3 overflow-hidden rounded-full bg-primary py-3 pl-4 pr-5 text-on-primary shadow-[inset_0_-3px_0_rgb(0_0_0/0.22),0_12px_24px_-10px_rgb(0_0_0/0.4)] hover:brightness-110 active:scale-[0.97] ${
        fx ? 'transition-[filter,transform] duration-160 ease-out' : ''
      }`}
      aria-label={`Open cart, ${count} ${count === 1 ? 'slot' : 'slots'}`}
    >
      {fx && sweep > 0 && (
        <motion.span
          key={sweep}
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-2/3"
          style={{
            background:
              'linear-gradient(90deg, transparent, color-mix(in srgb, var(--c-on-primary) 45%, transparent), transparent)',
          }}
          initial={{ x: '-110%' }}
          animate={{ x: '260%' }}
          transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
        />
      )}
      <span className="relative">
        <ShoppingBag size={20} aria-hidden="true" />
        <AnimatePresence initial={false}>
          {count > 0 && (
            <motion.span
              key={fx ? count : 'badge'}
              initial={fx ? { scale: 0.3 } : false}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 18 }}
              className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-on-primary px-1 text-[0.65rem] font-bold text-primary"
            >
              {count}
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      <span className="relative text-sm font-semibold tabular-nums">{count > 0 ? peso(total) : 'Cart'}</span>
    </button>
  )
}
