import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Activity, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { calculateFeatureUsage, type FeatureUsageProjection } from '@/lib/feature-analytics-engine';
import type { OnboardingData } from '@/lib/mock-data';

interface FeatureUsageSimulatorProps {
  features: Array<{
    feature_id: string;
    usefulness_score: number | null;
    incremental_cost: number | null;
    features?: {
      name: string;
      category: string;
      practicality_score: number | null;
    } | null;
  }>;
  profile: OnboardingData;
}

const confidenceColor: Record<string, string> = {
  high: 'bg-chart-positive/10 text-chart-positive border-chart-positive/20',
  medium: 'bg-accent/10 text-accent border-accent/20',
  low: 'bg-muted text-muted-foreground border-border',
};

const FeatureUsageSimulator = ({ features, profile }: FeatureUsageSimulatorProps) => {
  const projections = useMemo(() => {
    if (!features) return [];
    return features
      .filter(f => f.features)
      .map(f => calculateFeatureUsage(
        {
          id: f.feature_id,
          name: f.features!.name,
          category: f.features!.category,
          practicality_score: f.features!.practicality_score,
        },
        profile,
      ))
      .sort((a, b) => b.yearlyUses - a.yearlyUses);
  }, [features, profile]);

  if (projections.length === 0) return null;

  const maxYearly = Math.max(...projections.map(p => p.yearlyUses));

  return (
    <div className="bg-card rounded-2xl p-5 card-shadow border border-border/50">
      <h3 className="font-bold text-foreground mb-1 flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-primary" />
        Projected Feature Usage
      </h3>
      <p className="text-xs text-muted-foreground mb-5">
        Estimated yearly usage based on your {profile.dailyUsageKm}km/day driving in {profile.city}.
      </p>

      <div className="space-y-3">
        {projections.slice(0, 10).map((p, i) => (
          <motion.div
            key={p.featureId}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-sm font-medium text-foreground truncate">{p.featureName}</span>
                <Badge variant="outline" className="text-[10px] shrink-0 capitalize">{p.category}</Badge>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <span className="text-sm font-bold text-foreground">{p.yearlyUses.toLocaleString('en-IN')}</span>
                <span className="text-[10px] text-muted-foreground">/yr</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${(p.yearlyUses / maxYearly) * 100}%` }}
                  transition={{ duration: 0.5, delay: i * 0.04 }}
                />
              </div>
              <Badge className={`text-[9px] shrink-0 ${confidenceColor[p.confidenceLevel]}`}>
                {p.confidenceLevel}
              </Badge>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              ~{p.dailyUses} uses/day · {p.usageContext}
            </p>
          </motion.div>
        ))}
      </div>

      {projections.length > 10 && (
        <p className="text-xs text-muted-foreground mt-4 text-center">
          + {projections.length - 10} more features
        </p>
      )}
    </div>
  );
};

export default FeatureUsageSimulator;
