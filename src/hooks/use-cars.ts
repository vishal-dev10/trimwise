import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCars = () => {
  return useQuery({
    queryKey: ['cars'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('is_active', true)
        .order('brand');
      if (error) throw error;
      return data;
    },
  });
};

export const useCarVariants = (carId: string | undefined) => {
  return useQuery({
    queryKey: ['variants', carId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('variants')
        .select('*')
        .eq('car_id', carId!)
        .order('ex_showroom_price');
      if (error) throw error;
      return data;
    },
    enabled: !!carId,
  });
};

export const useVariantFeatures = (variantId: string | undefined) => {
  return useQuery({
    queryKey: ['variant-features', variantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('variant_features')
        .select('*, features(*)')
        .eq('variant_id', variantId!);
      if (error) throw error;
      return data;
    },
    enabled: !!variantId,
  });
};

export const useDepreciation = (carId: string | undefined) => {
  return useQuery({
    queryKey: ['depreciation', carId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('depreciation_models')
        .select('*')
        .eq('car_id', carId!)
        .order('year_number');
      if (error) throw error;
      return data;
    },
    enabled: !!carId,
  });
};

export const useCityPricing = (variantId: string | undefined) => {
  return useQuery({
    queryKey: ['city-pricing', variantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('city_pricing')
        .select('*')
        .eq('variant_id', variantId!);
      if (error) throw error;
      return data;
    },
    enabled: !!variantId,
  });
};
