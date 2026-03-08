import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

export function useAdminGuard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/auth', { replace: true });
      return;
    }

    supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' })
      .then(({ data, error }) => {
        if (error || !data) {
          navigate('/', { replace: true });
        } else {
          setIsAdmin(true);
        }
        setChecking(false);
      });
  }, [user, authLoading, navigate]);

  return { isAdmin, loading: authLoading || checking };
}
