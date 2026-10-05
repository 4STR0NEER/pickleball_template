/*
  Scoreboard hardware shared by both tiers: the housing, its screws,
  recessed readout windows, segment numerals and painted labels.
  Purely visual; no motion lives here.
*/

function Screw({ className }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute h-2.5 w-2.5 rounded-full ${className}`}
      style={{
        background:
          'radial-gradient(circle at 35% 30%, color-mix(in srgb, var(--c-on-stage) 55%, transparent), color-mix(in srgb, var(--c-stage), black 35%) 72%)',
        boxShadow: '0 1px 0 color-mix(in srgb, white 8%, transparent)',
      }}
    >
      <span className="absolute left-1/2 top-1/2 h-px w-[70%] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-black/45" />
    </span>
  )
}

/* The board. Corner screws sit just inside the rounded corners. */
export function Housing({ as: Tag = 'div', screws = true, className = '', children, ...rest }) {
  return (
    <Tag className={`housing ${className}`} {...rest}>
      {screws && (
        <>
          <Screw className="left-4 top-4" />
          <Screw className="right-4 top-4" />
          <Screw className="bottom-4 left-4" />
          <Screw className="bottom-4 right-4" />
        </>
      )}
      {children}
    </Tag>
  )
}

/* Segment numerals. Unlit 8s ghost behind every digit like a real display. */
export function Seg({ value, label, className = '' }) {
  const text = String(value)
  const ghost = text.replace(/[0-9-]/g, '8')
  return (
    <>
      <span aria-hidden="true" data-ghost={ghost} className={`seg ${className}`}>
        {text}
      </span>
      {label && <span className="sr-only">{label}</span>}
    </>
  )
}

export function Stencil({ as: Tag = 'span', className = '', children }) {
  return <Tag className={`stencil ${className}`}>{children}</Tag>
}

/* Label over a recessed window holding segment numerals */
export function Readout({ label, value, srLabel, caption, size = 'md', className = '' }) {
  const sizes = {
    sm: 'text-lg px-2.5 py-1.5',
    md: 'text-3xl px-3.5 py-2.5',
    lg: 'text-5xl sm:text-6xl px-4 py-3.5',
  }
  return (
    <div className={className}>
      <Stencil className="block text-[0.72rem] text-on-stage/65">{label}</Stencil>
      <div className={`readout mt-2 inline-flex rounded-lg ${sizes[size]}`}>
        <Seg value={value} label={srLabel ?? `${label}: ${value}`} />
      </div>
      {caption && <p className="mt-2 text-xs text-on-stage/65">{caption}</p>}
    </div>
  )
}
