"use client";
import { useState } from "react";
import Modal from "./Modal";

export default function AgeGate() {
  const [open, setOpen] = useState(true);

  const confirmAge = () => {
    document.cookie = "ageVerify=true; path=/; max-age=" + 60 * 60 * 24 * 30;
    setOpen(false);
    window.location.reload();
  };

  return (
    <Modal isOpen={open} onClose={() => {}}>
      <p className="text-center mb-4">You must be 21+. Click below to proceed.</p>
      <div className="text-center">
        <button
          onClick={confirmAge}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          I'm 21 or older
        </button>
      </div>
    </Modal>
  );
}
