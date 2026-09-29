/**
 * server/db/mongo.ts — Optional MongoDB Atlas connection & cloud document synchronization.
 */

import mongoose from 'mongoose';
import { env } from '../config/env.js';

let isMongoConnected = false;

// Generic Schema to persist repository collections into MongoDB Atlas
const DynamicCollectionSchema = new mongoose.Schema(
  {
    collectionName: { type: String, required: true, index: true },
    docId: { type: String, required: true, index: true },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  {
    timestamps: true,
    strict: false,
  }
);

DynamicCollectionSchema.index({ collectionName: 1, docId: 1 }, { unique: true });

export const MongoSyncModel = mongoose.model('NeedBridgeData', DynamicCollectionSchema);

export async function connectMongo(): Promise<boolean> {
  const uri = env.MONGODB_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.log('ℹ️  MongoDB Atlas: No MONGODB_URI provided in .env — using local persistent JSON fileStore.');
    return false;
  }

  try {
    await mongoose.connect(uri);
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

/**
 * Syncs a collection's items to MongoDB Atlas in the background
 */
export async function syncCollectionToMongo(collectionName: string, items: any[]): Promise<void> {
  if (!isMongoActive()) return;

  try {
    const ops = items.map((item) => ({
      updateOne: {
        filter: { collectionName, docId: item.id || item._id || String(item) },
        update: {
          $set: {
            collectionName,
            docId: item.id || item._id || String(item),
            data: item,
          },
        },
        upsert: true,
      },
    }));

    if (ops.length > 0) {
      await MongoSyncModel.bulkWrite(ops);
    }
  } catch (err: any) {
    console.warn(`⚠️  Failed to sync collection [${collectionName}] to MongoDB Atlas:`, err.message);
  }
}
