import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [cars, variants, features, cityPricing, depreciation, versions] = await Promise.all([
        supabase.from('cars').select('id, brand, model, segment', { count: 'exact' }),
        supabase.from('variants').select('id, car_id, name', { count: 'exact' }),
        supabase.from('features').select('id, category', { count: 'exact' }),
        supabase.from('city_pricing').select('id, variant_id, city', { count: 'exact' }),
        supabase.from('depreciation_models').select('id, car_id', { count: 'exact' }),
        supabase.from('dataset_versions' as any).select('*').order('created_at', { ascending: false }).limit(10),
      ]);

      const totalCars = cars.count ?? 0;
      const totalVariants = variants.count ?? 0;
      const totalFeatures = features.count ?? 0;

      const uniqueCities = new Set((cityPricing.data ?? []).map(cp => cp.city));
      const citiesCovered = uniqueCities.size;

      const variantIds = new Set((variants.data ?? []).map(v => v.id));
      const variantsWithPricing = new Set((cityPricing.data ?? []).map(cp => cp.variant_id));
      const variantsWithDepreciation = new Set((depreciation.data ?? []).map(d => d.car_id));
      const carIds = new Set((cars.data ?? []).map(c => c.id));

      const missingPricing = [...variantIds].filter(id => !variantsWithPricing.has(id)).length;
      const missingDepreciation = [...carIds].filter(id => !variantsWithDepreciation.has(id)).length;

      // Data completeness
      const totalChecks = totalCars + totalVariants;
      const completedChecks = totalCars + totalVariants - missingPricing - missingDepreciation;
      const completeness = totalChecks > 0 ? Math.round((completedChecks / totalChecks) * 100) : 0;

      // Feature categories
      const featureCategories: Record<string, number> = {};
      (features.data ?? []).forEach(f => {
        featureCategories[f.category] = (featureCategories[f.category] || 0) + 1;
      });

      // Segments
      const segments: Record<string, number> = {};
      (cars.data ?? []).forEach(c => {
        const seg = (c as any).segment || 'unknown';
        segments[seg] = (segments[seg] || 0) + 1;
      });

      return {
        totalCars,
        totalVariants,
        totalFeatures,
        citiesCovered,
        missingPricing,
        missingDepreciation,
        completeness: Math.min(completeness, 100),
        lastUpload: (versions.data as any)?.[0]?.created_at ?? null,
        currentVersion: (versions.data as any)?.[0]?.version_number ?? 0,
        featureCategories,
        segments,
        recentVersions: versions.data ?? [],
      };
    },
  });
};

export const useAuditLog = () => {
  return useQuery({
    queryKey: ['audit-log'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_audit_log' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as any[];
    },
  });
};
