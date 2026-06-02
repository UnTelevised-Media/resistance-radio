'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const NAV = [
  {
    href: 'https://untelevised.live',
    label: 'UNTELEVISED MEDIA',
    external: true,
    colorClass: 'text-alert',
    pulse: true,
  },
  {
    href: 'https://untelevised.live/breaking',
    label: 'BREAKING',
    external: true,
    colorClass: 'text-alert',
    pulse: false,
  },
  {
    href: 'https://dj.untelevised.live/public/resistance_radio',
    label: 'SCHEDULE',
    external: true,
    colorClass: 'text-cyan',
    pulse: false,
  },
  {
    href: 'https://untelevised.live/bookstore',
    label: 'BOOKSTORE',
    external: true,
    colorClass: 'text-gold',
    pulse: false,
  },
  {
    href: 'https://untelevised.live/about',
    label: 'MISSION',
    external: true,
    colorClass: '',
    pulse: false,
  },
] as const;

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let raf: number;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setScrolled(window.scrollY > 20));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-dark-900/98 border-b-2 border-phosphor/60 shadow-[0_0_20px_rgba(14,215,41,0.25)] backdrop-blur-md'
          : 'bg-dark-900/85 border-b border-phosphor/25 backdrop-blur-sm'
      }`}
    >
      <div className="flex items-center justify-between px-6 py-3 max-w-7xl mx-auto">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <span className="w-2 h-2 rounded-full bg-alert animate-pulse shadow-[0_0_8px_var(--ruby-400)]" />
          <div className="flex items-baseline gap-1.5">
            <span className="display-text text-lg phosphor-glow tracking-widest">RESISTANCE</span>
            <span className="display-text text-lg phosphor-glow-cyan tracking-widest">RADIO</span>
          </div>
          <span className="mono-text text-[9px] text-muted/50 hidden md:block tracking-wider border border-phosphor/20 px-1.5 py-0.5">
            314.7 MHz
          </span>
        </Link>

        {/* Center — broadcast status */}
        <div className="hidden md:flex items-center">
          <div className="broadcast-status">⚠ UNAUTHORIZED BROADCAST ⚠</div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0.5" aria-label="Main navigation">
          {NAV.map((item, i) => (
            <div key={item.href} className="flex items-center">
              {i === NAV.length - 1 && (
                <span className="mx-2 h-4 w-px bg-phosphor/30" />
              )}
              <Link
                href={item.href}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noopener noreferrer' : undefined}
                className={`flex items-center gap-1.5 px-3 py-1.5 mono-text text-[11px] tracking-widest uppercase transition-all duration-200
                  border border-transparent hover:border-phosphor/30 hover:bg-phosphor/5
                  ${item.colorClass || 'text-muted hover:text-phosphor'}`}
              >
                {item.pulse && (
                  <span className="w-1.5 h-1.5 rounded-full bg-alert animate-pulse shrink-0" />
                )}
                {item.label}
                {item.external && (
                  <span className="opacity-40 text-[9px] ml-0.5">↗</span>
                )}
              </Link>
            </div>
          ))}
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden mono-text text-phosphor text-xl w-10 h-10 flex items-center justify-center
            border border-phosphor/30 hover:border-phosphor hover:bg-phosphor/10 transition-all"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? '✕' : '≡'}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden border-t border-phosphor/20 bg-dark-900/98">
          <div className="flex flex-col p-4 gap-1 max-w-7xl mx-auto">
            <p className="mono-text text-[9px] text-muted/40 uppercase tracking-widest px-3 mb-2">
              TRANSMISSION LINKS
            </p>
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noopener noreferrer' : undefined}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 mono-text text-xs uppercase tracking-widest
                  border-l-2 border-phosphor/20 hover:border-phosphor hover:bg-phosphor/5 transition-all
                  ${item.colorClass || 'text-muted hover:text-phosphor'}`}
              >
                {item.pulse && (
                  <span className="w-1.5 h-1.5 rounded-full bg-alert animate-pulse shrink-0" />
                )}
                <span className="flex-1">{item.label}</span>
                {item.external && (
                  <span className="opacity-40 text-[10px]">↗</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
