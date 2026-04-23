import SectionHeader from './SectionHeader';

export default function Education() {
  return (
    <section id="education" className="relative scroll-mt-8 py-12 md:py-16">
      <div className="mx-auto max-w-5xl px-5">
        <SectionHeader command="cat education.md" title="education" />

        <div className="mt-6 space-y-5">
          {/* MSc — primary */}
          <div
            className="relative reveal border border-line border-l-[3px] bg-bg-card/70 p-5"
            style={{ borderLeftColor: '#cba6f7' }}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-mono text-[15px] font-medium text-ink">
                  MSc Computer Science
                </h3>
                <p className="mt-0.5 font-mono text-sm text-ink-muted">
                  St Mary&rsquo;s University, Twickenham
                </p>
              </div>
              <div className="shrink-0 text-right font-mono text-[11px] text-ink-faint">
                <div>Sep 2025 – Sep 2026</div>
                <div>expected Sep 2026</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
