import { useAdminStats } from '@/hooks/use-admin-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Layers, Sparkles, MapPin, AlertTriangle, CheckCircle } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = [
  'hsl(200, 80%, 50%)',
  'hsl(36, 95%, 55%)',
  'hsl(160, 60%, 45%)',
  'hsl(0, 72%, 55%)',
  'hsl(270, 60%, 55%)',
  'hsl(120, 50%, 45%)',
];

const AdminDashboard = () => {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) {
    return <div className="animate-pulse-soft text-muted-foreground p-8 text-center">Loading dashboard...</div>;
  }

  if (!stats) return null;

  const statCards = [
    { label: 'Total Cars', value: stats.totalCars, icon: Car, color: 'text-primary' },
    { label: 'Total Variants', value: stats.totalVariants, icon: Layers, color: 'text-accent' },
    { label: 'Total Features', value: stats.totalFeatures, icon: Sparkles, color: 'text-chart-positive' },
    { label: 'Cities Covered', value: stats.citiesCovered, icon: MapPin, color: 'text-primary' },
    { label: 'Missing Pricing', value: stats.missingPricing, icon: AlertTriangle, color: stats.missingPricing > 0 ? 'text-destructive' : 'text-chart-positive' },
    { label: 'Missing Depreciation', value: stats.missingDepreciation, icon: AlertTriangle, color: stats.missingDepreciation > 0 ? 'text-destructive' : 'text-chart-positive' },
  ];

  const featurePieData = Object.entries(stats.featureCategories).map(([name, value]) => ({ name, value }));
  const segmentBarData = Object.entries(stats.segments).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map(s => (
          <Card key={s.label} className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <s.icon className={`w-4 h-4 ${s.color}`} />
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
              <div className="text-2xl font-display font-bold text-foreground">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Completeness + Meta */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-4 h-4 text-chart-positive" />
              <span className="text-sm font-medium text-foreground">Data Completeness</span>
            </div>
            <div className="text-4xl font-display font-bold text-foreground">{stats.completeness}%</div>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${stats.completeness}%` }} />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <span className="text-xs text-muted-foreground">Dataset Version</span>
            <div className="text-2xl font-display font-bold text-foreground mt-1">v{stats.currentVersion}</div>
            <span className="text-xs text-muted-foreground mt-1 block">
              {stats.lastUpload ? new Date(stats.lastUpload).toLocaleDateString() : 'No uploads yet'}
            </span>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <span className="text-xs text-muted-foreground">Last Upload</span>
            <div className="text-sm font-medium text-foreground mt-1">
              {stats.lastUpload ? new Date(stats.lastUpload).toLocaleString() : 'Never'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {featurePieData.length > 0 && (
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Feature Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={featurePieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name} (${value})`}>
                    {featurePieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
        {segmentBarData.length > 0 && (
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Variants per Segment</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={segmentBarData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(200, 80%, 50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
