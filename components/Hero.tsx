type Entry = { href: string; label: string };

const sections: Entry[] = [
  { href: '#about', label: './about' },
  { href: '#experience', label: './experience' },
  { href: '#education', label: './education' },
  { href: '#certs', label: './certs' },
  { href: '#github', label: './github' },
  { href: '#articles', label: './articles' },
  { href: '#cv', label: './cv' },
];

function Prompt({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-sm">
      <span className="text-prompt">alex@mchugh</span>
      <span className="text-ink">:</span>
      <span className="text-path">~</span>
      <span className="mx-1 text-ink">$</span>
      <span className="text-ink">{children}</span>
    </span>
  );
}

export default function Hero() {
  return (
    <section id="top" className="relative pt-16 pb-10 md:pt-24 md:pb-14">
      <div className="mx-auto w-full max-w-5xl px-5">
        <div className="space-y-4">
          <div>
            <Prompt>whoami</Prompt>
          </div>

          <div>
            <h1 className="font-mono text-2xl font-medium leading-tight text-ink md:text-3xl">
              Alex McHugh
            </h1>
            <p className="mt-1 font-mono text-sm text-ink-muted md:text-base">
              DevSecOps Engineer · MSc Computer Science
            </p>
          </div>

          <div className="pt-2">
            <Prompt>ls ~/</Prompt>
          </div>

          <ul
            role="list"
            className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-sm"
          >
            {sections.map((s) => (
              <li key={s.href}>
                <a href={s.href} className="t-link">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
