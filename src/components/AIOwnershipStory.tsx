import { Sparkles, Loader2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import { useAINarrative } from '@/hooks/use-ai-narrative';
import { calculateEMI, type OnboardingData } from '@/lib/mock-data';

interface AIOwnershipStoryProps {
  variant: {
    name: string;
    ex_showroom_price: number;
    mileage_kmpl: number | null;
    insurance_cost_yearly: number | null;
  };
  carBrand: string;
  carModel: string;
  profile: OnboardingData;
  depreciation: Array<{ year_number: number; resale_value_pct: number }>;
}

const AIOwnershipStory = ({ variant, carBrand, carModel, profile, depreciation }: AIOwnershipStoryProps) => {
  const { narratives, loading, generate } = useAINarrative();
  const cacheKey = `tw_ai_ownership-story_${variant.name}_${profile.city}`;
  const aiNarrative = narratives[cacheKey];
  const isGenerating = loading[cacheKey];

  const onRoad = variant.ex_showroom_price * 1.15;
  const mileage = variant.mileage_kmpl ?? 15;
  const yearlyFuel = Math.round((profile.dailyUsageKm * 365 * 105) / mileage);
  const emi = calculateEMI(onRoad * 0.8);

  const handleGenerate = () => {
    generate('ownership-story', {
      car: { brand: carBrand, model: carModel, fuel_type: '', body_type: '' },
      variant: { name: variant.name, price: variant.ex_showroom_price, mileage: variant.mileage_kmpl },
      profile,
      tcoData: {
        onRoadPrice: onRoad,
        yearlyFuel,
        yearlyInsurance: variant.insurance_cost_yearly ?? 0,
        yearlyMaintenance: Math.round(onRoad * 0.02),
        emi,
      },
      depreciationData: depreciation.map(d => ({ year: d.year_number, resaleValuePct: d.resale_value_pct })),
    }, cacheKey);
  };

  return (
    <div className="bg-card rounded-2xl p-5 card-shadow border border-border/50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          Your Ownership Story
        </h3>
        {!aiNarrative && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="text-xs gap-1.5"
          >
            {isGenerating ? (
              <><Loader2 className="w-3 h-3 animate-spin" /> Writing...</>
            ) : (
              <><Sparkles className="w-3 h-3" /> Generate Story</>
            )}
          </Button>
        )}
      </div>

      {aiNarrative ? (
        <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground [&>p]:my-2">
          <ReactMarkdown>{aiNarrative}</ReactMarkdown>
        </div>
      ) : !isGenerating ? (
        <p className="text-sm text-muted-foreground">
          Generate a personalized year-by-year story of what owning the {variant.name} will look like — EMI, fuel, maintenance, and resale milestones.
        </p>
      ) : (
        <div className="space-y-2 animate-pulse">
          <div className="h-4 bg-secondary rounded w-full" />
          <div className="h-4 bg-secondary rounded w-5/6" />
          <div className="h-4 bg-secondary rounded w-4/6" />
          <div className="h-4 bg-secondary rounded w-full" />
          <div className="h-4 bg-secondary rounded w-3/4" />
        </div>
      )}
    </div>
  );
};

export default AIOwnershipStory;
