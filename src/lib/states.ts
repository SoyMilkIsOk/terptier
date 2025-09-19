import { Prisma } from "@prisma/client";

export type StateMetadata = {
  slug: string;
  name: string;
  abbreviation: string;
  tagline?: string;
  producerWhere?: Prisma.ProducerWhereInput;
  strainWhere?: Prisma.StrainWhereInput;
  attributeTag?: string;
};

const createFilters = (
  attributeTag?: string
): Pick<StateMetadata, "producerWhere" | "strainWhere"> => {
  if (!attributeTag) {
    return { producerWhere: undefined, strainWhere: undefined };
  }

  const producerWhere: Prisma.ProducerWhereInput = {
    attributes: { has: attributeTag },
  };

  const strainWhere: Prisma.StrainWhereInput = {
    producer: { attributes: { has: attributeTag } },
  };

  return { producerWhere, strainWhere };
};

export const STATES: StateMetadata[] = [
  {
    slug: "colorado",
    name: "Colorado",
    abbreviation: "CO",
    tagline: "Celebrating the Centennial State's finest producers",
    attributeTag: "state:colorado",
    ...createFilters("state:colorado"),
  },
];

export const DEFAULT_STATE = STATES[0];
export const DEFAULT_STATE_SLUG = DEFAULT_STATE.slug;

export function getStateMetadata(stateName: string): StateMetadata | null {
  const normalized = stateName.toLowerCase();
  return STATES.find((state) => state.slug === normalized) ?? null;
}

export function getStateFromAttributes(
  attributes?: string[] | null
): StateMetadata {
  if (attributes) {
    for (const state of STATES) {
      if (state.attributeTag && attributes.includes(state.attributeTag)) {
        return state;
      }
    }
  }
  return DEFAULT_STATE;
}

export function generateStateStaticParams() {
  return STATES.map((state) => ({ stateName: state.slug }));
}
