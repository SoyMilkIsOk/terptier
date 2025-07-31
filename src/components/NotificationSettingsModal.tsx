"use client";
import { useEffect, useState } from "react";
import Modal from "./Modal";

interface Pref {
  email: boolean;
}

export default function NotificationSettingsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [pref, setPref] = useState<Pref | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/notification-preferences", {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error();
        setPref(data.preference || { email: true });
      } catch {
        setError("Failed to load preferences");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isOpen]);

  const toggleEmail = async () => {
    if (!pref) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/notification-preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: !pref.email }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error();
      setPref(data.preference);
    } catch {
      setError("Failed to update preference");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h1 className="text-xl font-bold mb-4">Notification Settings</h1>
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
    </Modal>
  );
}
