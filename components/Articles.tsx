import SectionHeader from './SectionHeader';

const ARTICLE_TITLE =
  'The Death of the Trusted Zone: Navigating Decentralised Security';
const DELTAFLARE_REPOST_URL =
  'https://www.linkedin.com/posts/activity-7438227683089645568--bt6?utm_source=share&utm_medium=member_desktop&rcm=ACoAAEh31CcBN51w0RSiai2JMD1a5tLjziEr7F0';

export default function Articles() {
  return (
    <section id="articles" className="relative scroll-mt-20 py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-5">
        <SectionHeader command="cat writing/*.md" title="articles" />

        <article className="card reveal mt-6">
          <div className="mb-3 flex flex-wrap items-center gap-2 font-mono text-[11px] text-ink-faint">
            <span className="text-accent">[featured]</span>
            <a
              href={DELTAFLARE_REPOST_URL}
              target="_blank"
              rel="noreferrer"
              className="t-link"
            >
              published by deltaflare
            </a>
          </div>

          <h3 className="font-mono text-base font-medium leading-snug text-ink md:text-lg">
            {ARTICLE_TITLE}
          </h3>

          <p className="mt-3 max-w-2xl font-mono text-[13px] leading-relaxed text-ink-muted">
            The &ldquo;trusted zone&rdquo; is a relic of an era when systems
            had perimeters. IoT, remote telemetry, and hybrid work have turned
            that perimeter into a fiction. The article explores what
            replaces it, and how to secure a decentralised world in practice.
          </p>
        </article>
      </div>
    </section>
  );
}
