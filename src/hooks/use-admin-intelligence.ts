import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SegmentStress {
  segment: string;
  avgStress: number;
  variantCount: number;
  level: 'low' | 'moderate' | 'high';
}

interface OverpricedVariant {
  variantName: string;
  carName: string;
  segment: string;
  price: number;
  avgSegmentPrice: number;
  overpricePct: number;
  featureCount: number;
}

interface FeatureRegretEntry {
  featureName: string;
  category: string;
  missingCount: number;
  totalVariants: number;
  missingPct: number;
}

const REPAIR_RISK_SCORE: Record<string, number> = { low: 15, medium: 45, high: 80 };
const INSURANCE_IMPACT_SCORE: Record<string, number> = { none: 0, low: 15, moderate: 40, high: 70 };

export const useAdminIntelligence = () => {
  return useQuery({
    queryKey: ['admin-intelligence'],
    queryFn: async () => {
      const [carsRes, variantsRes, featuresRes, vfRes] = await Promise.all([
        supabase.from('cars').select('id, brand, model, segment'),
        supabase.from('variants').select('id, car_id, name, ex_showroom_price'),
        supabase.from('features').select('id, name, category, repair_risk, insurance_impact'),
        supabase.from('variant_features').select('variant_id, feature_id, usefulness_score, incremental_cost'),
      ]);

      const cars = carsRes.data ?? [];
      const variants = variantsRes.data ?? [];
      const features = featuresRes.data ?? [];
      const vf = vfRes.data ?? [];

      const carMap = new Map(cars.map(c => [c.id, c]));

      // --- 1. Segment Stress ---
      const segmentVariants: Record<string, typeof variants> = {};
      variants.forEach(v => {
        const car = carMap.get(v.car_id);
        const seg = (car as any)?.segment || 'unknown';
        if (!segmentVariants[seg]) segmentVariants[seg] = [];
        segmentVariants[seg].push(v);
      });

      const vfByVariant = new Map<string, typeof vf>();
      vf.forEach(f => {
        if (!vfByVariant.has(f.variant_id)) vfByVariant.set(f.variant_id, []);
        vfByVariant.get(f.variant_id)!.push(f);
      });

      const featureMap = new Map(features.map(f => [f.id, f]));

      const segmentStress: SegmentStress[] = Object.entries(segmentVariants).map(([segment, svs]) => {
        const stressScores = svs.map(v => {
          const vFeatures = vfByVariant.get(v.id) ?? [];
          const featureDetails = vFeatures.map(vf2 => featureMap.get(vf2.feature_id)).filter(Boolean);

          const avgRepair = featureDetails.length > 0
            ? featureDetails.reduce((s, f) => s + (REPAIR_RISK_SCORE[f!.repair_risk ?? 'low'] ?? 15), 0) / featureDetails.length
            : 15;

          const techCount = featureDetails.filter(f => ['technology', 'convenience'].includes(f!.category)).length;
          const eDensity = Math.min(100, (techCount / Math.max(1, featureDetails.length)) * 150);

          const avgIns = featureDetails.length > 0
            ? featureDetails.reduce((s, f) => s + (INSURANCE_IMPACT_SCORE[f!.insurance_impact ?? 'none'] ?? 0), 0) / featureDetails.length
            : 0;

          return Math.round(avgRepair * 0.4 + eDensity * 0.35 + avgIns * 0.25);
        });

        const avgStress = stressScores.length > 0
          ? Math.round(stressScores.reduce((a, b) => a + b, 0) / stressScores.length)
          : 0;

        return {
          segment,
          avgStress: Math.min(100, avgStress),
          variantCount: svs.length,
          level: (avgStress >= 60 ? 'high' : avgStress >= 35 ? 'moderate' : 'low') as SegmentStress['level'],
        };
      }).sort((a, b) => b.avgStress - a.avgStress);

      // --- 2. Overpriced Variants ---
      const segmentAvgPrice: Record<string, number> = {};
      Object.entries(segmentVariants).forEach(([seg, svs]) => {
        segmentAvgPrice[seg] = svs.reduce((s, v) => s + v.ex_showroom_price, 0) / svs.length;
      });

      const overpriced: OverpricedVariant[] = variants
        .map(v => {
          const car = carMap.get(v.car_id);
          const seg = (car as any)?.segment || 'unknown';
          const avgPrice = segmentAvgPrice[seg] ?? v.ex_showroom_price;
          const overpricePct = ((v.ex_showroom_price - avgPrice) / avgPrice) * 100;
          const featureCount = (vfByVariant.get(v.id) ?? []).length;

          return {
            variantName: v.name,
            carName: car ? `${car.brand} ${car.model}` : 'Unknown',
            segment: seg,
            price: v.ex_showroom_price,
            avgSegmentPrice: Math.round(avgPrice),
            overpricePct: Math.round(overpricePct),
            featureCount,
          };
        })
        .filter(v => v.overpricePct > 10)
        .sort((a, b) => b.overpricePct - a.overpricePct)
        .slice(0, 10);

      // --- 3. Feature Regret Heatmap ---
      const totalVariants = variants.length;
      const featurePresence = new Map<string, number>();
      vf.forEach(f => {
        featurePresence.set(f.feature_id, (featurePresence.get(f.feature_id) ?? 0) + 1);
      });

      const featureRegret: FeatureRegretEntry[] = features
        .map(f => {
          const present = featurePresence.get(f.id) ?? 0;
          const missing = totalVariants - present;
          return {
            featureName: f.name,
            category: f.category,
            missingCount: missing,
            totalVariants,
            missingPct: totalVariants > 0 ? Math.round((missing / totalVariants) * 100) : 0,
          };
        })
        .filter(f => f.missingPct > 0)
        .sort((a, b) => b.missingPct - a.missingPct)
        .slice(0, 15);

      return { segmentStress, overpriced, featureRegret };
    },
  });
};
