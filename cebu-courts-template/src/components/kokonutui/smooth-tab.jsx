/**
 * Adapted from Kokonut UI "Smooth Tab" (MIT, kokonut-labs/kokonutui).
 * Generalised into a controlled tab strip + directional content panel:
 *  - items: [{ id, label, sub, disabled }]
 *  - renderPanel(id): content for the selected tab
 * Changes: project tokens (lamp indicator on the housing), critically damped
 * spring for the indicator, drawer curve for panels, arrow key navigation,
 * disabled tabs, reduced motion (no slide or blur).
 */
import { useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'

const panelVariants = {
  enter: (d) => ({ x: d > 0 ? '14%' : '-14%', opacity: 0, filter: 'blur(6px)' }),
  center: { x: 0, opacity: 1, filter: 'blur(0px)' },
  exit: (d) => ({ x: d < 0 ? '14%' : '-14%', opacity: 0, filter: 'blur(6px)' }),
}

export default function SmoothTab({ items, value, onChange, renderPanel, className, ariaLabel = 'Tabs' }) {
  const reduce = useReducedMotion()
  const [direction, setDirection] = useState(0)
  const [box, setBox] = useState({ width: 0, left: 0 })
  const buttons = useRef(new Map())
  const container = useRef(null)

  useLayoutEffect(() => {
    const measure = () => {
      const b = buttons.current.get(value)
      const c = container.current
      if (!b || !c) return
      const r = b.getBoundingClientRect()
      const cr = c.getBoundingClientRect()
      setBox({ width: r.width, left: r.left - cr.left + c.scrollLeft })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [value, items])

  const select = (id) => {
    const from = items.findIndex((i) => i.id === value)
    const to = items.findIndex((i) => i.id === id)
    setDirection(to > from ? 1 : -1)
    onChange(id)
  }

  const onKeyDown = (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    const enabled = items.filter((i) => !i.disabled)
    const idx = enabled.findIndex((i) => i.id === value)
    const next = enabled[(idx + (e.key === 'ArrowRight' ? 1 : -1) + enabled.length) % enabled.length]
    if (next) {
      select(next.id)
      buttons.current.get(next.id)?.focus()
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div
        ref={container}
        role="tablist"
        aria-label={ariaLabel}
        onKeyDown={onKeyDown}
        className={cn('housing relative grid grid-cols-7 gap-1 overflow-x-auto rounded-2xl p-1.5', className)}
      >
        {/* Sliding lamp indicator */}
        <motion.div
          aria-hidden="true"
          className="absolute top-1.5 bottom-1.5 z-[1] rounded-xl bg-lamp shadow-[0_0_18px_color-mix(in_srgb,var(--c-lamp)_45%,transparent)]"
          initial={false}
          animate={{ width: box.width, x: box.left }}
          transition={reduce ? { duration: 0 } : { type: 'spring', bounce: 0, duration: 0.35 }}
          style={{ left: 0 }}
        />
        {items.map((item) => {
          const selected = item.id === value
          return (
            <button
              key={item.id}
              ref={(el) => (el ? buttons.current.set(item.id, el) : buttons.current.delete(item.id))}
              type="button"
              role="tab"
              aria-selected={selected}
              disabled={item.disabled}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(item.id)}
              className={cn(
                'relative z-[2] flex min-w-16 flex-col items-center rounded-xl px-2 py-2.5 text-center transition-colors duration-200 ease-out active:scale-[0.97]',
                selected ? 'text-stage' : 'text-on-stage/80 hover:bg-on-stage/8 hover:text-on-stage',
                item.disabled && 'cursor-not-allowed opacity-35 hover:bg-transparent'
              )}
            >
              {item.label}
              {item.sub}
            </button>
          )
        })}
      </div>

      <div className="relative overflow-hidden">
        <AnimatePresence custom={direction} initial={false} mode="popLayout">
          <motion.div
            key={value}
            custom={direction}
            variants={reduce ? undefined : panelVariants}
            initial={reduce ? { opacity: 0 } : 'enter'}
            animate={reduce ? { opacity: 1 } : 'center'}
            exit={reduce ? { opacity: 0 } : 'exit'}
            transition={{ duration: 0.38, ease: [0.32, 0.72, 0, 1] }}
            role="tabpanel"
          >
            {renderPanel(value)}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
