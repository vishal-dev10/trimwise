import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Wallet, Clock, MapPin, Gauge, Users, Cpu, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cities, type OnboardingData } from '@/lib/mock-data';

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
  onBack: () => void;
}

const steps = [
  { icon: Wallet, title: 'Budget Range', subtitle: 'What\'s your comfortable budget?' },
  { icon: Clock, title: 'Ownership Plan', subtitle: 'How long will you keep the car?' },
  { icon: MapPin, title: 'Your City', subtitle: 'Where will you register?' },
  { icon: Gauge, title: 'Daily Usage', subtitle: 'How much do you drive?' },
  { icon: Users, title: 'About You', subtitle: 'Help us personalize recommendations' },
];

const OnboardingFlow = ({ onComplete, onBack }: OnboardingFlowProps) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    budgetMin: 800000,
    budgetMax: 2000000,
    ownershipYears: 5,
    city: 'Mumbai',
    dailyUsageKm: 30,
    highwayPct: 30,
    drivingStyle: 'balanced',
    familySize: 4,
    techPreference: 'moderate',
    futurePlans: 'keep',
  });

  const updateData = (key: keyof OnboardingData, value: any) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const next = () => {
    if (step < steps.length - 1) setStep(s => s + 1);
    else onComplete(data);
  };

  const prev = () => {
    if (step > 0) setStep(s => s - 1);
    else onBack();
  };

  const progress = ((step + 1) / steps.length) * 100;

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-8">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-3 block">Minimum Budget</label>
              <Slider
                value={[data.budgetMin]}
                min={300000}
                max={5000000}
                step={50000}
                onValueChange={([v]) => updateData('budgetMin', v)}
              />
              <p className="text-2xl font-bold mt-2 text-foreground">₹{(data.budgetMin / 100000).toFixed(1)}L</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-3 block">Maximum Budget</label>
              <Slider
                value={[data.budgetMax]}
                min={data.budgetMin}
                max={10000000}
                step={50000}
                onValueChange={([v]) => updateData('budgetMax', v)}
              />
              <p className="text-2xl font-bold mt-2 text-foreground">₹{(data.budgetMax / 100000).toFixed(1)}L</p>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3">
              {[3, 5, 8].map(y => (
                <button
                  key={y}
                  onClick={() => updateData('ownershipYears', y)}
                  className={`py-6 rounded-xl border-2 transition-all font-bold text-lg ${
                    data.ownershipYears === y
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-card text-foreground hover:border-primary/40'
                  }`}
                >
                  {y} yrs
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground text-center">
              {data.ownershipYears === 3 ? 'Short-term ownership — resale value matters most' :
               data.ownershipYears === 5 ? 'Sweet spot — good balance of value and depreciation' :
               'Long-term — reliability and running costs are key'}
            </p>
          </div>
        );
      case 2:
        return (
          <div>
            <Select value={data.city} onValueChange={v => updateData('city', v)}>
              <SelectTrigger className="h-14 text-lg rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cities.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-4">
              Registration costs and road tax vary significantly by city.
            </p>
          </div>
        );
      case 3:
        return (
          <div className="space-y-8">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-3 block">Daily Driving (km)</label>
              <Slider
                value={[data.dailyUsageKm]}
                min={5}
                max={150}
                step={5}
                onValueChange={([v]) => updateData('dailyUsageKm', v)}
              />
              <p className="text-2xl font-bold mt-2 text-foreground">{data.dailyUsageKm} km/day</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-3 block">Highway Driving %</label>
              <Slider
                value={[data.highwayPct]}
                min={0}
                max={100}
                step={10}
                onValueChange={([v]) => updateData('highwayPct', v)}
              />
              <p className="text-lg font-semibold mt-2 text-foreground">{data.highwayPct}% highway</p>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Driving Style</label>
              <div className="grid grid-cols-3 gap-2">
                {['relaxed', 'balanced', 'spirited'].map(s => (
                  <button
                    key={s}
                    onClick={() => updateData('drivingStyle', s)}
                    className={`py-3 rounded-lg border transition-all text-sm font-medium capitalize ${
                      data.drivingStyle === s
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-card text-foreground hover:border-primary/40'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-3 block">Family Size</label>
              <Slider
                value={[data.familySize]}
                min={1}
                max={8}
                step={1}
                onValueChange={([v]) => updateData('familySize', v)}
              />
              <p className="text-lg font-semibold mt-2 text-foreground">{data.familySize} members</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Tech Preference</label>
              <div className="grid grid-cols-3 gap-2">
                {['minimal', 'moderate', 'tech-savvy'].map(t => (
                  <button
                    key={t}
                    onClick={() => updateData('techPreference', t)}
                    className={`py-3 rounded-lg border transition-all text-sm font-medium capitalize ${
                      data.techPreference === t
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-card text-foreground hover:border-primary/40'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const StepIcon = steps[step].icon;

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      {/* Progress bar */}
      <div className="h-1 bg-muted">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <button onClick={prev} className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm">
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <StepIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Step {step + 1} of {steps.length}</p>
                <h2 className="text-xl font-bold text-foreground">{steps[step].title}</h2>
              </div>
            </div>
            <p className="text-muted-foreground mb-8">{steps[step].subtitle}</p>

            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-6 pb-safe border-t border-border max-w-lg mx-auto w-full">
        <Button onClick={next} className="w-full h-14 text-lg rounded-xl gap-2 font-semibold">
          {step === steps.length - 1 ? 'Find My Car' : 'Continue'}
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default OnboardingFlow;
