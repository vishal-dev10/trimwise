import { motion } from 'framer-motion';
import { ChevronLeft, Star, TrendingUp, Gauge, Zap, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCars, useCarVariants, useDepreciation } from '@/hooks/use-cars';
import { formatPrice, calculateTCO, calculateEMI } from '@/lib/mock-data';
import { Skeleton } from '@/components/ui/skeleton';

interface VariantComparisonProps {
  carId: string;
  onBack: () => void;
  onSelectVariant: (variantId: string) => void;
  dailyKm?: number;
  ownershipYears?: number;
}

const VariantComparison = ({ carId, onBack, onSelectVariant, dailyKm = 30, ownershipYears = 5 }: VariantComparisonProps) => {
  const { data: cars } = useCars();
  const { data: variants, isLoading } = useCarVariants(carId);
  const { data: depreciation } = useDepreciation(carId);

  const car = cars?.find(c => c.id === carId);
  const resaleAt = depreciation?.find(d => d.year_number === ownershipYears);

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-chart-positive';
    if (score >= 5) return 'text-accent';
    return 'text-destructive';
  };

  const computeFeatureScore = (variant: any) => {
    // Simple score based on price tier (will use real data later)
    const idx = variants?.findIndex(v => v.id === variant.id) ?? 0;
    return Math.min(10, 4 + idx * 2);
  };

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
            {variants?.map((variant, i) => {
              const onRoad = variant.ex_showroom_price * 1.15;
              const tco = calculateTCO(
                onRoad,
                variant.insurance_cost_yearly ?? 0,
                variant.mileage_kmpl ?? 15,
                dailyKm,
                ownershipYears
              );
              const emi = calculateEMI(onRoad * 0.8);
              const featureScore = computeFeatureScore(variant);
              const resalePct = resaleAt?.resale_value_pct ?? 50;
              const isRecommended = i === Math.min(2, (variants?.length ?? 1) - 1);

              return (
                <motion.div
                  key={variant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`bg-card rounded-2xl p-5 card-shadow border transition-all cursor-pointer hover:card-shadow-hover ${
                    isRecommended ? 'border-primary/50 ring-1 ring-primary/20' : 'border-border/50'
                  }`}
                  onClick={() => onSelectVariant(variant.id)}
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
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    <div className="bg-secondary/50 rounded-xl p-3 text-center">
                      <TrendingUp className="w-4 h-4 mx-auto mb-1 text-primary" />
                      <p className="text-xs text-muted-foreground">{ownershipYears}yr TCO</p>
                      <p className="text-sm font-bold text-foreground">{formatPrice(tco)}</p>
                    </div>
                    <div className="bg-secondary/50 rounded-xl p-3 text-center">
                      <Star className={`w-4 h-4 mx-auto mb-1 ${getScoreColor(featureScore)}`} />
                      <p className="text-xs text-muted-foreground">Features</p>
                      <p className="text-sm font-bold text-foreground">{featureScore}/10</p>
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
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default VariantComparison;
