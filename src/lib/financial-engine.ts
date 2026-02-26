/**
 * TrimWise Financial Intelligence Engine
 * Financial Stretch, Depreciation Shock, and Upgrade Path calculations.
 * All financial data stored in localStorage only (session-based, no DB persistence).
 */

// ─── Types ─────────────────────────────────────────────────
export interface FinancialProfile {
  monthlyIncome: number;
  savingsPct: number;
  currentEMIs: number;
}

export interface FinancialStretchResult {
  carEMI: number;
  emiAsIncomePct: number;
  totalEMIPct: number;        // including existing EMIs
  level: 'safe' | 'moderate' | 'high';
  disposableAfterEMI: number;
  recommendation: string;
}

export interface DepreciationShockResult {
  year1DropPct: number;
  year1DropValue: number;
  onRoadPrice: number;
  yearlyData: Array<{
    year: number;
    value: number;
    dropFromPrevious: number;
    dropPct: number;
  }>;
}

export interface UpgradePathResult {
  optionA: UpgradeOption; // Buy top now
  optionB: UpgradeOption; // Buy mid, upgrade later
  netDifference: number;
  recommendation: string;
  chartData: Array<{
    year: string;
    'Buy Top Now': number;
    'Mid + Upgrade': number;
  }>;
}

export interface UpgradeOption {
  label: string;
  totalOwnershipCost: number;
  depreciationLoss: number;
  fuelCost: number;
  insuranceCost: number;
  maintenanceCost: number;
}

// ─── localStorage helpers ──────────────────────────────────
const FINANCIAL_KEY = 'trimwise_financial_profile';

export function saveFinancialProfile(profile: FinancialProfile): void {
  localStorage.setItem(FINANCIAL_KEY, JSON.stringify(profile));
}

export function loadFinancialProfile(): FinancialProfile | null {
  try {
    const raw = localStorage.getItem(FINANCIAL_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearFinancialProfile(): void {
  localStorage.removeItem(FINANCIAL_KEY);
}

// ─── 1. FINANCIAL STRETCH INDICATOR ───────────────────────
export function calculateFinancialStretch(
  onRoadPrice: number,
  financial: FinancialProfile,
  loanPct: number = 0.8,
  interestRate: number = 8.5,
  tenureMonths: number = 60,
): FinancialStretchResult {
  // Calculate car EMI
  const principal = onRoadPrice * loanPct;
  const monthlyRate = interestRate / 12 / 100;
  const carEMI = Math.round(
    (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1)
  );

  const emiAsIncomePct = (carEMI / financial.monthlyIncome) * 100;
  const totalEMIPct = ((carEMI + financial.currentEMIs) / financial.monthlyIncome) * 100;
  const disposableAfterEMI = financial.monthlyIncome - financial.currentEMIs - carEMI - (financial.monthlyIncome * financial.savingsPct / 100);

  const level: 'safe' | 'moderate' | 'high' =
    emiAsIncomePct <= 15 ? 'safe' :
    emiAsIncomePct <= 25 ? 'moderate' : 'high';

  const recommendations: Record<string, string> = {
    safe: 'This purchase fits comfortably within your financial profile. You maintain healthy savings and disposable income.',
    moderate: 'Manageable but consider your other financial goals. The EMI takes a significant portion of your income.',
    high: 'This may stretch your finances. Consider a longer tenure, higher down payment, or a more affordable variant.',
  };

  return {
    carEMI,
    emiAsIncomePct: Math.round(emiAsIncomePct * 10) / 10,
    totalEMIPct: Math.round(totalEMIPct * 10) / 10,
    level,
    disposableAfterEMI: Math.round(disposableAfterEMI),
    recommendation: recommendations[level],
  };
}

// ─── 2. DEPRECIATION SHOCK VISUALIZER ─────────────────────
export function calculateDepreciationShock(
  onRoadPrice: number,
  depreciation: Array<{ year_number: number; resale_value_pct: number }>,
): DepreciationShockResult {
  const sorted = [...depreciation].sort((a, b) => a.year_number - b.year_number);

  const yearlyData = sorted.map((d, i) => {
    const value = onRoadPrice * (d.resale_value_pct / 100);
    const prevValue = i === 0 ? onRoadPrice : onRoadPrice * (sorted[i - 1].resale_value_pct / 100);
    const dropFromPrevious = prevValue - value;
    const dropPct = (dropFromPrevious / prevValue) * 100;

    return {
      year: d.year_number,
      value: Math.round(value),
      dropFromPrevious: Math.round(dropFromPrevious),
      dropPct: Math.round(dropPct * 10) / 10,
    };
  });

  const year1 = yearlyData.find(d => d.year === 1);

  return {
    year1DropPct: year1?.dropPct ?? 15,
    year1DropValue: year1?.dropFromPrevious ?? Math.round(onRoadPrice * 0.15),
    onRoadPrice,
    yearlyData,
  };
}

// ─── 3. UPGRADE PATH SIMULATOR ────────────────────────────
export function calculateUpgradePath(
  topVariant: {
    ex_showroom_price: number;
    mileage_kmpl: number | null;
    insurance_cost_yearly: number | null;
  },
  midVariant: {
    ex_showroom_price: number;
    mileage_kmpl: number | null;
    insurance_cost_yearly: number | null;
  },
  depreciation: Array<{ year_number: number; resale_value_pct: number }>,
  dailyKm: number,
  totalYears: number = 8,
  upgradeAtYear: number = 4,
  fuelPrice: number = 105,
): UpgradePathResult {
  const topOnRoad = topVariant.ex_showroom_price * 1.15;
  const midOnRoad = midVariant.ex_showroom_price * 1.15;
  const topMileage = topVariant.mileage_kmpl ?? 15;
  const midMileage = midVariant.mileage_kmpl ?? 15;

  // Option A: Buy top now, keep for totalYears
  const topFuel = (dailyKm * 365 * fuelPrice * totalYears) / topMileage;
  const topInsurance = (topVariant.insurance_cost_yearly ?? 0) * totalYears;
  const topMaintenance = topOnRoad * 0.02 * totalYears;
  const topDepEnd = depreciation.find(d => d.year_number === totalYears);
  const topResale = topOnRoad * ((topDepEnd?.resale_value_pct ?? 30) / 100);
  const topDepLoss = topOnRoad - topResale;
  const topTotal = topOnRoad + topFuel + topInsurance + topMaintenance - topResale;

  // Option B: Buy mid now, sell at upgradeAtYear, buy new top
  const midFuelPhase1 = (dailyKm * 365 * fuelPrice * upgradeAtYear) / midMileage;
  const midInsPhase1 = (midVariant.insurance_cost_yearly ?? 0) * upgradeAtYear;
  const midMaintPhase1 = midOnRoad * 0.02 * upgradeAtYear;
  const midDepAt = depreciation.find(d => d.year_number === upgradeAtYear);
  const midResaleAt = midOnRoad * ((midDepAt?.resale_value_pct ?? 55) / 100);

  // Phase 2: buy new top (price adjusted ~5% per year inflation)
  const newTopPrice = topVariant.ex_showroom_price * Math.pow(1.05, upgradeAtYear);
  const newTopOnRoad = newTopPrice * 1.15;
  const remainingYears = totalYears - upgradeAtYear;
  const phase2Fuel = (dailyKm * 365 * fuelPrice * remainingYears) / topMileage;
  const phase2Ins = (topVariant.insurance_cost_yearly ?? 0) * remainingYears;
  const phase2Maint = newTopOnRoad * 0.02 * remainingYears;
  const phase2DepEnd = depreciation.find(d => d.year_number === remainingYears);
  const phase2Resale = newTopOnRoad * ((phase2DepEnd?.resale_value_pct ?? 55) / 100);

  const midTotal = midOnRoad + midFuelPhase1 + midInsPhase1 + midMaintPhase1 - midResaleAt +
                   newTopOnRoad + phase2Fuel + phase2Ins + phase2Maint - phase2Resale;
  const midDepLoss = (midOnRoad - midResaleAt) + (newTopOnRoad - phase2Resale);

  const optionA: UpgradeOption = {
    label: 'Buy Top Now',
    totalOwnershipCost: Math.round(topTotal),
    depreciationLoss: Math.round(topDepLoss),
    fuelCost: Math.round(topFuel),
    insuranceCost: Math.round(topInsurance),
    maintenanceCost: Math.round(topMaintenance),
  };

  const optionB: UpgradeOption = {
    label: `Mid → Upgrade at Yr ${upgradeAtYear}`,
    totalOwnershipCost: Math.round(midTotal),
    depreciationLoss: Math.round(midDepLoss),
    fuelCost: Math.round(midFuelPhase1 + phase2Fuel),
    insuranceCost: Math.round(midInsPhase1 + phase2Ins),
    maintenanceCost: Math.round(midMaintPhase1 + phase2Maint),
  };

  // Chart data: cumulative cost per year
  const chartData = Array.from({ length: totalYears }, (_, i) => {
    const yr = i + 1;
    const topCum = topOnRoad + (dailyKm * 365 * fuelPrice * yr) / topMileage +
                   (topVariant.insurance_cost_yearly ?? 0) * yr + topOnRoad * 0.02 * yr;

    let midCum: number;
    if (yr <= upgradeAtYear) {
      midCum = midOnRoad + (dailyKm * 365 * fuelPrice * yr) / midMileage +
               (midVariant.insurance_cost_yearly ?? 0) * yr + midOnRoad * 0.02 * yr;
    } else {
      const phaseYr = yr - upgradeAtYear;
      midCum = midOnRoad + midFuelPhase1 + midInsPhase1 + midMaintPhase1 - midResaleAt +
               newTopOnRoad + (dailyKm * 365 * fuelPrice * phaseYr) / topMileage +
               (topVariant.insurance_cost_yearly ?? 0) * phaseYr + newTopOnRoad * 0.02 * phaseYr;
    }

    return {
      year: `Yr ${yr}`,
      'Buy Top Now': Math.round(topCum),
      'Mid + Upgrade': Math.round(midCum),
    };
  });

  const diff = optionA.totalOwnershipCost - optionB.totalOwnershipCost;
  const recommendation = diff > 0
    ? `Upgrading from mid trim saves you ~${formatLakh(Math.abs(diff))} over ${totalYears} years.`
    : `Buying top now saves you ~${formatLakh(Math.abs(diff))} compared to upgrading later.`;

  return {
    optionA,
    optionB,
    netDifference: diff,
    recommendation,
    chartData,
  };
}

function formatLakh(v: number): string {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)} Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  return `₹${Math.round(v).toLocaleString('en-IN')}`;
}

// ─── Utility: stretch level styles ────────────────────────
export function stretchLevelColor(level: 'safe' | 'moderate' | 'high'): string {
  switch (level) {
    case 'safe': return 'text-chart-positive';
    case 'moderate': return 'text-accent';
    case 'high': return 'text-destructive';
  }
}

export function stretchLevelBg(level: 'safe' | 'moderate' | 'high'): string {
  switch (level) {
    case 'safe': return 'bg-chart-positive/10';
    case 'moderate': return 'bg-accent/10';
    case 'high': return 'bg-destructive/10';
  }
}
