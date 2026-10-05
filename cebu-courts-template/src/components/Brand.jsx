import { Link } from 'react-router-dom'
import { SITE } from '../config/site.js'

/* Placeholder mark. Swap the inner content for the client's logo <img>. */
export function LogoMark({ size = 'md', tone = 'accent' }) {
  const sizes = {
    sm: 'h-9 w-9 text-[0.6rem]',
    md: 'h-12 w-12 text-xs',
    lg: 'h-24 w-24 text-sm',
  }
  return (
    <span
      className={`${sizes[size]} inline-flex shrink-0 items-center justify-center rounded-2xl border-2 border-dashed font-semibold ${
        tone === 'current' ? 'border-current text-current' : 'border-accent/70 text-accent'
      }`}
    >
      Logo
    </span>
  )
}

export function BrandLockup({ size = 'md', link = true, tone = 'accent' }) {
  const inner = (
    <>
      <LogoMark size={size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'md'} tone={tone === 'stage' ? 'current' : 'accent'} />
      <span className={`display ${size === 'sm' ? 'text-lg' : 'text-xl'}`}>{SITE.businessName}</span>
    </>
  )
  return link ? (
    <Link to="/" className="inline-flex items-center gap-3">
      {inner}
    </Link>
  ) : (
    <span className="inline-flex items-center gap-3">{inner}</span>
  )
}
