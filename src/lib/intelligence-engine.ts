/**
 * TrimWise Intelligence Engine
 * Pure computation layer for regret risk, ownership stress,
 * reliability-weighted trim scores, and emotional bias detection.
 */

import type { OnboardingData } from '@/lib/mock-data';

// ─── Types ─────────────────────────────────────────────────
export interface FeatureRegretResult {
  featureId: string;
  featureName: string;
  category: string;
  regretRiskPct: number;        // 0–100
  regretLevel: 'low' | 'medium' | 'high';
  reason: string;
}

export interface OwnershipStressResult {
  score: number;                // 0–100
  level: 'low' | 'moderate' | 'high';
  factors: StressFactor[];
}

export interface StressFactor {
  label: string;
  contribution: number;        // 0–100 weight
  description: string;
}

export interface TrimScoreResult {
  score: number;               // 0–100
  breakdown: TrimScoreBreakdown;
  explanation: string;         // template-driven sentence
}

export interface TrimScoreBreakdown {
  featureUtility: number;
  resaleStrength: number;
  ownershipCostDeviation: number;
  overpricedPenalty: number;
  stressFactor: number;
  reliabilityWeight: number;
}

export interface EmotionalBiasResult {
  emotionalPct: number;        // 0–100
  isEmotional: boolean;
  explanation: string;
}

// ─── City profiles (congestion, parking density, climate) ──
const CITY_PROFILES: Record<string, { congestion: number; parking: number; climate: string }> = {
  Mumbai:    { congestion: 0.9, parking: 0.85, climate: 'tropical-wet' },
  Delhi:     { congestion: 0.85, parking: 0.7, climate: 'extreme' },
  Bangalore: { congestion: 0.8, parking: 0.75, climate: 'moderate' },
  Chennai:   { congestion: 0.75, parking: 0.7, climate: 'tropical-hot' },
  Hyderabad: { congestion: 0.7, parking: 0.65, climate: 'warm' },
  Pune:      { congestion: 0.65, parking: 0.6, climate: 'moderate' },
  Kolkata:   { congestion: 0.8, parking: 0.8, climate: 'tropical-wet' },
  Ahmedabad: { congestion: 0.6, parking: 0.55, climate: 'hot-dry' },
  Jaipur:    { congestion: 0.55, parking: 0.5, climate: 'hot-dry' },
  Lucknow:   { congestion: 0.5, parking: 0.5, climate: 'extreme' },
};

// Feature categories that map to usage context multipliers
const FEATURE_USAGE_CONTEXT: Record<string, {
  cityMultiplier: number;
  highwayMultiplier: number;
  familyMultiplier: number;
  techMultiplier: number;
}> = {
  safety:       { cityMultiplier: 0.6, highwayMultiplier: 1.0, familyMultiplier: 1.0, techMultiplier: 0.3 },
  comfort:      { cityMultiplier: 0.8, highwayMultiplier: 0.6, familyMultiplier: 0.8, techMultiplier: 0.4 },
  technology:   { cityMultiplier: 0.5, highwayMultiplier: 0.5, familyMultiplier: 0.4, techMultiplier: 1.0 },
  convenience:  { cityMultiplier: 0.9, highwayMultiplier: 0.4, familyMultiplier: 0.7, techMultiplier: 0.5 },
  performance:  { cityMultiplier: 0.3, highwayMultiplier: 0.9, familyMultiplier: 0.3, techMultiplier: 0.6 },
  exterior:     { cityMultiplier: 0.4, highwayMultiplier: 0.3, familyMultiplier: 0.3, techMultiplier: 0.3 },
  interior:     { cityMultiplier: 0.7, highwayMultiplier: 0.7, familyMultiplier: 0.8, techMultiplier: 0.4 },
};

// ─── Repair risk → numeric mapping ────────────────────────
const REPAIR_RISK_SCORE: Record<string, number> = {
  low: 15,
  medium: 45,
  high: 80,
};

const INSURANCE_IMPACT_SCORE: Record<string, number> = {
  none: 0,
  low: 15,
  moderate: 40,
  high: 70,
};

// ─── 1. REGRET RISK SCORE ─────────────────────────────────
export function calculateFeatureRegret(
  feature: {
    id: string;
    name: string;
    category: string;
    practicality_score: number | null;
    repair_risk: string | null;
    insurance_impact: string | null;
  },
  variantFeature: {
    usefulness_score: number | null;
    resale_impact: string | null;
    incremental_cost: number | null;
  } | null,  // null means feature is MISSING from this variant
  profile: OnboardingData
): FeatureRegretResult {
  const cityProfile = CITY_PROFILES[profile.city] ?? { congestion: 0.5, parking: 0.5, climate: 'moderate' };
  const usageCtx = FEATURE_USAGE_CONTEXT[feature.category] ?? { cityMultiplier: 0.5, highwayMultiplier: 0.5, familyMultiplier: 0.5, techMultiplier: 0.5 };

  const cityPct = (100 - profile.highwayPct) / 100;
  const highwayPct = profile.highwayPct / 100;
  const techWeight = profile.techPreference === 'tech-savvy' ? 1.0 : profile.techPreference === 'moderate' ? 0.6 : 0.3;
  const familyWeight = Math.min(1, profile.familySize / 5);

  // Usage relevance: how much would you actually use this feature?
  const usageRelevance =
    usageCtx.cityMultiplier * cityPct * cityProfile.congestion +
    usageCtx.highwayMultiplier * highwayPct +
    usageCtx.familyMultiplier * familyWeight * 0.5 +
    usageCtx.techMultiplier * techWeight * 0.3;

  const normalizedRelevance = Math.min(1, usageRelevance);

  // Practicality from feature definition
  const practicality = (feature.practicality_score ?? 5) / 10;

  // Resale impact penalty for missing features
  const resaleBonus = variantFeature === null
    ? (feature.category === 'safety' ? 0.2 : 0.1)
    : 0;

  // If feature IS present, regret is low
  if (variantFeature !== null) {
    return {
      featureId: feature.id,
      featureName: feature.name,
      category: feature.category,
      regretRiskPct: Math.round(Math.max(0, 5 + Math.random() * 5)),
      regretLevel: 'low',
      reason: 'Feature is included in this variant.',
    };
  }

  // Feature is MISSING — calculate regret risk
  const rawRegret = (normalizedRelevance * 0.45 + practicality * 0.35 + resaleBonus * 0.20) * 100;
  const regretPct = Math.round(Math.min(95, Math.max(10, rawRegret)));

  const level: 'low' | 'medium' | 'high' = regretPct >= 65 ? 'high' : regretPct >= 35 ? 'medium' : 'low';

  const reasons: string[] = [];
  if (normalizedRelevance > 0.6) reasons.push(`High usage relevance for ${profile.city} driving`);
  if (practicality > 0.7) reasons.push('High practicality score');
  if (familyWeight > 0.6 && usageCtx.familyMultiplier > 0.6) reasons.push('Important for family use');
  if (resaleBonus > 0) reasons.push('Impacts resale value');

  return {
    featureId: feature.id,
    featureName: feature.name,
    category: feature.category,
    regretRiskPct: regretPct,
    regretLevel: level,
    reason: reasons.length > 0 ? reasons.join('. ') + '.' : 'Moderate relevance to your usage pattern.',
  };
}

// ─── 2. OWNERSHIP STRESS SCORE ────────────────────────────
export function calculateOwnershipStress(
  features: Array<{
    features?: {
      repair_risk: string | null;
      insurance_impact: string | null;
      category: string;
    } | null;
  }>,
): OwnershipStressResult {
  if (features.length === 0) {
    return { score: 15, level: 'low', factors: [] };
  }

  const factors: StressFactor[] = [];

  // 1. Repair risk aggregate
  const avgRepairRisk = features.reduce((sum, f) => {
    return sum + (REPAIR_RISK_SCORE[f.features?.repair_risk ?? 'low'] ?? 15);
  }, 0) / features.length;

  factors.push({
    label: 'Repair Complexity',
    contribution: Math.round(avgRepairRisk),
    description: avgRepairRisk > 50 ? 'Multiple high-risk components' : 'Manageable repair profile',
  });

  // 2. Electronics density
  const techFeatures = features.filter(f =>
    ['technology', 'convenience'].includes(f.features?.category ?? '')
  ).length;
  const electronicsDensity = Math.min(100, (techFeatures / Math.max(1, features.length)) * 150);

  factors.push({
    label: 'Electronics Density',
    contribution: Math.round(electronicsDensity),
    description: electronicsDensity > 60 ? 'High electronics content increases failure points' : 'Balanced electronics level',
  });

  // 3. Insurance impact
  const avgInsurance = features.reduce((sum, f) => {
    return sum + (INSURANCE_IMPACT_SCORE[f.features?.insurance_impact ?? 'none'] ?? 0);
  }, 0) / features.length;

  factors.push({
    label: 'Insurance Complexity',
    contribution: Math.round(avgInsurance),
    description: avgInsurance > 40 ? 'Premium features increase insurance costs' : 'Standard insurance profile',
  });

  // Weighted score
  const score = Math.round(
    avgRepairRisk * 0.40 +
    electronicsDensity * 0.35 +
    avgInsurance * 0.25
  );

  const clampedScore = Math.min(100, Math.max(0, score));
  const level: 'low' | 'moderate' | 'high' = clampedScore >= 60 ? 'high' : clampedScore >= 35 ? 'moderate' : 'low';

  return { score: clampedScore, level, factors };
}

// ─── 3. RELIABILITY WEIGHTED TRIM SCORE ───────────────────
export function calculateTrimScore(
  variant: {
    ex_showroom_price: number;
    mileage_kmpl: number | null;
    insurance_cost_yearly: number | null;
  },
  allVariants: Array<{ ex_showroom_price: number }>,
  variantFeatures: Array<{
    usefulness_score: number | null;
    incremental_cost: number | null;
    resale_impact: string | null;
    features?: {
      repair_risk: string | null;
      practicality_score: number | null;
      category: string;
    } | null;
  }>,
  depreciation: Array<{ year_number: number; resale_value_pct: number }>,
  ownershipStress: OwnershipStressResult,
  profile: OnboardingData,
): TrimScoreResult {
  const prices = allVariants.map(v => v.ex_showroom_price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;

  // 1. Feature Utility (weighted by user profile)
  const techWeight = profile.techPreference === 'tech-savvy' ? 1.2 : profile.techPreference === 'moderate' ? 1.0 : 0.7;
  const featureUtility = variantFeatures.length > 0
    ? variantFeatures.reduce((sum, f) => sum + ((f.usefulness_score ?? 5) * techWeight), 0) / variantFeatures.length / 12 * 100
    : 30;

  // 2. Resale strength
  const depAt = depreciation.find(d => d.year_number === profile.ownershipYears);
  const resaleStrength = depAt ? depAt.resale_value_pct : 50;

  // 3. Ownership cost deviation (how far from cheapest variant proportionally)
  const costDeviation = ((variant.ex_showroom_price - minPrice) / priceRange) * 100;

  // 4. Overpriced feature penalty (features with high cost but low utility)
  const overpricedPenalty = variantFeatures.reduce((sum, f) => {
    const cost = f.incremental_cost ?? 0;
    const utility = f.usefulness_score ?? 5;
    if (cost > 30000 && utility < 5) return sum + 10;
    if (cost > 50000 && utility < 6) return sum + 15;
    return sum;
  }, 0);

  // 5. Stress factor
  const stressFactor = ownershipStress.score;

  // 6. Reliability weight (inverse of stress)
  const reliabilityWeight = 100 - stressFactor;

  // Final composite
  const raw =
    featureUtility * 0.25 +
    resaleStrength * 0.20 -
    costDeviation * 0.15 -
    overpricedPenalty * 0.10 -
    stressFactor * 0.10 +
    reliabilityWeight * 0.20;

  const score = Math.round(Math.min(100, Math.max(0, raw)));

  const breakdown: TrimScoreBreakdown = {
    featureUtility: Math.round(featureUtility),
    resaleStrength: Math.round(resaleStrength),
    ownershipCostDeviation: Math.round(costDeviation),
    overpricedPenalty: Math.round(overpricedPenalty),
    stressFactor: Math.round(stressFactor),
    reliabilityWeight: Math.round(reliabilityWeight),
  };

  // Template-driven explanation
  const explanationParts: string[] = [];
  if (featureUtility > 60) explanationParts.push('strong feature relevance for your usage');
  if (resaleStrength > 60) explanationParts.push(`solid ${profile.ownershipYears}-year resale value`);
  if (costDeviation < 30) explanationParts.push('competitive pricing within the lineup');
  if (stressFactor < 30) explanationParts.push('low ownership complexity');
  if (overpricedPenalty > 20) explanationParts.push('some features are overpriced relative to utility');

  const explanation = explanationParts.length > 0
    ? `This variant scores well due to ${explanationParts.join(', ')}.`
    : 'Balanced option with moderate strengths across all dimensions.';

  return { score, breakdown, explanation };
}

// ─── 4. SMART VS EMOTIONAL DECISION INDICATOR ─────────────
export function calculateEmotionalBias(
  selectedVariant: {
    ex_showroom_price: number;
  },
  allVariants: Array<{ ex_showroom_price: number; id: string }>,
  selectedTrimScore: TrimScoreResult,
  bestTrimScore: number,
): EmotionalBiasResult {
  const prices = allVariants.map(v => v.ex_showroom_price).sort((a, b) => a - b);
  const selectedRank = prices.indexOf(selectedVariant.ex_showroom_price);
  const isTopTier = selectedRank >= prices.length * 0.7;

  if (!isTopTier) {
    return {
      emotionalPct: Math.max(0, 20 - selectedTrimScore.score * 0.2),
      isEmotional: false,
      explanation: 'Your choice aligns well with analytical value metrics.',
    };
  }

  // Top-tier variant selected — check if utility justifies the premium
  const utilityGap = bestTrimScore - selectedTrimScore.score;
  const priceRatio = selectedVariant.ex_showroom_price / prices[0];
  const rawEmotional = Math.min(90, utilityGap * 1.5 + (priceRatio - 1) * 30);
  const emotionalPct = Math.round(Math.max(10, rawEmotional));
  const isEmotional = emotionalPct > 45;

  let explanation: string;
  if (emotionalPct > 65) {
    explanation = `Premium spend with ${emotionalPct}% attributed to aspirational value. Consider if the feature uplift justifies the cost difference.`;
  } else if (emotionalPct > 45) {
    explanation = `A balanced choice leaning towards premium positioning. Some features may see limited practical usage in your pattern.`;
  } else {
    explanation = 'Your choice is well-supported by feature utility and value metrics.';
  }

  return { emotionalPct, isEmotional, explanation };
}

// ─── Utility: stress level color mapping ──────────────────
export function stressLevelColor(level: 'low' | 'moderate' | 'high'): string {
  switch (level) {
    case 'low': return 'text-chart-positive';
    case 'moderate': return 'text-accent';
    case 'high': return 'text-destructive';
  }
}

export function stressLevelBg(level: 'low' | 'moderate' | 'high'): string {
  switch (level) {
    case 'low': return 'bg-chart-positive/10';
    case 'moderate': return 'bg-accent/10';
    case 'high': return 'bg-destructive/10';
  }
}

export function regretLevelColor(level: 'low' | 'medium' | 'high'): string {
  switch (level) {
    case 'low': return 'text-chart-positive';
    case 'medium': return 'text-accent';
    case 'high': return 'text-destructive';
  }
}
