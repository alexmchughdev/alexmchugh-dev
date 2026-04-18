import SectionHeader from './SectionHeader';

type Group = { label: string; items: string[] };

const stack: Group[] = [
  {
    label: 'languages',
    items: ['Go', 'Python', 'JavaScript', 'Bash'],
  },
  {
    label: 'platform',
    items: ['Linux', 'Git', 'Docker', 'Kubernetes'],
  },
  {
    label: 'delivery',
    items: ['ArgoCD', 'Kustomize', 'GitHub Actions'],
  },
  {
    label: 'security',
    items: ['Vault', 'mTLS/PKI', 'cert-manager'],
  },
  {
    label: 'observability',
    items: ['Prometheus', 'Grafana'],
  },
  {
    label: 'infrastructure',
    items: [
      'Proxmox',
      'Portainer',
      'pfSense',
      'OPNsense',
      'Tailscale',
      'Cloudflare',
    ],
  },
];

export default function About() {
  return (
    <section id="about" className="relative scroll-mt-8 py-12 md:py-16">
      <div className="mx-auto max-w-5xl px-5">
        <SectionHeader command="cat about.md" title="about" />

        <div className="mt-8 grid gap-10 md:grid-cols-12 md:gap-12">
          <div className="reveal md:col-span-7">
            <div className="space-y-4 font-mono text-sm leading-relaxed text-ink-muted md:text-[15px]">
              <p>
                Product assurance engineer pursuing DevSecOps. My current
                work covers the security and reliability of software before
                it ships. My focus going forward is on the delivery side of
                that: secure CI/CD, Kubernetes platform engineering, and
                supply-chain integrity.
              </p>
              <p>
                I&rsquo;m finishing an MSc in Computer Science. My homelab
                runs RKE2 with a full GitOps pipeline, Vault, and observability
                tooling, which is where I work with production DevSecOps
                patterns end to end.
              </p>
            </div>
          </div>

          <div className="reveal md:col-span-5">
            <dl className="space-y-3">
              {stack.map((g) => (
                <div key={g.label}>
                  <dt className="mb-1.5 font-mono text-[11px] text-ink-faint">
                    # {g.label}
                  </dt>
                  <dd>
                    <ul className="flex flex-wrap gap-1.5">
                      {g.items.map((t) => (
                        <li key={t} className="chip">
                          {t}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
