import { Prisma } from "@prisma/client";

export type StateMetadata = {
  slug: string;
  name: string;
  abbreviation: string;
  tagline?: string;
  producerWhere?: Prisma.ProducerWhereInput;
  strainWhere?: Prisma.StrainWhereInput;
};

type StateConfig = {
  slug: string;
  name: string;
  abbreviation: string;
  tagline?: string;
};

const createStateMetadata = ({
  slug,
  name,
  abbreviation,
  tagline,
}: StateConfig): StateMetadata => ({
  slug,
  name,
  abbreviation,
  tagline: tagline ?? `Discover ${name}'s finest producers`,
  producerWhere: { state: { slug } },
  strainWhere: { state: { slug } },
});

const STATE_CONFIGS: StateConfig[] = [
  {
    slug: "colorado",
    name: "Colorado",
    abbreviation: "CO",
    tagline: "Celebrating the Centennial State's finest producers",
  },
  {
    slug: "california",
    name: "California",
    abbreviation: "CA",
  },
  {
    slug: "oregon",
    name: "Oregon",
    abbreviation: "OR",
  },
  {
    slug: "washington",
    name: "Washington",
    abbreviation: "WA",
  },
  {
    slug: "massachusetts",
    name: "Massachusetts",
    abbreviation: "MA",
  },
  {
    slug: "maryland",
    name: "Maryland",
    abbreviation: "MD",
  },
  {
    slug: "vermont",
    name: "Vermont",
    abbreviation: "VT",
  },
  {
    slug: "maine",
    name: "Maine",
    abbreviation: "ME",
  },
];

export const STATES = STATE_CONFIGS.map(createStateMetadata);
const STATE_MAP = new Map(STATES.map((state) => [state.slug, state]));

export const DEFAULT_STATE = STATES[0];
export const DEFAULT_STATE_SLUG = DEFAULT_STATE.slug;

export function getStateMetadata(stateName: string): StateMetadata | null {
  const normalized = stateName.toLowerCase();
  return STATE_MAP.get(normalized) ?? null;
}

export function getStateFromAttributes(
  attributes?: string[] | null
): StateMetadata {
  if (attributes) {
    const prefix = "state:";
    for (const attribute of attributes) {
      if (attribute.startsWith(prefix)) {
        const slug = attribute.slice(prefix.length).toLowerCase();
        const state = STATE_MAP.get(slug);
        if (state) {
          return state;
        }
      }
    }
  }

  return DEFAULT_STATE;
}

export function generateStateStaticParams() {
  return STATES.map((state) => ({ stateName: state.slug }));
}
