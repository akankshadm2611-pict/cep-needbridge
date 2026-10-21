/**
 * server/db/mongo.ts — MongoDB Atlas as primary database.
 * Provides native Mongoose models for all collections.
 */

import { Readable } from 'node:stream';
import mongoose, { Schema, Model } from 'mongoose';
import { env } from '../config/env.js';

let isMongoConnected = false;

export async function connectMongo(): Promise<boolean> {
  const uri = env.MONGODB_URI;
  if (!uri) {
    if (env.NODE_ENV === 'production' || process.env.VERCEL === '1') {
      throw new Error('MONGODB_URI must be configured for production deployments.');
    }
    console.log('MongoDB Atlas is not configured; using the local JSON store.');
    return false;
  }

  if (mongoose.connection.readyState === 1 && isMongoConnected) {
    isMongoConnected = true;
    return true;
  }

  try {
    await mongoose.connect(uri, {
      dbName: 'needbridge',
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    });
    isMongoConnected = true;
    console.log('Connected to MongoDB Atlas.');
    return true;
  } catch (err) {
    isMongoConnected = false;
    if (env.NODE_ENV === 'production' || process.env.VERCEL === '1') {
      throw new Error('Could not connect to MongoDB Atlas. Check MONGODB_URI and Atlas network access.', { cause: err });
    }
    console.error('Could not connect to MongoDB Atlas; using the local JSON store.');
    return false;
  }
}

export function isMongoActive(): boolean {
  return isMongoConnected && mongoose.connection.readyState === 1;
}

// ─── Generic document schema ───────────────────────────────────────────────
// Each "collection" is stored as its own MongoDB collection using a flexible schema.

function makeModel<T>(collectionName: string): Model<T & { _id?: any }> {
  if (mongoose.models[collectionName]) {
    return mongoose.models[collectionName] as Model<T & { _id?: any }>;
  }
  const schema = new Schema<T & { _id?: any }>(
    { id: { type: String, required: true, unique: true } },
    { strict: false, collection: collectionName, timestamps: true }
  );
  return mongoose.model<T & { _id?: any }>(collectionName, schema);
}

// ─── Per-collection Mongo models ───────────────────────────────────────────
export const MongoModels = {
  users: () => makeModel<any>('users'),
  ngo_profiles: () => makeModel<any>('ngo_profiles'),
  volunteer_profiles: () => makeModel<any>('volunteer_profiles'),
  requirements: () => makeModel<any>('requirements'),
  applications: () => makeModel<any>('applications'),
  notifications: () => makeModel<any>('notifications'),
  categories: () => makeModel<any>('categories'),
};

// ─── CRUD helpers that work directly with MongoDB ──────────────────────────

export function normalizeMongoTimestamps<T extends { createdAt?: Date | string; updatedAt?: Date | string }>(
  document: T
): Omit<T, 'createdAt' | 'updatedAt'> & { createdAt?: string; updatedAt?: string } {
  const { createdAt, updatedAt, ...rest } = document;
  return {
    ...rest,
    ...(createdAt !== undefined
      ? { createdAt: createdAt instanceof Date ? createdAt.toISOString() : createdAt }
      : {}),
    ...(updatedAt !== undefined
      ? { updatedAt: updatedAt instanceof Date ? updatedAt.toISOString() : updatedAt }
      : {}),
  };
}

export async function mongoFindAll(collectionName: string): Promise<any[]> {
  const Model = makeModel<any>(collectionName);
  const docs = await Model.find({}).lean();
  return docs.map(({ _id, __v, ...rest }: any) => normalizeMongoTimestamps(rest));
}

export async function mongoUpsert(collectionName: string, items: any[]): Promise<void> {
  if (!isMongoActive() || items.length === 0) return;
  const Model = makeModel<any>(collectionName);
  const ops = items.map((item) => ({
    updateOne: {
      filter: { id: item.id },
      update: { $set: item },
      upsert: true,
    },
  }));
  await Model.bulkWrite(ops);
}

export async function mongoSyncChanges(collectionName: string, before: any[], after: any[]): Promise<void> {
  if (!isMongoActive()) {
    throw new Error('MongoDB must be connected before writing persistent data.');
  }

  const previousById = new Map(before.map((item) => [item.id, item]));
  const nextById = new Map(after.map((item) => [item.id, item]));
  if (nextById.has(undefined) || nextById.has(null)) {
    throw new Error(`Every document in [${collectionName}] must have an id.`);
  }
  if (nextById.size !== after.length) {
    throw new Error(`Documents in [${collectionName}] must have unique ids.`);
  }

  const changed = after.filter((item) => {
    const previous = previousById.get(item.id);
    return !previous || JSON.stringify(previous) !== JSON.stringify(item);
  });
  await mongoUpsert(collectionName, changed);

  const deletedIds = before
    .filter((item) => !nextById.has(item.id))
    .map((item) => item.id);
  if (deletedIds.length > 0) {
    const Model = makeModel<any>(collectionName);
    await Model.deleteMany({ id: { $in: deletedIds } });
  }
}

export async function mongoDeleteById(collectionName: string, id: string): Promise<void> {
  if (!isMongoActive()) return;
  const Model = makeModel<any>(collectionName);
  await Model.deleteOne({ id });
}

export async function mongoReplaceAll(collectionName: string, items: any[]): Promise<void> {
  if (!isMongoActive()) return;
  const Model = makeModel<any>(collectionName);
  // Use bulkWrite with upsert + delete orphans
  const ids = items.map((i) => i.id);
  await Model.deleteMany({ id: { $nin: ids } });
  if (items.length > 0) {
    await mongoUpsert(collectionName, items);
  }
}

export async function mongoSaveUpload(filename: string, data: Buffer, contentType: string): Promise<void> {
  if (!isMongoActive() || !mongoose.connection.db) {
    throw new Error('MongoDB must be connected before storing uploaded files.');
  }
  const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
  const stream = bucket.openUploadStream(filename, { metadata: { contentType } });
  await new Promise<void>((resolve, reject) => {
    stream.once('error', reject);
    stream.once('finish', resolve);
    stream.end(data);
  });
}

export async function mongoReadUpload(filename: string): Promise<{ stream: Readable; contentType?: string } | null> {
  if (!isMongoActive() || !mongoose.connection.db) {
    throw new Error('MongoDB must be connected before reading uploaded files.');
  }
  const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
  const [file] = await bucket.find({ filename }).sort({ uploadDate: -1 }).limit(1).toArray();
  if (!file) return null;
  return {
    stream: bucket.openDownloadStream(file._id),
    contentType: file.metadata?.contentType,
  };
}

export async function mongoDeleteUpload(filename: string): Promise<void> {
  if (!isMongoActive() || !mongoose.connection.db) return;
  const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
  const files = await bucket.find({ filename }).toArray();
  await Promise.all(files.map((file) => bucket.delete(file._id)));
}

// Legacy compat — kept so old imports don't break
export async function syncCollectionToMongo(collectionName: string, items: any[]): Promise<void> {
  if (!isMongoActive()) return;
  await mongoReplaceAll(collectionName, items);
}

// Alias kept for backward compat
export const MongoSyncModel = null;
