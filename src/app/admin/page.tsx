import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AgeGate from "@/components/AgeGate";
import { getAllStateMetadata } from "@/lib/states";
import { getStaticPageTitle } from "@/lib/seo";

const AGE_COOKIE_NAME = "ageVerify";
const STATE_COOKIE_NAME = "preferredState";

export const metadata: Metadata = {
  title: getStaticPageTitle("admin"),
};

export default async function AdminLandingPage() {
  const cookieStore = await cookies();
  const is21 = cookieStore.get(AGE_COOKIE_NAME)?.value === "true";
  const preferredState = cookieStore.get(STATE_COOKIE_NAME)?.value ?? null;

  const states = await getAllStateMetadata();
  const serializableStates = states.map((state) => ({
    slug: state.slug,
    name: state.name,
    abbreviation: state.abbreviation,
    tagline: state.tagline,
  }));

  const hasValidPreferredState =
    preferredState !== null && serializableStates.some((state) => state.slug === preferredState);

  if (is21 && hasValidPreferredState) {
    redirect(`/${preferredState}/admin`);
  }

  return (
    <AgeGate
      states={serializableStates}
      initialStateSlug={hasValidPreferredState ? preferredState : null}
    />
  );
}
