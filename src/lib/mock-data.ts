// Types for the application
export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  body_type: string;
  fuel_type: string;
  image_url: string | null;
  description: string | null;
}

export interface Variant {
  id: string;
  car_id: string;
  name: string;
  ex_showroom_price: number;
  insurance_cost_yearly: number;
  engine_cc: number | null;
  transmission: string;
  mileage_kmpl: number | null;
  horsepower: number | null;
  torque_nm: number | null;
  safety_rating: number | null;
}

export interface Feature {
  id: string;
  name: string;
  category: string;
  description: string | null;
  plain_explanation: string | null;
  practicality_score: number;
  repair_risk: string;
  insurance_impact: string;
}

export interface VariantFeature {
  id: string;
  variant_id: string;
  feature_id: string;
  incremental_cost: number;
  usefulness_score: number;
  resale_impact: string;
  feature?: Feature;
}

export interface DepreciationModel {
  car_id: string;
  year_number: number;
  depreciation_pct: number;
  resale_value_pct: number;
}

export interface OnboardingData {
  budgetMin: number;
  budgetMax: number;
  ownershipYears: number;
  city: string;
  dailyUsageKm: number;
  highwayPct: number;
  drivingStyle: string;
  familySize: number;
  techPreference: string;
  futurePlans: string;
}

export const formatPrice = (price: number): string => {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
};

export const formatPriceShort = (price: number): string => {
  if (price >= 10000000) return `${(price / 10000000).toFixed(1)}Cr`;
  if (price >= 100000) return `${(price / 100000).toFixed(1)}L`;
  return `${(price / 1000).toFixed(0)}K`;
};

export const calculateTCO = (
  onRoadPrice: number,
  insuranceYearly: number,
  mileageKmpl: number,
  dailyKm: number,
  years: number,
  fuelPricePerLiter: number = 105
): number => {
  const fuelCostPerYear = (dailyKm * 365 * fuelPricePerLiter) / mileageKmpl;
  const maintenancePerYear = onRoadPrice * 0.02;
  const totalCost = onRoadPrice + (insuranceYearly * years) + (fuelCostPerYear * years) + (maintenancePerYear * years);
  return Math.round(totalCost);
};

export const calculateEMI = (principal: number, rate: number = 8.5, tenure: number = 60): number => {
  const monthlyRate = rate / 12 / 100;
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1);
  return Math.round(emi);
};

export const cities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad',
  'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow'
];
