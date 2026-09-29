/**
 * server/db/fileStore.ts
 *
 * JSON-file backed storage driver.
 * - Loads collections into memory on boot.
 * - Atomic writes with a per-collection mutex.
 * - One JSON file per collection under DATA_DIR.
 */
import fs from 'fs';
import path from 'path';
import { env } from '../config/env.js';

export type JsonValue = any;

interface Collection<T> {
  data: T[];
  dirty: boolean;
  writeLock: boolean;
  writeQueue: Array<() => void>;
}

const store = new Map<string, Collection<any>>();

function collectionFile(name: string): string {
  return path.resolve(env.DATA_DIR, `${name}.json`);
}

/** Load or create a collection from disk */
function loadCollection<T extends JsonValue>(name: string): T[] {
  const file = collectionFile(name);
  if (!fs.existsSync(file)) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, '[]', 'utf-8');
    return [];
  }
  try {
    const raw = fs.readFileSync(file, 'utf-8');
    return JSON.parse(raw) as T[];
  } catch {
    console.warn(`⚠️  Could not parse ${file} — resetting to empty array`);
    return [];
  }
}

/** Get or initialise an in-memory collection */
export function getCollection<T extends JsonValue>(name: string): T[] {
  if (!store.has(name)) {
    const data = loadCollection<T>(name);
    store.set(name, { data: data as JsonValue[], dirty: false, writeLock: false, writeQueue: [] });
  }
  return (store.get(name)!.data as unknown) as T[];
}

/** Acquire write lock and persist collection atomically */
async function persistCollection(name: string): Promise<void> {
  const col = store.get(name);
  if (!col) return;

  if (col.writeLock) {
    // Queue this write
    return new Promise<void>((resolve) => {
      col.writeQueue.push(resolve);
    });
  }

  col.writeLock = true;
  try {
    const file = collectionFile(name);
    const tmp = file + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(col.data, null, 2), 'utf-8');
    fs.renameSync(tmp, file);
    col.dirty = false;
  } finally {
    col.writeLock = false;
    const next = col.writeQueue.shift();
    if (next) next();
  }
}

import { syncCollectionToMongo } from './mongo.js';

/** Replace entire collection (used internally by repository layer) */
export async function setCollection<T extends JsonValue>(name: string, items: T[]): Promise<void> {
  const col = store.get(name) ?? (() => {
    const c: Collection<JsonValue> = { data: [], dirty: false, writeLock: false, writeQueue: [] };
    store.set(name, c);
    return c;
  })();
  col.data = items as JsonValue[];
  col.dirty = true;
  await persistCollection(name);

  // Sync to MongoDB Atlas if connected
  syncCollectionToMongo(name, items).catch(() => {});
}

/** Ensure all dirty collections are flushed (call on graceful shutdown) */
export async function flushAll(): Promise<void> {
  const names = Array.from(store.keys());
  await Promise.all(names.filter(n => store.get(n)?.dirty).map(persistCollection));
}

/** Reload a collection from disk (useful for tests / hot-reload) */
export function reloadCollection(name: string): void {
  store.delete(name);
}

/** Check if a collection is empty (before seeding) */
export function isCollectionEmpty(name: string): boolean {
  return getCollection(name).length === 0;
}
