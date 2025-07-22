'use client';
import { useState, useEffect } from "react";
import { Shield, Calendar, Cookie, Eye, Lock, Check, Leaf } from "lucide-react";

type Step = 'age' | 'privacy' | 'complete';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

type CookieType = keyof Omit<CookiePreferences, 'essential'>;

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-lg mx-4 max-h-[95vh] overflow-y-auto border border-green-200/30">
        {children}
      </div>
    </div>
  );
}

export default function AgeGate() {
  const [open, setOpen] = useState<boolean>(true);
  const [step, setStep] = useState<Step>('age');
  const [ageVerify, setAgeVerify] = useState<boolean>(false);
  const [privacyAccepted, setPrivacyAccepted] = useState<boolean>(false);
  const [cookiePreferences, setCookiePreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
    functional: false
  });
  const [showCookieDetails, setShowCookieDetails] = useState<boolean>(false);

  // Cookie utility functions
  const setCookie = (name: string, value: string, days: number): void => {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  };

  const getCookie = (name: string): string | null => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

  const deleteCookie = (name: string): void => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  };

  // Check existing cookies on mount
  useEffect(() => {
    const ageVerify = getCookie('ageVerify');
    const privacyConsent = getCookie('privacyConsent');
    const cookiePrefs = getCookie('cookiePreferences');

    if (ageVerify && privacyConsent) {
      setOpen(false);
      return;
    } else if (ageVerify) {
      setAgeVerify(true);
      setStep('privacy');
    }

    if (cookiePrefs) {
      try {
        const prefs = JSON.parse(decodeURIComponent(cookiePrefs));
        setCookiePreferences(prev => ({ ...prev, ...prefs }));
      } catch (e) {
        console.error('Error parsing cookie preferences:', e);
      }
    }
  }, []);

  const handleAgeConfirm = (): void => {
    setAgeVerify(true);
    setStep('privacy');
    
    // Set age verification cookie (30 days)
    setCookie('ageVerify', 'true', 30);
    
    // Track that user confirmed age
    console.log('Age verified and stored in cookies');
  };

  const handlePrivacyAccept = (): void => {
    setPrivacyAccepted(true);
    setStep('complete');
    
    // Set privacy consent cookie (365 days)
    setCookie('privacyConsent', 'true', 365);
    
    // Set cookie preferences
    setCookie('cookiePreferences', encodeURIComponent(JSON.stringify(cookiePreferences)), 365);
    
    // Set individual cookie flags based on preferences
    if (cookiePreferences.analytics) {
      setCookie('analyticsEnabled', 'true', 365);
    } else {
      deleteCookie('analyticsEnabled');
    }
    
    if (cookiePreferences.marketing) {
      setCookie('marketingEnabled', 'true', 365);
    } else {
      deleteCookie('marketingEnabled');
    }
    
    if (cookiePreferences.functional) {
      setCookie('functionalEnabled', 'true', 365);
    } else {
      deleteCookie('functionalEnabled');
    }
    
    console.log('Privacy preferences saved:', cookiePreferences);
    
    // Close modal and reload page after animation
    setTimeout(() => {
      setOpen(false);
      window.location.reload();
    }, 2000);
  };

  const toggleCookiePreference = (type: CookieType): void => {
    setCookiePreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleRejectAll = (): void => {
    setCookiePreferences({
      essential: true,
      analytics: false,
      marketing: false,
      functional: false
    });
  };

  const handleAcceptAll = (): void => {
    setCookiePreferences({
      essential: true,
      analytics: true,
      marketing: true,
      functional: true
    });
  };

  return (
    <Modal isOpen={open} onClose={() => {}}>
      {step === 'complete' ? (
        <div className="p-6 sm:p-8 text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Welcome!</h2>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">Thank you for verifying your age and setting your privacy preferences.</p>
          <div className="flex items-center justify-center space-x-2 text-sm text-green-600">
            <Leaf className="w-4 h-4" />
            <span>Preferences saved securely</span>
          </div>
          <div className="mt-4">
            <div className="h-2 bg-green-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-600 rounded-full animate-[loading_2s_ease-in-out]"></div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 sm:p-6 text-white">
            <div className="flex items-center justify-center mb-3">
              {step === 'age' ? (
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3" />
              ) : (
                <Lock className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3" />
              )}
              <h1 className="text-lg sm:text-2xl font-bold">
                {step === 'age' ? 'Age Verification' : 'Privacy & Cookies'}
              </h1>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: step === 'age' ? '50%' : '100%' }}
              />
            </div>
          </div>

          {/* Age Verification Step */}
          {step === 'age' && (
            <div className="p-4 sm:p-8">
              <div className="text-center mb-6 sm:mb-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">Age Verification Required</h2>
                <p className="text-gray-600 text-sm sm:text-lg leading-relaxed px-2">
                  To access this content, you must be <strong>21 years or older</strong>. 
                  Please confirm your age to continue.
                </p>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <button
                  onClick={handleAgeConfirm}
                  className="w-full bg-gradient-to-r cursor-pointer from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl text-sm sm:text-base"
                >
                  ✓ I'm 21 or older
                </button>
                
                <button
                  onClick={() => window.history.back()}
                  className="w-full bg-gray-100 cursor-pointer hover:bg-gray-200 text-gray-700 font-medium py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-all duration-200 border border-gray-200 text-sm sm:text-base"
                >
                  I'm under 21
                </button>
              </div>
              
              <div className="mt-4 sm:mt-6 text-center">
                <p className="text-xs text-gray-500">
                  Your age verification will be stored for 30 days
                </p>
              </div>
            </div>
          )}

          {/* Privacy & Cookies Step */}
          {step === 'privacy' && (
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
                {/* Essential Cookies */}
                <div className="flex items-center justify-between p-3 sm:p-4 bg-green-50 rounded-xl border border-green-100">
                  <div className="flex-1 pr-3">
                    <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Essential Cookies</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Required for basic site functionality</p>
                  </div>
                  <div className="w-10 h-5 cursor-not-allowed sm:w-12 sm:h-6 bg-green-500 rounded-full flex items-center justify-end px-1">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full"></div>
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl border">
                  <div className="flex-1 pr-3">
                    <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Analytics</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Help us improve our service</p>
                  </div>
                  <button
                    onClick={() => toggleCookiePreference('analytics')}
                    className={`w-10 h-5 cursor-pointer sm:w-12 sm:h-6 rounded-full flex items-center px-1 transition-all duration-200 ${
                      cookiePreferences.analytics 
                        ? 'bg-green-500 justify-end' 
                        : 'bg-gray-300 justify-start'
                    }`}
                  >
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full"></div>
                  </button>
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl border">
                  <div className="flex-1 pr-3">
                    <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Marketing</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Personalized content and ads</p>
                  </div>
                  <button
                    onClick={() => toggleCookiePreference('marketing')}
                    className={`w-10 h-5 cursor-pointer sm:w-12 sm:h-6 rounded-full flex items-center px-1 transition-all duration-200 ${
                      cookiePreferences.marketing 
                        ? 'bg-green-500 justify-end' 
                        : 'bg-gray-300 justify-start'
                    }`}
                  >
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full"></div>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={handleAcceptAll}
                    className="flex-1 cursor-pointer bg-green-100 hover:bg-green-200 text-green-700 font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg text-sm border border-green-200"
                  >
                    Accept All
                  </button>
                  <button
                    onClick={handleRejectAll}
                    className="flex-1 cursor-pointer bg-red-100 hover:bg-red-200 text-red-700 font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg text-sm border border-red-200"
                  >
                    Reject All
                  </button>
                </div>
                
                <button
                  onClick={handlePrivacyAccept}
                  className="w-full cursor-pointer bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold py-3 px-4 sm:px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg text-sm"
                >
                  Save My Preferences
                </button>
                
                <button
                  onClick={() => setShowCookieDetails(!showCookieDetails)}
                  className="w-full cursor-pointer flex items-center justify-center text-gray-600 hover:text-gray-800 py-2 text-xs sm:text-sm transition-colors duration-200"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  {showCookieDetails ? 'Hide' : 'Show'} Cookie Details
                </button>
              </div>

              {showCookieDetails && (
                <div className="mt-4 p-3 sm:p-4 bg-green-50 rounded-xl border border-green-100 text-xs sm:text-sm text-gray-700">
                  <h4 className="font-semibold mb-2 text-green-800">Cookie Information</h4>
                  <ul className="space-y-1 text-xs">
                    <li>• <strong>Essential:</strong> Session management, security, age verification</li>
                    <li>• <strong>Analytics:</strong> Google Analytics, usage statistics, performance</li>
                    <li>• <strong>Marketing:</strong> Ad personalization, retargeting, social media</li>
                    <li>• <strong>Functional:</strong> Language preferences, user settings, themes</li>
                  </ul>
                  <p className="mt-2 text-xs text-gray-500">
                    Cookies are stored securely and you can change these preferences anytime.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="px-4 sm:px-8 pb-4 sm:pb-6 text-center">
            <p className="text-xs text-gray-500">
              By continuing, you agree to our{' '}
              <a href="/terms" className="text-green-600 hover:underline">Terms of Service</a> and{' '}
              <a href="/privacy" className="text-green-600 hover:underline">Privacy Policy</a>
            </p>
          </div>
        </>
      )}
    </Modal>
  );
}