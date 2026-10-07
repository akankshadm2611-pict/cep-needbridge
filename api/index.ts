import app, { ensureDbInitialized } from '../server/index.js';

export default async function handler(req: any, res: any) {
  await ensureDbInitialized();
  return app(req, res);
}
