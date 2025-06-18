"use client";
import { useEffect } from "react";

export default function AgeGate() {
  useEffect(() => {
    const ok = confirm("You must be 21+. Click OK to proceed.");
    if (ok) {
      document.cookie = "ageVerify=true; path=/; max-age=" + 60*60*24*30;
      window.location.reload();
    }
  }, []);
  return null;
}
