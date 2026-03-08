import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, TrendingUp, Wrench, Shield, Zap, IndianRupee, Star, AlertTriangle, CheckCircle2, Brain, Activity, HeartPulse, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCars, useCarVariants, useVariantFeatures, useCityPricing, useDepreciation } from '@/hooks/use-cars';
import { formatPrice, calculateTCO, calculateEMI, type OnboardingData } from '@/lib/mock-data';
import TCOSimulator from '@/components/TCOSimulator';
import UpgradePathSimulator from '@/components/UpgradePathSimulator';
import FinancialStretchMeter from '@/components/FinancialStretchMeter';
import { loadFinancialProfile } from '@/lib/financial-engine';
import {
  calculateFeatureRegret,
  calculateOwnershipStress,
  calculateTrimScore,
  stressLevelColor,
  stressLevelBg,
  regretLevelColor,
  type FeatureRegretResult,
} from '@/lib/intelligence-engine';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import FeatureUsageSimulator from '@/components/FeatureUsageSimulator';
import VariantDeltaAnalyzer from '@/components/VariantDeltaAnalyzer';
import AIDecisionExplainer from '@/components/AIDecisionExplainer';
import AIFeatureWorth from '@/components/AIFeatureWorth';
import AIOwnershipStory from '@/components/AIOwnershipStory';
import AINegotiationTips from '@/components/AINegotiationTips';
import ChatAdvisor from '@/components/ChatAdvisor';

interface VariantDeepDiveProps {
  carId: string;
  variantId: string;
  onBack: () => void;
  profile: OnboardingData;
}

const VariantDeepDive = ({ carId, variantId, onBack, profile }: VariantDeepDiveProps) => {
  const { data: cars } = useCars();
  const { data: variants } = useCarVariants(carId);
  const { data: features, isLoading: featuresLoading } = useVariantFeatures(variantId);
  const { data: cityPricing } = useCityPricing(variantId);
  const { data: depreciation } = useDepreciation(carId);

  const car = cars?.find(c => c.id === carId);
  const variant = variants?.find(v => v.id === variantId);
  const cityPrice = cityPricing?.find(cp => cp.city === profile.city);

  // Intelligence computations
  const ownershipStress = useMemo(() => {
    if (!features) return null;
    return calculateOwnershipStress(features);
  }, [features]);

  const trimScore = useMemo(() => {
    if (!variant || !variants || !features || !depreciation || !ownershipStress) return null;
    return calculateTrimScore(variant, variants, features, depreciation, ownershipStress, profile);
  }, [variant, variants, features, depreciation, ownershipStress, profile]);

  // Regret risk for features that are MISSING from this variant
  // We'd need all features to compare, but we can compute for existing ones
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

  const financialProfile = useMemo(() => loadFinancialProfile(), []);

  // Find mid variant for upgrade path (variant closest to median price)
  const midVariant = useMemo(() => {
    if (!variants || variants.length < 2) return null;
    const sorted = [...variants].sort((a, b) => a.ex_showroom_price - b.ex_showroom_price);
    return sorted[Math.floor(sorted.length / 2)];
  }, [variants]);

  const topVariant = useMemo(() => {
    if (!variants || variants.length < 2) return null;
    return [...variants].sort((a, b) => b.ex_showroom_price - a.ex_showroom_price)[0];
  }, [variants]);

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

      <div className="max-w-4xl mx-auto px-4 py-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start bg-secondary/50 rounded-xl p-1 mb-6 overflow-x-auto">
            <TabsTrigger value="overview" className="rounded-lg text-sm">Overview</TabsTrigger>
            <TabsTrigger value="features" className="rounded-lg text-sm">Features</TabsTrigger>
            <TabsTrigger value="intelligence" className="rounded-lg text-sm">
              <Brain className="w-3 h-3 mr-1" /> Intelligence
            </TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-lg text-sm">
              <BarChart3 className="w-3 h-3 mr-1" /> Analytics
            </TabsTrigger>
            <TabsTrigger value="tco" className="rounded-lg text-sm">TCO</TabsTrigger>
            <TabsTrigger value="financial" className="rounded-lg text-sm">Financial</TabsTrigger>
            <TabsTrigger value="resale" className="rounded-lg text-sm">Resale</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {/* On-road breakdown */}
              <div className="bg-card rounded-2xl p-5 card-shadow border border-border/50">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-primary" />
                  On-Road Price Breakdown ({profile.city})
                </h3>
                <div className="space-y-3">
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
              </div>

              {/* Intelligence Summary Cards */}
              {(trimScore || ownershipStress) && (
                <div className="grid grid-cols-2 gap-3">
                  {trimScore && (
                    <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20">
                      <div className="flex items-center gap-2 mb-1">
                        <Brain className="w-4 h-4 text-primary" />
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

              {/* EMI Card */}
              <div className="bg-card rounded-2xl p-5 card-shadow border border-border/50">
                <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  EMI Estimate
                </h3>
                <p className="text-3xl font-bold text-foreground">₹{emi.toLocaleString('en-IN')}<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                <p className="text-xs text-muted-foreground mt-1">80% financing · 8.5% rate · 5 year tenure</p>
              </div>

              {/* Specs */}
              <div className="bg-card rounded-2xl p-5 card-shadow border border-border/50">
                <h3 className="font-bold text-foreground mb-4">Key Specs</h3>
                <div className="grid grid-cols-2 gap-4">
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
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="features">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              {features && features.length > 0 ? features.map((vf: any, i: number) => {
                const regret = featureRegrets.find(r => r.featureId === vf.feature_id);
                return (
                  <div key={vf.id} className="bg-card rounded-2xl p-5 card-shadow border border-border/50">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-bold text-foreground">{vf.features?.name}</h4>
                        <p className="text-sm text-muted-foreground">{vf.features?.category}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">+{formatPrice(vf.incremental_cost)}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{vf.features?.plain_explanation}</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-accent" />
                        <span className="text-xs font-medium text-foreground">Usefulness: {vf.usefulness_score}/10</span>
                      </div>
                      <Badge className={`text-xs ${riskColor(vf.features?.repair_risk)}`}>
                        <Wrench className="w-3 h-3 mr-1" />
                        {vf.features?.repair_risk} repair risk
                      </Badge>
                      <span className={`text-xs font-medium ${resaleImpactColor(vf.resale_impact)}`}>
                        {vf.resale_impact === 'positive' ? '↑' : vf.resale_impact === 'negative' ? '↓' : '→'} Resale: {vf.resale_impact}
                      </span>
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No additional features for this variant.</p>
                  <p className="text-sm mt-1">This is the base variant.</p>
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* ─── INTELLIGENCE TAB ─── */}
          <TabsContent value="intelligence">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">

              {/* AI Decision Explainer */}
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

              {/* Trim Score Breakdown */}
              {trimScore && (
                <div className="bg-card rounded-2xl p-5 card-shadow border border-border/50">
                  <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    Reliability-Weighted Trim Score
                  </h3>
                  <div className="flex items-center gap-4 mb-5">
                    <div className="relative w-20 h-20">
                      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                        <circle cx="18" cy="18" r="16" fill="none" stroke="hsl(var(--secondary))" strokeWidth="3" />
                        <circle
                          cx="18" cy="18" r="16" fill="none"
                          stroke="hsl(var(--primary))"
                          strokeWidth="3"
                          strokeDasharray={`${trimScore.score} ${100 - trimScore.score}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-lg font-display font-bold text-foreground">
                        {trimScore.score}
                      </span>
                    </div>
                    <div className="flex-1 text-sm text-muted-foreground">
                      <p>Composite score factoring feature utility, resale strength, ownership cost, and reliability.</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { label: 'Feature Utility', value: trimScore.breakdown.featureUtility, positive: true },
                      { label: 'Resale Strength', value: trimScore.breakdown.resaleStrength, positive: true },
                      { label: 'Reliability Weight', value: trimScore.breakdown.reliabilityWeight, positive: true },
                      { label: 'Cost Deviation', value: trimScore.breakdown.ownershipCostDeviation, positive: false },
                      { label: 'Overpriced Penalty', value: trimScore.breakdown.overpricedPenalty, positive: false },
                      { label: 'Stress Factor', value: trimScore.breakdown.stressFactor, positive: false },
                    ].map(item => (
                      <div key={item.label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className={item.positive ? 'text-chart-positive' : 'text-destructive'}>
                            {item.positive ? '+' : '−'}{item.value}
                          </span>
                        </div>
                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${item.positive ? 'bg-chart-positive' : 'bg-destructive'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, item.value)}%` }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ownership Stress */}
              {ownershipStress && (
                <div className="bg-card rounded-2xl p-5 card-shadow border border-border/50">
                  <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                    <HeartPulse className={`w-4 h-4 ${stressLevelColor(ownershipStress.level)}`} />
                    Ownership Stress Index
                  </h3>
                  <div className="flex items-center gap-4 mb-5">
                    <div className={`px-4 py-2 rounded-xl ${stressLevelBg(ownershipStress.level)}`}>
                      <span className={`text-2xl font-display font-bold capitalize ${stressLevelColor(ownershipStress.level)}`}>
                        {ownershipStress.level}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${
                            ownershipStress.level === 'low' ? 'bg-chart-positive' :
                            ownershipStress.level === 'moderate' ? 'bg-accent' : 'bg-destructive'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${ownershipStress.score}%` }}
                          transition={{ duration: 0.8 }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{ownershipStress.score}/100</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {ownershipStress.factors.map((f, i) => (
                      <Collapsible key={i}>
                        <CollapsibleTrigger className="w-full">
                          <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-colors">
                            <span className="text-sm font-medium text-foreground">{f.label}</span>
                            <Badge variant="outline" className="text-xs">{f.contribution}%</Badge>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <p className="text-xs text-muted-foreground px-3 py-2">{f.description}</p>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                </div>
              )}

              {/* Feature Regret Indicators (for included features) */}
              {featureRegrets.length > 0 && (
                <div className="bg-card rounded-2xl p-5 card-shadow border border-border/50">
                  <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-accent" />
                    Feature Relevance Analysis
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">
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
                          {r.regretLevel === 'low' ? '✓ Included' : `⚠ ${r.regretRiskPct}% regret risk`}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* ─── ANALYTICS TAB ─── */}
          <TabsContent value="analytics">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              {/* Feature Usage Simulator */}
              {features && features.length > 0 && (
                <FeatureUsageSimulator features={features} profile={profile} />
              )}

              {/* Variant Delta Analyzer */}
              {variants && variants.length >= 2 && (
                <VariantDeltaAnalyzer variants={variants} />
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="tco">
            <TCOSimulator
              variant={variant}
              depreciation={depreciation ?? []}
              dailyKm={profile.dailyUsageKm}
            />
          </TabsContent>

          <TabsContent value="financial">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              {/* Financial Stretch Meter */}
              {financialProfile && (
                <FinancialStretchMeter onRoadPrice={onRoad} financial={financialProfile} />
              )}
              {!financialProfile && (
                <div className="bg-secondary/30 rounded-2xl p-5 border border-border/50 text-center">
                  <p className="text-sm text-muted-foreground">
                    Add your financial details during onboarding to see the Financial Stress Meter here.
                  </p>
                </div>
              )}

              {/* Upgrade Path Simulator */}
              {midVariant && topVariant && depreciation && midVariant.id !== topVariant.id && (
                <UpgradePathSimulator
                  topVariant={topVariant}
                  midVariant={midVariant}
                  depreciation={depreciation}
                  dailyKm={profile.dailyUsageKm}
                />
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="resale">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {depreciation && depreciation.length > 0 ? (
                <>
                  <div className="bg-card rounded-2xl p-5 card-shadow border border-border/50">
                    <h3 className="font-bold text-foreground mb-4">Resale Value Timeline</h3>
                    <div className="space-y-3">
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
                    </div>
                  </div>

                  <div className="bg-primary/5 rounded-2xl p-5 border border-primary/20">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-bold text-foreground mb-1">Best Time to Sell</h4>
                        <p className="text-sm text-muted-foreground">
                          Sell around year 3-4 for the best value retention. After year 5, depreciation slows but resale becomes harder.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Depreciation data not available for this car.</p>
                </div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* AI Chat Advisor */}
      <ChatAdvisor
        variant={variant}
        car={car ? { brand: car.brand, model: car.model, fuel_type: car.fuel_type, body_type: car.body_type } : undefined}
        profile={profile}
        trimScore={trimScore?.score ?? null}
        stressLevel={ownershipStress?.level ?? null}
        featureCount={features?.length ?? 0}
      />
    </div>
  );
};

export default VariantDeepDive;
