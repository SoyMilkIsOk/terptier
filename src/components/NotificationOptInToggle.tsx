'use client';

import { useState, useTransition } from 'react';

interface Props {
  initial: boolean;
}

export default function NotificationOptInToggle({ initial }: Props) {
  const [checked, setChecked] = useState(initial);
  const [isPending, startTransition] = useTransition();

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
      } catch (err) {
        console.error('Failed to update notification setting', err);
        setChecked(!newValue);
      }
    });
  };

  return (
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
  );
}

