import { cache } from "react";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prismadb";
import { DEFAULT_STATE, DEFAULT_STATE_SLUG, STATE_TAGLINES } from "./stateConstants";

export type StateMetadata = {
  slug: string;
  name: string;
  abbreviation: string;
  tagline?: string;
  producerWhere?: Prisma.ProducerWhereInput;
  strainWhere?: Prisma.StrainWhereInput;
};

const createStateMetadata = ({
  slug,
  name,
  abbreviation,
  tagline,
}: {
  slug: string;
  name: string;
  abbreviation: string;
  tagline?: string;
}): StateMetadata => ({
  slug,
  name,
  abbreviation,
  tagline: tagline ?? `Discover ${name}'s finest producers`,
  producerWhere: { state: { slug } },
  strainWhere: { state: { slug } },
});

const loadStateMetadata = cache(async (): Promise<StateMetadata[]> => {
  const states = await prisma.state.findMany({
    orderBy: { name: "asc" },
  });

  if (!states.length) {
    return [
      createStateMetadata({
        slug: DEFAULT_STATE.slug,
        name: DEFAULT_STATE.name,
        abbreviation: DEFAULT_STATE.abbreviation,
        tagline: STATE_TAGLINES[DEFAULT_STATE.slug],
      }),
    ];
  }

  return states.map((state) =>
    createStateMetadata({
      slug: state.slug,
      name: state.name,
      abbreviation: state.code,
      tagline: STATE_TAGLINES[state.slug],
    }),
  );
});

export async function getAllStateMetadata() {
  return loadStateMetadata();
}

export async function getStateMetadata(stateName: string): Promise<StateMetadata | null> {
  const normalized = stateName.toLowerCase();
  const states = await loadStateMetadata();
  return states.find((state) => state.slug === normalized) ?? null;
}

export async function getStateFromAttributes(attributes?: string[] | null) {
  if (attributes) {
    const prefix = "state:";
    for (const attribute of attributes) {
      if (attribute.startsWith(prefix)) {
        const slug = attribute.slice(prefix.length).toLowerCase();
        const states = await loadStateMetadata();
        const state = states.find((candidate) => candidate.slug === slug);
        if (state) {
          return state;
        }
      }
    }
  }

  const states = await loadStateMetadata();
  return (
    states.find((state) => state.slug === DEFAULT_STATE_SLUG) ?? states[0]
  );
}

export async function generateStateStaticParams() {
  const states = await loadStateMetadata();
  return states.map((state) => ({ stateName: state.slug }));
}
