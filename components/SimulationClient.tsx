'use client';

import { useEffect, useRef, useState } from 'react';

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
  knowledge: number;
  samples: number;
  probes: number;
  viable: boolean;
};

const EMPTY_STATS: Stats = {
  turn: 0,
  health: 0,
  energy: 0,
  knowledge: 0,
  samples: 0,
  probes: 0,
  viable: false,
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
  const pyodideRef = useRef<PyodideInterface | null>(null);
  const loopTimerRef = useRef<number | null>(null);

  const [status, setStatus] = useState<string>('booting pyodide…');
  const [running, setRunning] = useState<boolean>(false);
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        await loadScriptOnce(PYODIDE_CDN);
        if (cancelled) return;
        if (!window.loadPyodide) throw new Error('loadPyodide not on window');

        setStatus('initialising python runtime…');
        const pyodide = await window.loadPyodide({
          indexURL: `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`,
        });
        if (cancelled) return;

        setStatus('silencing stdout…');
        await pyodide.runPythonAsync(`
import sys, os
sys.stdout = open(os.devnull, 'w')
sys.stderr = open(os.devnull, 'w')
`);

        setStatus('fetching simulation source…');
        const sources = await Promise.all(
          PY_FILES.map(async (name) => {
            const res = await fetch(`/simulation-py/${name}`);
            if (!res.ok) throw new Error(`fetch ${name}: ${res.status}`);
            const text = await res.text();
            return [name, text] as const;
          }),
        );
        if (cancelled) return;

        try {
          pyodide.FS.mkdir('/sim');
        } catch {
          // already exists
        }
        for (const [name, text] of sources) {
          pyodide.FS.writeFile(`/sim/${name}`, text);
        }

        setStatus('constructing simulation…');
        await pyodide.runPythonAsync(`
import sys
if '/sim' not in sys.path:
    sys.path.insert(0, '/sim')
from simulation import Simulation
sim = Simulation()
`);
        if (cancelled) return;

        pyodideRef.current = pyodide;
        setStatus('running');
        setRunning(true);
        renderFrame();
        loopTimerRef.current = window.setInterval(tick, TICK_MS);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setStatus(`error: ${msg}`);
      }
    }

    function tick() {
      const pyodide = pyodideRef.current;
      if (!pyodide) return;
      let keepGoing = false;
      try {
        keepGoing = pyodide.runPython('sim.run_turn()') as boolean;
      } catch {
        keepGoing = false;
      }
      renderFrame();
      if (!keepGoing) {
        stopLoop();
        setRunning(false);
        setStatus('simulation ended');
      }
    }

    function stopLoop() {
      if (loopTimerRef.current != null) {
        window.clearInterval(loopTimerRef.current);
        loopTimerRef.current = null;
      }
    }

    function renderFrame() {
      const pyodide = pyodideRef.current;
      const canvas = canvasRef.current;
      if (!pyodide || !canvas) return;

      const frameJson = pyodide.runPython(`
import json
_grid = sim.grid
_cells = [[_grid.get_cell(x, y) for x in range(_grid.width)] for y in range(_grid.height)]
_probes = [
    {"name": p.name, "x": p.x, "y": p.y}
    for p in sim.probes
]
_viable = any(getattr(p, "carries_viable_strain", False) for p in sim.probes) or getattr(sim, "_Simulation__culture", None) is not None and False
# prefer culture.viable_strain when present
try:
    _culture_viable = sim.__dict__.get('_Simulation__culture').viable_strain
except Exception:
    _culture_viable = False
json.dumps({
    "turn": sim.turn,
    "cells": _cells,
    "grace": {"x": sim.grace.x, "y": sim.grace.y, "health": sim.grace.health, "energy": sim.grace.energy, "knowledge": sim.grace.knowledge_score, "samples": len(sim.grace.inventory)},
    "rocky": {"x": sim.rocky.x, "y": sim.rocky.y},
    "probes": _probes,
    "viable": bool(_culture_viable or any(p.get("viable", False) for p in _probes)),
})
`) as string;

      let frame: {
        turn: number;
        cells: string[][];
        grace: {
          x: number;
          y: number;
          health: number;
          energy: number;
          knowledge: number;
          samples: number;
        };
        rocky: { x: number; y: number };
        probes: { name: string; x: number; y: number }[];
        viable: boolean;
      };
      try {
        frame = JSON.parse(frameJson);
      } catch {
        return;
      }

      draw(canvas, frame);
      setStats({
        turn: frame.turn,
        health: frame.grace.health,
        energy: frame.grace.energy,
        knowledge: frame.grace.knowledge,
        samples: frame.grace.samples,
        probes: frame.probes.length,
        viable: frame.viable,
      });
    }

    boot();

    return () => {
      cancelled = true;
      if (loopTimerRef.current != null) {
        window.clearInterval(loopTimerRef.current);
        loopTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-10 font-mono">
      <header className="mb-6">
        <h1 className="text-lg text-ink">./simulation</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Multi-agent grid simulation — Python executed in-browser via Pyodide.
        </p>
        <p className="mt-1 text-xs text-ink-faint">status: {status}</p>
      </header>

      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <div className="border border-line bg-bg-elevated p-2">
          <canvas
            ref={canvasRef}
            width={CANVAS_PX}
            height={CANVAS_PX}
            style={{ width: CANVAS_PX, height: CANVAS_PX, display: 'block' }}
          />
        </div>

        <aside className="w-full border border-line bg-bg-elevated p-4 md:w-64">
          <h2 className="mb-3 text-sm text-accent">MISSION STATUS</h2>
          <Row label="turn" value={String(stats.turn)} />
          <Row label="health" value={String(stats.health)} />
          <Row label="energy" value={String(stats.energy)} />
          <Row label="knowledge" value={String(stats.knowledge)} />
          <Row label="samples" value={String(stats.samples)} />
          <Row label="probes" value={String(stats.probes)} />
          <Row label="viable" value={stats.viable ? 'Yes' : 'No'} />

          <h2 className="mb-2 mt-5 text-sm text-accent">LEGEND</h2>
          <LegendRow label="G  Grace" colour="#00ff88" />
          <LegendRow label="R  Rocky" colour="#ff8800" />
          <LegendRow label="A  Adrian" colour="#2d6a2d" />
          <LegendRow label="X  Astrophage" colour="#8b0000" />
          <LegendRow label="H  Hail Mary" colour="#1a3a6b" />
          <LegendRow label="B  Blip-A" colour="#6b4a1a" />
          <LegendRow label="!  Hazard" colour="#7a6a00" />

          <p className="mt-5 text-[11px] text-ink-faint">
            {running ? 'running…' : 'idle'}
          </p>
        </aside>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-0.5 text-xs">
      <span className="text-ink-muted">{label.toUpperCase()}:</span>
      <span className="text-ink">{value}</span>
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

type Frame = {
  cells: string[][];
  grace: { x: number; y: number };
  rocky: { x: number; y: number };
  probes: { name: string; x: number; y: number }[];
};

function draw(canvas: HTMLCanvasElement, frame: Frame) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, CANVAS_PX, CANVAS_PX);

  for (let y = 0; y < GRID_CELLS; y++) {
    for (let x = 0; x < GRID_CELLS; x++) {
      const cell = frame.cells[y][x];
      ctx.fillStyle = CELL_COLOURS[cell] ?? '#0a0a1a';
      ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      ctx.strokeStyle = '#1a1a2e';
      ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
  }

  drawAgent(ctx, frame.grace.x, frame.grace.y, 'G', '#00ff88');
  drawAgent(ctx, frame.rocky.x, frame.rocky.y, 'R', '#ff8800');
  for (const p of frame.probes) {
    drawAgent(ctx, p.x, p.y, p.name.charAt(0), '#aaaaff');
  }
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
