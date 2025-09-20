"use client";

import { createContext, useContext } from "react";
import { DEFAULT_STATE_SLUG } from "@/lib/states";

const StateSlugContext = createContext<string>(DEFAULT_STATE_SLUG);

export function StateProvider({
  stateSlug,
  children,
}: {
  stateSlug: string;
  children: React.ReactNode;
}) {
  return (
    <StateSlugContext.Provider value={stateSlug}>
      {children}
    </StateSlugContext.Provider>
  );
}

export function useStateSlug() {
  return useContext(StateSlugContext);
}
