import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

export function useShortlist() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['shortlist', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shortlist')
        .select('*, variants(*, cars(*))')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const shortlistedVariantIds = new Set(
    query.data?.map((item: any) => item.variant_id) ?? []
  );

  const addToShortlist = useMutation({
    mutationFn: async (variantId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('shortlist')
        .insert({ user_id: user.id, variant_id: variantId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shortlist', user?.id] });
    },
  });

  const removeFromShortlist = useMutation({
    mutationFn: async (variantId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('shortlist')
        .delete()
        .eq('user_id', user.id)
        .eq('variant_id', variantId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shortlist', user?.id] });
    },
  });

  const toggleShortlist = (variantId: string) => {
    if (shortlistedVariantIds.has(variantId)) {
      removeFromShortlist.mutate(variantId);
    } else {
      addToShortlist.mutate(variantId);
    }
  };

  return {
    shortlist: query.data ?? [],
    shortlistedVariantIds,
    isLoading: query.isLoading,
    toggleShortlist,
    isToggling: addToShortlist.isPending || removeFromShortlist.isPending,
  };
}
