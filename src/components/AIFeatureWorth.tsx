import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';
import { useAINarrative } from '@/hooks/use-ai-narrative';
import type { OnboardingData } from '@/lib/mock-data';

interface AIFeatureWorthProps {
  feature: {
    feature_id: string;
    usefulness_score: number | null;
    incremental_cost: number | null;
    resale_impact: string | null;
    features?: {
      name: string;
      category: string;
      practicality_score: number | null;
      repair_risk: string | null;
    } | null;
  };
  carBrand: string;
  carModel: string;
  profile: OnboardingData;
}

const AIFeatureWorth = ({ feature, carBrand, carModel, profile }: AIFeatureWorthProps) => {
  const { narratives, loading, generate } = useAINarrative();
  const cacheKey = `tw_ai_feature-worth_${feature.feature_id}_${profile.city}`;
  const aiNarrative = narratives[cacheKey];
  const isGenerating = loading[cacheKey];

  const handleGenerate = () => {
    generate('feature-worth', {
      car: { brand: carBrand, model: carModel, fuel_type: '', body_type: '' },
      profile,
      feature: {
        name: feature.features?.name ?? '',
        category: feature.features?.category ?? '',
        incrementalCost: feature.incremental_cost ?? 0,
        usefulnessScore: feature.usefulness_score ?? 0,
        repairRisk: feature.features?.repair_risk ?? 'unknown',
        resaleImpact: feature.resale_impact ?? 'neutral',
        practicality: feature.features?.practicality_score ?? null,
      },
    }, cacheKey);
  };

  if (aiNarrative) {
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        className="mt-2 pt-2 border-t border-border/30"
      >
        <div className="flex items-center gap-1.5 mb-1">
          <Sparkles className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">AI Verdict</span>
        </div>
        <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground text-xs [&>p]:my-0.5">
          <ReactMarkdown>{aiNarrative}</ReactMarkdown>
        </div>
      </motion.div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={(e) => { e.stopPropagation(); handleGenerate(); }}
      disabled={isGenerating}
      className="mt-2 text-[10px] h-6 gap-1 text-primary hover:text-primary"
    >
      {isGenerating ? (
        <><Loader2 className="w-2.5 h-2.5 animate-spin" /> Analyzing...</>
      ) : (
        <><Sparkles className="w-2.5 h-2.5" /> Is this worth it for me?</>
      )}
    </Button>
  );
};

export default AIFeatureWorth;
