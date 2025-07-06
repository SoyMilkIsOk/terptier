// src/app/page.tsx
import { cookies } from "next/headers";
import AgeGate from "@/components/AgeGate";
import HeroHome from "@/components/HeroHome";

export default async function HomePage() {
  const cookieStore = await cookies();
  const is21 = cookieStore.get("ageVerify")?.value === "true";

  if (!is21) {
    return <AgeGate />;
  }

  return <HeroHome />;
}
