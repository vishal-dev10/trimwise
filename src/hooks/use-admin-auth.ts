import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

type AdminAuthErrorCode =
  | 'invalid_credentials'
  | 'network_error'
  | 'service_unreachable'
  | 'insufficient_privileges'
  | 'unknown_error';

type AdminAuthError = {
  code: AdminAuthErrorCode;
  message: string;
};

const isNetworkLikeError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return /failed to fetch|networkerror|load failed|fetch|timeout|aborted/i.test(message);
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const AUTH_REQUEST_TIMEOUT_MS = 12000;
const SIGN_IN_MAX_RETRIES = 2;

const withTimeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      const timeoutError = new Error('Auth request timeout');
      timeoutError.name = 'TimeoutError';
      reject(timeoutError);
    }, timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timeoutId);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });

export const useAdminAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdminRole = async (userId: string) => {
    const { data, error } = await supabase.rpc('has_role', {
      _user_id: userId,
      _role: 'admin',
    });

    if (error) {
      throw error;
    }

    return !!data;
  };

  const checkAdminRoleWithRetry = async (userId: string, maxRetries = 2) => {
    let lastError: unknown = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const adminStatus = await checkAdminRole(userId);
        return { isAdmin: adminStatus, error: null as unknown };
      } catch (error) {
        lastError = error;

        if (attempt < maxRetries && isNetworkLikeError(error)) {
          await delay(250 * (attempt + 1));
          continue;
        }

        break;
      }
    }

    return { isAdmin: false, error: lastError };
  };

  useEffect(() => {
    let isMounted = true;

    const syncFromSession = async (session: Session | null) => {
      if (!isMounted) return;

      setUser(session?.user ?? null);

      if (!session?.user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setLoading(true);
      const { isAdmin: adminStatus } = await checkAdminRoleWithRetry(session.user.id);

      if (!isMounted) return;

      setIsAdmin(adminStatus);
      setLoading(false);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncFromSession(session);
    });

    void supabase.auth.getSession().then(({ data: { session } }) => {
      void syncFromSession(session);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: AdminAuthError | null }> => {
    const normalizedEmail = email.trim().toLowerCase();
    const networkFailureMessage =
      typeof navigator !== 'undefined' && navigator.onLine === false
        ? 'You appear to be offline. Please reconnect and retry.'
        : 'Unable to reach authentication service from this browser. Disable VPN/ad blocker/firewall and retry.';

    let authResponse: Awaited<ReturnType<typeof supabase.auth.signInWithPassword>> | null = null;
    let lastThrownError: unknown = null;

    for (let attempt = 0; attempt <= SIGN_IN_MAX_RETRIES; attempt++) {
      try {
        const response = await withTimeout(
          supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password,
          }),
          AUTH_REQUEST_TIMEOUT_MS,
        );

        authResponse = response;

        if (!response.error) {
          break;
        }

        if (attempt < SIGN_IN_MAX_RETRIES && isNetworkLikeError(response.error)) {
          await delay(300 * (attempt + 1));
          continue;
        }

        break;
      } catch (error) {
        lastThrownError = error;

        if (attempt < SIGN_IN_MAX_RETRIES && isNetworkLikeError(error)) {
          await delay(300 * (attempt + 1));
          continue;
        }

        break;
      }
    }

    if (!authResponse) {
      if (isNetworkLikeError(lastThrownError)) {
        return {
          error: {
            code: 'service_unreachable',
            message: networkFailureMessage,
          },
        };
      }

      return {
        error: {
          code: 'unknown_error',
          message: 'Unexpected sign-in error. Please retry.',
        },
      };
    }

    const { data, error } = authResponse;

    if (error) {
      const message = error.message?.toLowerCase?.() ?? '';

      if (isNetworkLikeError(error)) {
        return {
          error: {
            code: 'service_unreachable',
            message: networkFailureMessage,
          },
        };
      }

      if (message.includes('invalid login credentials')) {
        return {
          error: {
            code: 'invalid_credentials',
            message: 'Invalid email or password.',
          },
        };
      }

      if (message.includes('email not confirmed')) {
        return {
          error: {
            code: 'invalid_credentials',
            message: 'Email is not confirmed for this account.',
          },
        };
      }

      return {
        error: {
          code: 'unknown_error',
          message: error.message || 'Unable to sign in.',
        },
      };
    }

    if (!data.user) {
      return {
        error: {
          code: 'unknown_error',
          message: 'Sign-in succeeded but user session is missing. Please retry.',
        },
      };
    }

    const { isAdmin: adminStatus, error: roleError } = await checkAdminRoleWithRetry(data.user.id);

    if (roleError) {
      return {
        error: {
          code: 'network_error',
          message: 'Signed in, but admin role verification failed due to network. Please retry.',
        },
      };
    }

    if (!adminStatus) {
      await supabase.auth.signOut();
      return {
        error: {
          code: 'insufficient_privileges',
          message: 'This account does not have admin access.',
        },
      };
    }

    setUser(data.user);
    setIsAdmin(true);
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
  };

  return { user, isAdmin, loading, signIn, signOut };
};
