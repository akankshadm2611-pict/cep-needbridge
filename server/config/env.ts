import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const isProductionLike = (): boolean => process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  MONGODB_URI: z.string().min(1).optional().or(z.literal('')),
  JWT_SECRET: z.string().min(1).default('needbridge-dev-secret-change-in-production-32chars'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  DATA_DIR: z.string().default(process.env.VERCEL === '1' ? '/tmp/needbridge-data' : './data'),
  UPLOAD_DIR: z.string().default(process.env.VERCEL === '1' ? '/tmp/needbridge-data/uploads' : './data/uploads'),
  MAX_FILE_SIZE_MB: z.coerce.number().default(10),
  BCRYPT_ROUNDS: z.coerce.number().default(12),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().default(200),
  COOKIE_SAME_SITE: z.enum(['strict', 'lax', 'none']).default('lax'),
});

export type Env = z.infer<typeof EnvSchema>;

function loadEnv(): Env {
  const result = EnvSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Invalid environment variables:', result.error.flatten().fieldErrors);
    process.exit(1);
  }

  const envValues = result.data;
  const productionLike = isProductionLike();

  if (productionLike && !envValues.MONGODB_URI) {
    console.warn('⚠️ MONGODB_URI is not set. The app will continue with the local JSON fallback instead of exiting.');
  }

  if (productionLike && envValues.JWT_SECRET === 'needbridge-dev-secret-change-in-production-32chars') {
    console.warn('⚠️ JWT_SECRET is using the default local value. Set a private secret in Vercel/production to avoid auth instability.');
  }

  return envValues;
}

export const env = loadEnv();
