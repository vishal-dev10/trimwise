import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Star, TrendingUp, Gauge, Zap, Shield, Brain, HeartPulse, ArrowLeftRight, Check, Heart } from 'lucide-react';
import { useShortlist } from '@/hooks/use-shortlist';
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
import SideBySideExplainer from '@/components/SideBySideExplainer';
import ChatAdvisor from '@/components/ChatAdvisor';

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
  compareMode,
  isSelected,
  onToggleCompare,
  isShortlisted,
  onToggleShortlist,
}: {
  variant: any;
  allVariants: any[];
  depreciation: any[] | undefined;
  profile: OnboardingData;
  index: number;
  isRecommended: boolean;
  recommendedIdx: number;
  onSelect: () => void;
  compareMode: boolean;
  isSelected: boolean;
  onToggleCompare: () => void;
  isShortlisted: boolean;
  onToggleShortlist: () => void;
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

  const handleClick = () => {
    if (compareMode) {
      onToggleCompare();
    } else {
      onSelect();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`bg-card rounded-2xl p-5 card-shadow border transition-all cursor-pointer hover:card-shadow-hover relative ${
        isRecommended && !compareMode ? 'border-primary/50 ring-1 ring-primary/20' : 
        isSelected ? 'border-primary/50 ring-2 ring-primary/30' : 'border-border/50'
      }`}
      onClick={handleClick}
    >
      {/* Shortlist heart button */}
      {!compareMode && (
        <button
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-secondary/80 transition-colors"
          onClick={(e) => { e.stopPropagation(); onToggleShortlist(); }}
        >
          <Heart className={`w-5 h-5 transition-colors ${isShortlisted ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
        </button>
      )}

      {/* Compare selection indicator */}
      {compareMode && (
        <div className={`absolute top-3 right-3 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
          isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/30 bg-background'
        }`}>
          {isSelected && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
        </div>
      )}

      {isRecommended && !compareMode && (
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
  const { shortlistedVariantIds, toggleShortlist } = useShortlist();

  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const car = cars?.find(c => c.id === carId);
  const recommendedIdx = Math.min(2, (variants?.length ?? 1) - 1);

  const toggleCompareId = (id: string) => {
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 2) return [prev[1], id]; // replace oldest
      return [...prev, id];
    });
  };

  const compareVariants = useMemo(() => {
    if (compareIds.length !== 2 || !variants) return null;
    const a = variants.find(v => v.id === compareIds[0]);
    const b = variants.find(v => v.id === compareIds[1]);
    return a && b ? [a, b] as const : null;
  }, [compareIds, variants]);

  const showComparison = compareMode && compareVariants;

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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{car.brand}</p>
                <h1 className="text-2xl font-bold text-foreground">{car.model} — Compare Variants</h1>
              </div>
              {variants && variants.length >= 2 && (
                <button
                  onClick={() => {
                    setCompareMode(!compareMode);
                    if (compareMode) setCompareIds([]);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    compareMode
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary/80 text-foreground hover:bg-secondary'
                  }`}
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  {compareMode ? 'Comparing' : 'Compare'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Compare mode instructions */}
        <AnimatePresence>
          {compareMode && !showComparison && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4"
            >
              <div className="bg-primary/5 rounded-xl p-3 border border-primary/20 flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-primary shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Select <strong className="text-foreground">2 variants</strong> to compare their Decision Intelligence side by side.
                  {compareIds.length > 0 && <span className="text-primary ml-1">({compareIds.length}/2 selected)</span>}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Side-by-side view */}
        <AnimatePresence mode="wait">
          {showComparison && (
            <motion.div
              key="comparison"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-6"
            >
              <SideBySideExplainer
                variantA={compareVariants[0]}
                variantB={compareVariants[1]}
                allVariants={variants!}
                depreciation={depreciation}
                profile={profile}
                carBrand={car?.brand ?? ''}
                carModel={car?.model ?? ''}
                onClose={() => {
                  setCompareMode(false);
                  setCompareIds([]);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Variant cards */}
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
                compareMode={compareMode}
                isSelected={compareIds.includes(variant.id)}
                onToggleCompare={() => toggleCompareId(variant.id)}
                isShortlisted={shortlistedVariantIds.has(variant.id)}
                onToggleShortlist={() => toggleShortlist(variant.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* AI Chat Advisor */}
      <ChatAdvisor
        car={car ? { brand: car.brand, model: car.model, fuel_type: car.fuel_type, body_type: car.body_type } : undefined}
        profile={profile}
      />
    </div>
  );
};

export default VariantComparison;
