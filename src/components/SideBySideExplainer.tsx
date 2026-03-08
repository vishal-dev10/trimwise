import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Brain, ArrowLeftRight, Sparkles, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import { useVariantFeatures } from '@/hooks/use-cars';
import { formatPrice, type OnboardingData } from '@/lib/mock-data';
import {
  calculateFeatureRegret,
  calculateOwnershipStress,
  calculateTrimScore,
  type FeatureRegretResult,
} from '@/lib/intelligence-engine';
import {
  generateReasoningBlocks,
  generateRecommendation,
  verdictConfig,
  blockVerdictStyles,
  type AIDecisionExplainerProps,
  type ReasoningBlock,
} from '@/components/AIDecisionExplainer';
import { useAINarrative } from '@/hooks/use-ai-narrative';

interface SideBySideExplainerProps {
  variantA: any;
  variantB: any;
  allVariants: any[];
  depreciation: any[] | undefined;
  profile: OnboardingData;
  carBrand: string;
  carModel: string;
  onClose: () => void;
}

// Sub-component that fetches features and computes intelligence for one variant
const VariantColumn = ({
  variant,
  allVariants,
  depreciation,
  profile,
  carBrand,
  carModel,
  side,
}: {
  variant: any;
  allVariants: any[];
  depreciation: any[] | undefined;
  profile: OnboardingData;
  carBrand: string;
  carModel: string;
  side: 'left' | 'right';
}) => {
  const { data: features } = useVariantFeatures(variant.id);

  const ownershipStress = useMemo(() => {
    if (!features) return null;
    return calculateOwnershipStress(features);
  }, [features]);

  const trimScore = useMemo(() => {
    if (!variant || !allVariants || !features || !depreciation || !ownershipStress) return null;
    return calculateTrimScore(variant, allVariants, features, depreciation, ownershipStress, profile);
  }, [variant, allVariants, features, depreciation, ownershipStress, profile]);

  const featureRegrets: FeatureRegretResult[] = useMemo(() => {
    if (!features) return [];
    return features
      .filter((vf: any) => vf.features)
      .map((vf: any) => calculateFeatureRegret(
        {
          id: vf.feature_id,
          name: vf.features.name,
          category: vf.features.category,
          practicality_score: vf.features.practicality_score,
          repair_risk: vf.features.repair_risk,
          insurance_impact: vf.features.insurance_impact,
        },
        {
          usefulness_score: vf.usefulness_score,
          resale_impact: vf.resale_impact,
          incremental_cost: vf.incremental_cost,
        },
        profile
      ));
  }, [features, profile]);

  const explainerProps: AIDecisionExplainerProps = {
    variant,
    carBrand,
    carModel,
    profile,
    trimScore,
    ownershipStress,
    featureRegrets,
    variantCount: allVariants.length,
    compact: true,
  };

  const reasoningBlocks = useMemo(() => generateReasoningBlocks(explainerProps), [explainerProps]);
  const recommendation = useMemo(() => generateRecommendation(explainerProps), [explainerProps]);
  const vc = verdictConfig[recommendation.verdict];
  const VerdictIcon = vc.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: side === 'left' ? -12 : 12 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex-1 min-w-0 space-y-3"
    >
      {/* Variant header */}
      <div className="bg-card rounded-xl p-4 card-shadow border border-border/50">
        <h4 className="font-bold text-foreground text-sm truncate">{variant.name}</h4>
        <p className="text-lg font-bold text-foreground">{formatPrice(variant.ex_showroom_price)}</p>
        <div className="flex gap-2 mt-2">
          <Badge variant="outline" className="text-[10px]">{variant.engine_cc}cc</Badge>
          <Badge variant="outline" className="text-[10px] capitalize">{variant.transmission}</Badge>
          <Badge variant="outline" className="text-[10px]">{variant.mileage_kmpl} kmpl</Badge>
        </div>
      </div>

      {/* Verdict */}
      <div className={`rounded-xl p-3 border ${vc.bg} ${vc.border}`}>
        <div className="flex items-center gap-2 mb-1">
          <VerdictIcon className={`w-4 h-4 ${vc.color}`} />
          <Badge className={`text-[10px] ${vc.bg} ${vc.color} ${vc.border}`}>{vc.label}</Badge>
        </div>
        <p className="text-xs text-foreground font-semibold leading-snug">{recommendation.headline}</p>
        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{recommendation.reasoning}</p>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-2 gap-2">
        {trimScore && (
          <div className="bg-primary/5 rounded-lg p-3 border border-primary/10 text-center">
            <p className="text-[10px] text-muted-foreground">Trim Score</p>
            <p className="text-xl font-display font-bold text-primary">{trimScore.score}</p>
          </div>
        )}
        {ownershipStress && (
          <div className={`rounded-lg p-3 border border-border/30 text-center ${
            ownershipStress.level === 'low' ? 'bg-chart-positive/5' :
            ownershipStress.level === 'moderate' ? 'bg-accent/5' : 'bg-destructive/5'
          }`}>
            <p className="text-[10px] text-muted-foreground">Stress</p>
            <p className={`text-xl font-display font-bold capitalize ${
              ownershipStress.level === 'low' ? 'text-chart-positive' :
              ownershipStress.level === 'moderate' ? 'text-accent' : 'text-destructive'
            }`}>{ownershipStress.score}</p>
          </div>
        )}
      </div>

      {/* Reasoning blocks */}
      <div className="space-y-2">
        {reasoningBlocks.map((block, i) => {
          const style = blockVerdictStyles[block.verdict];
          const Icon = block.icon;
          return (
            <div key={i} className="bg-secondary/30 rounded-lg p-3 border border-border/20">
              <div className="flex items-center gap-2 mb-1">
                <div className={`p-1 rounded ${style.bg}`}>
                  <Icon className={`w-3 h-3 ${style.color}`} />
                </div>
                <span className="text-xs font-semibold text-foreground">{block.title}</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{block.summary}</p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

// Extract computed data for AI comparison
const useVariantIntelligence = (variant: any, allVariants: any[], depreciation: any[] | undefined, profile: OnboardingData) => {
  const { data: features } = useVariantFeatures(variant.id);

  const ownershipStress = useMemo(() => {
    if (!features) return null;
    return calculateOwnershipStress(features);
  }, [features]);

  const trimScore = useMemo(() => {
    if (!variant || !allVariants || !features || !depreciation || !ownershipStress) return null;
    return calculateTrimScore(variant, allVariants, features, depreciation, ownershipStress, profile);
  }, [variant, allVariants, features, depreciation, ownershipStress, profile]);

  return { trimScore, ownershipStress };
};

const SideBySideExplainer = ({
  variantA,
  variantB,
  allVariants,
  depreciation,
  profile,
  carBrand,
  carModel,
  onClose,
}: SideBySideExplainerProps) => {
  const { narratives, loading, generate } = useAINarrative();
  const intA = useVariantIntelligence(variantA, allVariants, depreciation, profile);
  const intB = useVariantIntelligence(variantB, allVariants, depreciation, profile);

  const cacheKey = `tw_ai_compare_${variantA.id}_${variantB.id}`;
  const aiNarrative = narratives[cacheKey];
  const isGenerating = loading[cacheKey];

  const handleCompareAI = () => {
    generate('compare', {
      car: { brand: carBrand, model: carModel, fuel_type: '', body_type: '' },
      profile,
      variantA: {
        name: variantA.name,
        price: variantA.ex_showroom_price,
        trimScore: intA.trimScore?.score ?? 0,
        stressLevel: intA.ownershipStress?.level ?? 'unknown',
        mileage: variantA.mileage_kmpl,
      },
      variantB: {
        name: variantB.name,
        price: variantB.ex_showroom_price,
        trimScore: intB.trimScore?.score ?? 0,
        stressLevel: intB.ownershipStress?.level ?? 'unknown',
        mileage: variantB.mileage_kmpl,
      },
    }, cacheKey);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-background"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-foreground">Side-by-Side Decision Comparison</h3>
        </div>
        <button
          onClick={onClose}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary"
        >
          Exit Compare
        </button>
      </div>

      {/* AI Comparison Narrator — TrimWise Take */}
      <div className="bg-card rounded-xl p-4 card-shadow border border-border/50 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-foreground">TrimWise Take</span>
          </div>
          {!aiNarrative && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCompareAI}
              disabled={isGenerating || !intA.trimScore || !intB.trimScore}
              className="text-xs gap-1.5"
            >
              {isGenerating ? (
                <><Loader2 className="w-3 h-3 animate-spin" /> Comparing...</>
              ) : (
                <><Sparkles className="w-3 h-3" /> AI Compare</>
              )}
            </Button>
          )}
        </div>
        {aiNarrative ? (
          <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground [&>p]:my-1">
            <ReactMarkdown>{aiNarrative}</ReactMarkdown>
          </div>
        ) : !isGenerating ? (
          <p className="text-xs text-muted-foreground">
            Get an AI-powered verdict on which variant is better for your profile.
          </p>
        ) : (
          <div className="space-y-1.5 animate-pulse">
            <div className="h-3 bg-secondary rounded w-full" />
            <div className="h-3 bg-secondary rounded w-3/4" />
          </div>
        )}
      </div>

      {/* Profile context */}
      <div className="bg-secondary/20 rounded-lg p-3 border border-border/20 mb-4">
        <div className="flex flex-wrap gap-2 items-center">
          <Brain className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mr-2">Profile:</span>
          {[
            profile.city,
            `${profile.dailyUsageKm}km/day`,
            `${profile.highwayPct}% hwy`,
            `${profile.ownershipYears}yr`,
          ].map(tag => (
            <Badge key={tag} variant="outline" className="text-[10px] py-0">{tag}</Badge>
          ))}
        </div>
      </div>

      {/* Columns */}
      <ScrollArea className="w-full">
        <div className="flex gap-3">
          <VariantColumn
            variant={variantA}
            allVariants={allVariants}
            depreciation={depreciation}
            profile={profile}
            carBrand={carBrand}
            carModel={carModel}
            side="left"
          />
          <div className="flex flex-col items-center pt-16">
            <div className="w-px h-full bg-border/50" />
          </div>
          <VariantColumn
            variant={variantB}
            allVariants={allVariants}
            depreciation={depreciation}
            profile={profile}
            carBrand={carBrand}
            carModel={carModel}
            side="right"
          />
        </div>
      </ScrollArea>
    </motion.div>
  );
};

export default SideBySideExplainer;
