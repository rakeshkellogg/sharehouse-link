// Helper functions for India-specific formatting and validation

// Indian number formatting with proper grouping
export const formatINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN').format(amount);
};

// Format price with Indian currency symbol and grouping
export const formatIndianPrice = (priceRupees: number, showUnit?: string): string => {
  const formatted = `₹${formatINR(priceRupees)}`;
  if (showUnit && priceRupees >= 100000) {
    if (priceRupees >= 10000000) {
      return `${formatted} (₹${(priceRupees / 10000000).toFixed(2)} crore)`;
    } else if (priceRupees >= 100000) {
      return `${formatted} (₹${(priceRupees / 100000).toFixed(2)} lakh)`;
    }
  }
  return formatted;
};

// Price calculation functions
export const priceFactors = {
  rupees: 1,
  thousand: 1000,
  lakh: 100000,
  crore: 10000000
} as const;

export type PriceUnit = keyof typeof priceFactors;

export const calculatePriceRupees = (amount: number, unit: PriceUnit): number => {
  return Math.round(amount * priceFactors[unit]);
};

// Size calculation functions  
export const sizeScales = {
  units: 1,
  thousand: 1000,
  lakh: 100000,
  crore: 10000000
} as const;

export type SizeScale = keyof typeof sizeScales;

export const sizeUnits = [
  'sq_ft',
  'sq_yd', 
  'sq_m',
  'acre',
  'hectare',
  'cent',
  'guntha',
  'marla',
  'kanal',
  'bigha',
  'cottah'
] as const;

export type SizeUnit = typeof sizeUnits[number];

export const sizeUnitLabels: Record<SizeUnit, string> = {
  sq_ft: 'sq ft',
  sq_yd: 'sq yd (gaj)',
  sq_m: 'sq m',
  acre: 'acre',
  hectare: 'hectare',
  cent: 'cent',
  guntha: 'guntha',
  marla: 'marla',
  kanal: 'kanal',
  bigha: 'bigha',
  cottah: 'cottah'
};

export const calculateSizeValue = (amount: number, scale: SizeScale): number => {
  return amount * sizeScales[scale];
};

export const formatSizeDisplay = (value: number, unit: SizeUnit): string => {
  return `${formatINR(value)} ${sizeUnitLabels[unit]}`;
};

// Pincode validation
export const validatePincode = (pincode: string): boolean => {
  return /^[1-9][0-9]{5}$/.test(pincode);
};

// Pincode lookup interface
export interface PincodeData {
  pincode: string;
  city: string;
  state: string;
  lat?: number;
  lng?: number;
}

// Indian states list for dropdown
export const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

// Price unit labels for display
export const priceUnitLabels: Record<PriceUnit, string> = {
  rupees: 'rupees',
  thousand: 'thousand',
  lakh: 'lakh',
  crore: 'crore'
};

// Size scale labels for display
export const sizeScaleLabels: Record<SizeScale, string> = {
  units: 'units',
  thousand: 'thousand', 
  lakh: 'lakh',
  crore: 'crore'
};