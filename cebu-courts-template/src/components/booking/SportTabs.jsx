import { SPORTS } from '../../config/site.js'
import { useShowcase } from '../../context/ShowcaseContext.jsx'

export default function SportTabs({ value, onChange }) {
  const fx = useShowcase().tier !== 'basic'
  const onKeyDown = (e) => {
    const idx = SPORTS.findIndex((s) => s.id === value)
    if (e.key === 'ArrowRight') onChange(SPORTS[(idx + 1) % SPORTS.length].id)
    if (e.key === 'ArrowLeft') onChange(SPORTS[(idx - 1 + SPORTS.length) % SPORTS.length].id)
  }

  return (
    <div
      role="tablist"
      aria-label="Sport"
      onKeyDown={onKeyDown}
      className="housing inline-flex max-w-full gap-1 overflow-x-auto rounded-full p-1.5"
    >
      {SPORTS.map((s) => {
        const active = s.id === value
        return (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(s.id)}
            className={`stencil whitespace-nowrap rounded-full px-5 py-3 text-sm active:scale-[0.97] ${
              fx ? 'transition-[background-color,color,transform] duration-200 ease-out' : ''
            } ${
              active
                ? 'bg-lamp text-stage shadow-[0_0_14px_color-mix(in_srgb,var(--c-lamp)_45%,transparent)]'
                : 'text-on-stage/70 hover:bg-on-stage/10 hover:text-on-stage'
            }`}
          >
            {s.name}
          </button>
        )
      })}
    </div>
  )
}
