import SectionHeader from './SectionHeader';

const stack = [
  'Go',
  'Python',
  'React',
  'Kubernetes',
  'ArgoCD',
  'Vault',
  'Terraform',
  'GitHub Actions',
  'Trivy',
  'Semgrep',
  'Kyverno',
  'Wazuh',
];

export default function About() {
  return (
    <section id="about" className="relative scroll-mt-20 py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-5">
        <SectionHeader command="cat about.md" title="about" />

        <div className="mt-8 grid gap-10 md:grid-cols-12 md:gap-12">
          <div className="reveal md:col-span-8">
            <div className="space-y-4 font-mono text-sm leading-relaxed text-ink-muted md:text-[15px]">
              <p>
                I&rsquo;m a DevSecOps engineer. The most interesting failures
                happen where security, infrastructure, and developer experience
                collide, and that&rsquo;s where I spend my time.
              </p>
              <p>
                I&rsquo;m finishing an MSc in Computer Science while running a
                homelab that mirrors the production patterns I work with:
                RKE2, GitOps, policy-as-code, SIEM, signed artifacts.
              </p>
            </div>
          </div>

          <div className="reveal md:col-span-4">
            <div className="mb-2 font-mono text-xs text-ink-faint"># stack</div>
            <ul className="flex flex-wrap gap-1.5">
              {stack.map((t) => (
                <li key={t} className="chip">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
