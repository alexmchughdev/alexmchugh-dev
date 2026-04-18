import data from '@/data/github.json';
import SectionHeader from './SectionHeader';

type Pin = {
  name: string;
  description: string | null;
  url: string;
  stars: number;
  forks: number;
  language: { name: string; color: string } | null;
  topics: string[];
};

type Day = { date: string; count: number; weekday: number };
type Week = { days: Day[] };

type GithubData = {
  fetchedAt: string | null;
  stub?: boolean;
  pinned: Pin[];
  calendar: { total: number; weeks: Week[] };
};

const gh = data as GithubData;

const CELL = 10;
const GAP = 3;
const WEEKDAY_LABELS = ['Mon', 'Wed', 'Fri'];

// GitHub's dark-mode contribution palette
// GitHub's dark-mode contribution palette, kept as-is so the graph reads
// identically to github.com.
function intensity(count: number): string {
  if (count <= 0) return '#161b22';
  if (count < 3) return '#0e4429';
  if (count < 6) return '#006d32';
  if (count < 10) return '#26a641';
  return '#39d353';
}

function Calendar({ weeks, total }: { weeks: Week[]; total: number }) {
  if (weeks.length === 0) {
    return (
      <p className="font-mono text-xs text-ink-faint">
        # contribution data unavailable at build time
      </p>
    );
  }

  const width = weeks.length * (CELL + GAP);
  const height = 7 * (CELL + GAP);

  const monthMarkers: { x: number; label: string }[] = [];
  let lastMonth = -1;
  weeks.forEach((w, wi) => {
    const first = w.days[0];
    if (!first) return;
    const m = new Date(first.date).getUTCMonth();
    if (m !== lastMonth) {
      monthMarkers.push({
        x: wi * (CELL + GAP),
        label: new Date(first.date).toLocaleString('en-US', {
          month: 'short',
          timeZone: 'UTC',
        }),
      });
      lastMonth = m;
    }
  });

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-4 pr-2">
          <div className="font-mono text-xs text-ink-muted">
            <span className="text-ink">{total.toLocaleString()}</span>{' '}
            contributions · last 12 months
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-ink-faint">
            less
            {[0, 2, 5, 9, 20].map((n) => (
              <span
                key={n}
                className="inline-block h-2.5 w-2.5"
                style={{ background: intensity(n) }}
                aria-hidden
              />
            ))}
            more
          </div>
        </div>

        <svg
          width={width + 28}
          height={height + 22}
          viewBox={`0 0 ${width + 28} ${height + 22}`}
          role="img"
          aria-label={`${total} GitHub contributions in the last year`}
        >
          {WEEKDAY_LABELS.map((l, i) => (
            <text
              key={l}
              x={0}
              y={18 + (i * 2 + 1) * (CELL + GAP) + CELL - 2}
              fontSize="9"
              fontFamily="ui-monospace, monospace"
              fill="#55555f"
            >
              {l}
            </text>
          ))}
          {monthMarkers.map((m, i) => (
            <text
              key={`${m.label}-${i}`}
              x={24 + m.x}
              y={10}
              fontSize="9"
              fontFamily="ui-monospace, monospace"
              fill="#55555f"
            >
              {m.label}
            </text>
          ))}
          <g transform="translate(24 18)">
            {weeks.map((w, wi) =>
              w.days.map((d) => (
                <rect
                  key={d.date}
                  x={wi * (CELL + GAP)}
                  y={d.weekday * (CELL + GAP)}
                  width={CELL}
                  height={CELL}
                  fill={intensity(d.count)}
                >
                  <title>{`${d.count} contribution${d.count === 1 ? '' : 's'} on ${d.date}`}</title>
                </rect>
              )),
            )}
          </g>
        </svg>
      </div>
    </div>
  );
}

function PinCard({ repo }: { repo: Pin }) {
  return (
    <a
      href={repo.url}
      target="_blank"
      rel="noreferrer"
      className="card reveal flex flex-col"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="font-mono text-[14px] font-medium text-ink">
          {repo.name}
        </h3>
        <span aria-hidden className="font-mono text-xs text-ink-faint">
          ↗
        </span>
      </div>

      <p className="mb-4 flex-1 font-mono text-[12px] leading-relaxed text-ink-muted">
        {repo.description || '# no description'}
      </p>

      <div className="flex items-center gap-4 border-t border-line pt-3 font-mono text-[11px] text-ink-faint">
        {repo.language ? (
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: repo.language.color || '#8a8a92' }}
            />
            {repo.language.name}
          </span>
        ) : null}
        {repo.stars > 0 ? <span>★ {repo.stars}</span> : null}
        {repo.forks > 0 ? <span>⑂ {repo.forks}</span> : null}
      </div>
    </a>
  );
}

// Explicit exclude list so re-pinning a retired repo won't resurface it here.
const HIDDEN_REPOS = new Set(['edgeflux']);

export default function GitHub() {
  const pinned = gh.pinned.filter(
    (r) => !HIDDEN_REPOS.has(r.name.toLowerCase()),
  );
  const hasPinned = pinned.length > 0;
  const hasCalendar = gh.calendar.weeks.length > 0;
  if (!hasPinned && !hasCalendar) return null;

  return (
    <section id="github" className="relative scroll-mt-8 py-12 md:py-16">
      <div className="mx-auto max-w-5xl px-5">
        <SectionHeader
          command="git log --oneline --graph"
          title="github"
        />

        {hasCalendar ? (
          <div className="mt-6 border border-line bg-bg-card/60 p-4 md:p-5 reveal">
            <Calendar weeks={gh.calendar.weeks} total={gh.calendar.total} />
          </div>
        ) : null}

        {hasPinned ? (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pinned.map((repo) => (
              <li key={repo.name}>
                <PinCard repo={repo} />
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-6 font-mono text-xs text-ink-faint">
          <a
            href="https://github.com/alexmchughdev"
            target="_blank"
            rel="noreferrer"
            className="t-link"
          >
            github.com/alexmchughdev
          </a>
        </div>
      </div>
    </section>
  );
}
