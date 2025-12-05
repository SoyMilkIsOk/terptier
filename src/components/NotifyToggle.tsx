"use client";

import { useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

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
    <button
      onClick={toggle}
      disabled={loading}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all duration-200
        ${
          subscribed
            ? "bg-green-100 text-green-700 hover:bg-green-200"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }
        ${loading ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}
      `}
      title={subscribed ? "Unsubscribe from drop updates" : "Notify me when this drops"}
    >
      {subscribed ? (
        <>
          <Bell className="w-5 h-5 fill-current" />
          <span>Subscribed</span>
        </>
      ) : (
        <>
          <Bell className="w-5 h-5" />
          <span>Notify Me</span>
        </>
      )}
    </button>
  );
}
