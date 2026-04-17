export default function CV() {
  return (
    <section id="cv" className="relative scroll-mt-24 py-28 md:py-36">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-10 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-5">
            <div className="section-label reveal">
              <span className="font-mono text-ink-faint">04</span>
              cv
            </div>
            <h2 className="section-title reveal">Experience &amp; credentials.</h2>
          </div>

          <div className="reveal md:col-span-7">
            <p className="text-base leading-relaxed text-ink-muted md:text-lg">
              Background in IT assurance and controls auditing, currently
              focused on DevSecOps engineering — CI/CD, Kubernetes platform
              security, supply-chain integrity, and SIEM/observability. Pursuing
              an MSc in Computer Science alongside consulting engagements and
              open-source work.
            </p>

            <ul className="mt-8 grid gap-3 font-mono text-sm text-ink-muted">
              <li className="flex items-center gap-3">
                <span className="text-accent">▹</span>
                MSc Computer Science{' '}
                <span className="text-ink-faint">— in progress</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-accent">▹</span>
                IT Assurance → DevSecOps{' '}
                <span className="text-ink-faint">— multi-year transition</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-accent">▹</span>
                Kubernetes, GitOps, Supply-chain security{' '}
                <span className="text-ink-faint">— focus areas</span>
              </li>
            </ul>

            <div className="mt-10 flex flex-wrap gap-3">
              {/* PLACEHOLDER — drop CV at /public/cv.pdf */}
              <a href="/cv.pdf" className="btn-primary" download>
                <span className="text-accent/70">$</span>
                Download CV
                <span aria-hidden>↓</span>
              </a>
              <a
                href="https://www.linkedin.com/in/alexmchugh2026/"
                target="_blank"
                rel="noreferrer"
                className="btn-ghost"
              >
                View on LinkedIn
                <span aria-hidden>↗</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
