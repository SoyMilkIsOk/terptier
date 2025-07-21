"use client";
import { useState } from "react";
import dynamic from "next/dynamic";

const GoogleFormEmbed = dynamic(() => import("@/components/GoogleFormEmbed"), {
  ssr: false,
});

export default function FeedbackPage() {
  const [showForm, setShowForm] = useState(false);
  return (
    <div className="flex flex-col items-center gap-6 py-8 px-4">
      <h1 className="text-3xl font-bold">Request a Producer</h1>
      <p className="text-center">Missing your favorite producer? Let us know.</p>

        <GoogleFormEmbed />

    </div>
  );
}
