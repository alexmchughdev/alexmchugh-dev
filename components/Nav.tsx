'use client';

import { useEffect, useState } from 'react';

const links = [
  { href: '#about', label: 'about' },
  // { href: '#projects', label: 'projects' }, // re-enable alongside <Projects /> in app/page.tsx
  { href: '#github', label: 'github' },
  { href: '#articles', label: 'articles' },
  { href: '#cv', label: 'cv' },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={[
        'fixed inset-x-0 top-0 z-50 border-b transition-colors duration-200',
        scrolled
          ? 'border-line bg-bg/95'
          : 'border-transparent bg-bg',
      ].join(' ')}
    >
      <div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-5 font-mono text-sm">
        <a href="#top" className="flex items-center gap-0 hover:opacity-90">
          <span className="text-prompt">alex</span>
          <span className="text-ink-faint">@</span>
          <span className="text-[#b3c48c]">mchugh</span>
          <span className="text-ink-faint">:</span>
          <span className="text-ink">~</span>
          <span className="ml-1 text-ink-faint">$</span>
        </a>

        <nav className="hidden items-center gap-5 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-ink-muted transition-colors hover:text-accent"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-8 w-8 items-center justify-center text-ink-muted hover:text-ink md:hidden"
        >
          <span className="font-mono text-xs">{open ? '[x]' : '[≡]'}</span>
        </button>
      </div>

      <div
        className={[
          'overflow-hidden border-t border-line bg-bg md:hidden',
          open ? 'max-h-72' : 'max-h-0',
          'transition-[max-height] duration-200 ease-out',
        ].join(' ')}
      >
        <nav className="flex flex-col px-5 py-2 font-mono text-sm">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="py-2 text-ink-muted transition-colors hover:text-accent"
            >
              {l.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
