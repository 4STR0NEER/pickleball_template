import { Link } from 'react-router-dom'
import { useShowcase } from '../context/ShowcaseContext.jsx'

// Hardware push buttons: a bevel underneath, pressed in on :active
const base =
  'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[0.95rem] font-semibold leading-none select-none active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed'

const bevel = 'shadow-[inset_0_-3px_0_rgb(0_0_0/0.22),inset_0_1px_0_rgb(255_255_255/0.18)] active:shadow-[inset_0_-1px_0_rgb(0_0_0/0.22)]'

const variants = {
  primary: `bg-primary text-on-primary hover:brightness-110 ${bevel}`,
  ghost: 'border border-ink/30 text-ink hover:bg-ink/8',
  // On the scoreboard housing
  lamp: `bg-lamp text-stage hover:brightness-105 ${bevel}`,
  ghostStage: 'border border-on-stage/30 text-on-stage hover:bg-on-stage/10',
  inverse: 'bg-on-deep text-deep hover:opacity-90',
  outlineInverse: 'border border-on-deep/40 text-on-deep hover:bg-on-deep/10',
}

export default function Button({ to, href, variant = 'primary', className = '', children, ...rest }) {
  const { tier } = useShowcase()
  // Intermediate: presses and hovers ease (160ms, strong ease-out). Basic switches instantly.
  const fx =
    tier !== 'basic'
      ? 'transition-[transform,box-shadow,filter,background-color] duration-160 ease-out'
      : ''
  const cls = `${base} ${variants[variant]} ${fx} ${className}`
  if (to) {
    return (
      <Link to={to} className={cls} {...rest}>
        {children}
      </Link>
    )
  }
  if (href) {
    return (
      <a href={href} className={cls} {...rest}>
        {children}
      </a>
    )
  }
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  )
}
