import { useState, useCallback, useRef } from 'react';
import { toast } from '@/hooks/use-toast';

type AdvisorType = 'explain-score' | 'compare' | 'feature-worth' | 'negotiation' | 'ownership-story';

const AI_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/car-advisor`;

function hashKey(type: string, context: unknown): string {
  return `tw_ai_${type}_${JSON.stringify(context).slice(0, 200)}`;
}

export function useAINarrative() {
  const [narratives, setNarratives] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const abortRef = useRef<Record<string, AbortController>>({});

  const generate = useCallback(async (type: AdvisorType, context: Record<string, unknown>, cacheKey?: string) => {
    const key = cacheKey || hashKey(type, context);

    // Check localStorage cache
    const cached = localStorage.getItem(key);
    if (cached) {
      setNarratives(prev => ({ ...prev, [key]: cached }));
      return cached;
    }

    // Abort previous request for same key
    abortRef.current[key]?.abort();
    const controller = new AbortController();
    abortRef.current[key] = controller;

    setLoading(prev => ({ ...prev, [key]: true }));

    try {
      const resp = await fetch(AI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ type, context }),
        signal: controller.signal,
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: 'Request failed' }));
        toast({ title: 'AI Advisor', description: err.error || 'Something went wrong', variant: 'destructive' });
        return null;
      }

      const data = await resp.json();
      const content = data.content || '';

      // Cache in localStorage
      try { localStorage.setItem(key, content); } catch { /* quota exceeded */ }

      setNarratives(prev => ({ ...prev, [key]: content }));
      return content;
    } catch (e: unknown) {
      if (e instanceof Error && e.name === 'AbortError') return null;
      console.error('AI narrative error:', e);
      toast({ title: 'AI Advisor', description: 'Failed to generate insight. Please try again.', variant: 'destructive' });
      return null;
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
      delete abortRef.current[key];
    }
  }, []);

  const clearCache = useCallback((keyPrefix?: string) => {
    if (keyPrefix) {
      Object.keys(localStorage).filter(k => k.startsWith(keyPrefix)).forEach(k => localStorage.removeItem(k));
    } else {
      Object.keys(localStorage).filter(k => k.startsWith('tw_ai_')).forEach(k => localStorage.removeItem(k));
    }
  }, []);

  return { narratives, loading, generate, clearCache };
}
