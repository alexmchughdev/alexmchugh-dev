import SectionHeader from './SectionHeader';

type Cert = {
  name: string;
  issuer: string;
  issued: string;
  expires?: string;
  accent: string;
  url: string;
};

// PLACEHOLDER Credly URLs — replace each with the real badge URL when
// available. Cards link out; entire card is clickable.
const certs: Cert[] = [
  {
    name: 'CompTIA Security+',
    issuer: 'CompTIA',
    issued: 'Oct 2025',
    expires: 'Oct 2028',
    accent: '#FF0000',
    url: 'https://www.credly.com/badges/df00b627-e948-4521-a8b2-4ad0ac523542/public_url',
  },
  {
    name: 'Certified in Cybersecurity (CC)',
    issuer: 'ISC2',
    issued: 'Oct 2025',
    expires: 'Oct 2028',
    accent: '#4CAF50',
    url: 'https://www.credly.com/badges/79c20cb8-f31c-4b49-aad5-dedc141eb2b8/public_url',
  },
  {
    name: 'AWS Certified Cloud Practitioner',
    issuer: 'Amazon Web Services',
    issued: 'Oct 2025',
    expires: 'Oct 2028',
    accent: '#FF9900',
    url: 'https://www.credly.com/badges/c106804b-c2e7-47e1-8721-7b5f780013ce/public_url',
  },
  {
    name: 'Azure Fundamentals (AZ-900)',
    issuer: 'Microsoft',
    issued: 'Oct 2025',
    accent: '#0078D4',
    url: 'https://learn.microsoft.com/en-gb/users/alexmchugh-1009/credentials/1f7ef9db87e912c4',
  },
];

export default function Certifications() {
  return (
    <section id="certs" className="relative scroll-mt-8 py-12 md:py-16">
      <div className="mx-auto max-w-5xl px-5">
        <SectionHeader command="ls certs/" title="certs" />

        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {certs.map((c) => (
            <li key={c.name}>
              <a
                href={c.url}
                target="_blank"
                rel="noreferrer"
                className="group relative flex h-full flex-col border border-line border-l-[3px] bg-bg-card/70 p-5 transition-colors duration-150 hover:border-ink-muted/60 hover:bg-bg-card"
                style={{ borderLeftColor: c.accent }}
              >
                <div className="flex-1">
                  <h3 className="font-mono text-[15px] font-medium leading-snug text-ink">
                    {c.name}
                  </h3>
                  <p className="mt-0.5 font-mono text-xs text-ink-muted">
                    {c.issuer}
                  </p>
                  <p className="mt-2 font-mono text-[11px] text-ink-faint">
                    Issued {c.issued}
                    {c.expires ? ` · Expires ${c.expires}` : ''}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-end font-mono text-xs text-accent">
                  <span className="transition-transform group-hover:translate-x-0.5">
                    ↗ verify
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
