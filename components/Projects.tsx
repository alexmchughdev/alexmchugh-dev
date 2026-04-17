import SectionHeader from './SectionHeader';

type Project = {
  title: string;
  tagline: string;
  description: string;
  tech: string[];
  github?: string;
  live?: string;
  status?: 'live' | 'early' | 'academic' | 'homelab';
};

const projects: Project[] = [
  {
    title: 'DevSecOps Home Lab',
    tagline: 'Production patterns, at home',
    description:
      'RKE2 Kubernetes cluster on a Rocky Linux mini PC, fronted by OPNsense with Suricata feeding Wazuh SIEM. Vault for secrets, MinIO for object storage, Velero for backup. Proxmox on a Dell PowerEdge R220.',
    tech: [
      'RKE2',
      'Rocky Linux',
      'Vault',
      'Velero',
      'MinIO',
      'OPNsense',
      'Suricata',
      'Wazuh',
      'Proxmox',
    ],
    status: 'homelab',
  },
  {
    title: 'getdfx.uk',
    tagline: 'OT Edge Asset Management',
    description:
      'Go web app for industrial asset tagging, shipped on a full GitOps pipeline: signed images, admission-policy gating, and end-to-end observability from commit to cluster.',
    tech: [
      'Go',
      'GitHub Actions',
      'ArgoCD',
      'RKE2',
      'GHCR',
      'Kustomize',
      'Trivy',
      'Semgrep',
      'Cosign/Sigstore',
      'Kyverno',
      'cert-manager',
      'Prometheus',
      'Grafana',
      'Loki',
    ],
    live: 'https://getdfx.uk',
    status: 'live',
  },
  {
    title: 'Seiri',
    tagline: 'Webhook & cron monitoring',
    description:
      'B2B SaaS that catches the failures nobody notices: silent webhook drops and cron jobs that simply stop firing. Early stage.',
    tech: ['SaaS', 'Observability'],
    status: 'early',
  },
  {
    title: 'Orion Belt',
    tagline: 'Open-source PAM gateway',
    description:
      'A privileged access management gateway for teams that have outgrown shared SSH keys but can’t justify an enterprise PAM. Early stage.',
    tech: ['Open Source', 'Go', 'Zero Trust'],
    status: 'early',
  },
  {
    title: 'Multi-agent simulation',
    tagline: 'MSc research project',
    description:
      'Multi-agent simulation inspired by Project Hail Mary. Autonomous agents coordinating under partial information in a grid world.',
    tech: ['Python', 'Multi-agent', 'Simulation'],
    github: 'https://github.com/AlexMcHugh1/multi-agent-simulation-python',
    status: 'academic',
  },
  {
    title: 'Campus maintenance system',
    tagline: 'MSc web app',
    description:
      'Full-stack maintenance management system for a university campus: ticketing, asset tracking, role-based workflows.',
    tech: ['React', 'Express', 'MongoDB', 'Node.js'],
    status: 'academic',
  },
];

const statusLabel: Record<NonNullable<Project['status']>, string> = {
  live: 'live',
  early: 'early',
  academic: 'academic',
  homelab: 'homelab',
};

export default function Projects() {
  return (
    <section id="projects" className="relative scroll-mt-20 py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-5">
        <SectionHeader command="ls -l projects/" title="projects" />

        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {projects.map((p) => (
            <li key={p.title} className="card reveal flex flex-col">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-mono text-[15px] font-medium text-ink">
                    {p.title}
                  </h3>
                  <p className="mt-0.5 font-mono text-xs text-ink-faint">
                    {p.tagline}
                  </p>
                </div>
                {p.status ? (
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-ink-faint">
                    [{statusLabel[p.status]}]
                  </span>
                ) : null}
              </div>

              <p className="mb-4 flex-1 font-mono text-[13px] leading-relaxed text-ink-muted">
                {p.description}
              </p>

              <ul className="mb-4 flex flex-wrap gap-1.5">
                {p.tech.map((t) => (
                  <li
                    key={t}
                    className="border border-line bg-transparent px-1.5 py-0 font-mono text-[11px] text-ink-muted"
                  >
                    {t}
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center gap-4 border-t border-line pt-3 font-mono text-xs">
                {p.live ? (
                  <a
                    href={p.live}
                    target="_blank"
                    rel="noreferrer"
                    className="t-link"
                  >
                    ./live
                  </a>
                ) : null}
                {p.github ? (
                  <a
                    href={p.github}
                    target="_blank"
                    rel="noreferrer"
                    className="t-link"
                  >
                    ./source
                  </a>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
