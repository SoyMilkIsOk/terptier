// src/app/page.tsx
import type { Metadata } from "next";
import { cookies } from "next/headers";
import AgeGate from "@/components/AgeGate";
import HeroHome from "@/components/HeroHome";
import { getAllStateMetadata } from "@/lib/states";
import { getStaticPageTitle } from "@/lib/seo";

export const metadata: Metadata = {
  title: getStaticPageTitle("home"),
};

const STATE_COOKIE_NAME = "preferredState";

export default async function HomePage() {
  const cookieStore = await cookies();
  const is21 = cookieStore.get("ageVerify")?.value === "true";
  const preferredState = cookieStore.get(STATE_COOKIE_NAME)?.value ?? null;

  const states = await getAllStateMetadata();
  const serializableStates = states.map((state) => ({
    slug: state.slug,
    name: state.name,
    abbreviation: state.abbreviation,
    tagline: state.tagline,
  }));

  const selectedState =
    preferredState && serializableStates.length
      ? serializableStates.find((state) => state.slug === preferredState) ?? null
      : null;

  if (!is21 || !selectedState) {
    return (
      <AgeGate
        states={serializableStates}
        initialStateSlug={preferredState}
      />
    );
  }

  return <HeroHome state={selectedState} states={serializableStates} />;
}
