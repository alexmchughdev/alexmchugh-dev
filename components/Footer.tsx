export default function Footer() {
  return (
    <footer className="border-t border-line bg-bg">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-5 py-8 md:flex-row md:items-center md:justify-between">
        <div className="font-mono text-xs text-ink-faint">
          <span className="text-prompt">alex</span>
          <span>@</span>
          <span className="text-[#b3c48c]">mchugh</span>
          <span>:</span>
          <span className="text-ink-muted">~</span>
          <span className="ml-1">$ echo &quot;&copy; 2026&quot;</span>
        </div>

        <nav className="flex flex-wrap items-center gap-5 font-mono text-xs text-ink-muted">
          <a
            href="https://github.com/AlexMcHugh1"
            target="_blank"
            rel="noreferrer"
            className="hover:text-accent"
          >
            github ↗
          </a>
          <a
            href="https://www.linkedin.com/in/alexmchugh2026/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-accent"
          >
            linkedin ↗
          </a>
          <a href="mailto:alex@alexmchugh.dev" className="hover:text-accent">
            email ↗
          </a>
        </nav>
      </div>
    </footer>
  );
}
