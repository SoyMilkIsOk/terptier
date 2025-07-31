"use client";
import { useState } from "react";
import { Bell } from "lucide-react";
import NotificationSettingsModal from "./NotificationSettingsModal";

export default function NotificationSettingsButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Notification settings"
        className="text-green-600 hover:text-green-800"
      >
        <Bell className="w-5 h-5" />
      </button>
      <NotificationSettingsModal
        isOpen={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
