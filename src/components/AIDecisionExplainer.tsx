import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Brain, Lightbulb, TrendingUp, AlertTriangle, CheckCircle2, Target, Zap, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import type { OnboardingData } from '@/lib/mock-data';
import type { TrimScoreResult, OwnershipStressResult, FeatureRegretResult } from '@/lib/intelligence-engine';

export interface AIDecisionExplainerProps {
  variant: {
    name: string;
    ex_showroom_price: number;
    mileage_kmpl: number | null;
  };
  carBrand: string;
  carModel: string;
  profile: OnboardingData;
  trimScore: TrimScoreResult | null;
  ownershipStress: OwnershipStressResult | null;
  featureRegrets: FeatureRegretResult[];
  variantCount: number;
  compact?: boolean;
}

export interface ReasoningBlock {
  icon: React.ElementType;
  title: string;
  verdict: 'positive' | 'caution' | 'warning';
  summary: string;
  detail: string;
}

export function generateReasoningBlocks(
  props: AIDecisionExplainerProps
): ReasoningBlock[] {
  const { variant, profile, trimScore, ownershipStress, featureRegrets } = props;
  const blocks: ReasoningBlock[] = [];

  // 1. Profile-fit reasoning
  const dailyKmLabel = profile.dailyUsageKm <= 20 ? 'light' : profile.dailyUsageKm <= 40 ? 'moderate' : 'heavy';
  const mileage = variant.mileage_kmpl ?? 15;
  const annualFuelCost = Math.round((profile.dailyUsageKm * 365 * 105) / mileage);
  const fuelVerdict = annualFuelCost < 80000 ? 'positive' : annualFuelCost < 140000 ? 'caution' : 'warning';

  blocks.push({
    icon: Target,
    title: 'Usage-Profile Fit',
    verdict: fuelVerdict,
    summary: `${dailyKmLabel} daily driver (${profile.dailyUsageKm} km/day) in ${profile.city} with ${profile.highwayPct}% highway driving.`,
    detail: `At ${mileage} kmpl, your estimated annual fuel spend is ₹${annualFuelCost.toLocaleString('en-IN')}. ${
      fuelVerdict === 'positive'
        ? 'This is well within efficient range for your usage pattern.'
        : fuelVerdict === 'caution'
        ? 'Moderate fuel expense — consider whether higher-mileage variants exist.'
        : 'High fuel costs for this usage level. A more fuel-efficient variant may save significantly over your ownership period.'
    }`,
  });

  // 2. Trim score reasoning
  if (trimScore) {
    const b = trimScore.breakdown;
    const scoreVerdict: 'positive' | 'caution' | 'warning' =
      trimScore.score >= 65 ? 'positive' : trimScore.score >= 40 ? 'caution' : 'warning';

    const strengths: string[] = [];
    const weaknesses: string[] = [];

    if (b.featureUtility > 60) strengths.push('strong feature relevance');
    if (b.resaleStrength > 60) strengths.push(`solid ${profile.ownershipYears}-year resale`);
    if (b.reliabilityWeight > 70) strengths.push('high reliability confidence');
    if (b.ownershipCostDeviation > 60) weaknesses.push('premium pricing within lineup');
    if (b.overpricedPenalty > 15) weaknesses.push('some features are overpriced vs. utility');
    if (b.stressFactor > 50) weaknesses.push('elevated ownership complexity');

    blocks.push({
      icon: Brain,
      title: 'Composite Trim Analysis',
      verdict: scoreVerdict,
      summary: `Trim Score: ${trimScore.score}/100. ${
        strengths.length > 0 ? `Strengths: ${strengths.join(', ')}.` : ''
      }`,
      detail: `${trimScore.explanation} ${
        weaknesses.length > 0
          ? `Areas of concern: ${weaknesses.join(', ')}.`
          : 'No significant weaknesses detected.'
      }`,
    });
  }

  // 3. Ownership stress reasoning
  if (ownershipStress) {
    const stressVerdict: 'positive' | 'caution' | 'warning' =
      ownershipStress.level === 'low' ? 'positive' : ownershipStress.level === 'moderate' ? 'caution' : 'warning';

    const topFactor = ownershipStress.factors.length > 0
      ? ownershipStress.factors.reduce((a, b) => a.contribution > b.contribution ? a : b)
      : null;

    blocks.push({
      icon: ShieldCheck,
      title: 'Ownership Complexity',
      verdict: stressVerdict,
      summary: `${ownershipStress.level.charAt(0).toUpperCase() + ownershipStress.level.slice(1)} stress (${ownershipStress.score}/100).${
        topFactor ? ` Primary driver: ${topFactor.label}.` : ''
      }`,
      detail: topFactor
        ? `${topFactor.description} ${
            stressVerdict === 'positive'
              ? 'Overall, this variant is straightforward to own and maintain.'
              : stressVerdict === 'caution'
              ? 'Budget for occasional specialized service needs.'
              : 'Expect higher-than-average maintenance costs and specialist service requirements.'
          }`
        : 'Insufficient data to assess ownership complexity factors.',
    });
  }

  // 4. Feature regret analysis
  const highRegrets = featureRegrets.filter(r => r.regretLevel === 'high');
  const mediumRegrets = featureRegrets.filter(r => r.regretLevel === 'medium');

  if (highRegrets.length > 0 || mediumRegrets.length > 0) {
    const regretVerdict: 'positive' | 'caution' | 'warning' =
      highRegrets.length >= 2 ? 'warning' : highRegrets.length === 1 || mediumRegrets.length >= 3 ? 'caution' : 'positive';

    blocks.push({
      icon: AlertTriangle,
      title: 'Feature Gap Risk',
      verdict: regretVerdict,
      summary: `${highRegrets.length} high-risk and ${mediumRegrets.length} medium-risk feature gaps detected.`,
      detail: highRegrets.length > 0
        ? `Missing high-impact features: ${highRegrets.map(r => r.featureName).join(', ')}. ${highRegrets[0].reason}`
        : `Minor gaps in: ${mediumRegrets.slice(0, 3).map(r => r.featureName).join(', ')}. These are situationally useful but not critical for your profile.`,
    });
  }

  return blocks;
}

export function generateRecommendation(props: AIDecisionExplainerProps): {
  verdict: 'strong-buy' | 'good-fit' | 'consider-alternatives' | 'caution';
  headline: string;
  reasoning: string;
} {
  const { trimScore, ownershipStress, featureRegrets, profile, variant } = props;
  const score = trimScore?.score ?? 50;
  const stress = ownershipStress?.score ?? 50;
  const highRegrets = featureRegrets.filter(r => r.regretLevel === 'high').length;

  // Composite decision
  const composite = score * 0.5 - stress * 0.25 - highRegrets * 8;

  if (composite >= 40) {
    return {
      verdict: 'strong-buy',
      headline: `${variant.name} is an excellent match for your profile`,
      reasoning: `Strong alignment with your ${profile.dailyUsageKm}km daily driving in ${profile.city}, backed by solid feature utility and manageable ownership costs over ${profile.ownershipYears} years.`,
    };
  } else if (composite >= 20) {
    return {
      verdict: 'good-fit',
      headline: `${variant.name} is a solid choice with minor tradeoffs`,
      reasoning: `Good overall fit for your needs. ${
        stress > 50 ? 'Be prepared for moderate maintenance complexity. ' : ''
      }${highRegrets > 0 ? `${highRegrets} missing feature(s) may matter over time. ` : ''}Consider if the price premium aligns with your budget expectations.`,
    };
  } else if (composite >= 0) {
    return {
      verdict: 'consider-alternatives',
      headline: `Worth comparing ${variant.name} against other variants`,
      reasoning: `While functional, there are ${highRegrets > 0 ? 'notable feature gaps' : 'cost-efficiency concerns'} for your usage profile. A mid-tier variant may deliver better value per rupee for your ${profile.ownershipYears}-year ownership plan.`,
    };
  } else {
    return {
      verdict: 'caution',
      headline: `${variant.name} may not be the best fit for your profile`,
      reasoning: `The combination of ${stress > 50 ? 'high ownership complexity' : 'moderate utility'} and ${
        highRegrets > 0 ? `${highRegrets} critical feature gaps` : 'premium pricing'
      } suggests better options exist within this lineup for your ${profile.city} driving pattern.`,
    };
  }
}

export const verdictConfig = {
  'strong-buy': { color: 'text-chart-positive', bg: 'bg-chart-positive/10', border: 'border-chart-positive/20', icon: CheckCircle2, label: 'Strong Match' },
  'good-fit': { color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', icon: TrendingUp, label: 'Good Fit' },
  'consider-alternatives': { color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/20', icon: Lightbulb, label: 'Consider Alternatives' },
  'caution': { color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20', icon: AlertTriangle, label: 'Proceed with Caution' },
};

export const blockVerdictStyles = {
  positive: { color: 'text-chart-positive', bg: 'bg-chart-positive/10', border: 'border-chart-positive/20' },
  caution: { color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/20' },
  warning: { color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20' },
};

const AIDecisionExplainer = (props: AIDecisionExplainerProps) => {
  const reasoningBlocks = useMemo(() => generateReasoningBlocks(props), [props]);
  const recommendation = useMemo(() => generateRecommendation(props), [props]);

  const vc = verdictConfig[recommendation.verdict];
  const VerdictIcon = vc.icon;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* ─── Top-level recommendation ─── */}
      <div className={`rounded-2xl p-5 border ${vc.bg} ${vc.border}`}>
        <div className="flex items-start gap-3 mb-3">
          <div className={`p-2 rounded-xl ${vc.bg}`}>
            <VerdictIcon className={`w-5 h-5 ${vc.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={`text-xs ${vc.bg} ${vc.color} ${vc.border}`}>{vc.label}</Badge>
            </div>
            <h3 className="font-bold text-foreground text-base leading-snug">{recommendation.headline}</h3>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed pl-12">
          {recommendation.reasoning}
        </p>
      </div>

      {/* ─── Reasoning blocks accordion ─── */}
      <div className="bg-card rounded-2xl p-5 card-shadow border border-border/50">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" />
          Decision Reasoning
        </h3>
        <Accordion type="multiple" className="space-y-2">
          {reasoningBlocks.map((block, i) => {
            const style = blockVerdictStyles[block.verdict];
            const Icon = block.icon;
            return (
              <AccordionItem key={i} value={`block-${i}`} className="border-none">
                <AccordionTrigger className="hover:no-underline py-3 px-3 rounded-xl bg-secondary/40 hover:bg-secondary/60 transition-colors">
                  <div className="flex items-center gap-3 text-left">
                    <div className={`p-1.5 rounded-lg ${style.bg}`}>
                      <Icon className={`w-3.5 h-3.5 ${style.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{block.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{block.summary}</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 pt-2">
                  <p className="text-sm text-muted-foreground leading-relaxed pl-10">
                    {block.detail}
                  </p>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>

      {/* ─── Profile context reminder ─── */}
      <div className="bg-secondary/30 rounded-xl p-4 border border-border/30">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Profile</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            `${props.profile.city}`,
            `${props.profile.dailyUsageKm} km/day`,
            `${props.profile.highwayPct}% highway`,
            `${props.profile.ownershipYears} yr plan`,
            `Family: ${props.profile.familySize}`,
            `Tech: ${props.profile.techPreference}`,
            `Style: ${props.profile.drivingStyle}`,
          ].map(tag => (
            <Badge key={tag} variant="outline" className="text-[10px] py-0.5">{tag}</Badge>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default AIDecisionExplainer;
