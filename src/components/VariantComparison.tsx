import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Star, TrendingUp, Gauge, Zap, Shield, Brain, HeartPulse } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCars, useCarVariants, useVariantFeatures, useDepreciation } from '@/hooks/use-cars';
import { formatPrice, calculateTCO, calculateEMI, type OnboardingData } from '@/lib/mock-data';
import { Skeleton } from '@/components/ui/skeleton';
import {
  calculateOwnershipStress,
  calculateTrimScore,
  calculateEmotionalBias,
  stressLevelColor,
  stressLevelBg,
} from '@/lib/intelligence-engine';

interface VariantComparisonProps {
  carId: string;
  onBack: () => void;
  onSelectVariant: (variantId: string) => void;
  profile: OnboardingData;
}

// Sub-component for a single variant card that fetches its own features
const VariantCard = ({
  variant,
  allVariants,
  depreciation,
  profile,
  index,
  isRecommended,
  recommendedIdx,
  onSelect,
}: {
  variant: any;
  allVariants: any[];
  depreciation: any[] | undefined;
  profile: OnboardingData;
  index: number;
  isRecommended: boolean;
  recommendedIdx: number;
  onSelect: () => void;
}) => {
  const { data: features } = useVariantFeatures(variant.id);
  const resaleAt = depreciation?.find(d => d.year_number === profile.ownershipYears);

  const ownershipStress = useMemo(() => {
    if (!features) return null;
    return calculateOwnershipStress(features);
  }, [features]);

  const trimScore = useMemo(() => {
    if (!features || !depreciation || !ownershipStress) return null;
    return calculateTrimScore(variant, allVariants, features, depreciation, ownershipStress, profile);
  }, [variant, allVariants, features, depreciation, ownershipStress, profile]);

  const onRoad = variant.ex_showroom_price * 1.15;
  const tco = calculateTCO(
    onRoad,
    variant.insurance_cost_yearly ?? 0,
    variant.mileage_kmpl ?? 15,
    profile.dailyUsageKm,
    profile.ownershipYears
  );
  const emi = calculateEMI(onRoad * 0.8);
  const resalePct = resaleAt?.resale_value_pct ?? 50;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`bg-card rounded-2xl p-5 card-shadow border transition-all cursor-pointer hover:card-shadow-hover ${
        isRecommended ? 'border-primary/50 ring-1 ring-primary/20' : 'border-border/50'
      }`}
      onClick={onSelect}
    >
      {isRecommended && (
        <Badge className="mb-3 bg-primary/10 text-primary border-primary/20 text-xs">
          <Star className="w-3 h-3 mr-1" /> Recommended
        </Badge>
      )}

      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-foreground">{variant.name}</h3>
          <p className="text-2xl font-bold text-foreground mt-1">{formatPrice(variant.ex_showroom_price)}</p>
          <p className="text-xs text-muted-foreground">ex-showroom · On-road ~{formatPrice(onRoad)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">EMI from</p>
          <p className="text-lg font-bold text-foreground">₹{emi.toLocaleString('en-IN')}</p>
          <p className="text-xs text-muted-foreground">/month</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="bg-secondary/50 rounded-xl p-3 text-center">
          <TrendingUp className="w-4 h-4 mx-auto mb-1 text-primary" />
          <p className="text-xs text-muted-foreground">{profile.ownershipYears}yr TCO</p>
          <p className="text-sm font-bold text-foreground">{formatPrice(tco)}</p>
        </div>
        <div className="bg-secondary/50 rounded-xl p-3 text-center">
          <Gauge className="w-4 h-4 mx-auto mb-1 text-accent" />
          <p className="text-xs text-muted-foreground">Mileage</p>
          <p className="text-sm font-bold text-foreground">{variant.mileage_kmpl ?? '—'}</p>
        </div>
        <div className="bg-secondary/50 rounded-xl p-3 text-center">
          <Shield className="w-4 h-4 mx-auto mb-1 text-chart-positive" />
          <p className="text-xs text-muted-foreground">Resale</p>
          <p className="text-sm font-bold text-foreground">{resalePct}%</p>
        </div>
      </div>

      {/* Intelligence scores */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {trimScore && (
          <div className="bg-primary/5 rounded-xl p-3 flex items-center gap-2 border border-primary/10">
            <Brain className="w-4 h-4 text-primary shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground">Trim Score</p>
              <p className="text-sm font-bold text-primary">{trimScore.score}/100</p>
            </div>
          </div>
        )}
        {ownershipStress && (
          <div className={`${stressLevelBg(ownershipStress.level)} rounded-xl p-3 flex items-center gap-2 border border-border/30`}>
            <HeartPulse className={`w-4 h-4 shrink-0 ${stressLevelColor(ownershipStress.level)}`} />
            <div>
              <p className="text-[10px] text-muted-foreground">Stress</p>
              <p className={`text-sm font-bold capitalize ${stressLevelColor(ownershipStress.level)}`}>{ownershipStress.level}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className="text-xs">{variant.engine_cc}cc</Badge>
        <Badge variant="outline" className="text-xs capitalize">{variant.transmission}</Badge>
        {variant.horsepower && <Badge variant="outline" className="text-xs">{variant.horsepower} bhp</Badge>}
        {variant.safety_rating && (
          <Badge variant="outline" className="text-xs gap-1">
            {'★'.repeat(variant.safety_rating)}
          </Badge>
        )}
      </div>
    </motion.div>
  );
};

const VariantComparison = ({ carId, onBack, onSelectVariant, profile }: VariantComparisonProps) => {
  const { data: cars } = useCars();
  const { data: variants, isLoading } = useCarVariants(carId);
  const { data: depreciation } = useDepreciation(carId);

  const car = cars?.find(c => c.id === carId);
  const recommendedIdx = Math.min(2, (variants?.length ?? 1) - 1);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button onClick={onBack} className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm mb-2">
            <ChevronLeft className="w-4 h-4" />
            All Cars
          </button>
          {car && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{car.brand}</p>
              <h1 className="text-2xl font-bold text-foreground">{car.model} — Compare Variants</h1>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <Skeleton key={i} className="h-52 rounded-2xl" />)}
          </div>
        ) : (
          <div className="space-y-4">
            {variants?.map((variant, i) => (
              <VariantCard
                key={variant.id}
                variant={variant}
                allVariants={variants}
                depreciation={depreciation}
                profile={profile}
                index={i}
                isRecommended={i === recommendedIdx}
                recommendedIdx={recommendedIdx}
                onSelect={() => onSelectVariant(variant.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VariantComparison;
