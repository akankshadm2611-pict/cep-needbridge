/**
 * server/db/fileStore.ts
 *
 * Hybrid storage driver:
 * - If MongoDB Atlas is connected → MongoDB is PRIMARY (read + write).
 * - JSON files serve as local fallback when Mongo is unavailable.
 * - On startup, if Mongo is active, data is loaded from Mongo into memory.
 * - All writes go to both MongoDB AND the local JSON file (for resilience).
 */
import fs from 'fs';
import path from 'path';
import { env } from '../config/env.js';
import { isMongoActive, mongoFindAll, mongoReplaceAll } from './mongo.js';

export type JsonValue = any;

interface Collection<T> {
  data: T[];
  dirty: boolean;
  writeLock: boolean;
  writeQueue: Array<() => void>;
  loadedFromMongo: boolean;
}

const store = new Map<string, Collection<any>>();

function collectionFile(name: string): string {
  return path.resolve(env.DATA_DIR, `${name}.json`);
}

/** Load from disk (JSON fallback) */
function loadFromDisk<T>(name: string): T[] {
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

/** Save to local JSON file atomically */
async function persistToDisk(name: string): Promise<void> {
  const col = store.get(name);
  if (!col) return;

  if (col.writeLock) {
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

/** Get or initialise an in-memory collection (synchronous read) */
export function getCollection<T extends JsonValue>(name: string): T[] {
  if (!store.has(name)) {
    // Load from disk initially; MongoDB load happens async via initCollection
    const data = loadFromDisk<T>(name);
    store.set(name, {
      data: data as JsonValue[],
      dirty: false,
      writeLock: false,
      writeQueue: [],
      loadedFromMongo: false,
    });
  }
  return (store.get(name)!.data as unknown) as T[];
}

/**
 * Initialise a collection from MongoDB if connected.
 * Call this on server startup for each collection before serving requests.
 */
export async function initCollectionFromMongo(name: string): Promise<void> {
  if (!isMongoActive()) return;
  const col = store.get(name);
  if (col?.loadedFromMongo) return;

  try {
    const mongoData = await mongoFindAll(name);
    if (mongoData.length > 0) {
      console.log(`📦 Loaded ${mongoData.length} records from MongoDB Atlas [${name}]`);
      const c = store.get(name) ?? {
        data: [],
        dirty: false,
        writeLock: false,
        writeQueue: [],
        loadedFromMongo: false,
      };
      c.data = mongoData;
      c.loadedFromMongo = true;
      store.set(name, c);
      // Also sync to local JSON file
      await persistToDisk(name);
    } else {
      // If Mongo is empty but we have local data, push local → Mongo
      const localData = loadFromDisk(name);
      if (localData.length > 0) {
        console.log(`☁️  Seeding MongoDB Atlas [${name}] with ${localData.length} local records`);
        await mongoReplaceAll(name, localData);
        if (store.has(name)) {
          store.get(name)!.loadedFromMongo = true;
        }
      }
    }
  } catch (err: any) {
    console.warn(`⚠️  Could not load [${name}] from MongoDB:`, err.message);
  }
}

/** Replace entire collection — writes to Mongo (primary) + JSON (backup) */
export async function setCollection<T extends JsonValue>(name: string, items: T[]): Promise<void> {
  const col = store.get(name) ?? (() => {
    const c: Collection<JsonValue> = {
      data: [],
      dirty: false,
      writeLock: false,
      writeQueue: [],
      loadedFromMongo: false,
    };
    store.set(name, c);
    return c;
  })();

  col.data = items as JsonValue[];
  col.dirty = true;

  // Always persist to local JSON (fast, synchronous backup)
  await persistToDisk(name);

  // Write to MongoDB Atlas as primary if connected
  if (isMongoActive()) {
    mongoReplaceAll(name, items).catch((err: any) => {
      console.warn(`⚠️  MongoDB write failed for [${name}]:`, err.message);
    });
  }
}

/** Ensure all dirty collections are flushed (call on graceful shutdown) */
export async function flushAll(): Promise<void> {
  const names = Array.from(store.keys());
  await Promise.all(names.filter(n => store.get(n)?.dirty).map(n => persistToDisk(n)));
}

/** Reload a collection from disk (useful for tests / hot-reload) */
export function reloadCollection(name: string): void {
  store.delete(name);
}

/** Check if a collection is empty (before seeding) */
export function isCollectionEmpty(name: string): boolean {
  return getCollection(name).length === 0;
}

// Legacy compat export (kept for any imports that reference this)
export { syncCollectionToMongo } from './mongo.js';
