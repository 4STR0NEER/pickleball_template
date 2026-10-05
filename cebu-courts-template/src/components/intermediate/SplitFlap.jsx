import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

/* One flap slot. When its character changes, the top half folds down onto the new one. */
function FlapTile({ char }) {
  const [state, setState] = useState({ prev: char, next: char, n: 0 })
  if (state.next !== char) setState({ prev: state.next, next: char, n: state.n + 1 })
  const { prev, next, n } = state

  return (
    <span className="flap-tile">
      <span className="flap-half top">
        <span>{next}</span>
      </span>
      <span className="flap-half bottom">
        <span>{n ? prev : next}</span>
      </span>
      {n > 0 && (
        <>
          <span key={`t${n}`} className="flap-half top flap-anim-top">
            <span>{prev}</span>
          </span>
          <span key={`b${n}`} className="flap-half bottom flap-anim-bottom">
            <span>{next}</span>
          </span>
        </>
      )}
    </span>
  )
}

/*
  Split-flap headline. Tiles sit blank until `active`, then cycle random
  letters and settle one by one from left to right (about 1.6 s in total).
*/
export default function SplitFlap({ text, active, onSettled, settleBase = 650, step = 38 }) {
  const reduce = useReducedMotion()
  const target = text.toUpperCase()
  const [display, setDisplay] = useState(() => target.replace(/\S/g, ' '))
  const settledRef = useRef(onSettled)
  settledRef.current = onSettled

  useEffect(() => {
    if (!active) return
    if (reduce) {
      setDisplay(target)
      settledRef.current?.()
      return
    }

    const settleAt = {}
    let n = 0
    for (let i = 0; i < target.length; i++) {
      if (target[i] !== ' ') settleAt[i] = settleBase + n++ * step
    }

    const start = performance.now()
    const id = setInterval(() => {
      const t = performance.now() - start
      let done = true
      const next = [...target]
        .map((c, i) => {
          if (c === ' ' || t >= settleAt[i]) return c
          done = false
          return CHARS[Math.floor(Math.random() * CHARS.length)]
        })
        .join('')
      setDisplay(next)
      if (done) {
        clearInterval(id)
        settledRef.current?.()
      }
    }, 80)

    return () => clearInterval(id)
  }, [active, target, reduce, settleBase, step])

  // Break the headline into two balanced lines; words never split across lines
  const lines = balanceLines(target)

  return (
    <span aria-hidden="true" className="flex flex-col items-center gap-y-[0.16em]">
      {lines.map((line) => (
        <span key={line.offset} className="flex flex-wrap justify-center gap-x-[0.34em] gap-y-[0.16em]">
          {line.words.map(({ word, offset: start }) => (
            <span key={start} className="flex gap-[0.06em]">
              {[...word].map((_, i) => (
                <FlapTile key={i} char={display[start + i]} />
              ))}
            </span>
          ))}
        </span>
      ))}
    </span>
  )
}

function balanceLines(text) {
  const words = []
  let offset = 0
  for (const word of text.split(' ')) {
    words.push({ word, offset })
    offset += word.length + 1
  }
  if (text.length <= 14 || words.length < 2) return [{ offset: 0, words }]

  let best = 1
  let bestScore = Infinity
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).map((w) => w.word).join(' ').length
    const b = words.slice(i).map((w) => w.word).join(' ').length
    const score = Math.max(a, b)
    if (score < bestScore) {
      bestScore = score
      best = i
    }
  }
  return [
    { offset: words[0].offset, words: words.slice(0, best) },
    { offset: words[best].offset, words: words.slice(best) },
  ]
}
