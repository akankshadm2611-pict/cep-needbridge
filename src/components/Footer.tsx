/**
 * src/components/Footer.tsx — Minimal site-wide footer.
 */

import React from 'react';

export function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 py-4">
      <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} NeedBridge. Connecting communities, one need at a time.
      </div>
    </footer>
  );
}
