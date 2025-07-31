"use client";

import { useEffect, useState } from "react";
import BackButton from "@/components/BackButton";

interface Pref {
  email: boolean;
}

export default function NotificationSettingsPage() {
  const [pref, setPref] = useState<Pref | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/notification-preferences");
        if (!res.ok) throw new Error("failed");
        const data = await res.json();
        setPref(data.preference || { email: true });
      } catch {
        setError("Failed to load preferences");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleEmail = async () => {
    if (!pref) return;
    setSaving(true);
    try {
      const res = await fetch("/api/notification-preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: !pref.email }),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setPref(data.preference);
    } catch {
      setError("Failed to update preference");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <BackButton />
      </div>
      <h1 className="text-2xl font-bold mb-4">Notification Settings</h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={pref?.email ?? false}
            onChange={toggleEmail}
            disabled={saving}
          />
          <span>Receive weekly drop emails</span>
        </label>
      )}
    </div>
  );
}

