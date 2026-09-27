'use client';
import { ORDER_KEY, sanitizeOrder } from './order';
import type { OrderLine } from '@/types/catalog';
type Snapshot = { lines: OrderLine[]; storageError: boolean };
const empty: Snapshot = { lines: [], storageError: false };
let snapshot = empty;
let initialized = false;
const listeners = new Set<() => void>();
function read() {
  try {
    snapshot = {
      lines: sanitizeOrder(JSON.parse(localStorage.getItem(ORDER_KEY) || '[]')),
      storageError: false,
    };
  } catch {
    snapshot = { lines: [], storageError: true };
  }
}
export function getOrderSnapshot() {
  if (typeof window !== 'undefined' && !initialized) {
    initialized = true;
    read();
  }
  return snapshot;
}
export function getServerOrderSnapshot() {
  return empty;
}
export function setOrder(update: OrderLine[] | ((lines: OrderLine[]) => OrderLine[])) {
  const current = getOrderSnapshot();
  const lines = sanitizeOrder(typeof update === 'function' ? update(current.lines) : update);
  let storageError = false;
  try {
    localStorage.setItem(ORDER_KEY, JSON.stringify(lines));
  } catch {
    storageError = true;
  }
  snapshot = { lines, storageError };
  listeners.forEach((listener) => listener());
}
export function subscribeOrder(listener: () => void) {
  listeners.add(listener);
  const storage = (e: StorageEvent) => {
    if (e.key === ORDER_KEY || e.key === null) {
      read();
      listeners.forEach((fn) => fn());
    }
  };
  window.addEventListener('storage', storage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', storage);
  };
}
