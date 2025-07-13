"use client";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="flex items-center text-blue-600 hover:underline"
    >
      <ArrowLeft className="w-4 h-4 mr-1" />
      Back
    </button>
  );
}
