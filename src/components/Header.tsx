'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Socials from './Socials';

const NAV = [
  {
    href: 'https://untelevised.media',
    label: 'UNTELEVISED MEDIA',
    colorClass: 'text-alert',
    pulse: false,
    internal: false,
    icon: 'M20 3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H4V5h16v14zM6 7h12v2H6V7zm0 4h12v2H6v-2zm0 4h8v2H6v-2z',
  },
  {
    href: 'https://untelevised.live',
    label: 'UNTELEVISED LIVE',
    colorClass: 'text-phosphor',
    pulse: false,
    internal: false,
    icon: 'M21 6H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1zM3 17V7h18v10H3zm-2 2h22v-1H1v1zM1 5h22V4H1v1z',
  },
  {
    href: 'https://untelevised.media/bookstore',
    label: 'BOOKSTORE',
    colorClass: 'text-gold',
    pulse: false,
    internal: false,
    icon: 'M12 2C8.4 2 5.4 3.6 4 6V20c0 .6.4 1 1 1s1-.4 1-1v-.3c1.1-1 3-1.7 6-1.7s4.9.7 6 1.7V20c0 .6.4 1 1 1s1-.4 1-1V6c-1.4-2.4-4.4-4-8-4zm-1 13.9c-2.1.1-3.8.6-5 1.4V7c1-1.8 3.3-3 6-3V16h-1v-.1zm7 1.4c-1.2-.8-2.9-1.3-5-1.4V4c2.7 0 5 1.2 6 3v10.3z',
  },
  {
    href: 'https://untelevised.media/breaking',
    label: 'BREAKING NEWS',
    colorClass: 'text-alert',
    pulse: false,
    internal: false,
    icon: 'M12 2c-4 4-5 7-5 10a5 5 0 0 0 10 0c0-3-1-6-5-10zm0 13a2 2 0 0 1-2-2c0-1.5 1-3 2-4 1 1 2 2.5 2 4a2 2 0 0 1-2 2z',
  },
  {
    href: '/schedule',
    label: 'SCHEDULE',
    colorClass: 'text-cyan',
    pulse: false,
    internal: true,
    icon: 'M19 3h-1V1h-2v2H8V1H6v2H5C3.9 3 3 3.9 3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z',
  },
  {
    href: 'https://untelevised.media/about',
    label: 'MISSION',
    colorClass: '',
    pulse: false,
    internal: false,
    icon: null,
  },
];

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
      <div className="flex items-center justify-between px-6 py-3 max-w-7xl mx-auto gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
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
        <div className="hidden xl:flex items-center shrink-0">
          <div className="broadcast-status">⚠ UNAUTHORIZED BROADCAST ⚠</div>
        </div>

        {/* Right side: nav + support + socials */}
        <div className="hidden lg:flex items-center gap-2 min-w-0">

          {/* Nav links */}
          <nav className="flex items-center gap-0.5" aria-label="Main navigation">
            {NAV.map((item, i) => (
              <div key={item.href} className="flex items-center">
                {i === NAV.length - 1 && (
                  <span className="mx-2 h-4 w-px bg-phosphor/30" />
                )}
                <Link
                  href={item.href}
                  {...(!item.internal && { target: '_blank', rel: 'noopener noreferrer' })}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 mono-text text-[10px] tracking-widest uppercase whitespace-nowrap transition-all duration-200
                    border border-transparent hover:border-phosphor/30 hover:bg-phosphor/5
                    ${item.colorClass || 'text-muted hover:text-phosphor'}`}
                >
                  {item.pulse && (
                    <span className="w-1.5 h-1.5 rounded-full bg-alert animate-pulse shrink-0" />
                  )}
                  {item.icon && (
                    <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current shrink-0" aria-hidden="true">
                      <path d={item.icon} />
                    </svg>
                  )}
                  {item.label}
                  {!item.internal && <span className="opacity-40 text-[9px]">↗</span>}
                </Link>
              </div>
            ))}
          </nav>

          {/* Divider */}
          <span className="h-4 w-px bg-phosphor/30 mx-1" />

          {/* Support CTA */}
          <Link
            href="https://untelevised.media/support"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-alert/10 border border-alert/50 text-alert
              mono-text text-[10px] tracking-widest uppercase hover:bg-alert/20 hover:border-alert
              transition-all duration-200 shadow-[0_0_8px_rgba(255,23,68,0.15)] shrink-0"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-alert animate-pulse" />
            SUPPORT
          </Link>

          {/* Divider */}
          <span className="h-4 w-px bg-phosphor/30 mx-1" />

          {/* Social icons */}
          <Socials dropdown />
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden mono-text text-phosphor text-xl w-10 h-10 flex items-center justify-center
            border border-phosphor/30 hover:border-phosphor hover:bg-phosphor/10 transition-all shrink-0"
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
                {...(!item.internal && { target: '_blank', rel: 'noopener noreferrer' })}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 mono-text text-xs uppercase tracking-widest
                  border-l-2 border-phosphor/20 hover:border-phosphor hover:bg-phosphor/5 transition-all
                  ${item.colorClass || 'text-muted hover:text-phosphor'}`}
              >
                {item.pulse && (
                  <span className="w-1.5 h-1.5 rounded-full bg-alert animate-pulse shrink-0" />
                )}
                {item.icon && (
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current shrink-0" aria-hidden="true">
                    <path d={item.icon} />
                  </svg>
                )}
                <span className="flex-1">{item.label}</span>
                {!item.internal && <span className="opacity-40 text-[10px]">↗</span>}
              </Link>
            ))}

            {/* Support in mobile menu */}
            <div className="mt-3 pt-3 border-t border-phosphor/10 flex flex-col gap-3">
              <Link
                href="https://untelevised.media/support"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-3 bg-alert/10 border border-alert/40 text-alert
                  mono-text text-xs tracking-widest uppercase hover:bg-alert/20 transition-all"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-alert animate-pulse" />
                SUPPORT THE STATION ↗
              </Link>

              <p className="mono-text text-[9px] text-muted/40 uppercase tracking-widest px-1 mt-1">
                FOLLOW US
              </p>
              <Socials />
            </div>

          </div>
        </div>
      )}
    </header>
  );
}
