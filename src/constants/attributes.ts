export interface AttributeOption {
  key: string;
  label: string;
  icon: string;
  tooltip: string;
}

export const FLOWER_ATTRIBUTES: AttributeOption[] = [
  {
    key: 'outdoor',
    label: 'Outdoor',
    icon: '☀️',
    tooltip: 'Cultivated outside using natural sunlight',
  },
  {
    key: 'indoor',
    label: 'Indoor',
    icon: '🏠',
    tooltip: 'Cultivated indoors with controlled environment',
  },
  {
    key: 'hydroponic',
    label: 'Hydroponic',
    icon: '💧',
    tooltip: 'Grown using nutrient-rich water instead of soil',
  },
  {
    key: 'soil-grown',
    label: 'Soil Grown',
    icon: '🪴',
    tooltip: 'Grown traditionally in soil',
  },
  {
    key: 'organic',
    label: 'Organic',
    icon: '🌱',
    tooltip: 'Produced without synthetic chemicals',
  },
  {
    key: 'salts',
    label: 'Salts Used',
    icon: '🧂',
    tooltip: 'Uses salt-based nutrients',
  },
  {
    key: 'living soil',
    label: 'Living Soil',
    icon: '🪱',
    tooltip: 'Cultivated in living soil with active microbes',
  },
];

export const HASH_ATTRIBUTES: AttributeOption[] = [
  {
    key: 'living soil',
    label: 'Living Soil',
    icon: '🪱',
    tooltip: 'Cultivated in living soil with active microbes',
  },
  {
    key: 'single source',
    label: 'Single Source',
    icon: '🎯',
    tooltip: "Made from the producer's own plants",
  },
  {
    key: 'stainless bags',
    label: 'Stainless Bags',
    icon: '🔩',
    tooltip: 'Uses stainless steel mesh bags for washing',
  },
  {
    key: 'nylon bags',
    label: 'Nylon Bags',
    icon: '👜',
    tooltip: 'Uses nylon mesh bags for washing',
  },
  {
    key: 'cold cure',
    label: 'Cold Cure',
    icon: '❄️',
    tooltip: 'Hash cured at cold temperatures',
  },
  {
    key: 'fresh press',
    label: 'Fresh Press',
    icon: '🆕',
    tooltip: 'Hash jarred immediately after pressing',
  },
  {
    key: '90u',
    label: '90u',
    icon: '9️⃣0️⃣',
    tooltip: 'Filtered through a 90 micron screen',
  },
  {
    key: 'full spec',
    label: 'Full Spec',
    icon: '📊',
    tooltip: 'Contains a full spectrum of resin sizes',
  },
];

export const ATTRIBUTE_OPTIONS: Record<'FLOWER' | 'HASH', AttributeOption[]> = {
  FLOWER: FLOWER_ATTRIBUTES,
  HASH: HASH_ATTRIBUTES,
};
