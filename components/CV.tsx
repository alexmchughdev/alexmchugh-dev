import SectionHeader from './SectionHeader';

export default function CV() {
  return (
    <section id="cv" className="relative scroll-mt-8 py-12 md:py-16">
      <div className="mx-auto max-w-5xl px-5">
        <SectionHeader command="less cv.txt" title="cv" />

        <div className="mt-8 grid gap-10 md:grid-cols-12 md:gap-12">
          <div className="reveal md:col-span-8">
            <p className="font-mono text-sm leading-relaxed text-ink-muted md:text-[15px]">
              Product assurance engineer pursuing DevSecOps. Focus areas:
              CI/CD, Kubernetes platform security, supply-chain integrity,
              and SIEM/observability. Currently finishing an MSc in Computer
              Science.
            </p>

            <ul className="mt-6 space-y-2 font-mono text-sm text-ink-muted">
              <li>
                <span className="text-ink-faint">-</span> Product assurance
                engineering
                <span className="text-ink-faint"> (current)</span>
              </li>
              <li>
                <span className="text-ink-faint">-</span> DevSecOps, Kubernetes,
                GitOps, supply-chain security
                <span className="text-ink-faint"> (focus)</span>
              </li>
              <li>
                <span className="text-ink-faint">-</span> MSc Computer Science
                <span className="text-ink-faint"> (in progress)</span>
              </li>
            </ul>
          </div>

          <div className="reveal flex flex-col gap-3 md:col-span-4">
            {/* PLACEHOLDER: drop CV at /public/cv.pdf */}
            <a href="/cv.pdf" className="btn-primary" download>
              ./cv.pdf
            </a>
            <a
              href="https://www.linkedin.com/in/alexmchugh2026/"
              target="_blank"
              rel="noreferrer"
              className="btn"
            >
              linkedin.com ↗
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
