import React, { useRef } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { ShieldCheck } from 'lucide-react';

export default function TurnstileWidget({ onSuccess, onError, onExpire, theme = 'dark' }) {
  const turnstileRef = useRef(null);
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  // Cloudflare always-passes test site key if no key is configured
  // https://developers.cloudflare.com/turnstile/troubleshooting/testing/
  // '1x00000000000000000000AA' always passes
  const effectiveSiteKey = siteKey && siteKey !== 'your_turnstile_site_key'
    ? siteKey
    : '1x00000000000000000000AA';

  return (
    <div className="flex flex-col items-center justify-center my-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
      <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-400">
        <ShieldCheck className="w-4 h-4 text-indigo-400" />
        <span>Cloudflare Security Verification</span>
      </div>
      
      <Turnstile
        ref={turnstileRef}
        siteKey={effectiveSiteKey}
        options={{
          theme: theme === 'dark' ? 'dark' : 'light',
          size: 'normal',
        }}
        onSuccess={(token) => {
          if (onSuccess) onSuccess(token);
        }}
        onError={(error) => {
          console.error('[Turnstile] Error:', error);
          if (onError) onError(error);
        }}
        onExpire={() => {
          if (onExpire) onExpire();
        }}
      />
    </div>
  );
}
