"use client";
import { useRouter } from "next/navigation";
import NotificationSettingsModal from "@/components/NotificationSettingsModal";

export default function NotificationSettingsPage() {
  const router = useRouter();
  return (
    <NotificationSettingsModal
      isOpen={true}
      onClose={() => router.back()}
    />
  );
}
