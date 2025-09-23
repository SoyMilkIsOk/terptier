"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function SupabaseListener({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const subscribed = useRef(false);

  useEffect(() => {
    if (subscribed.current) {
      return;
    }
    subscribed.current = true;

    let active = true;

    const revalidate = async () => {
      try {
        await supabase.auth.getUser();
      } catch (error) {
        console.error("Failed to refresh Supabase session", error);
      }
      if (active) {
        router.refresh();
      }
    };

    void revalidate();

    const { data } = supabase.auth.onAuthStateChange(async () => {
      await revalidate();
    });

    return () => {
      active = false;
      data?.subscription.unsubscribe();
    };
  }, [router]);

  return <>{children}</>;
}
