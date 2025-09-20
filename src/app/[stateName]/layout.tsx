import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  getStateMetadata,
  generateStateStaticParams,
} from "@/lib/states";
import { StateProvider } from "@/components/StateProvider";

export async function generateStaticParams() {
  return generateStateStaticParams();
}

export default async function StateLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ stateName: string }>;
}) {
  const { stateName } = await params;
  const state = await getStateMetadata(stateName);

  if (!state) {
    notFound();
  }

  return (
    <StateProvider stateSlug={state.slug}>
      {children}
    </StateProvider>
  );
}
