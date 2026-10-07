/**
 * server/db/mongo.ts — MongoDB Atlas as primary database.
 * Provides native Mongoose models for all collections.
 */

import dns from 'node:dns';
import mongoose, { Schema, Model } from 'mongoose';
import { env } from '../config/env.js';

// Resolve SRV records via public DNS if local/ISP DNS fails to resolve _mongodb._tcp
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {
  // Ignore
}

let isMongoConnected = false;

export async function connectMongo(): Promise<boolean> {
  const uri = env.MONGODB_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.log('ℹ️  MongoDB Atlas: No MONGODB_URI provided in .env — using local persistent JSON fileStore.');
    return false;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    isMongoConnected = true;
    console.log('🍃 MongoDB Atlas: Connected successfully to database!');
    return true;
  } catch (err: any) {
    console.error('❌ MongoDB Atlas Connection Error:', err.message);
    console.log('⚠️  Falling back to local persistent JSON fileStore.');
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

export async function mongoFindAll(collectionName: string): Promise<any[]> {
  const Model = makeModel<any>(collectionName);
  const docs = await Model.find({}).lean();
  return docs.map(({ _id, __v, ...rest }: any) => rest);
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

// Legacy compat — kept so old imports don't break
export async function syncCollectionToMongo(collectionName: string, items: any[]): Promise<void> {
  if (!isMongoActive()) return;
  try {
    await mongoReplaceAll(collectionName, items);
  } catch (err: any) {
    console.warn(`⚠️  Failed to sync [${collectionName}] to MongoDB:`, err.message);
  }
}

// Alias kept for backward compat
export const MongoSyncModel = null;
