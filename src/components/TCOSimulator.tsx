import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { formatPrice } from '@/lib/mock-data';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import DepreciationShock from '@/components/DepreciationShock';

interface TCOSimulatorProps {
  variant: {
    ex_showroom_price: number;
    insurance_cost_yearly: number | null;
    mileage_kmpl: number | null;
  };
  depreciation: Array<{
    year_number: number;
    resale_value_pct: number;
    depreciation_pct: number;
  }>;
  dailyKm?: number;
}

const TCOSimulator = ({ variant, depreciation, dailyKm: initialDailyKm = 30 }: TCOSimulatorProps) => {
  const [years, setYears] = useState(5);
  const [dailyKm, setDailyKm] = useState(initialDailyKm);
  const [fuelPrice, setFuelPrice] = useState(105);

  const onRoad = variant.ex_showroom_price * 1.15;
  const mileage = variant.mileage_kmpl ?? 15;

  const chartData = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const yr = i + 1;
      const fuelCost = (dailyKm * 365 * fuelPrice * yr) / mileage;
      const insurance = (variant.insurance_cost_yearly ?? 0) * yr;
      const maintenance = onRoad * 0.02 * yr;
      const depEntry = depreciation.find(d => d.year_number === yr);
      const resaleVal = depEntry ? onRoad * (depEntry.resale_value_pct / 100) : onRoad * Math.pow(0.85, yr);
      const totalCost = onRoad + fuelCost + insurance + maintenance;
      const effectiveCost = totalCost - resaleVal;

      return {
        year: `Yr ${yr}`,
        'Total Cost': Math.round(totalCost),
        'Effective Cost': Math.round(effectiveCost),
        'Resale Value': Math.round(resaleVal),
      };
    });
  }, [years, dailyKm, fuelPrice, variant, depreciation, onRoad, mileage]);

  const selectedData = chartData[years - 1];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card rounded-2xl p-4 card-shadow border border-border/50 text-center">
          <p className="text-xs text-muted-foreground">Total Cost</p>
          <p className="text-lg font-bold text-foreground">{formatPrice(selectedData['Total Cost'])}</p>
        </div>
        <div className="bg-card rounded-2xl p-4 card-shadow border border-border/50 text-center">
          <p className="text-xs text-muted-foreground">Resale Value</p>
          <p className="text-lg font-bold text-chart-positive">{formatPrice(selectedData['Resale Value'])}</p>
        </div>
        <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20 text-center">
          <p className="text-xs text-muted-foreground">Effective Cost</p>
          <p className="text-lg font-bold text-primary">{formatPrice(selectedData['Effective Cost'])}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-card rounded-2xl p-5 card-shadow border border-border/50">
        <h3 className="font-bold text-foreground mb-4">Cost Over Time</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(200, 80%, 40%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(200, 80%, 40%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="effectiveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(36, 95%, 55%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(36, 95%, 55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 50%)" />
              <YAxis tickFormatter={v => `${(v / 100000).toFixed(0)}L`} tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 50%)" />
              <Tooltip
                formatter={(value: number) => formatPrice(value)}
                contentStyle={{ borderRadius: 12, border: '1px solid hsl(220, 15%, 90%)', fontSize: 12 }}
              />
              <Area type="monotone" dataKey="Total Cost" stroke="hsl(200, 80%, 40%)" fill="url(#totalGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="Effective Cost" stroke="hsl(36, 95%, 55%)" fill="url(#effectiveGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-card rounded-2xl p-5 card-shadow border border-border/50 space-y-6">
        <h3 className="font-bold text-foreground">Adjust Parameters</h3>
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-muted-foreground">Ownership Period</span>
            <span className="text-sm font-bold text-foreground">{years} years</span>
          </div>
          <Slider value={[years]} min={1} max={8} step={1} onValueChange={([v]) => setYears(v)} />
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-muted-foreground">Daily Driving</span>
            <span className="text-sm font-bold text-foreground">{dailyKm} km</span>
          </div>
          <Slider value={[dailyKm]} min={5} max={150} step={5} onValueChange={([v]) => setDailyKm(v)} />
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-muted-foreground">Fuel Price</span>
            <span className="text-sm font-bold text-foreground">₹{fuelPrice}/L</span>
          </div>
          <Slider value={[fuelPrice]} min={70} max={150} step={1} onValueChange={([v]) => setFuelPrice(v)} />
        </div>
      </div>

      {/* Depreciation Shock */}
      <DepreciationShock onRoadPrice={onRoad} depreciation={depreciation} />
    </motion.div>
  );
};

export default TCOSimulator;
