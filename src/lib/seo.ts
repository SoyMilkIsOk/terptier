import type { Metadata } from "next";

export const SITE_NAME = "TerpTier";
export const TITLE_SEPARATOR = " | ";

export const BASE_METADATA: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s${TITLE_SEPARATOR}${SITE_NAME}`,
  },
};

export const STATIC_PAGE_TITLES = {
  home: "Discover Top Cannabis Producers, Strains & Drops",
  about: "About TerpTier",
  faq: "Frequently Asked Questions",
  feedback: "Share Feedback",
  terms: "Terms of Service",
  privacy: "Privacy Policy",
  login: "Log In",
  signup: "Create an Account",
  drops: "National Drops Calendar",
  rankings: "Top Cannabis Producer Rankings",
  admin: "Admin Dashboard",
  profile: "User Profile",
  stateDrops: "State Drops Calendar",
  stateRankings: "State Producer Rankings",
  stateAdmin: "State Admin Dashboard",
  producerStrains: "Producer Strain Library",
  strain: "Strain Details",
};

export type StaticPageKey = keyof typeof STATIC_PAGE_TITLES;

export const createPageTitle = (title: string) =>
  `${title}${TITLE_SEPARATOR}${SITE_NAME}`;

export const getStaticPageTitle = (key: StaticPageKey) =>
  createPageTitle(STATIC_PAGE_TITLES[key]);

export const getProducerPageTitle = (producerName: string) =>
  createPageTitle(`About ${producerName}: Drops, Strains & Reviews`);

export const getProducerStrainLibraryTitle = (producerName: string) =>
  createPageTitle(`${producerName} Strain Library & Reviews`);

export const getProducerDropsPageTitle = (producerName: string) =>
  createPageTitle(`${producerName} Drop Schedule & Upcoming Strains`);

export const getStrainPageTitle = (
  strainName: string,
  producerName: string,
) =>
  createPageTitle(`${strainName} by ${producerName}: Reviews & Terp Insights`);

export const getStateDropsPageTitle = (stateName: string) =>
  createPageTitle(`${stateName} Cannabis Drops & Release Calendar`);

export const getStateRankingsPageTitle = (stateName: string) =>
  createPageTitle(`${stateName} Cannabis Producer Rankings`);

export const getStateAdminPageTitle = (stateName: string) =>
  createPageTitle(`${stateName} Admin Dashboard`);

export const getProfilePageTitle = (displayName: string) =>
  createPageTitle(`${displayName}'s TerpTier Profile`);

export const getAdminProducerEditTitle = (producerName: string) =>
  createPageTitle(`Manage ${producerName} on TerpTier`);
