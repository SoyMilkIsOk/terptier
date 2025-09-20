"use client";

import { useState, useEffect, type ChangeEvent, type ReactNode } from "react";
import { Shield, Calendar, Cookie, Eye, Lock, Check, Leaf } from "lucide-react";

export type AgeGateStateOption = {
  slug: string;
  name: string;
  abbreviation: string;
  tagline?: string | null;
};

type Step = "age" | "privacy" | "complete";

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

type CookieType = keyof Omit<CookiePreferences, "essential">;

interface ModalProps {
  isOpen: boolean;
  children: ReactNode;
}

const AGE_COOKIE_NAME = "ageVerify";
const PRIVACY_COOKIE_NAME = "privacyConsent";
const COOKIE_PREFS_COOKIE_NAME = "cookiePreferences";
const STATE_COOKIE_NAME = "preferredState";
const STATE_STORAGE_KEY = "terptier:selectedState";

const setCookie = (name: string, value: string, days: number): void => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

const getCookie = (name: string): string | null => {
  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i += 1) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === " ") {
      cookie = cookie.substring(1, cookie.length);
    }
    if (cookie.indexOf(nameEQ) === 0) {
      return cookie.substring(nameEQ.length, cookie.length);
    }
  }
  return null;
};

const deleteCookie = (name: string): void => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

function Modal({ isOpen, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-lg mx-4 max-h-[95vh] overflow-y-auto border border-green-200/30">
        {children}
      </div>
    </div>
  );
}

interface AgeGateProps {
  states?: AgeGateStateOption[];
  initialStateSlug?: string | null;
}

export default function AgeGate({ states = [], initialStateSlug = null }: AgeGateProps) {
  const normalizedInitialSlug = initialStateSlug?.toLowerCase() ?? "";
  const [open, setOpen] = useState<boolean>(true);
  const [step, setStep] = useState<Step>("age");
  const [cookiePreferences, setCookiePreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
    functional: false,
  });
  const [showCookieDetails, setShowCookieDetails] = useState<boolean>(false);
  const [selectedState, setSelectedState] = useState<string>(() => {
    if (!states.length) {
      return "";
    }
    if (normalizedInitialSlug && states.some((state) => state.slug === normalizedInitialSlug)) {
      return normalizedInitialSlug;
    }
    return "";
  });
  const [stateError, setStateError] = useState<string | null>(null);
  const [hasExistingPrivacyConsent, setHasExistingPrivacyConsent] = useState(false);

  useEffect(() => {
    if (!states.length) {
      return;
    }

    const initialFromProps = normalizedInitialSlug && states.some((state) => state.slug === normalizedInitialSlug)
      ? normalizedInitialSlug
      : "";

    const cookieState = getCookie(STATE_COOKIE_NAME);
    const hasCookieState = cookieState && states.some((state) => state.slug === cookieState);

    if (hasCookieState) {
      setSelectedState(cookieState!);
      try {
        window.localStorage.setItem(STATE_STORAGE_KEY, cookieState!);
      } catch (error) {
        console.warn("Unable to persist state selection", error);
      }
    } else if (initialFromProps) {
      setSelectedState(initialFromProps);
    } else if (typeof window !== "undefined") {
      try {
        const stored = window.localStorage.getItem(STATE_STORAGE_KEY);
        if (stored && states.some((state) => state.slug === stored)) {
          setSelectedState(stored);
        }
      } catch (error) {
        console.warn("Unable to load stored state selection", error);
      }
    }
  }, [states, normalizedInitialSlug]);

  useEffect(() => {
    const ageVerifyCookie = getCookie(AGE_COOKIE_NAME);
    const privacyConsent = getCookie(PRIVACY_COOKIE_NAME);
    const cookiePrefs = getCookie(COOKIE_PREFS_COOKIE_NAME);

    if (cookiePrefs) {
      try {
        const parsed = JSON.parse(decodeURIComponent(cookiePrefs));
        setCookiePreferences((prev) => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error("Error parsing cookie preferences:", error);
      }
    }

    const cookieState = getCookie(STATE_COOKIE_NAME);
    const hasValidState = !states.length || (cookieState && states.some((state) => state.slug === cookieState));

    if (privacyConsent === "true") {
      setHasExistingPrivacyConsent(true);
    }

    if (ageVerifyCookie === "true" && hasValidState) {
      if (privacyConsent === "true") {
        setStep("complete");
        setTimeout(() => {
          setOpen(false);
          window.location.reload();
        }, 1200);
      } else {
        setStep("privacy");
      }
    }
  }, [states]);

  const persistStateSelection = (slug: string) => {
    setCookie(STATE_COOKIE_NAME, slug, 365);
    try {
      window.localStorage.setItem(STATE_STORAGE_KEY, slug);
    } catch (error) {
      console.warn("Unable to persist state selection", error);
    }
  };

  const handleAgeConfirm = (): void => {
    if (states.length && !selectedState) {
      setStateError("Please select your state to continue.");
      return;
    }

    setCookie(AGE_COOKIE_NAME, "true", 30);

    if (states.length && selectedState) {
      persistStateSelection(selectedState);
    }

    if (hasExistingPrivacyConsent) {
      setStep("complete");
      setTimeout(() => {
        setOpen(false);
        window.location.reload();
      }, 1200);
    } else {
      setStep("privacy");
    }
  };

  const handlePrivacyAccept = (): void => {
    setHasExistingPrivacyConsent(true);
    setStep("complete");

    setCookie(PRIVACY_COOKIE_NAME, "true", 365);
    setCookie(COOKIE_PREFS_COOKIE_NAME, encodeURIComponent(JSON.stringify(cookiePreferences)), 365);

    if (states.length && selectedState) {
      persistStateSelection(selectedState);
    }

    if (cookiePreferences.analytics) {
      setCookie("analyticsEnabled", "true", 365);
    } else {
      deleteCookie("analyticsEnabled");
    }

    if (cookiePreferences.marketing) {
      setCookie("marketingEnabled", "true", 365);
    } else {
      deleteCookie("marketingEnabled");
    }

    if (cookiePreferences.functional) {
      setCookie("functionalEnabled", "true", 365);
    } else {
      deleteCookie("functionalEnabled");
    }

    setTimeout(() => {
      setOpen(false);
      window.location.reload();
    }, 2000);
  };

  const toggleCookiePreference = (type: CookieType): void => {
    setCookiePreferences((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleRejectAll = (): void => {
    setCookiePreferences({
      essential: true,
      analytics: false,
      marketing: false,
      functional: false,
    });
  };

  const handleAcceptAll = (): void => {
    setCookiePreferences({
      essential: true,
      analytics: true,
      marketing: true,
      functional: true,
    });
  };

  const handleStateChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedState(event.target.value);
    if (stateError) {
      setStateError(null);
    }
  };

  return (
    <Modal isOpen={open}>
      {step === "complete" ? (
        <div className="p-6 sm:p-8 text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Welcome!</h2>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">
            Thank you for verifying your age{states.length ? " and setting your state preferences" : ""}.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-green-600">
            <Leaf className="w-4 h-4" />
            <span>Preferences saved securely</span>
          </div>
          <div className="mt-4">
            <div className="h-2 bg-green-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-600 rounded-full animate-[loading_2s_ease-in-out]" />
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 sm:p-6 text-white">
            <div className="flex items-center justify-center mb-3">
              {step === "age" ? (
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3" />
              ) : (
                <Lock className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3" />
              )}
              <h1 className="text-lg sm:text-2xl font-bold">
                {step === "age" ? "Age Verification" : "Privacy & Cookies"}
              </h1>
            </div>

            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: step === "age" ? "50%" : "100%" }}
              />
            </div>
          </div>

          {step === "age" && (
            <div className="p-4 sm:p-8">
              <div className="text-center mb-6 sm:mb-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">Age Verification Required</h2>
                <p className="text-gray-600 text-sm sm:text-lg leading-relaxed px-2">
                  To access this content, you must be <strong>21 years or older</strong>. Please confirm your age and let us know where you're exploring from to continue.
                </p>
              </div>

              {states.length ? (
                <div className="mb-4 text-left">
                  <label htmlFor="age-gate-state" className="block text-sm font-semibold text-gray-700 mb-2">
                    Select your state
                  </label>
                  <select
                    id="age-gate-state"
                    value={selectedState}
                    onChange={handleStateChange}
                    className="w-full rounded-xl border border-green-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-200"
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
                  {stateError ? (
                    <p className="mt-2 text-xs text-red-600" role="alert">
                      {stateError}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <div className="space-y-3 sm:space-y-4">
                <button
                  onClick={handleAgeConfirm}
                  disabled={states.length > 0 && !selectedState}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 disabled:from-green-400 disabled:to-emerald-400 disabled:cursor-not-allowed hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl text-sm sm:text-base"
                >
                  ✓ I'm 21 or older
                </button>

                <button
                  onClick={() => window.history.back()}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-all duration-200 border border-gray-200 text-sm sm:text-base"
                >
                  I'm under 21
                </button>
              </div>

              <div className="mt-4 sm:mt-6 text-center">
                <p className="text-xs text-gray-500">Your verification will be stored for 30 days.</p>
              </div>
            </div>
          )}

          {step === "privacy" && (
            <div className="p-4 sm:p-8">
              <div className="text-center mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Cookie className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Privacy & Cookie Preferences</h2>
                <p className="text-gray-600 text-xs sm:text-sm">
                  We respect your privacy. Choose your cookie preferences below.
                </p>
              </div>

              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div className="flex items-center justify-between p-3 sm:p-4 bg-green-50 rounded-xl border border-green-100">
                  <div className="flex-1 pr-3">
                    <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Essential Cookies</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Required for basic site functionality</p>
                  </div>
                  <div className="w-10 h-5 cursor-not-allowed sm:w-12 sm:h-6 bg-green-500 rounded-full flex items-center justify-end px-1">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl border">
                  <div className="flex-1 pr-3">
                    <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Analytics</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Help us improve our service</p>
                  </div>
                  <button
                    onClick={() => toggleCookiePreference("analytics")}
                    className={`w-10 h-5 sm:w-12 sm:h-6 rounded-full flex items-center px-1 transition-all duration-200 ${
                      cookiePreferences.analytics ? "bg-green-500 justify-end" : "bg-gray-300 justify-start"
                    }`}
                    type="button"
                  >
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl border">
                  <div className="flex-1 pr-3">
                    <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Marketing</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Personalized content and ads</p>
                  </div>
                  <button
                    onClick={() => toggleCookiePreference("marketing")}
                    className={`w-10 h-5 sm:w-12 sm:h-6 rounded-full flex items-center px-1 transition-all duration-200 ${
                      cookiePreferences.marketing ? "bg-green-500 justify-end" : "bg-gray-300 justify-start"
                    }`}
                    type="button"
                  >
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl border">
                  <div className="flex-1 pr-3">
                    <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Functional</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Experience enhancements</p>
                  </div>
                  <button
                    onClick={() => toggleCookiePreference("functional")}
                    className={`w-10 h-5 sm:w-12 sm:h-6 rounded-full flex items-center px-1 transition-all duration-200 ${
                      cookiePreferences.functional ? "bg-green-500 justify-end" : "bg-gray-300 justify-start"
                    }`}
                    type="button"
                  >
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={handleAcceptAll}
                    className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg text-sm border border-green-200"
                    type="button"
                  >
                    Accept All
                  </button>
                  <button
                    onClick={handleRejectAll}
                    className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg text-sm border border-red-200"
                    type="button"
                  >
                    Reject All
                  </button>
                </div>

                <button
                  onClick={handlePrivacyAccept}
                  className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold py-3 px-4 sm:px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg text-sm"
                  type="button"
                >
                  Save My Preferences
                </button>

                <button
                  onClick={() => setShowCookieDetails(!showCookieDetails)}
                  className="w-full flex items-center justify-center text-gray-600 hover:text-gray-800 py-2 text-xs sm:text-sm transition-colors duration-200"
                  type="button"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  {showCookieDetails ? "Hide" : "Show"} Cookie Details
                </button>
              </div>

              {showCookieDetails && (
                <div className="mt-4 p-3 sm:p-4 bg-green-50 rounded-xl border border-green-100 text-xs sm:text-sm text-gray-700">
                  <h4 className="font-semibold mb-2 text-green-800">Cookie Information</h4>
                  <ul className="space-y-1 text-xs">
                    <li>
                      • <strong>Essential:</strong> Session management, security, age verification
                    </li>
                    <li>
                      • <strong>Analytics:</strong> Google Analytics, usage statistics, performance
                    </li>
                    <li>
                      • <strong>Marketing:</strong> Ad personalization, retargeting, social media
                    </li>
                    <li>
                      • <strong>Functional:</strong> Language preferences, user settings, themes
                    </li>
                  </ul>
                  <p className="mt-2 text-xs text-gray-500">
                    Cookies are stored securely and you can change these preferences anytime.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="px-4 sm:px-8 pb-4 sm:pb-6 text-center">
            <p className="text-xs text-gray-500">
              By continuing, you agree to our{" "}
              <a href="/terms" className="text-green-600 hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-green-600 hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </>
      )}
    </Modal>
  );
}
