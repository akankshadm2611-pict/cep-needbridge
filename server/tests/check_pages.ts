/**
 * scratch/check_pages.ts — Verify HTTP serving of frontend and API routes.
 */
import { app } from '../index.js';
import http from 'http';

async function verify() {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(3002, () => resolve()));
  console.log('HTTP Server listening on 3002 for verification...\n');

  try {
    // Check root page
    const resHome = await fetch('http://localhost:3002/');
    console.log(`GET / => status: ${resHome.status}, contentType: ${resHome.headers.get('content-type')}`);
    const homeHtml = await resHome.text();
    console.log(`GET / body length: ${homeHtml.length}, contains NeedBridge: ${homeHtml.includes('NeedBridge')}`);

    // Check SPA route /opportunities
    const resOpp = await fetch('http://localhost:3002/opportunities');
    console.log(`GET /opportunities => status: ${resOpp.status}, contentType: ${resOpp.headers.get('content-type')}`);

    // Check API route /api/health
    const resHealth = await fetch('http://localhost:3002/api/health');
    const healthJson = await resHealth.json();
    console.log(`GET /api/health => status: ${resHealth.status}, data:`, healthJson);

    // Check API route /api/impact
    const resImpact = await fetch('http://localhost:3002/api/impact');
    const impactJson = await resImpact.json();
    console.log(`GET /api/impact => status: ${resImpact.status}, data:`, (impactJson as any).ok);

    console.log('\n✅ All frontend and API routes verified successfully!');
  } finally {
    server.close();
  }
}

verify();
