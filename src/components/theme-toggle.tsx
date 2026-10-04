'use client';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
type Mode = 'light' | 'dark' | 'system';
const modes: Mode[] = ['light', 'dark', 'system'];
export function ThemeToggle() {
  const [mode, setMode] = useState<Mode>('light');
  useEffect(() => { const stored = localStorage.getItem('a2-theme') as Mode | null; if (stored && modes.includes(stored)) requestAnimationFrame(() => setMode(stored)); }, []);
  useEffect(() => { document.documentElement.dataset.theme = mode; try { localStorage.setItem('a2-theme', mode); } catch { /* blocked storage is allowed */ } }, [mode]);
  const Icon = mode === 'dark' ? Moon : mode === 'light' ? Sun : Monitor;
  return <button className="theme-toggle icon-button" type="button" onClick={() => setMode((current) => modes[(modes.indexOf(current) + 1) % modes.length])} aria-label={`Theme mode: ${mode}. Switch theme`} title={`Theme: ${mode}`}><Icon size={18} /><span className="theme-toggle-label">{mode}</span></button>;
}
