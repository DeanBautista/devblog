import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Home', to: '/' },
  { label: 'Article', to: '/article' },
  { label: 'About', to: '/about' },
];

function navLinkClass({ isActive }) {
  const baseClassName = 'text-sm font-semibold uppercase tracking-[0.18em] transition-colors';
  return isActive
    ? `${baseClassName} text-on-surface`
    : `${baseClassName} text-on-surface-variant hover:text-on-surface`;
}

export default function PublicHeader() {
  const [isOpen, setIsOpen] = useState(false);

  function handleNavItemClick() {
    setIsOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-outline-variant/30 bg-surface/95 backdrop-blur-lg">
      <div className="relative mx-auto flex h-20 w-full max-w-6xl items-center px-5 md:px-8">
        <Link
          to="/"
          onClick={handleNavItemClick}
          className="flex items-center gap-3 text-2xl font-semibold leading-none tracking-tight text-on-surface"
        >
          <img src="/favicon.svg" alt="DevCore CMS logo" className="h-9 w-9 shrink-0" />
          <span>DevCore CMS</span>
        </Link>

        <nav className="absolute right-5 hidden items-center gap-10 md:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={navLinkClass}
              onClick={handleNavItemClick}
              end={item.to === '/'}
            >
              {item.label}
            </NavLink>
          ))}

          <Link
            to="/admin/login"
            onClick={handleNavItemClick}
            className="try-admin-header-cta inline-flex items-center justify-center rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em]"
          >
            Try Admin
          </Link>
        </nav>

        <Link
          to="/admin/login"
          onClick={handleNavItemClick}
          className="try-admin-header-cta ml-auto inline-flex items-center justify-center rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] md:hidden"
        >
          Try Admin
        </Link>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="rounded-lg border border-outline-variant/40 p-2 text-on-surface-variant transition-colors hover:text-on-surface md:hidden"
          aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="ml-auto hidden h-10 w-10 md:block" aria-hidden="true" />
      </div>

      {isOpen && (
        <nav className="fixed bg-surface h-screen left-0 right-0 border-t border-outline-variant/30 px-5 py-4 md:hidden">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={handleNavItemClick}
                className={({ isActive }) =>
                  isActive
                    ? 'rounded-xl bg-surface-container px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-on-surface'
                    : 'rounded-xl px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-on-surface-variant'
                }
                end={item.to === '/'}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
