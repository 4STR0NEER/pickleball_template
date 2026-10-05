/**
 * Adapted from Kokonut UI "Slide Text Button" (MIT, kokonut-labs/kokonutui).
 * Changes: React Router links, project tokens and lamp variant, Emil timings
 * (200ms strong ease out, press scale), no entrance animation, reduced motion safe.
 */
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

const variants = {
  lamp: 'bg-lamp text-stage shadow-[inset_0_-3px_0_rgb(0_0_0/0.22)] hover:brightness-105',
  primary: 'bg-primary text-on-primary shadow-[inset_0_-3px_0_rgb(0_0_0/0.22)] hover:brightness-110',
  ghostLight: 'border border-white/35 text-white hover:bg-white/10',
  ghost: 'border border-ink/30 text-ink hover:bg-ink/8',
}

export default function SlideTextButton({ to, href, onClick, text, hoverText, variant = 'lamp', icon: Icon, className, ...props }) {
  const slide = hoverText ?? text
  const cls = cn(
    'group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full px-7 text-[0.95rem] font-semibold',
    'transition-[transform,filter,background-color] duration-160 ease-out active:scale-[0.97]',
    variants[variant],
    className
  )
  const inner = (
    <span className="relative inline-block transition-transform duration-200 ease-out group-hover:-translate-y-full motion-reduce:transition-none">
      <span className="flex items-center gap-2 transition-opacity duration-200 ease-out group-hover:opacity-0">
        {Icon && <Icon size={16} aria-hidden="true" />}
        {text}
      </span>
      <span aria-hidden="true" className="absolute left-0 top-full flex w-full items-center justify-center gap-2 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100">
        {slide}
      </span>
    </span>
  )
  if (to) return <Link to={to} className={cls} {...props}>{inner}</Link>
  if (href) return <a href={href} className={cls} {...props}>{inner}</a>
  return <button type="button" onClick={onClick} className={cls} {...props}>{inner}</button>
}
