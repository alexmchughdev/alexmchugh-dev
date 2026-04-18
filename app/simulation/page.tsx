import SimulationClient from '@/components/SimulationClient';

export const metadata = {
  title: 'Hail Mary · Multi-Agent Grid Simulation',
  description:
    'Browser-hosted run of the multi-agent-grid-simulation Python code, powered by Pyodide.',
  robots: { index: false, follow: false },
};

export default function SimulationPage() {
  return <SimulationClient />;
}
