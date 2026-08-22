import React from 'react';

// Used before a route has the data required to render its final layout.
export default function PageLoader({ label = 'Loading store...' }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex min-h-[100dvh] items-center justify-center bg-slate-950 px-4"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="h-11 w-11 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        <p className="text-sm font-medium text-slate-300">{label}</p>
      </div>
    </div>
  );
}
