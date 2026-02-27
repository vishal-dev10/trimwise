import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, ArrowRight, AlertTriangle, Gem, Wrench, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { formatPrice } from '@/lib/mock-data';
import { calculateVariantDelta, type VariantDelta } from '@/lib/feature-analytics-engine';
import { useVariantFeatures } from '@/hooks/use-cars';

interface VariantDeltaAnalyzerProps {
  variants: Array<{
    id: string;
    name: string;
    ex_showroom_price: number;
  }>;
}

const VariantDeltaAnalyzer = ({ variants }: VariantDeltaAnalyzerProps) => {
  const sorted = useMemo(
    () => [...variants].sort((a, b) => a.ex_showroom_price - b.ex_showroom_price),
    [variants],
  );

  const [stepIdx, setStepIdx] = useState(0);
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  const fromVariant = sorted[stepIdx];
  const toVariant = sorted[Math.min(stepIdx + 1, sorted.length - 1)];

  const { data: fromFeatures } = useVariantFeatures(fromVariant?.id);
  const { data: toFeatures } = useVariantFeatures(toVariant?.id);

  const delta: VariantDelta | null = useMemo(() => {
    if (!fromVariant || !toVariant || fromVariant.id === toVariant.id) return null;
    if (!fromFeatures || !toFeatures) return null;
    return calculateVariantDelta(fromVariant, toVariant, fromFeatures, toFeatures as any);
  }, [fromVariant, toVariant, fromFeatures, toFeatures]);

  if (sorted.length < 2) return null;

  const maxSteps = sorted.length - 2;
  const displayedFeatures = delta?.featuresAdded ?? [];
  const visibleFeatures = showAllFeatures ? displayedFeatures : displayedFeatures.slice(0, 5);

  return (
    <div className="bg-card rounded-2xl p-5 card-shadow border border-border/50">
      <h3 className="font-bold text-foreground mb-1 flex items-center gap-2">
        <Layers className="w-4 h-4 text-primary" />
        Variant Delta Analyzer
      </h3>
      <p className="text-xs text-muted-foreground mb-5">
        Slide to see what changes between trim levels.
      </p>

      {/* Trim Slider */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground">Base</span>
          <span className="text-xs font-medium text-muted-foreground">Top</span>
        </div>
        <Slider
          value={[stepIdx]}
          onValueChange={([v]) => { setStepIdx(v); setShowAllFeatures(false); }}
          min={0}
          max={maxSteps}
          step={1}
          className="w-full"
        />
        <div className="flex items-center justify-center gap-2 mt-3">
          <Badge variant="outline" className="text-xs">{fromVariant?.name}</Badge>
          <ArrowRight className="w-3 h-3 text-muted-foreground" />
          <Badge variant="outline" className="text-xs">{toVariant?.name}</Badge>
        </div>
      </div>

      {delta && (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${fromVariant.id}-${toVariant.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Cost Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-secondary/50 rounded-xl p-3 text-center">
                <p className="text-[10px] text-muted-foreground">Price Jump</p>
                <p className="text-lg font-bold text-foreground">+{formatPrice(delta.incrementalCost)}</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-3 text-center">
                <p className="text-[10px] text-muted-foreground">Cost/Core Feature</p>
                <p className="text-lg font-bold text-foreground">{formatPrice(delta.costPerMeaningfulFeature)}</p>
              </div>
            </div>

            {/* Forced Bundle Tax */}
            <div className={`rounded-xl p-4 border ${
              delta.forcedBundleTaxPct > 40
                ? 'bg-destructive/5 border-destructive/20'
                : delta.forcedBundleTaxPct > 20
                ? 'bg-accent/5 border-accent/20'
                : 'bg-chart-positive/5 border-chart-positive/20'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className={`w-4 h-4 ${
                  delta.forcedBundleTaxPct > 40 ? 'text-destructive' :
                  delta.forcedBundleTaxPct > 20 ? 'text-accent' : 'text-chart-positive'
                }`} />
                <span className="text-sm font-bold text-foreground">Forced Bundle Tax</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-display font-bold text-foreground">
                  {formatPrice(delta.forcedBundleTax)}
                </span>
                <span className={`text-sm font-bold ${
                  delta.forcedBundleTaxPct > 40 ? 'text-destructive' :
                  delta.forcedBundleTaxPct > 20 ? 'text-accent' : 'text-chart-positive'
                }`}>
                  ({delta.forcedBundleTaxPct}%)
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Extra cost beyond the sum of high-utility features you'd actually want.
              </p>

              {/* Core vs Decorative breakdown bar */}
              {delta.incrementalCost > 0 && (
                <div className="mt-3">
                  <div className="flex items-center gap-1 mb-1">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-[10px] text-muted-foreground">Core {formatPrice(delta.coreFeaturesCost)}</span>
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/30 ml-2" />
                    <span className="text-[10px] text-muted-foreground">Decorative {formatPrice(delta.decorativeFeaturesCost)}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden flex">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${(delta.coreFeaturesCost / delta.incrementalCost) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                    <motion.div
                      className="h-full bg-muted-foreground/30"
                      initial={{ width: 0 }}
                      animate={{ width: `${(delta.decorativeFeaturesCost / delta.incrementalCost) * 100}%` }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Features Added */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                {displayedFeatures.length} features added in this step
              </p>
              <div className="space-y-2">
                {visibleFeatures.map((f, i) => (
                  <motion.div
                    key={f.featureId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/30"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {f.classification === 'core' ? (
                        <Wrench className="w-3 h-3 text-primary shrink-0" />
                      ) : (
                        <Gem className="w-3 h-3 text-muted-foreground shrink-0" />
                      )}
                      <span className="text-sm text-foreground truncate">{f.featureName}</span>
                      <Badge variant="outline" className={`text-[9px] shrink-0 ${
                        f.classification === 'core'
                          ? 'border-primary/30 text-primary'
                          : 'border-muted-foreground/30 text-muted-foreground'
                      }`}>
                        {f.classification}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-xs text-muted-foreground">{f.usefulnessScore}/10</span>
                      <span className="text-xs font-medium text-foreground">+{formatPrice(f.incrementalCost)}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {displayedFeatures.length > 5 && (
                <button
                  onClick={() => setShowAllFeatures(!showAllFeatures)}
                  className="flex items-center gap-1 text-xs text-primary mt-2 mx-auto hover:underline"
                >
                  {showAllFeatures ? (
                    <><ChevronUp className="w-3 h-3" /> Show less</>
                  ) : (
                    <><ChevronDown className="w-3 h-3" /> Show all {displayedFeatures.length} features</>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {!delta && (
        <div className="text-center py-6 text-muted-foreground text-sm">
          Loading delta analysis…
        </div>
      )}
    </div>
  );
};

export default VariantDeltaAnalyzer;
