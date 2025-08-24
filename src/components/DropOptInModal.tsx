'use client';

import { useState } from 'react';
import Modal from './Modal';

interface Props {
  onClose: () => void;
  onOptIn?: () => void;
}

export default function DropOptInModal({ onClose, onOptIn }: Props) {
  const [open, setOpen] = useState(true);

  const setCookie = (name: string, value: string, days: number) => {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/; SameSite=Lax`;
  };

  const handleClose = () => {
    setCookie('dropOptInPrompt', 'done', 365);
    setOpen(false);
    onClose();
  };

  const handleYes = async () => {
    try {
      await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationOptIn: true }),
      });
      onOptIn?.();
    } catch (err) {
      console.error('Failed to update notification setting', err);
    } finally {
      handleClose();
    }
  };

  return (
    <Modal isOpen={open} onClose={handleClose}>
      <h2 className="text-xl font-semibold mb-4 text-center">
        Get notified about new drops?
      </h2>
      <div className="flex justify-center space-x-4">
        <button
          onClick={handleClose}
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
        >
          No
        </button>
        <button
          onClick={handleYes}
          className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
        >
          Yes
        </button>
      </div>
    </Modal>
  );
}

