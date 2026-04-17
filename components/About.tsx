import SectionHeader from './SectionHeader';

const stack = [
  'Linux',
  'Bash',
  'Go',
  'Python',
  'Git',
  'Docker',
  'Kubernetes',
  'ArgoCD',
  'Kustomize',
  'GitHub Actions',
  'Vault',
  'Prometheus',
  'Grafana',
  'Proxmox',
  'Portainer',
  'pfSense',
  'Tailscale',
  'Cloudflare',
];

export default function About() {
  return (
    <section id="about" className="relative scroll-mt-8 py-12 md:py-16">
      <div className="mx-auto max-w-5xl px-5">
        <SectionHeader command="cat about.md" title="about" />

        <div className="mt-8 grid gap-10 md:grid-cols-12 md:gap-12">
          <div className="reveal md:col-span-8">
            <div className="space-y-4 font-mono text-sm leading-relaxed text-ink-muted md:text-[15px]">
              <p>
                I&rsquo;m a product assurance engineer pursuing DevSecOps.
                The most interesting failures happen where security,
                infrastructure, and developer experience collide, and
                that&rsquo;s where I&rsquo;m building my career.
              </p>
              <p>
                I&rsquo;m finishing an MSc in Computer Science while running a
                homelab that mirrors the production patterns I work toward:
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
