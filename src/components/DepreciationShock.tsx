import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, ToggleLeft, ToggleRight } from 'lucide-react';
import { formatPrice } from '@/lib/mock-data';
import { calculateDepreciationShock } from '@/lib/financial-engine';

interface DepreciationShockProps {
  onRoadPrice: number;
  depreciation: Array<{ year_number: number; resale_value_pct: number }>;
}

const DepreciationShock = ({ onRoadPrice, depreciation }: DepreciationShockProps) => {
  const [showPct, setShowPct] = useState(false);
  const shock = calculateDepreciationShock(onRoadPrice, depreciation);

  if (shock.yearlyData.length === 0) return null;

  return (
    <div className="bg-card rounded-2xl p-5 card-shadow border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-destructive" />
          Depreciation Shock
        </h3>
        <button
          onClick={() => setShowPct(!showPct)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg bg-secondary/50"
        >
          {showPct ? <ToggleRight className="w-4 h-4 text-primary" /> : <ToggleLeft className="w-4 h-4" />}
          {showPct ? '%' : '₹'}
        </button>
      </div>

      {/* Year 1 shock highlight */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 mb-4 text-center"
      >
        <p className="text-xs text-muted-foreground mb-1">First Year Value Drop</p>
        <motion.p
          className="text-3xl font-display font-bold text-destructive"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {showPct ? `${shock.year1DropPct}%` : formatPrice(shock.year1DropValue)}
        </motion.p>
        <p className="text-xs text-muted-foreground mt-1">
          You may lose {showPct ? `${shock.year1DropPct}% of value` : formatPrice(shock.year1DropValue)} in first 12 months
        </p>
      </motion.div>

      {/* Year-by-year bars */}
      <div className="space-y-2">
        {shock.yearlyData.map((d, i) => (
          <motion.div
            key={d.year}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * i, duration: 0.4 }}
            className="flex items-center gap-3"
          >
            <span className="text-xs font-mono text-muted-foreground w-10">Yr {d.year}</span>
            <div className="flex-1 bg-secondary/50 rounded-full h-6 overflow-hidden relative">
              <motion.div
                className="h-full rounded-full bg-destructive/20"
                initial={{ width: 0 }}
                animate={{ width: `${d.dropPct}%` }}
                transition={{ delay: 0.2 + 0.1 * i, duration: 0.6 }}
              />
              <span className="absolute inset-y-0 left-2 flex items-center text-[10px] font-medium text-foreground">
                {showPct ? `−${d.dropPct}%` : `−${formatPrice(d.dropFromPrevious)}`}
              </span>
            </div>
            <span className="text-xs font-semibold text-foreground w-16 text-right">
              {formatPrice(d.value)}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DepreciationShock;
