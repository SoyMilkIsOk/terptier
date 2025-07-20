export interface AttributeOption {
  key: string;
  label: string;
  icon: string;
}

export const ATTRIBUTE_OPTIONS: AttributeOption[] = [
  { key: 'outdoor', label: 'Outdoor', icon: '☀️' },
  { key: 'indoor', label: 'Indoor', icon: '🏠' },
  { key: 'hydroponic', label: 'Hydroponic', icon: '💧' },
    { key: 'soil-grown', label: 'Soil Grown', icon: '🪴' },
  { key: 'organic', label: 'Organic', icon: '🌱' },
    { key: 'salts', label: 'Salts Used', icon: '🧂' },
  { key: 'living soil', label: 'Living Soil', icon: '🪱' },
];
