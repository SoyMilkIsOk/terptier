"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";

interface NotifyToggleProps {
  strainId: string;
  initialSubscribed: boolean;
  isLoggedIn: boolean;
}

export default function NotifyToggle({
  strainId,
  initialSubscribed,
  isLoggedIn,
}: NotifyToggleProps) {
  const [subscribed, setSubscribed] = useState(initialSubscribed);
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (showTooltip) {
      const timer = setTimeout(() => {
        setShowTooltip(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showTooltip]);

  const toggle = async () => {
    if (!isLoggedIn) {
      router.push("/login?reason=notify");
      return;
    }

    setLoading(true);
    try {
      const method = subscribed ? "DELETE" : "POST";
      const res = await fetch("/api/notifications/subscribe", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strainId }),
      });

      if (res.ok) {
        setSubscribed(!subscribed);
        setShowTooltip(true);
      } else {
        console.error("Failed to toggle subscription");
      }
    } catch (error) {
      console.error("Error toggling subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={toggle}
        disabled={loading}
        className={`
          flex items-center gap-2 p-3 md:px-4 md:py-2 rounded-full font-semibold transition-all duration-200
          ${
            subscribed
              ? "bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-200"
              : "bg-red-50 text-red-600 hover:bg-red-100"
          }
          ${loading ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}
        `}
        title={subscribed ? "Unsubscribe from drop updates" : "Notify me when this drops"}
      >
        {subscribed ? (
          <>
            <Bell className="w-5 h-5 fill-current" />
            <span className="hidden md:inline">Subscribed</span>
          </>
        ) : (
          <>
            <Bell className="w-5 h-5" />
            <span className="hidden md:inline">Notify Me</span>
          </>
        )}
      </button>

      {mounted && createPortal(
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: -50, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: -50, x: "-50%" }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`
                fixed top-24 left-1/2 z-[100] px-4 py-2 rounded-full shadow-xl md:hidden
                flex items-center gap-2 text-white text-sm font-bold tracking-wide whitespace-nowrap
                ${subscribed ? "bg-green-500 shadow-green-200" : "bg-red-500 shadow-red-200"}
              `}
            >
              {subscribed ? (
                <>
                  <Bell className="w-5 h-5 fill-current" />
                  <span>Drop Notifications On</span>
                </>
              ) : (
                <>
                  <BellOff className="w-5 h-5" />
                  <span>Drop Notifications Off</span>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
