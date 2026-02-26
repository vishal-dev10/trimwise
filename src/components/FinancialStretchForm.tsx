import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Percent, CreditCard, X } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { saveFinancialProfile, loadFinancialProfile, type FinancialProfile } from '@/lib/financial-engine';

interface FinancialStretchFormProps {
  onComplete: (profile: FinancialProfile) => void;
  onSkip: () => void;
}

const FinancialStretchForm = ({ onComplete, onSkip }: FinancialStretchFormProps) => {
  const [income, setIncome] = useState(80000);
  const [savings, setSavings] = useState(20);
  const [emis, setEmis] = useState(0);

  useEffect(() => {
    const saved = loadFinancialProfile();
    if (saved) {
      setIncome(saved.monthlyIncome);
      setSavings(saved.savingsPct);
      setEmis(saved.currentEMIs);
    }
  }, []);

  const handleSubmit = () => {
    const profile: FinancialProfile = {
      monthlyIncome: income,
      savingsPct: savings,
      currentEMIs: emis,
    };
    saveFinancialProfile(profile);
    onComplete(profile);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">This data stays on your device only.</p>
        <button onClick={onSkip} className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
          <X className="w-3 h-3" /> Skip
        </button>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <Wallet className="w-4 h-4 text-primary" />
          <label className="text-sm font-medium text-muted-foreground">Monthly Income</label>
        </div>
        <Slider
          value={[income]}
          min={20000}
          max={500000}
          step={5000}
          onValueChange={([v]) => setIncome(v)}
        />
        <p className="text-2xl font-bold mt-2 text-foreground">₹{income.toLocaleString('en-IN')}</p>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <Percent className="w-4 h-4 text-primary" />
          <label className="text-sm font-medium text-muted-foreground">Monthly Savings %</label>
        </div>
        <Slider
          value={[savings]}
          min={0}
          max={60}
          step={5}
          onValueChange={([v]) => setSavings(v)}
        />
        <p className="text-2xl font-bold mt-2 text-foreground">{savings}%</p>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <CreditCard className="w-4 h-4 text-primary" />
          <label className="text-sm font-medium text-muted-foreground">Existing EMIs (monthly)</label>
        </div>
        <Slider
          value={[emis]}
          min={0}
          max={200000}
          step={1000}
          onValueChange={([v]) => setEmis(v)}
        />
        <p className="text-2xl font-bold mt-2 text-foreground">₹{emis.toLocaleString('en-IN')}</p>
      </div>
    </div>
  );
};

export default FinancialStretchForm;
