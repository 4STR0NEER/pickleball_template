import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Seg } from '../board/Board.jsx'

/*
  Segment readout that changes like a scoreboard update: the old value
  drops out, the new one rolls up and its lamps flicker on.
*/
export default function RollingSeg({ value, label, className = '' }) {
  const reduce = useReducedMotion()
  return (
    <span className={`relative inline-grid overflow-hidden ${className}`}>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={value}
          className="col-start-1 row-start-1"
          initial={reduce ? { opacity: 0 } : { y: '70%', opacity: 0 }}
          animate={reduce ? { opacity: 1 } : { y: '0%', opacity: [0, 1, 0.35, 1] }}
          exit={reduce ? { opacity: 0 } : { y: '-70%', opacity: 0, transition: { duration: 0.16, ease: [0.4, 0, 1, 1] } }}
          transition={{ y: { duration: 0.28, ease: [0.23, 1, 0.32, 1] }, opacity: { duration: 0.32, times: [0, 0.4, 0.6, 1] } }}
        >
          <Seg value={value} label={label} />
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
