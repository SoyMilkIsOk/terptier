"use client";

import type { ChangeEvent } from "react";
import { useCallback, useMemo, useState } from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";

export type AgeGateStateOption = {
  slug: string;
  name: string;
  abbreviation: string;
  tagline?: string;
};

interface AgeGateProps {
  states?: AgeGateStateOption[];
  initialStateSlug?: string | null;
}

const AGE_COOKIE_NAME = "ageVerify";
const STATE_COOKIE_NAME = "preferredState";
const STATE_STORAGE_KEY = "terptier:selectedState";

const setCookie = (name: string, value: string, maxAgeDays: number) => {
  const expires = new Date();
  expires.setDate(expires.getDate() + maxAgeDays);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

export default function AgeGate({
  states = [],
  initialStateSlug = null,
}: AgeGateProps) {
  const hasStates = states.length > 0;
  const initialSelection = useMemo(() => {
    if (!hasStates) {
      return "";
    }
    if (!initialStateSlug) {
      return "";
    }
    const normalized = initialStateSlug.toLowerCase();
    return states.some((state) => state.slug === normalized) ? normalized : "";
  }, [hasStates, initialStateSlug, states]);

  const [is21Confirmed, setIs21Confirmed] = useState(false);
  const [selectedState, setSelectedState] = useState(initialSelection);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);

  const handleStateChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedState(event.target.value);
    if (error) {
      setError(null);
    }
  }, [error]);

  const handleConfirm = async () => {
    if (submitting) {
      return;
    }

    if (!is21Confirmed) {
      setError("You must confirm that you are 21 or older to continue.");
      return;
    }

    if (hasStates && !selectedState) {
      setError("Please select your state before continuing.");
      return;
    }

    setSubmitting(true);
    setError(null);

    setCookie(AGE_COOKIE_NAME, "true", 30);

    if (hasStates && selectedState) {
      setCookie(STATE_COOKIE_NAME, selectedState, 365);
      try {
        window.localStorage.setItem(STATE_STORAGE_KEY, selectedState);
      } catch (storageError) {
        console.warn("Unable to persist state selection", storageError);
      }
    }

    setComplete(true);

    window.setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl rounded-3xl bg-white/95 p-8 shadow-2xl">
        {complete ? (
          <div className="flex flex-col items-center text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-emerald-500" />
            <h2 className="text-2xl font-semibold text-slate-900">Welcome to TerpTier</h2>
            <p className="text-slate-600">
              Thank you for verifying your age{hasStates ? " and selecting your state" : ""}. Loading your experience now.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <ShieldCheck className="h-7 w-7 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Before we continue</h2>
                <p className="text-sm text-slate-600">
                  Please verify that you are at least 21 years old{hasStates ? " and tell us where you're exploring from." : "."}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center space-x-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-300">
                <input
                  type="checkbox"
                  checked={is21Confirmed}
                  onChange={(event) => {
                    setIs21Confirmed(event.target.checked);
                    if (error) {
                      setError(null);
                    }
                  }}
                  className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm font-medium text-slate-800">
                  I confirm that I am at least 21 years old.
                </span>
              </label>

              {hasStates ? (
                <div className="space-y-2">
                  <label htmlFor="state-select" className="text-sm font-medium text-slate-700">
                    Select your state
                  </label>
                  <select
                    id="state-select"
                    value={selectedState}
                    onChange={handleStateChange}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  >
                    <option value="" disabled>
                      Choose a state
                    </option>
                    {states.map((state) => (
                      <option key={state.slug} value={state.slug}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
            </div>

            {error ? (
              <p className="text-sm text-rose-600" role="alert">
                {error}
              </p>
            ) : null}

            <button
              type="button"
              onClick={handleConfirm}
              disabled={submitting}
              className="w-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-emerald-600 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Loading..." : "Enter TerpTier"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
