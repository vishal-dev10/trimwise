import { Sparkles, Loader2, HandCoins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import { useAINarrative } from '@/hooks/use-ai-narrative';
import type { OnboardingData } from '@/lib/mock-data';

interface AINegotiationTipsProps {
  variant: {
    name: string;
    ex_showroom_price: number;
  };
  carBrand: string;
  carModel: string;
  profile: OnboardingData;
  cityPricing?: {
    on_road_price: number;
    road_tax: number | null;
    registration_cost: number | null;
    insurance_cost: number | null;
  } | null;
}

const AINegotiationTips = ({ variant, carBrand, carModel, profile, cityPricing }: AINegotiationTipsProps) => {
  const { narratives, loading, generate } = useAINarrative();
  const cacheKey = `tw_ai_negotiation_${variant.name}_${profile.city}`;
  const aiNarrative = narratives[cacheKey];
  const isGenerating = loading[cacheKey];

  const handleGenerate = () => {
    generate('negotiation', {
      car: { brand: carBrand, model: carModel, fuel_type: '', body_type: '' },
      variant: { name: variant.name, price: variant.ex_showroom_price },
      profile,
      cityPricing: cityPricing ? {
        onRoadPrice: cityPricing.on_road_price,
        roadTax: cityPricing.road_tax ?? 0,
        registration: cityPricing.registration_cost ?? 0,
        insurance: cityPricing.insurance_cost ?? 0,
      } : undefined,
    }, cacheKey);
  };

  return (
    <div className="bg-card rounded-2xl p-5 card-shadow border border-border/50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <HandCoins className="w-4 h-4 text-primary" />
          Smart Negotiation Tips
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
              <><Loader2 className="w-3 h-3 animate-spin" /> Thinking...</>
            ) : (
              <><Sparkles className="w-3 h-3" /> Get Tips</>
            )}
          </Button>
        )}
      </div>

      {aiNarrative ? (
        <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground [&>p]:my-2 [&>ul]:my-2">
          <ReactMarkdown>{aiNarrative}</ReactMarkdown>
        </div>
      ) : !isGenerating ? (
        <p className="text-sm text-muted-foreground">
          Get city-specific negotiation guidance for the {variant.name} in {profile.city} — discounts, best timing, and what to push for.
        </p>
      ) : (
        <div className="space-y-2 animate-pulse">
          <div className="h-4 bg-secondary rounded w-full" />
          <div className="h-4 bg-secondary rounded w-4/5" />
          <div className="h-4 bg-secondary rounded w-3/5" />
        </div>
      )}
    </div>
  );
};

export default AINegotiationTips;
