import SectionHeader from './SectionHeader';

type Role = {
  company: string;
  title: string;
  type: string;
  dates: string;
  bullets?: string[];
  summary?: string;
  accent: string;
  muted?: boolean;
};

const roles: Role[] = [
  {
    company: 'deltaflare',
    title: 'Product Assurance Engineer',
    type: 'On-site · London',
    dates: 'Oct 2025 – Present',
    accent: '#cba6f7', // mauve
    bullets: [
      'Supporting testing and assurance activities for the Phoenix platform.',
      'Assisting with software validation, documentation, and automation tasks.',
      'Writing Go and Bash tooling for automation and internal infrastructure tasks.',
      'Linux systems administration and container management via Docker and Portainer.',
      'Grafana dashboards for container monitoring and observability.',
      'Participating in security assessment and patch testing activities.',
      'Collaborating with senior engineers to resolve technical issues and explore new development concepts.',
    ],
  },
];

export default function Experience() {
  return (
    <section id="experience" className="relative scroll-mt-8 py-12 md:py-16">
      <div className="mx-auto max-w-5xl px-5">
        <SectionHeader command="cat experience.yaml" title="experience" />

        <ul className="mt-6 space-y-4">
          {roles.map((r) => (
            <li
              key={r.company}
              className={[
                'relative reveal border border-line border-l-[3px] bg-bg-card/70',
                r.muted ? 'px-5 py-4 opacity-90' : 'p-5',
              ].join(' ')}
              style={{ borderLeftColor: r.accent }}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3
                    className={
                      r.muted
                        ? 'font-mono text-sm text-ink-muted'
                        : 'font-mono text-[15px] font-medium text-ink'
                    }
                  >
                    {r.title}
                    <span className="text-ink-faint"> · </span>
                    <span
                      className={
                        r.muted ? 'text-ink-muted' : 'text-ink-muted'
                      }
                    >
                      {r.company}
                    </span>
                  </h3>
                </div>
                <div className="shrink-0 text-right font-mono text-[11px] text-ink-faint">
                  <div>{r.dates}</div>
                  <div>{r.type}</div>
                </div>
              </div>

              {r.summary ? (
                <p
                  className={[
                    'mt-2 font-mono leading-relaxed',
                    r.muted
                      ? 'text-xs text-ink-muted'
                      : 'text-[13px] text-ink-muted',
                  ].join(' ')}
                >
                  {r.summary}
                </p>
              ) : null}

              {r.bullets ? (
                <ul className="mt-3 space-y-1.5 font-mono text-[13px] leading-relaxed text-ink-muted">
                  {r.bullets.map((b) => (
                    <li key={b} className="flex gap-2">
                      <span className="mt-0.5 text-ink-faint">-</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
