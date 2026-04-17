function Prompt({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-sm">
      <span className="text-prompt">alex</span>
      <span className="text-ink-faint">@</span>
      <span className="text-[#b3c48c]">mchugh</span>
      <span className="text-ink-faint">:</span>
      <span className="text-ink">~</span>
      <span className="mx-1 text-ink-faint">$</span>
      <span className="text-ink">{children}</span>
    </span>
  );
}

export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] items-center pt-20"
    >
      <div className="mx-auto w-full max-w-5xl px-5">
        <div className="space-y-5">
          <div>
            <Prompt>whoami</Prompt>
          </div>

          <div className="pl-0">
            <h1 className="font-mono text-2xl font-medium leading-tight text-ink md:text-3xl">
              Alex McHugh
            </h1>
            <p className="mt-1 font-mono text-sm text-ink-muted md:text-base">
              DevSecOps Engineer · MSc Computer Science
            </p>
          </div>

          <div className="pt-4">
            <Prompt>cat about.txt</Prompt>
          </div>

          <div className="max-w-2xl font-mono text-sm leading-relaxed text-ink-muted md:text-[15px]">
            I work on the boring, important parts of software delivery:
            secure CI/CD pipelines, Kubernetes platforms, policy-as-code,
            and the observability that tells you when something&rsquo;s
            actually broken. Currently finishing an MSc in Computer Science.
          </div>

          <div className="pt-4 flex flex-wrap items-center gap-3">
            <Prompt>
              <span>
                ls{' '}
                <a href="#projects" className="t-link">projects/</a>
              </span>
            </Prompt>
            <span className="text-ink-faint">·</span>
            {/* PLACEHOLDER: drop CV at /public/cv.pdf */}
            <a href="/cv.pdf" className="t-link font-mono text-sm" download>
              ./cv.pdf
            </a>
          </div>

          <div className="pt-2 font-mono text-sm text-ink">
            <span className="text-prompt">alex</span>
            <span className="text-ink-faint">@</span>
            <span className="text-[#b3c48c]">mchugh</span>
            <span className="text-ink-faint">:</span>
            <span className="text-ink">~</span>
            <span className="mx-1 text-ink-faint">$</span>
            <span className="ml-0.5 inline-block h-[1.1em] w-[0.55em] translate-y-[3px] bg-ink animate-cursor-blink" />
          </div>
        </div>
      </div>
    </section>
  );
}
