import { Link } from 'react-router-dom'
import { LogoMark } from '../Brand.jsx'
import Button from '../Button.jsx'
import { SITE } from '../../config/site.js'
import { useShowcase } from '../../context/ShowcaseContext.jsx'
import useScrollHide from '../../hooks/useScrollHide.js'

const LINKS = [
  { to: '/#sports', label: 'Courts' },
  { to: '/#amenities', label: 'Amenities' },
  { to: '/#location', label: 'Location' },
]

/* Tucks away on scroll down, returns on scroll up. The logo slot is the loader's landing spot. */
/* `overlay`: sits on a dark hero (Pro video) and reads light until scrolled */
export default function SiteHeader({ overlay = false }) {
  const { loading } = useShowcase()
  const { hidden, scrolled } = useScrollHide()
  const light = overlay && !scrolled

  return (
    <header
      className={`site-header fixed inset-x-0 top-0 z-30 transition-[transform,background-color,border-color] duration-300 ease-drawer ${
        hidden ? '-translate-y-full' : 'translate-y-0'
      } ${scrolled ? 'border-b border-line bg-bg/85 backdrop-blur-md' : 'border-b border-transparent'} ${light ? 'text-white' : ''}`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-6 lg:pl-24">
        <Link to="/" className="flex items-center gap-3">
          {/* Stays invisible until the loader's logo lands here */}
          <span id="header-logo-slot" className="inline-flex" style={{ opacity: loading ? 0 : 1 }}>
            <LogoMark size="md" tone={light ? 'current' : 'accent'} />
          </span>
          <span
            className="display hidden text-xl transition-opacity duration-700 sm:inline"
            style={{ opacity: loading ? 0 : 1, transitionDelay: loading ? '0ms' : '150ms' }}
          >
            {SITE.businessName}
          </span>
        </Link>

        <nav
          className="flex items-center gap-8 transition-opacity duration-700"
          style={{ opacity: loading ? 0 : 1, transitionDelay: loading ? '0ms' : '300ms' }}
          aria-label="Main"
        >
          <ul className="hidden items-center gap-7 text-sm font-medium md:flex">
            {LINKS.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className={`relative transition-colors ${light ? 'text-white/80 hover:text-white' : 'text-ink/75 hover:text-ink'}`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <Button to="/booking" variant={light ? 'lamp' : 'primary'} className="px-5! py-2.5! text-sm">
            Book a court
          </Button>
        </nav>
      </div>
    </header>
  )
}
