'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const PYODIDE_VERSION = '0.27.0';
const PYODIDE_CDN = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/pyodide.js`;

const PY_FILES = [
  'environment.py',
  'agents.py',
  'astrophage.py',
  'taumoeba.py',
  'mission.py',
  'simulation.py',
];

const CELL_SIZE = 28;
const GRID_CELLS = 20;
const CANVAS_PX = CELL_SIZE * GRID_CELLS;
const TICK_MS = 300;
const FLASHBACK_PAUSE_MS = 3500;
const LOG_MAX_LINES = 400;

const CELL_COLOURS: Record<string, string> = {
  '.': '#0a0a1a',
  A: '#2d6a2d',
  X: '#8b0000',
  H: '#1a3a6b',
  B: '#6b4a1a',
  '!': '#7a6a00',
};

type PyodideInterface = {
  runPythonAsync: (code: string) => Promise<unknown>;
  runPython: (code: string) => unknown;
  globals: { get: (name: string) => unknown };
  FS: {
    writeFile: (path: string, data: string) => void;
    mkdir: (path: string) => void;
  };
};

declare global {
  interface Window {
    loadPyodide?: (opts: { indexURL: string }) => Promise<PyodideInterface>;
  }
}

type Stats = {
  turn: number;
  health: number;
  energy: number;
  fuel: number;
  equipment: number;
  knowledge: number;
  samples: number;
  probes: number;
  probesTransmitted: number;
  cooperation: number;
  astrophageCells: number;
  viable: boolean;
  missionState: 'idle' | 'running' | 'paused' | 'complete' | 'failed';
};

const EMPTY_STATS: Stats = {
  turn: 0,
  health: 0,
  energy: 0,
  fuel: 0,
  equipment: 0,
  knowledge: 0,
  samples: 0,
  probes: 0,
  probesTransmitted: 0,
  cooperation: 100,
  astrophageCells: 0,
  viable: false,
  missionState: 'idle',
};

function loadScriptOnce(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${src}"]`,
    );
    if (existing) {
      if (existing.dataset.loaded === 'true') return resolve();
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('script load failed')), {
        once: true,
      });
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = () => {
      s.dataset.loaded = 'true';
      resolve();
    };
    s.onerror = () => reject(new Error(`failed to load ${src}`));
    document.head.appendChild(s);
  });
}

export default function SimulationClient() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const logRef = useRef<HTMLDivElement | null>(null);
  const pyodideRef = useRef<PyodideInterface | null>(null);
  const timerRef = useRef<number | null>(null);
  const runningRef = useRef<boolean>(false);

  const [ready, setReady] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('booting pyodide runtime');
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [logLines, setLogLines] = useState<string[]>([]);
  const [flashback, setFlashback] = useState<{
    message: string;
    objective: string;
  } | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const drawFrame = useCallback(
    (
      cells: string[][],
      grace: { x: number; y: number },
      rocky: { x: number; y: number },
      probes: { name: string; x: number; y: number }[],
    ) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = '#0a0a1a';
      ctx.fillRect(0, 0, CANVAS_PX, CANVAS_PX);

      for (let y = 0; y < GRID_CELLS; y++) {
        for (let x = 0; x < GRID_CELLS; x++) {
          ctx.fillStyle = CELL_COLOURS[cells[y][x]] ?? '#0a0a1a';
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          ctx.strokeStyle = '#1a1a2e';
          ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }

      drawAgent(ctx, grace.x, grace.y, 'G', '#00ff88');
      drawAgent(ctx, rocky.x, rocky.y, 'R', '#ff8800');
      for (const p of probes) {
        drawAgent(ctx, p.x, p.y, p.name.charAt(0), '#aaaaff');
      }
    },
    [],
  );

  const pullFrameAndLog = useCallback(() => {
    const pyodide = pyodideRef.current;
    if (!pyodide) return;

    const frameJson = pyodide.runPython(`
import json
_grid = sim.grid
_cells = [[_grid.get_cell(x, y) for x in range(_grid.width)] for y in range(_grid.height)]
_probes = [{"name": p.name, "x": p.x, "y": p.y, "transmitted": p.data_transmitted} for p in sim.probes]
_pending = sim.consume_pending_flashbacks()
_new_log = _log_buffer.getvalue()
_log_buffer.seek(0); _log_buffer.truncate(0)
json.dumps({
    "turn": sim.turn,
    "cells": _cells,
    "grace": {
        "x": sim.grace.x, "y": sim.grace.y,
        "health": sim.grace.health, "energy": sim.grace.energy,
        "fuel": sim.grace.fuel, "equipment": sim.grace.equipment,
        "knowledge": sim.grace.knowledge_score,
        "samples": len(sim.grace.inventory),
    },
    "rocky": {"x": sim.rocky.x, "y": sim.rocky.y},
    "probes": _probes,
    "probes_transmitted": sum(1 for p in sim.probes if p.data_transmitted),
    "cooperation": sim.protocol.cooperation_score,
    "astrophage_cells": len(sim.astrophage.intensity_map),
    "viable": sim.culture.viable_strain,
    "pending_flashbacks": _pending,
    "log": _new_log,
})
`) as string;

    const frame = JSON.parse(frameJson) as {
      turn: number;
      cells: string[][];
      grace: Stats & { x: number; y: number };
      rocky: { x: number; y: number };
      probes: { name: string; x: number; y: number; transmitted: boolean }[];
      probes_transmitted: number;
      cooperation: number;
      astrophage_cells: number;
      viable: boolean;
      pending_flashbacks: { message: string; objective: string }[];
      log: string;
    };

    drawFrame(frame.cells, frame.grace, frame.rocky, frame.probes);

    setStats((prev) => ({
      ...prev,
      turn: frame.turn,
      health: frame.grace.health,
      energy: frame.grace.energy,
      fuel: frame.grace.fuel,
      equipment: frame.grace.equipment,
      knowledge: frame.grace.knowledge,
      samples: frame.grace.samples,
      probes: frame.probes.length,
      probesTransmitted: frame.probes_transmitted,
      cooperation: frame.cooperation,
      astrophageCells: frame.astrophage_cells,
      viable: frame.viable,
    }));

    if (frame.log) {
      const newLines = frame.log
        .split('\n')
        .filter((line) => line.length > 0);
      if (newLines.length) {
        setLogLines((prev) => {
          const merged = [...prev, ...newLines];
          return merged.length > LOG_MAX_LINES
            ? merged.slice(merged.length - LOG_MAX_LINES)
            : merged;
        });
      }
    }

    return frame.pending_flashbacks;
  }, [drawFrame]);

  const tick = useCallback(() => {
    const pyodide = pyodideRef.current;
    if (!pyodide || !runningRef.current) return;

    let keepGoing = true;
    try {
      keepGoing = pyodide.runPython('sim.run_turn()') as boolean;
    } catch {
      keepGoing = false;
    }

    const pending = pullFrameAndLog();
    const hadFlashback = pending && pending.length > 0;

    if (hadFlashback) {
      const entry = pending![pending!.length - 1];
      setFlashback({ message: entry.message, objective: entry.objective });
    } else {
      setFlashback(null);
    }

    if (!keepGoing) {
      runningRef.current = false;
      stopTimer();
      setStats((s) => ({
        ...s,
        missionState: pyodide.runPython('sim.culture.viable_strain and any(p.data_transmitted for p in sim.probes)') === true
          ? 'complete'
          : 'failed',
      }));
      setStatus('simulation ended');
      return;
    }

    const delay = hadFlashback ? FLASHBACK_PAUSE_MS : TICK_MS;
    timerRef.current = window.setTimeout(tick, delay);
  }, [pullFrameAndLog, stopTimer]);

  const handleRunToggle = useCallback(() => {
    if (!pyodideRef.current) return;
    if (runningRef.current) {
      runningRef.current = false;
      stopTimer();
      setStats((s) => ({ ...s, missionState: 'paused' }));
      setStatus('paused');
    } else {
      runningRef.current = true;
      setStats((s) => ({ ...s, missionState: 'running' }));
      setStatus('running');
      tick();
    }
  }, [stopTimer, tick]);

  const handleReset = useCallback(() => {
    const pyodide = pyodideRef.current;
    if (!pyodide) return;
    runningRef.current = false;
    stopTimer();
    pyodide.runPython(`
sim = Simulation()
_log_buffer.seek(0); _log_buffer.truncate(0)
`);
    setLogLines([]);
    setFlashback(null);
    setStats({ ...EMPTY_STATS });
    setStatus('idle');
    pullFrameAndLog();
  }, [pullFrameAndLog, stopTimer]);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        await loadScriptOnce(PYODIDE_CDN);
        if (cancelled) return;
        if (!window.loadPyodide) throw new Error('loadPyodide missing');

        setStatus('initialising python runtime');
        const pyodide = await window.loadPyodide({
          indexURL: `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`,
        });
        if (cancelled) return;

        setStatus('routing python stdout');
        await pyodide.runPythonAsync(`
import io, sys
_log_buffer = io.StringIO()
sys.stdout = _log_buffer
sys.stderr = _log_buffer
`);

        setStatus('fetching simulation source');
        const sources = await Promise.all(
          PY_FILES.map(async (name) => {
            const res = await fetch(`/simulation-py/${name}`);
            if (!res.ok) throw new Error(`fetch ${name}: ${res.status}`);
            return [name, await res.text()] as const;
          }),
        );
        if (cancelled) return;

        try {
          pyodide.FS.mkdir('/sim');
        } catch {
          // exists
        }
        for (const [name, text] of sources) {
          pyodide.FS.writeFile(`/sim/${name}`, text);
        }

        setStatus('constructing simulation');
        await pyodide.runPythonAsync(`
import sys
if '/sim' not in sys.path:
    sys.path.insert(0, '/sim')
from simulation import Simulation
sim = Simulation()
`);
        if (cancelled) return;

        pyodideRef.current = pyodide;
        pullFrameAndLog();
        setReady(true);
        setStatus('ready — press run');
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setStatus(`error: ${msg}`);
      }
    }

    boot();
    return () => {
      cancelled = true;
      stopTimer();
    };
  }, [pullFrameAndLog, stopTimer]);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [logLines]);

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-10 font-mono">
      <header className="mb-6">
        <h1 className="text-lg text-ink">./cps7004-hail-mary-simulation</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Multi-agent grid simulation for CPS7004 coursework. Python runs in the
          browser via Pyodide; Grace, Rocky and the beetle probes execute on
          unmodified source.
        </p>
        <p className="mt-1 text-xs text-ink-faint">status: {status}</p>
      </header>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRunToggle}
              disabled={!ready || stats.missionState === 'complete' || stats.missionState === 'failed'}
              className="border border-accent/70 px-3 py-1.5 text-xs text-accent transition-colors hover:bg-accent/10 disabled:cursor-not-allowed disabled:border-line disabled:text-ink-faint"
            >
              {stats.missionState === 'running' ? '[ pause ]' : '[ run ]'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={!ready}
              className="border border-line px-3 py-1.5 text-xs text-ink-muted transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:text-ink-faint"
            >
              [ reset ]
            </button>
            <span className="text-xs text-ink-faint">
              turn {stats.turn} / 50
            </span>
          </div>

          <div className="border border-line bg-bg-elevated p-2">
            <canvas
              ref={canvasRef}
              width={CANVAS_PX}
              height={CANVAS_PX}
              style={{ width: CANVAS_PX, height: CANVAS_PX, display: 'block' }}
            />
          </div>

          {flashback && (
            <div className="border border-peach/60 bg-bg-elevated p-3 text-xs">
              <div className="mb-1 font-bold text-peach">[ FLASHBACK ]</div>
              <p className="text-ink">{flashback.message}</p>
              <div className="mt-2 font-bold text-accent">[ OBJECTIVE ]</div>
              <p className="text-ink-muted">{flashback.objective}</p>
            </div>
          )}
        </div>

        <aside className="w-full space-y-4 lg:w-80">
          <div className="border border-line bg-bg-elevated p-4">
            <h2 className="mb-3 text-sm text-accent">DASHBOARD</h2>
            <Bar
              label="health"
              value={stats.health}
              max={100}
              colour="#ff5577"
            />
            <Bar
              label="energy"
              value={stats.energy}
              max={100}
              colour="#00ff88"
            />
            <Bar
              label="fuel"
              value={stats.fuel}
              max={100}
              colour="#ffaa33"
            />
            <Bar
              label="equipment"
              value={Math.round(stats.equipment * 100)}
              max={100}
              colour="#aaaaff"
              suffix=""
            />
            <Bar
              label="cooperation"
              value={stats.cooperation}
              max={100}
              colour="#cba6f7"
            />
          </div>

          <div className="border border-line bg-bg-elevated p-4">
            <h2 className="mb-3 text-sm text-accent">MISSION STATE</h2>
            <StatRow label="knowledge" value={String(stats.knowledge)} />
            <StatRow label="samples" value={String(stats.samples)} />
            <StatRow
              label="probes"
              value={`${stats.probes} / 4  (sent ${stats.probesTransmitted})`}
            />
            <StatRow
              label="viable strain"
              value={stats.viable ? 'Yes' : 'No'}
              accent={stats.viable}
            />
            <StatRow
              label="astrophage cells"
              value={String(stats.astrophageCells)}
            />
            <StatRow label="state" value={stats.missionState} />
          </div>

          <div className="border border-line bg-bg-elevated p-3">
            <h2 className="mb-2 text-sm text-accent">LEGEND</h2>
            <LegendRow label="G  Grace" colour="#00ff88" />
            <LegendRow label="R  Rocky" colour="#ff8800" />
            <LegendRow label="A  Adrian" colour="#2d6a2d" />
            <LegendRow label="X  Astrophage" colour="#8b0000" />
            <LegendRow label="H  Hail Mary" colour="#1a3a6b" />
            <LegendRow label="B  Blip-A" colour="#6b4a1a" />
            <LegendRow label="!  Hazard" colour="#7a6a00" />
          </div>
        </aside>
      </div>

      <section className="mt-6">
        <h2 className="mb-2 text-sm text-accent">EVENT LOG</h2>
        <div
          ref={logRef}
          className="h-56 overflow-y-auto border border-line bg-[#07070f] p-3 text-xs leading-5 text-ink"
        >
          {logLines.length === 0 ? (
            <p className="text-ink-faint">
              no events yet. press [ run ] to begin.
            </p>
          ) : (
            logLines.map((line, i) => (
              <div
                key={i}
                className={
                  line.includes('[FLASHBACK]')
                    ? 'text-peach'
                    : line.includes('[OBJECTIVE]')
                      ? 'text-accent'
                      : line.startsWith('---')
                        ? 'text-ink-faint'
                        : 'text-ink'
                }
              >
                {line}
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

function Bar({
  label,
  value,
  max,
  colour,
  suffix = '',
}: {
  label: string;
  value: number;
  max: number;
  colour: string;
  suffix?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="mb-2">
      <div className="mb-1 flex justify-between text-[11px]">
        <span className="text-ink-muted">{label.toUpperCase()}</span>
        <span className="text-ink">
          {value}
          {suffix}
        </span>
      </div>
      <div className="h-1.5 w-full bg-[#1a1a2e]">
        <div
          style={{ width: `${pct}%`, backgroundColor: colour }}
          className="h-full transition-all duration-200"
        />
      </div>
    </div>
  );
}

function StatRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex justify-between py-0.5 text-xs">
      <span className="text-ink-muted">{label.toUpperCase()}</span>
      <span className={accent ? 'text-green' : 'text-ink'}>{value}</span>
    </div>
  );
}

function LegendRow({ label, colour }: { label: string; colour: string }) {
  return (
    <div className="text-xs" style={{ color: colour }}>
      {label}
    </div>
  );
}

function drawAgent(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string,
  colour: string,
) {
  const cx = x * CELL_SIZE + CELL_SIZE / 2;
  const cy = y * CELL_SIZE + CELL_SIZE / 2;
  const r = CELL_SIZE / 2 - 4;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = colour;
  ctx.fill();
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = 'black';
  ctx.font = 'bold 10px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, cx, cy);
}
