import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { initCollectionFromMongo } from './fileStore.js';
import { connectMongo, isMongoActive } from './mongo.js';
import { UsersRepo } from './repositories/index.js';
import { seedCategories } from './seed.js';

interface AdminCredential {
  email: string;
  password: string;
  name?: string;
}

function readCredentials(): AdminCredential[] {
  const credentialsPath = path.resolve(process.cwd(), 'admin-credentials.json');
  if (!fs.existsSync(credentialsPath)) {
    throw new Error('admin-credentials.json is missing from the project root.');
  }

  const parsed: unknown = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('admin-credentials.json must contain a non-empty array of admin credentials.');
  }

  const credentials = parsed as AdminCredential[];
  const emails = new Set<string>();
  for (const credential of credentials) {
    if (
      typeof credential.email !== 'string' ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credential.email) ||
      typeof credential.password !== 'string' ||
      credential.password.length < 12
    ) {
      throw new Error('Each admin entry needs a valid email and a password of at least 12 characters.');
    }
    const normalizedEmail = credential.email.toLowerCase();
    if (emails.has(normalizedEmail)) {
      throw new Error('admin-credentials.json contains duplicate email addresses.');
    }
    emails.add(normalizedEmail);
  }
  return credentials;
}

async function createAdmins(): Promise<void> {
  if (!env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing. Add your Atlas connection string to the local .env file.');
  }

  const credentials = readCredentials();
  await connectMongo();
  if (!isMongoActive()) {
    throw new Error('Could not connect to MongoDB Atlas.');
  }

  await initCollectionFromMongo('users');
  await initCollectionFromMongo('categories');
  await seedCategories();

  for (const credential of credentials) {
    const passwordHash = await bcrypt.hash(credential.password, env.BCRYPT_ROUNDS);
    const existing = UsersRepo.findByEmail(credential.email);
    if (existing) {
      if (existing.role !== 'admin') {
        throw new Error(`The configured admin email is already registered with a non-admin role.`);
      }
      await UsersRepo.update(existing.id, { passwordHash });
    } else {
      await UsersRepo.create({
        email: credential.email,
        passwordHash,
        role: 'admin',
        status: 'active',
        onboardingComplete: true,
      });
    }
  }
  console.log(`Provisioned ${credentials.length} admin account(s) in MongoDB Atlas.`);
}

createAdmins()
  .catch((err: unknown) => {
    console.error('Admin provisioning failed:', err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
