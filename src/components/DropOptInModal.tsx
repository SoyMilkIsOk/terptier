// /components/DropOptInModal.tsx
'use client';

import { useState } from 'react';
import { Bell, Mail, ShieldCheck, Clock, X, Check, Loader2 } from 'lucide-react';

interface Props {
  onClose: () => void;
  onOptIn?: () => void;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function DropOptInModal({ onClose, onOptIn }: Props) {
  const [open, setOpen] = useState(true);
  const [status, setStatus] = useState<Status>('idle');

  const setCookie = (name: string, value: string, days: number) => {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/; SameSite=Lax`;
  };

  const finishAndClose = () => {
    setCookie('dropOptInPrompt', 'done', 365);
    setOpen(false);
    onClose();
  };

  const handleClose = () => {
    // “No” path or X/overlay close: still set cookie so we don’t prompt again
    finishAndClose();
  };

  const handleYes = async () => {
    try {
      setStatus('loading');
      await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationOptIn: true }),
      });
      setStatus('success');
      onOptIn?.();
      setTimeout(() => finishAndClose(), 900);
    } catch (err) {
      console.error('Failed to update notification setting', err);
      setStatus('error');
      // Fail-soft: still set “don’t show again” and close after a beat
      setTimeout(() => finishAndClose(), 1200);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drop-optin-title"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-lg mx-4 max-h-[95vh] overflow-y-auto rounded-3xl border border-green-200/30 bg-white/95 backdrop-blur-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative rounded-t-3xl bg-gradient-to-r from-green-600 to-emerald-600 p-5 sm:p-6 text-white">
          <button
            onClick={handleClose}
            className="absolute right-3 top-3 p-2 rounded-full bg-white/15 hover:bg-white/25 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center">
            <div className="mr-3 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/20">
              <Bell className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
            </div>
            <h2 id="drop-optin-title" className="text-xl sm:text-2xl font-bold">
              Get notified about new drops?
            </h2>
          </div>

          {/* Accent/progress bar */}
          <div className="mt-4 h-2 w-full rounded-full bg-white/20 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                status === 'success' ? 'w-full' : 'w-1/2'
              } bg-white/90`}
            />
          </div>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-7">
          {/* Intro blurb */}
          <p className="mb-5 text-center text-sm sm:text-base text-gray-700">
            Opt in to receive quick updates when new drops go live. No spam—just the good stuff.
          </p>

          {/* Feature pills */}
          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            <div className="flex items-center gap-3 rounded-xl border border-green-100 bg-green-50 p-3">
              <Clock className="h-5 w-5 text-green-700" />
              <span className="text-sm font-medium text-green-800">Timely alerts</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-3">
              <Mail className="h-5 w-5 text-emerald-700" />
              <span className="text-sm font-medium text-emerald-800">Email only</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-green-100 bg-green-50 p-3">
              <ShieldCheck className="h-5 w-5 text-green-700" />
              <span className="text-sm font-medium text-green-800">Privacy-first</span>
            </div>
          </div>

          {/* Status card */}
          {status !== 'idle' && (
            <div
              className={`mb-5 flex items-center gap-3 rounded-xl border p-3 ${
                status === 'loading'
                  ? 'border-emerald-200 bg-emerald-50'
                  : status === 'success'
                  ? 'border-green-200 bg-green-50'
                  : 'border-red-200 bg-red-50'
              }`}
            >
              {status === 'loading' && <Loader2 className="h-5 w-5 animate-spin" />}
              {status === 'success' && <Check className="h-5 w-5 text-green-700" />}
              {status === 'error' && <X className="h-5 w-5 text-red-600" />}
              <p className="text-sm text-gray-800">
                {status === 'loading' && 'Saving your preference…'}
                {status === 'success' && 'All set! You’ll get notified about new drops.'}
                {status === 'error' && 'We hit a snag. Preference may not have saved, but you won’t be prompted again.'}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0">
              <button
                onClick={handleClose}
                className="flex-1 rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition-all duration-200 hover:scale-[1.02] hover:bg-gray-200 active:scale-[0.98]"
                disabled={status === 'loading'}
              >
                No thanks
              </button>

              <button
                onClick={handleYes}
                className="flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:from-emerald-700 hover:to-green-700 active:scale-[0.98] disabled:opacity-70"
                disabled={status === 'loading' || status === 'success'}
              >
                {status === 'loading' ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving…
                  </span>
                ) : status === 'success' ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Check className="h-4 w-4" />
                    Enabled
                  </span>
                ) : (
                  'Yes, notify me'
                )}
              </button>
            </div>

            <p className="text-center text-xs text-gray-500">
              You can opt out anytime in settings. By continuing, you agree to our{' '}
              <a href="/terms" className="text-green-600 hover:underline">Terms</a> and{' '}
              <a href="/privacy" className="text-green-600 hover:underline">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
