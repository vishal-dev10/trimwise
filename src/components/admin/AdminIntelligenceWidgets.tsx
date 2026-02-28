import { useAdminIntelligence } from '@/hooks/use-admin-intelligence';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Brain, TrendingUp, Grid3X3 } from 'lucide-react';

const STRESS_COLORS: Record<string, string> = {
  low: 'hsl(160, 60%, 45%)',
  moderate: 'hsl(36, 95%, 55%)',
  high: 'hsl(0, 72%, 55%)',
};

const CATEGORY_COLORS: Record<string, string> = {
  safety: 'hsl(200, 80%, 50%)',
  comfort: 'hsl(270, 60%, 55%)',
  technology: 'hsl(36, 95%, 55%)',
  convenience: 'hsl(160, 60%, 45%)',
  performance: 'hsl(0, 72%, 55%)',
  exterior: 'hsl(200, 40%, 60%)',
  interior: 'hsl(120, 50%, 45%)',
};

const formatPrice = (n: number) => {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${(n / 1000).toFixed(0)}K`;
};

const AdminIntelligenceWidgets = () => {
  const { data, isLoading } = useAdminIntelligence();

  if (isLoading) {
    return <div className="animate-pulse text-muted-foreground text-center py-6">Loading intelligence...</div>;
  }

  if (!data) return null;

  const { segmentStress, overpriced, featureRegret } = data;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
        <Brain className="w-5 h-5 text-primary" />
        Intelligence Insights
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Segment Stress */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent" />
              Avg Ownership Stress by Segment
            </CardTitle>
          </CardHeader>
          <CardContent>
            {segmentStress.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={segmentStress} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <YAxis dataKey="segment" type="category" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip
                    formatter={(value: number) => [`${value}/100`, 'Stress']}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Bar dataKey="avgStress" radius={[0, 4, 4, 0]}>
                    {segmentStress.map((entry, i) => (
                      <Cell key={i} fill={STRESS_COLORS[entry.level]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No segment data available</p>
            )}
          </CardContent>
        </Card>

        {/* Overpriced Variants */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-destructive" />
              Most Overpriced Variants
            </CardTitle>
          </CardHeader>
          <CardContent>
            {overpriced.length > 0 ? (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {overpriced.map((v, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-sm">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-foreground truncate">{v.carName} — {v.variantName}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatPrice(v.price)} vs avg {formatPrice(v.avgSegmentPrice)} · {v.featureCount} features
                      </div>
                    </div>
                    <span className="ml-2 text-xs font-bold text-destructive whitespace-nowrap">
                      +{v.overpricePct}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No overpriced variants detected</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Feature Regret Heatmap */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Grid3X3 className="w-4 h-4 text-accent" />
            Feature Regret Frequency — Missing Across Variants
          </CardTitle>
        </CardHeader>
        <CardContent>
          {featureRegret.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {featureRegret.map((f, i) => {
                const opacity = 0.3 + (f.missingPct / 100) * 0.7;
                const bgColor = CATEGORY_COLORS[f.category] ?? 'hsl(200, 50%, 50%)';
                return (
                  <div
                    key={i}
                    className="px-3 py-2 rounded-lg text-xs font-medium border border-border/30"
                    style={{ backgroundColor: bgColor, opacity, color: 'white' }}
                    title={`${f.featureName}: missing in ${f.missingPct}% of variants (${f.missingCount}/${f.totalVariants})`}
                  >
                    <div className="truncate max-w-[140px]">{f.featureName}</div>
                    <div className="text-[10px] mt-0.5 opacity-80">{f.missingPct}% missing · {f.category}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">All features are present across variants</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminIntelligenceWidgets;
