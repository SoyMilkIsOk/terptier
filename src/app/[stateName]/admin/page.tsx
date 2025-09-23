import type { Metadata } from "next";
import { getStateMetadata } from "@/lib/states";
import {
  getStateAdminPageTitle,
  getStaticPageTitle,
} from "@/lib/seo";
import StateAdminPageClient from "./StateAdminPageClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ stateName: string }>;
}): Promise<Metadata> {
  const { stateName } = await params;
  const state = await getStateMetadata(stateName);

  if (!state) {
    return { title: getStaticPageTitle("stateAdmin") };
  }

  return { title: getStateAdminPageTitle(state.name) };
}

export default function StateAdminPage() {
  return <StateAdminPageClient />;
}
