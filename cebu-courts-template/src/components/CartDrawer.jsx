import { useEffect, useState } from 'react'
import { X, Trash2, ShoppingBag } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useCart } from '../context/CartContext.jsx'
import { useShowcase } from '../context/ShowcaseContext.jsx'
import { getSport } from '../data/availability.js'
import { formatRange, formatShortDate, peso } from '../utils/date.js'
import Button from './Button.jsx'

// iOS style drawer curve: fast start, long settle
const EASE = [0.32, 0.72, 0, 1]

export default function CartDrawer() {
  const { items, count, total, remove, clear, open, setOpen } = useCart()
  const fx = useShowcase().tier !== 'basic'
  const [notice, setNotice] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, setOpen])

  useEffect(() => {
    if (count === 0) setNotice(false)
  }, [count])

  // Basic opens instantly; Intermediate slides in
  const t = (duration) => ({ duration: fx ? duration : 0, ease: EASE })

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <motion.button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close cart"
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={t(0.4)}
          />
          <motion.aside
            className="relative flex h-full w-full max-w-md flex-col bg-raised text-ink shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Your cart"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={t(0.42)}
          >
            <header className="flex items-center justify-between border-b border-line px-6 py-5">
              <div>
                <h2 className="display text-2xl">Your cart</h2>
                <p className="mt-1 text-sm text-ink/60">
                  {count} {count === 1 ? 'time slot' : 'time slots'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-2 text-ink/70 hover:bg-ink/10 hover:text-ink"
                aria-label="Close cart"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </header>

            {count === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <ShoppingBag size={36} className="text-accent" aria-hidden="true" />
                <p className="mt-4 font-semibold">Your cart is empty</p>
                <p className="mt-2 max-w-xs text-sm text-ink/65">
                  Pick a date on the calendar, then add the times and courts you want to play.
                </p>
                <Button to="/booking" className="mt-6" onClick={() => setOpen(false)}>
                  Browse open times
                </Button>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={item.id}
                        layout={fx}
                        initial={fx ? { opacity: 0, x: 24 } : false}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 24 }}
                        transition={t(0.35)}
                        className="flex items-start justify-between gap-4 py-4"
                      >
                        <div>
                          <p className="font-semibold">
                            {getSport(item.sportId).name}, {item.courtName}
                          </p>
                          <p className="mt-1 text-sm text-ink/65">
                            {formatShortDate(item.dateKey)}, {formatRange(item.hour)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold tabular-nums">{peso(item.price)}</span>
                          <button
                            type="button"
                            onClick={() => remove(item.id)}
                            className="rounded-full p-2 text-ink/55 hover:bg-ink/10 hover:text-ink"
                            aria-label={`Remove ${item.courtName} at ${formatRange(item.hour)}`}
                          >
                            <Trash2 size={16} aria-hidden="true" />
                          </button>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>

                <footer className="border-t border-line px-6 py-5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-ink/70">Total</span>
                    <span className="display text-3xl tabular-nums">{peso(total)}</span>
                  </div>
                  <Button className="mt-5 w-full" onClick={() => setNotice(true)}>
                    Proceed to checkout
                  </Button>
                  {notice && (
                    <p className="mt-3 rounded-xl bg-ink/8 px-4 py-3 text-sm text-ink/80" role="status">
                      Demo only. Checkout goes live once a payment method is connected.
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={clear}
                    className="mt-3 w-full text-center text-sm text-ink/60 underline-offset-4 hover:text-ink hover:underline"
                  >
                    Clear cart
                  </button>
                </footer>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}
