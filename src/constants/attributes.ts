export interface AttributeOption {
  key: string;
  label: string;
  icon: string;
}

export const ATTRIBUTE_OPTIONS: AttributeOption[] = [
  { key: 'outdoor', label: 'Sun Grown', icon: '☀️' },
  { key: 'indoor', label: 'Indoor', icon: '🏠' },
  { key: 'hydroponic', label: 'Hydroponic', icon: '💧' },
  { key: 'living soil', label: 'Living Soil', icon: '🪱' },
  { key: 'soil-grown', label: 'Regular Soil', icon: '🪴' },
  { key: 'no pesticides', label: 'No Pesticides', icon: '🐞' },
];
