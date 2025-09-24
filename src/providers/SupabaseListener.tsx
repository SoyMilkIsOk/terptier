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

    const revalidate = async (source: string) => {
      console.debug(`[SupabaseListener] revalidate triggered from ${source}`);
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.warn("[SupabaseListener] auth.getUser error", error.message);
        } else {
          console.debug("[SupabaseListener] auth user", data.user?.id ?? null);
        }
      } catch (error) {
        console.error("[SupabaseListener] Failed to refresh Supabase session", error);
      }
      if (active) {
        router.refresh();
      }
    };

    void revalidate("mount");

    const { data } = supabase.auth.onAuthStateChange(async (event) => {
      console.debug("[SupabaseListener] auth state change", event);
      await revalidate(event ?? "unknown");
    });

    return () => {
      active = false;
      data?.subscription.unsubscribe();
    };
  }, [router]);

  return <>{children}</>;
}
