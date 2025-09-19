import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  getStateMetadata,
  generateStateStaticParams,
} from "@/lib/states";
import { StateProvider } from "@/components/StateProvider";
import StateNavLinks from "@/components/StateNavLinks";

export function generateStaticParams() {
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
  const state = getStateMetadata(stateName);

  if (!state) {
    notFound();
  }

  const navLinks = [
    { label: "Rankings", href: `/${state.slug}/rankings` },
    { label: "Drops", href: `/${state.slug}/drops` },
  ];

  return (
    <StateProvider stateSlug={state.slug}>
      <div className="flex flex-col gap-6">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
          <div className="px-6 py-6 md:px-10 md:py-8 flex flex-col gap-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-green-600">
                  TerpTier States
                </p>
                <h1 className="text-3xl font-bold text-gray-900">
                  {state.name}
                </h1>
                {state.tagline ? (
                  <p className="mt-2 text-sm text-gray-600 max-w-xl">
                    {state.tagline}
                  </p>
                ) : null}
              </div>
            </div>
            <StateNavLinks links={navLinks} />
          </div>
        </div>
        <div>{children}</div>
      </div>
    </StateProvider>
  );
}
