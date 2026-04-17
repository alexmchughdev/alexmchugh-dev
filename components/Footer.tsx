export default function Footer() {
  return (
    <footer className="relative border-t border-line/70 bg-bg">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 font-mono text-sm">
          <span className="text-accent">~/</span>
          <span className="text-ink">alexmchugh.dev</span>
          <span className="ml-2 text-ink-faint">
            &copy; Alex McHugh 2026
          </span>
        </div>

        <nav className="flex flex-wrap items-center gap-5 font-mono text-xs text-ink-muted">
          <a
            href="https://github.com/AlexMcHugh1"
            target="_blank"
            rel="noreferrer"
            className="link-underline"
          >
            github <span aria-hidden>↗</span>
          </a>
          <a
            href="https://www.linkedin.com/in/alexmchugh2026/"
            target="_blank"
            rel="noreferrer"
            className="link-underline"
          >
            linkedin <span aria-hidden>↗</span>
          </a>
          {/* PLACEHOLDER — replace with real contact email */}
          <a href="mailto:CONTACT_EMAIL" className="link-underline">
            email <span aria-hidden>↗</span>
          </a>
        </nav>
      </div>
    </footer>
  );
}
