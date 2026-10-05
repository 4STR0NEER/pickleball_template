/* A row of scoreboard lamps that light up left to right with progress (0 to 1) */
export default function LampBar({ progress, cells = 24, className = '' }) {
  const lit = Math.round(progress * cells)
  return (
    <div
      className={`readout flex gap-1 rounded-md p-1.5 ${className}`}
      role="progressbar"
      aria-label="Loading"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
    >
      {Array.from({ length: cells }, (_, i) => (
        <span
          key={i}
          className="h-2.5 flex-1 rounded-[2px]"
          style={{
            background: i < lit ? 'var(--c-lamp)' : 'color-mix(in srgb, var(--c-lamp) 10%, transparent)',
            boxShadow: i < lit ? '0 0 6px color-mix(in srgb, var(--c-lamp) 60%, transparent)' : 'none',
          }}
        />
      ))}
    </div>
  )
}
