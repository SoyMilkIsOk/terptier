export interface AttributeOption {
  key: string;
  label: string;
  icon: string;
}

export const ATTRIBUTE_OPTIONS: AttributeOption[] = [
  { key: 'sun-grown', label: 'Sun Grown', icon: '☀️' },
  { key: 'indoor', label: 'Indoor', icon: '🏠' },
  { key: 'hydroponic', label: 'Hydroponic', icon: '💧' },
  { key: 'living soil', label: 'Living Soil', icon: '🌱' },
  { key: 'regular soil', label: 'Regular Soil', icon: '🪴' },
  { key: 'no pesticides', label: 'No Pesticides', icon: '🐞' },
  { key: 'uses pesticides', label: 'Uses Pesticides', icon: '🧪' },
];
