import SimulationClient from '@/components/SimulationClient';

export const metadata = {
  title: 'CPS7004 · Project Hail Mary Multi-Agent Simulation',
  description:
    'CPS7004 coursework. Multi-agent grid simulation of Grace, Rocky, Astrophage and Taumoeba. Python runs in the browser via Pyodide.',
  robots: { index: false, follow: false },
};

export default function SimulationPage() {
  return <SimulationClient />;
}
