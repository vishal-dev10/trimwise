import { motion } from 'framer-motion';
import { CheckCircle2, TrendingUp, Lightbulb, AlertTriangle, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  generateRecommendation,
  generateReasoningBlocks,
  verdictConfig,
  type AIDecisionExplainerProps,
} from '@/components/AIDecisionExplainer';

interface VerdictHeroProps extends AIDecisionExplainerProps {
  onAskAdvisor?: () => void;
  isPersonalized: boolean;
  onPersonalize?: () => void;
}

const VerdictHero = (props: VerdictHeroProps) => {
  const recommendation = generateRecommendation(props);
  const blocks = generateReasoningBlocks(props);
  const vc = verdictConfig[recommendation.verdict];
  const VerdictIcon = vc.icon;

  // Pull a 1-line "skip the next" / "buy this" style sub-headline from blocks
  const topReason = blocks[0]?.summary ?? '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl p-6 border-2 ${vc.bg} ${vc.border} relative overflow-hidden`}
    >
      {/* Decorative glow */}
      <div className={`absolute -top-12 -right-12 w-40 h-40 rounded-full ${vc.bg} blur-3xl opacity-60 pointer-events-none`} />

      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <div className={`p-2 rounded-xl ${vc.bg} border ${vc.border}`}>
            <VerdictIcon className={`w-5 h-5 ${vc.color}`} />
          </div>
          <Badge className={`text-xs ${vc.bg} ${vc.color} ${vc.border}`}>
            {vc.label}
          </Badge>
          {!props.isPersonalized && (
            <Badge variant="outline" className="text-[10px] ml-auto">Generic — not personalized</Badge>
          )}
        </div>

        <h2 className="text-xl md:text-2xl font-display font-bold text-foreground leading-tight mb-2">
          {recommendation.headline}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {recommendation.reasoning}
        </p>

        {topReason && (
          <p className="text-xs text-muted-foreground/80 mb-4 italic">
            {topReason}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {!props.isPersonalized && props.onPersonalize && (
            <Button
              size="sm"
              onClick={props.onPersonalize}
              className="rounded-full gap-1.5 text-xs"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Personalize for me
            </Button>
          )}
          {props.onAskAdvisor && (
            <Button
              size="sm"
              variant="outline"
              onClick={props.onAskAdvisor}
              className="rounded-full gap-1.5 text-xs"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Ask the advisor
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default VerdictHero;
