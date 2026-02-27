/**
 * TrimWise Feature Analytics Engine
 * Computes feature usage projections, delta analysis,
 * forced bundle tax, and core vs decorative classification.
 */

import type { OnboardingData } from '@/lib/mock-data';

// ─── Types ─────────────────────────────────────────────────
export interface FeatureUsageProjection {
  featureId: string;
  featureName: string;
  category: string;
  yearlyUses: number;
  dailyUses: number;
  usageContext: string;        // e.g. "city driving", "highway", "parking"
  confidenceLevel: 'high' | 'medium' | 'low';
}

export interface VariantDelta {
  fromVariantName: string;
  toVariantName: string;
  featuresAdded: DeltaFeature[];
  incrementalCost: number;
  costPerMeaningfulFeature: number;
  forcedBundleTax: number;
  forcedBundleTaxPct: number;
  coreFeaturesCost: number;
  decorativeFeaturesCost: number;
}

export interface DeltaFeature {
  featureId: string;
  featureName: string;
  category: string;
  incrementalCost: number;
  usefulnessScore: number;
  classification: 'core' | 'decorative';
  resaleImpact: string;
}

// ─── Feature classification thresholds ─────────────────────
const CORE_USEFULNESS_THRESHOLD = 6;   // >=6 usefulness = core
const CORE_CATEGORIES = new Set(['safety', 'comfort', 'convenience']);

// ─── Usage frequency baselines per category ────────────────
// Base daily uses assuming average conditions
const CATEGORY_USAGE_BASELINES: Record<string, {
  baseDailyUses: number;
  cityMultiplier: number;
  highwayMultiplier: number;
  familySizeMultiplier: number;
  context: string;
}> = {
  safety: {
    baseDailyUses: 2.0,
    cityMultiplier: 1.2,
    highwayMultiplier: 1.5,
    familySizeMultiplier: 1.3,
    context: 'active safety engagement',
  },
  comfort: {
    baseDailyUses: 3.5,
    cityMultiplier: 1.4,
    highwayMultiplier: 0.8,
    familySizeMultiplier: 1.2,
    context: 'daily commute comfort',
  },
  technology: {
    baseDailyUses: 2.0,
    cityMultiplier: 1.0,
    highwayMultiplier: 1.2,
    familySizeMultiplier: 0.8,
    context: 'connected driving',
  },
  convenience: {
    baseDailyUses: 4.0,
    cityMultiplier: 1.6,
    highwayMultiplier: 0.5,
    familySizeMultiplier: 1.1,
    context: 'city driving & parking',
  },
  performance: {
    baseDailyUses: 1.5,
    cityMultiplier: 0.6,
    highwayMultiplier: 1.8,
    familySizeMultiplier: 0.7,
    context: 'highway & spirited driving',
  },
  exterior: {
    baseDailyUses: 0.5,
    cityMultiplier: 0.8,
    highwayMultiplier: 0.3,
    familySizeMultiplier: 0.5,
    context: 'aesthetic appeal',
  },
  interior: {
    baseDailyUses: 3.0,
    cityMultiplier: 1.2,
    highwayMultiplier: 1.0,
    familySizeMultiplier: 1.4,
    context: 'cabin experience',
  },
};

// City parking density affects convenience features
const CITY_PARKING_DENSITY: Record<string, number> = {
  Mumbai: 0.9, Delhi: 0.8, Bangalore: 0.85, Chennai: 0.75,
  Hyderabad: 0.7, Pune: 0.65, Kolkata: 0.8, Ahmedabad: 0.6,
  Jaipur: 0.55, Lucknow: 0.5,
};

// ─── 1. FEATURE USAGE PROJECTION ──────────────────────────
export function calculateFeatureUsage(
  feature: {
    id: string;
    name: string;
    category: string;
    practicality_score: number | null;
  },
  profile: OnboardingData,
): FeatureUsageProjection {
  const baseline = CATEGORY_USAGE_BASELINES[feature.category] ?? CATEGORY_USAGE_BASELINES.comfort;
  const parkingDensity = CITY_PARKING_DENSITY[profile.city] ?? 0.6;

  const cityPct = (100 - profile.highwayPct) / 100;
  const highwayPct = profile.highwayPct / 100;
  const familyFactor = Math.min(1.5, profile.familySize / 4);
  const practicality = (feature.practicality_score ?? 5) / 10;

  // Distance factor: more driving = more feature usage
  const distanceFactor = Math.min(2, profile.dailyUsageKm / 30);

  let dailyUses = baseline.baseDailyUses
    * (cityPct * baseline.cityMultiplier + highwayPct * baseline.highwayMultiplier)
    * (familyFactor * baseline.familySizeMultiplier)
    * practicality
    * distanceFactor;

  // Convenience features get parking density boost
  if (feature.category === 'convenience') {
    dailyUses *= (1 + parkingDensity * 0.3);
  }

  dailyUses = Math.round(dailyUses * 10) / 10;
  const yearlyUses = Math.round(dailyUses * 365);

  // Confidence: high if we have strong profile signals
  const confidenceLevel: 'high' | 'medium' | 'low' =
    profile.dailyUsageKm > 20 && practicality > 0.5 ? 'high' :
    practicality > 0.3 ? 'medium' : 'low';

  return {
    featureId: feature.id,
    featureName: feature.name,
    category: feature.category,
    yearlyUses,
    dailyUses,
    usageContext: baseline.context,
    confidenceLevel,
  };
}

// ─── 2. FEATURE CLASSIFICATION ────────────────────────────
export function classifyFeature(
  usefulnessScore: number,
  category: string,
): 'core' | 'decorative' {
  if (usefulnessScore >= CORE_USEFULNESS_THRESHOLD) return 'core';
  if (CORE_CATEGORIES.has(category) && usefulnessScore >= 4) return 'core';
  return 'decorative';
}

// ─── 3. VARIANT DELTA ANALYZER ────────────────────────────
export function calculateVariantDelta(
  fromVariant: { id: string; name: string; ex_showroom_price: number },
  toVariant: { id: string; name: string; ex_showroom_price: number },
  fromFeatures: Array<{ feature_id: string }>,
  toFeatures: Array<{
    feature_id: string;
    incremental_cost: number | null;
    usefulness_score: number | null;
    resale_impact: string | null;
    features?: {
      name: string;
      category: string;
    } | null;
  }>,
): VariantDelta {
  // Find features in toVariant not in fromVariant
  const fromFeatureIds = new Set(fromFeatures.map(f => f.feature_id));
  const addedFeatures = toFeatures.filter(f => !fromFeatureIds.has(f.feature_id));

  const deltaFeatures: DeltaFeature[] = addedFeatures.map(f => {
    const usefulness = f.usefulness_score ?? 5;
    const category = f.features?.category ?? 'comfort';
    return {
      featureId: f.feature_id,
      featureName: f.features?.name ?? 'Unknown Feature',
      category,
      incrementalCost: f.incremental_cost ?? 0,
      usefulnessScore: usefulness,
      classification: classifyFeature(usefulness, category),
      resaleImpact: f.resale_impact ?? 'neutral',
    };
  });

  const incrementalCost = toVariant.ex_showroom_price - fromVariant.ex_showroom_price;

  const coreFeatures = deltaFeatures.filter(f => f.classification === 'core');
  const decorativeFeatures = deltaFeatures.filter(f => f.classification === 'decorative');

  const coreFeaturesCost = coreFeatures.reduce((s, f) => s + f.incrementalCost, 0);
  const decorativeFeaturesCost = decorativeFeatures.reduce((s, f) => s + f.incrementalCost, 0);

  const totalFeatureCost = coreFeaturesCost + decorativeFeaturesCost;

  // Forced Bundle Tax = price jump - sum of all meaningful (core) feature costs
  const forcedBundleTax = Math.max(0, incrementalCost - coreFeaturesCost);
  const forcedBundleTaxPct = incrementalCost > 0
    ? Math.round((forcedBundleTax / incrementalCost) * 100)
    : 0;

  const meaningfulCount = coreFeatures.length || 1;
  const costPerMeaningfulFeature = Math.round(incrementalCost / meaningfulCount);

  return {
    fromVariantName: fromVariant.name,
    toVariantName: toVariant.name,
    featuresAdded: deltaFeatures,
    incrementalCost,
    costPerMeaningfulFeature,
    forcedBundleTax,
    forcedBundleTaxPct,
    coreFeaturesCost,
    decorativeFeaturesCost,
  };
}
