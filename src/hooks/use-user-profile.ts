import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import type { OnboardingData } from '@/lib/mock-data';

export function useUserProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const saveProfile = useMutation({
    mutationFn: async (profile: OnboardingData) => {
      if (!user?.id) throw new Error('Not authenticated');

      const row = {
        user_id: user.id,
        budget_min: profile.budgetMin,
        budget_max: profile.budgetMax,
        ownership_years: profile.ownershipYears,
        city: profile.city,
        daily_usage_km: profile.dailyUsageKm,
        highway_pct: profile.highwayPct,
        driving_style: profile.drivingStyle,
        family_size: profile.familySize,
        tech_preference: profile.techPreference,
        future_plans: profile.futurePlans,
      };

      const { data: existing } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('user_profiles')
          .update(row)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_profiles')
          .insert(row);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile', user?.id] });
    },
  });

  // Convert DB row to OnboardingData
  const toOnboardingData = (): OnboardingData | null => {
    const d = query.data;
    if (!d) return null;
    // Only consider it a complete profile if key fields are filled
    if (!d.budget_min || !d.budget_max || !d.city) return null;
    return {
      budgetMin: Number(d.budget_min),
      budgetMax: Number(d.budget_max),
      ownershipYears: d.ownership_years ?? 5,
      city: d.city ?? 'Mumbai',
      dailyUsageKm: Number(d.daily_usage_km ?? 30),
      highwayPct: d.highway_pct ?? 30,
      drivingStyle: (d.driving_style ?? 'balanced') as OnboardingData['drivingStyle'],
      familySize: d.family_size ?? 4,
      techPreference: (d.tech_preference ?? 'moderate') as OnboardingData['techPreference'],
      futurePlans: (d.future_plans ?? 'keep') as OnboardingData['futurePlans'],
    };
  };

  return {
    profile: toOnboardingData(),
    isLoading: query.isLoading,
    saveProfile: saveProfile.mutateAsync,
    isSaving: saveProfile.isPending,
  };
}
