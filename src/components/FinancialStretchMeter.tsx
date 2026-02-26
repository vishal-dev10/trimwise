import { motion } from 'framer-motion';
import { Gauge } from 'lucide-react';
import { formatPrice } from '@/lib/mock-data';
import { calculateFinancialStretch, stretchLevelColor, stretchLevelBg, type FinancialProfile } from '@/lib/financial-engine';

interface FinancialStretchMeterProps {
  onRoadPrice: number;
  financial: FinancialProfile;
}

const FinancialStretchMeter = ({ onRoadPrice, financial }: FinancialStretchMeterProps) => {
  const result = calculateFinancialStretch(onRoadPrice, financial);

  // Gauge angle: 0 = safe(left), 180 = high(right)
  const gaugeAngle = Math.min(180, (result.emiAsIncomePct / 40) * 180);

  return (
    <div className="bg-card rounded-2xl p-5 card-shadow border border-border/50">
      <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
        <Gauge className="w-4 h-4 text-primary" />
        Financial Stress Meter
      </h3>

      {/* Gauge visualization */}
      <div className="flex justify-center mb-4">
        <div className="relative w-40 h-20 overflow-hidden">
          {/* Background arc */}
          <svg viewBox="0 0 200 100" className="w-full h-full">
            <path
              d="M 10 100 A 90 90 0 0 1 190 100"
              fill="none"
              stroke="hsl(var(--secondary))"
              strokeWidth="12"
              strokeLinecap="round"
            />
            {/* Safe zone */}
            <path
              d="M 10 100 A 90 90 0 0 1 73 22"
              fill="none"
              stroke="hsl(var(--chart-positive))"
              strokeWidth="12"
              strokeLinecap="round"
              opacity={0.3}
            />
            {/* Moderate zone */}
            <path
              d="M 73 22 A 90 90 0 0 1 127 22"
              fill="none"
              stroke="hsl(var(--accent))"
              strokeWidth="12"
              strokeLinecap="round"
              opacity={0.3}
            />
            {/* High zone */}
            <path
              d="M 127 22 A 90 90 0 0 1 190 100"
              fill="none"
              stroke="hsl(var(--destructive))"
              strokeWidth="12"
              strokeLinecap="round"
              opacity={0.3}
            />
            {/* Needle */}
            <motion.line
              x1="100"
              y1="100"
              x2="100"
              y2="20"
              stroke="hsl(var(--foreground))"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ rotate: -90, originX: '100', originY: '100' }}
              animate={{ rotate: gaugeAngle - 90 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{ transformOrigin: '100px 100px' }}
            />
            <circle cx="100" cy="100" r="5" fill="hsl(var(--foreground))" />
          </svg>
        </div>
      </div>

      {/* Level badge */}
      <div className="text-center mb-4">
        <motion.span
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold capitalize ${stretchLevelBg(result.level)} ${stretchLevelColor(result.level)}`}
        >
          {result.level === 'safe' ? '✓ Safe' : result.level === 'moderate' ? '⚡ Moderate' : '⚠ High Stretch'}
        </motion.span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-secondary/30 rounded-xl p-3 text-center">
          <p className="text-[10px] text-muted-foreground">Car EMI</p>
          <p className="text-sm font-bold text-foreground">₹{result.carEMI.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-secondary/30 rounded-xl p-3 text-center">
          <p className="text-[10px] text-muted-foreground">EMI/Income</p>
          <p className={`text-sm font-bold ${stretchLevelColor(result.level)}`}>{result.emiAsIncomePct}%</p>
        </div>
        <div className="bg-secondary/30 rounded-xl p-3 text-center">
          <p className="text-[10px] text-muted-foreground">Total EMI Load</p>
          <p className="text-sm font-bold text-foreground">{result.totalEMIPct}%</p>
        </div>
        <div className="bg-secondary/30 rounded-xl p-3 text-center">
          <p className="text-[10px] text-muted-foreground">Disposable</p>
          <p className={`text-sm font-bold ${result.disposableAfterEMI > 0 ? 'text-chart-positive' : 'text-destructive'}`}>
            ₹{Math.abs(result.disposableAfterEMI).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Recommendation */}
      <div className={`${stretchLevelBg(result.level)} rounded-xl p-3 border border-border/30`}>
        <p className="text-xs text-foreground leading-relaxed">{result.recommendation}</p>
      </div>
    </div>
  );
};

export default FinancialStretchMeter;
