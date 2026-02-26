import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowRightLeft } from 'lucide-react';
import { formatPrice } from '@/lib/mock-data';
import { calculateUpgradePath } from '@/lib/financial-engine';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface UpgradePathSimulatorProps {
  topVariant: {
    name: string;
    ex_showroom_price: number;
    mileage_kmpl: number | null;
    insurance_cost_yearly: number | null;
  };
  midVariant: {
    name: string;
    ex_showroom_price: number;
    mileage_kmpl: number | null;
    insurance_cost_yearly: number | null;
  };
  depreciation: Array<{ year_number: number; resale_value_pct: number }>;
  dailyKm: number;
}

const UpgradePathSimulator = ({ topVariant, midVariant, depreciation, dailyKm }: UpgradePathSimulatorProps) => {
  const result = useMemo(() => {
    return calculateUpgradePath(topVariant, midVariant, depreciation, dailyKm);
  }, [topVariant, midVariant, depreciation, dailyKm]);

  const winner = result.netDifference > 0 ? 'B' : 'A';

  return (
    <div className="bg-card rounded-2xl p-5 card-shadow border border-border/50 space-y-5">
      <h3 className="font-bold text-foreground flex items-center gap-2">
        <ArrowRightLeft className="w-4 h-4 text-primary" />
        Upgrade Path Simulator
      </h3>

      <p className="text-xs text-muted-foreground">
        Compare: Buy <span className="font-semibold text-foreground">{topVariant.name}</span> now vs Start with{' '}
        <span className="font-semibold text-foreground">{midVariant.name}</span> and upgrade in 4 years.
      </p>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`rounded-xl p-4 border ${winner === 'A' ? 'border-primary/30 bg-primary/5' : 'border-border/50 bg-secondary/30'}`}>
          <p className="text-xs text-muted-foreground mb-1">Option A: Buy Top Now</p>
          <p className="text-xl font-bold text-foreground">{formatPrice(result.optionA.totalOwnershipCost)}</p>
          <p className="text-[10px] text-muted-foreground mt-1">over 8 years</p>
          {winner === 'A' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-xs font-medium text-primary flex items-center gap-1"
            >
              <ArrowUpRight className="w-3 h-3" /> Better Value
            </motion.div>
          )}
        </div>
        <div className={`rounded-xl p-4 border ${winner === 'B' ? 'border-primary/30 bg-primary/5' : 'border-border/50 bg-secondary/30'}`}>
          <p className="text-xs text-muted-foreground mb-1">Option B: Mid → Upgrade</p>
          <p className="text-xl font-bold text-foreground">{formatPrice(result.optionB.totalOwnershipCost)}</p>
          <p className="text-[10px] text-muted-foreground mt-1">mid 4yr + top 4yr</p>
          {winner === 'B' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-xs font-medium text-primary flex items-center gap-1"
            >
              <ArrowUpRight className="w-3 h-3" /> Better Value
            </motion.div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={result.chartData}>
            <defs>
              <linearGradient id="topNowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(200, 80%, 40%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(200, 80%, 40%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="midUpgradeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(36, 95%, 55%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(36, 95%, 55%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} stroke="hsl(220, 10%, 50%)" />
            <YAxis tickFormatter={v => `${(v / 100000).toFixed(0)}L`} tick={{ fontSize: 11 }} stroke="hsl(220, 10%, 50%)" />
            <Tooltip
              formatter={(value: number) => formatPrice(value)}
              contentStyle={{ borderRadius: 12, border: '1px solid hsl(220, 15%, 90%)', fontSize: 12 }}
            />
            <Area type="monotone" dataKey="Buy Top Now" stroke="hsl(200, 80%, 40%)" fill="url(#topNowGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="Mid + Upgrade" stroke="hsl(36, 95%, 55%)" fill="url(#midUpgradeGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Cost breakdown */}
      <div className="bg-secondary/30 rounded-xl p-4">
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
          <div className="font-semibold text-foreground">Metric</div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <span className="font-semibold text-foreground">Top Now</span>
            <span className="font-semibold text-foreground">Mid+Up</span>
          </div>
          {[
            { label: 'Depreciation', a: result.optionA.depreciationLoss, b: result.optionB.depreciationLoss },
            { label: 'Fuel', a: result.optionA.fuelCost, b: result.optionB.fuelCost },
            { label: 'Insurance', a: result.optionA.insuranceCost, b: result.optionB.insuranceCost },
            { label: 'Maintenance', a: result.optionA.maintenanceCost, b: result.optionB.maintenanceCost },
          ].map(row => (
            <div key={row.label} className="contents">
              <span className="text-muted-foreground py-1">{row.label}</span>
              <div className="grid grid-cols-2 gap-2 text-center py-1">
                <span className="text-foreground">{formatPrice(row.a)}</span>
                <span className="text-foreground">{formatPrice(row.b)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendation */}
      <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
        <p className="text-sm text-foreground font-medium">{result.recommendation}</p>
      </div>
    </div>
  );
};

export default UpgradePathSimulator;
