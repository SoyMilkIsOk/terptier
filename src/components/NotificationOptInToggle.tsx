'use client';

import { useState, useTransition } from 'react';

interface Props {
  initial: boolean;
}

export default function NotificationOptInToggle({ initial }: Props) {
  const [checked, setChecked] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ message: string; type: 'sub' | 'unsub' } | null>(null);

  const onChange = () => {
    const newValue = !checked;
    setChecked(newValue);
    startTransition(async () => {
      try {
        await fetch('/api/users/me', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notificationOptIn: newValue }),
        });
        setToast({
          message: newValue ? 'Subscribed' : 'Unsubscribed',
          type: newValue ? 'sub' : 'unsub',
        });
        setTimeout(() => setToast(null), 3000);
      } catch (err) {
        console.error('Failed to update notification setting', err);
        setChecked(!newValue);
      }
    });
  };

  return (
    <>
      {toast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 transform px-4 py-2 rounded-md text-white shadow-md z-50 ${
            toast.type === 'sub' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {toast.message}
        </div>
      )}
      <label className="inline-flex items-center space-x-2 cursor-pointer">
        <input
          type="checkbox"
          className="form-checkbox h-5 w-5 text-green-600"
          checked={checked}
          onChange={onChange}
          disabled={isPending}
        />
        <span>Receive weekly drop emails</span>
      </label>
    </>
  );
}

