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
  'mTLS/PKI',
  'cert-manager',
  'Prometheus',
  'Grafana',
  'Proxmox',
  'Portainer',
  'pfSense',
  'OPNsense',
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
                Product assurance engineer pursuing DevSecOps. My
                current work covers the security and reliability of software
                before it ships. My focus going forward is on the delivery
                side of that: secure CI/CD, Kubernetes platform engineering,
                and supply-chain integrity.
              </p>
              <p>
                I&rsquo;m finishing an MSc in Computer Science. My homelab
                runs RKE2 with a full GitOps pipeline, Vault, and observability
                tooling, which is where I work with production DevSecOps
                patterns end to end.
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
