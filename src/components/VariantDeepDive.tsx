import { useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, TrendingUp, Wrench, Shield, Zap, IndianRupee, Star, AlertTriangle, CheckCircle2, Activity, HeartPulse } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCars, useCarVariants, useVariantFeatures, useCityPricing, useDepreciation } from '@/hooks/use-cars';
import { formatPrice, calculateEMI, type OnboardingData } from '@/lib/mock-data';
import TCOSimulator from '@/components/TCOSimulator';
import {
  calculateFeatureRegret,
  calculateOwnershipStress,
  calculateTrimScore,
  stressLevelColor,
  stressLevelBg,
} from '@/lib/intelligence-engine';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import VariantDeltaAnalyzer from '@/components/VariantDeltaAnalyzer';
import AIDecisionExplainer from '@/components/AIDecisionExplainer';
import VerdictHero from '@/components/VerdictHero';
import PersonalizePrompt from '@/components/PersonalizePrompt';
import ChatAdvisor from '@/components/ChatAdvisor';

interface VariantDeepDiveProps {
  carId: string;
  variantId: string;
  onBack: () => void;
  profile: OnboardingData;
  isPersonalized?: boolean;
  onPersonalize?: () => void;
}

const SectionCard = ({ title, icon: Icon, children, defaultOpen = false }: { title: string; icon: any; children: React.ReactNode; defaultOpen?: boolean }) => (
  <Collapsible defaultOpen={defaultOpen}>
    <div className="bg-card rounded-2xl card-shadow border border-border/50 overflow-hidden">
      <CollapsibleTrigger className="w-full p-5 flex items-center justify-between hover:bg-secondary/30 transition-colors group">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" />
          <span className="font-bold text-foreground text-sm">{title}</span>
        </div>
        <span className="text-xs text-muted-foreground group-data-[state=open]:hidden">Tap to expand</span>
        <span className="text-xs text-muted-foreground hidden group-data-[state=open]:inline">Tap to collapse</span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-5 pb-5">{children}</div>
      </CollapsibleContent>
    </div>
  </Collapsible>
);

const VariantDeepDive = ({ carId, variantId, onBack, profile, isPersonalized = true, onPersonalize }: VariantDeepDiveProps) => {
  const { data: cars } = useCars();
  const { data: variants } = useCarVariants(carId);
  const { data: features } = useVariantFeatures(variantId);
  const { data: cityPricing } = useCityPricing(variantId);
  const { data: depreciation } = useDepreciation(carId);

  const car = cars?.find(c => c.id === carId);
  const variant = variants?.find(v => v.id === variantId);
  const cityPrice = cityPricing?.find(cp => cp.city === profile.city);
  const advisorRef = useRef<HTMLDivElement>(null);

  const ownershipStress = useMemo(() => {
    if (!features) return null;
    return calculateOwnershipStress(features);
  }, [features]);

  const trimScore = useMemo(() => {
    if (!variant || !variants || !features || !depreciation || !ownershipStress) return null;
    return calculateTrimScore(variant, variants, features, depreciation, ownershipStress, profile);
  }, [variant, variants, features, depreciation, ownershipStress, profile]);

  const featureRegrets = useMemo(() => {
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

  if (!variant) return null;

  const onRoad = cityPrice?.on_road_price ?? variant.ex_showroom_price * 1.15;
  const emi = calculateEMI(onRoad * 0.8);

  const resaleImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'text-chart-positive';
      case 'negative': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const riskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-chart-positive/10 text-chart-positive';
      case 'medium': return 'bg-accent/10 text-accent';
      case 'high': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button onClick={onBack} className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm mb-2">
            <ChevronLeft className="w-4 h-4" />
            Back to Variants
          </button>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{car?.brand} {car?.model}</p>
              <h1 className="text-2xl font-bold text-foreground">{variant.name}</h1>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">{formatPrice(variant.ex_showroom_price)}</p>
              <p className="text-xs text-muted-foreground">ex-showroom</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* ─── 1. TL;DR VERDICT HERO ─── */}
        <VerdictHero
          variant={variant}
          carBrand={car?.brand ?? ''}
          carModel={car?.model ?? ''}
          profile={profile}
          trimScore={trimScore}
          ownershipStress={ownershipStress}
          featureRegrets={featureRegrets}
          variantCount={variants?.length ?? 0}
          isPersonalized={isPersonalized}
          onPersonalize={onPersonalize}
          onAskAdvisor={() => {
            // ChatAdvisor floating bubble — scroll to bottom and let user open
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
          }}
        />

        {/* ─── 2. PRICE + EMI (always visible) ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-card rounded-2xl p-5 card-shadow border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <IndianRupee className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">On-Road · {profile.city}</span>
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{formatPrice(onRoad)}</p>
            <p className="text-[10px] text-muted-foreground mt-1">ex-showroom + tax + reg + insurance</p>
          </div>
          <div className="bg-card rounded-2xl p-5 card-shadow border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">EMI · 5 yr</span>
            </div>
            <p className="text-2xl font-display font-bold text-foreground">₹{emi.toLocaleString('en-IN')}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
            <p className="text-[10px] text-muted-foreground mt-1">80% finance · 8.5% rate</p>
          </div>
        </div>

        {/* Personalize prompt (only if not personalized) */}
        {!isPersonalized && onPersonalize && (
          <PersonalizePrompt onPersonalize={onPersonalize} compact />
        )}

        {/* ─── 3. SCORE SUMMARY ─── */}
        {(trimScore || ownershipStress) && (
          <div className="grid grid-cols-2 gap-3">
            {trimScore && (
              <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Trim Score</span>
                </div>
                <p className="text-3xl font-display font-bold text-primary">{trimScore.score}</p>
                <p className="text-[10px] text-muted-foreground mt-1">out of 100</p>
              </div>
            )}
            {ownershipStress && (
              <div className={`${stressLevelBg(ownershipStress.level)} rounded-2xl p-4 border border-border/50`}>
                <div className="flex items-center gap-2 mb-1">
                  <HeartPulse className={`w-4 h-4 ${stressLevelColor(ownershipStress.level)}`} />
                  <span className="text-xs text-muted-foreground">Ownership Stress</span>
                </div>
                <p className={`text-3xl font-display font-bold capitalize ${stressLevelColor(ownershipStress.level)}`}>
                  {ownershipStress.level}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">score: {ownershipStress.score}/100</p>
              </div>
            )}
          </div>
        )}

        {/* ─── 4. FULL DECISION REASONING (collapsible) ─── */}
        <SectionCard title="Detailed Decision Reasoning" icon={CheckCircle2}>
          <AIDecisionExplainer
            variant={variant}
            carBrand={car?.brand ?? ''}
            carModel={car?.model ?? ''}
            profile={profile}
            trimScore={trimScore}
            ownershipStress={ownershipStress}
            featureRegrets={featureRegrets}
            variantCount={variants?.length ?? 0}
          />
        </SectionCard>

        {/* ─── 5. ON-ROAD BREAKDOWN ─── */}
        <SectionCard title="On-Road Price Breakdown" icon={IndianRupee}>
          <div className="space-y-3 pt-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ex-Showroom</span>
              <span className="font-semibold text-foreground">{formatPrice(variant.ex_showroom_price)}</span>
            </div>
            {cityPrice && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Registration</span>
                  <span className="text-foreground">{formatPrice(cityPrice.registration_cost ?? 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Road Tax</span>
                  <span className="text-foreground">{formatPrice(cityPrice.road_tax ?? 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Insurance</span>
                  <span className="text-foreground">{formatPrice(cityPrice.insurance_cost ?? 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Other Charges</span>
                  <span className="text-foreground">{formatPrice(cityPrice.other_charges ?? 0)}</span>
                </div>
              </>
            )}
            <div className="border-t border-border pt-3 flex justify-between">
              <span className="font-bold text-foreground">Total On-Road</span>
              <span className="font-bold text-xl text-foreground">{formatPrice(onRoad)}</span>
            </div>
          </div>
        </SectionCard>

        {/* ─── 6. KEY SPECS ─── */}
        <SectionCard title="Key Specs" icon={Zap}>
          <div className="grid grid-cols-2 gap-4 pt-2">
            {[
              { label: 'Engine', value: `${variant.engine_cc}cc`, icon: Zap },
              { label: 'Transmission', value: variant.transmission, icon: Shield },
              { label: 'Mileage', value: `${variant.mileage_kmpl} kmpl`, icon: TrendingUp },
              { label: 'Power', value: `${variant.horsepower} bhp`, icon: Zap },
            ].map(spec => (
              <div key={spec.label} className="bg-secondary/50 rounded-xl p-3">
                <spec.icon className="w-4 h-4 text-primary mb-1" />
                <p className="text-xs text-muted-foreground">{spec.label}</p>
                <p className="font-semibold text-foreground capitalize">{spec.value}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ─── 7. WHAT YOU'RE PAYING EXTRA FOR (Variant Delta) ─── */}
        {variants && variants.length >= 2 && (
          <SectionCard title="What You Pay Extra For (vs other trims)" icon={TrendingUp}>
            <div className="pt-2">
              <VariantDeltaAnalyzer variants={variants} />
            </div>
          </SectionCard>
        )}

        {/* ─── 8. FEATURE REGRET RISKS ─── */}
        {featureRegrets.length > 0 && (
          <SectionCard title="Feature Fit & Regret Risks" icon={AlertTriangle} defaultOpen>
            <p className="text-xs text-muted-foreground mb-4 pt-2">
              How each feature aligns with your driving pattern and preferences.
            </p>
            <div className="space-y-2">
              {featureRegrets.map((r) => (
                <div key={r.featureId} className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/30">
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-foreground truncate block">{r.featureName}</span>
                    <span className="text-[10px] text-muted-foreground capitalize">{r.category}</span>
                  </div>
                  <Badge className={`text-xs shrink-0 ml-2 ${
                    r.regretLevel === 'low' ? 'bg-chart-positive/10 text-chart-positive border-chart-positive/20' :
                    r.regretLevel === 'medium' ? 'bg-accent/10 text-accent border-accent/20' :
                    'bg-destructive/10 text-destructive border-destructive/20'
                  }`}>
                    {r.regretLevel === 'low' ? '✓ Good fit' : `⚠ ${r.regretRiskPct}% regret`}
                  </Badge>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* ─── 9. FEATURE LIST ─── */}
        {features && features.length > 0 && (
          <SectionCard title={`All Features (${features.length})`} icon={Star}>
            <div className="space-y-3 pt-2">
              {features.map((vf: any) => {
                const regret = featureRegrets.find(r => r.featureId === vf.feature_id);
                return (
                  <div key={vf.id} className="bg-secondary/30 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-bold text-foreground text-sm">{vf.features?.name}</h4>
                        <p className="text-xs text-muted-foreground">{vf.features?.category}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">+{formatPrice(vf.incremental_cost)}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{vf.features?.plain_explanation}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-accent" />
                        <span className="text-[10px] font-medium text-foreground">{vf.usefulness_score}/10</span>
                      </div>
                      <Badge className={`text-[10px] ${riskColor(vf.features?.repair_risk)}`}>
                        <Wrench className="w-2.5 h-2.5 mr-1" />
                        {vf.features?.repair_risk} repair
                      </Badge>
                      <span className={`text-[10px] font-medium ${resaleImpactColor(vf.resale_impact)}`}>
                        {vf.resale_impact === 'positive' ? '↑' : vf.resale_impact === 'negative' ? '↓' : '→'} resale: {vf.resale_impact}
                      </span>
                      {regret && regret.regretLevel !== 'low' && (
                        <Badge className={`text-[10px] ${
                          regret.regretLevel === 'medium' ? 'bg-accent/10 text-accent border-accent/20' :
                          'bg-destructive/10 text-destructive border-destructive/20'
                        }`}>
                          ⚠ {regret.regretRiskPct}% regret
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        )}

        {/* ─── 10. 5-YEAR TCO ─── */}
        <SectionCard title="5-Year Cost Reality (TCO)" icon={IndianRupee}>
          <div className="pt-2">
            <TCOSimulator
              variant={variant}
              depreciation={depreciation ?? []}
              dailyKm={profile.dailyUsageKm}
            />
          </div>
        </SectionCard>

        {/* ─── 11. RESALE TIMELINE ─── */}
        {depreciation && depreciation.length > 0 && (
          <SectionCard title="Resale Value Timeline" icon={TrendingUp}>
            <div className="space-y-3 pt-2">
              {depreciation.map(d => {
                const resaleValue = variant.ex_showroom_price * (d.resale_value_pct / 100);
                return (
                  <div key={d.year_number} className="flex items-center gap-4">
                    <span className="text-sm font-mono text-muted-foreground w-12">Yr {d.year_number}</span>
                    <div className="flex-1 bg-secondary/50 rounded-full h-3 overflow-hidden">
                      <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${d.resale_value_pct}%` }}
                        transition={{ delay: d.year_number * 0.1, duration: 0.5 }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-foreground w-16 text-right">{d.resale_value_pct}%</span>
                    <span className="text-xs text-muted-foreground w-20 text-right">{formatPrice(resaleValue)}</span>
                  </div>
                );
              })}
              <div className="bg-primary/5 rounded-xl p-4 border border-primary/20 mt-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Best time to sell: </span>
                    Year 3-4 for the best value retention. After year 5, depreciation slows but resale becomes harder.
                  </p>
                </div>
              </div>
            </div>
          </SectionCard>
        )}
      </div>

      {/* AI Chat Advisor (floating) */}
      <div ref={advisorRef}>
        <ChatAdvisor
          variant={variant}
          car={car ? { brand: car.brand, model: car.model, fuel_type: car.fuel_type, body_type: car.body_type } : undefined}
          profile={profile}
          trimScore={trimScore?.score ?? null}
          stressLevel={ownershipStress?.level ?? null}
          featureCount={features?.length ?? 0}
        />
      </div>
    </div>
  );
};

export default VariantDeepDive;
