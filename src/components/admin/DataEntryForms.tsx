import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

// ── Car Form ──────────────────────────────────────────────
export const CarForm = () => {
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    brand: '', model: '', segment: 'compact', body_type: 'suv',
    fuel_type: 'petrol', year: new Date().getFullYear().toString(),
    engine_options: '', description: '',
  });

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.brand.trim() || !form.model.trim()) { toast.error('Brand and model are required'); return; }
    setSaving(true);
    const { error } = await supabase.from('cars').insert({
      brand: form.brand.trim(), model: form.model.trim(), segment: form.segment,
      body_type: form.body_type, fuel_type: form.fuel_type, year: Number(form.year),
      engine_options: form.engine_options || null, description: form.description || null,
    } as any);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Added ${form.brand} ${form.model}`);
    setForm({ brand: '', model: '', segment: 'compact', body_type: 'suv', fuel_type: 'petrol', year: new Date().getFullYear().toString(), engine_options: '', description: '' });
    qc.invalidateQueries({ queryKey: ['admin-stats'] });
    qc.invalidateQueries({ queryKey: ['cars'] });
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-display">Add Car</CardTitle>
        <CardDescription className="text-xs">Add a new car model to the database.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Brand *</Label><Input placeholder="e.g. Hyundai" value={form.brand} onChange={e => set('brand', e.target.value)} /></div>
            <div><Label className="text-xs">Model *</Label><Input placeholder="e.g. Creta" value={form.model} onChange={e => set('model', e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label className="text-xs">Segment</Label>
              <Select value={form.segment} onValueChange={v => set('segment', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{['compact', 'sub-compact', 'mid-size', 'full-size', 'luxury'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Body Type</Label>
              <Select value={form.body_type} onValueChange={v => set('body_type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{['sedan', 'suv', 'hatchback', 'mpv', 'coupe', 'pickup'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Fuel Type</Label>
              <Select value={form.fuel_type} onValueChange={v => set('fuel_type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{['petrol', 'diesel', 'electric', 'hybrid', 'cng'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Year</Label><Input type="number" value={form.year} onChange={e => set('year', e.target.value)} /></div>
            <div><Label className="text-xs">Engine Options</Label><Input placeholder="e.g. 1.5L Turbo | 1.0L NA" value={form.engine_options} onChange={e => set('engine_options', e.target.value)} /></div>
          </div>
          <div><Label className="text-xs">Description</Label><Textarea placeholder="Optional description" value={form.description} onChange={e => set('description', e.target.value)} rows={2} /></div>
          <Button type="submit" disabled={saving} className="w-full">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />} Add Car
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

// ── Variant Form ──────────────────────────────────────────
export const VariantForm = () => {
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const { data: cars } = useQuery({ queryKey: ['cars-list-all'], queryFn: async () => { const { data } = await supabase.from('cars').select('id, brand, model').order('brand'); return data ?? []; } });
  const [form, setForm] = useState({
    car_id: '', name: '', ex_showroom_price: '', transmission: 'manual',
    engine_cc: '', horsepower: '', torque_nm: '', mileage_kmpl: '',
    fuel_tank_liters: '', safety_rating: '',
  });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.car_id || !form.name.trim() || !form.ex_showroom_price) { toast.error('Car, variant name, and price are required'); return; }
    setSaving(true);
    const { error } = await supabase.from('variants').insert({
      car_id: form.car_id, name: form.name.trim(),
      ex_showroom_price: Number(form.ex_showroom_price),
      transmission: form.transmission,
      engine_cc: form.engine_cc ? Number(form.engine_cc) : null,
      horsepower: form.horsepower ? Number(form.horsepower) : null,
      torque_nm: form.torque_nm ? Number(form.torque_nm) : null,
      mileage_kmpl: form.mileage_kmpl ? Number(form.mileage_kmpl) : null,
      fuel_tank_liters: form.fuel_tank_liters ? Number(form.fuel_tank_liters) : null,
      safety_rating: form.safety_rating ? Number(form.safety_rating) : null,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Added variant: ${form.name}`);
    setForm({ car_id: form.car_id, name: '', ex_showroom_price: '', transmission: 'manual', engine_cc: '', horsepower: '', torque_nm: '', mileage_kmpl: '', fuel_tank_liters: '', safety_rating: '' });
    qc.invalidateQueries({ queryKey: ['admin-stats'] });
    qc.invalidateQueries({ queryKey: ['variants'] });
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-display">Add Variant</CardTitle>
        <CardDescription className="text-xs">Add a trim/variant for an existing car model.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div><Label className="text-xs">Car Model *</Label>
            <Select value={form.car_id} onValueChange={v => set('car_id', v)}>
              <SelectTrigger><SelectValue placeholder="Select car" /></SelectTrigger>
              <SelectContent>{(cars ?? []).map(c => <SelectItem key={c.id} value={c.id}>{c.brand} {c.model}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Variant Name *</Label><Input placeholder="e.g. SX(O) Turbo DCT" value={form.name} onChange={e => set('name', e.target.value)} /></div>
            <div><Label className="text-xs">Ex-Showroom Price (₹) *</Label><Input type="number" placeholder="e.g. 1500000" value={form.ex_showroom_price} onChange={e => set('ex_showroom_price', e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label className="text-xs">Transmission</Label>
              <Select value={form.transmission} onValueChange={v => set('transmission', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{['manual', 'automatic', 'cvt', 'dct', 'amt', 'imt'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Engine (cc)</Label><Input type="number" placeholder="1497" value={form.engine_cc} onChange={e => set('engine_cc', e.target.value)} /></div>
            <div><Label className="text-xs">HP</Label><Input type="number" placeholder="158" value={form.horsepower} onChange={e => set('horsepower', e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label className="text-xs">Torque (Nm)</Label><Input type="number" placeholder="253" value={form.torque_nm} onChange={e => set('torque_nm', e.target.value)} /></div>
            <div><Label className="text-xs">Mileage (kmpl)</Label><Input type="number" step="0.1" placeholder="17.0" value={form.mileage_kmpl} onChange={e => set('mileage_kmpl', e.target.value)} /></div>
            <div><Label className="text-xs">Safety Rating (1-5)</Label><Input type="number" min="1" max="5" placeholder="4" value={form.safety_rating} onChange={e => set('safety_rating', e.target.value)} /></div>
          </div>
          <div><Label className="text-xs">Fuel Tank (L)</Label><Input type="number" step="0.1" placeholder="50" value={form.fuel_tank_liters} onChange={e => set('fuel_tank_liters', e.target.value)} /></div>
          <Button type="submit" disabled={saving} className="w-full">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />} Add Variant
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

// ── Feature Form ──────────────────────────────────────────
export const FeatureForm = () => {
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', category: 'comfort', description: '',
    repair_risk: 'low', insurance_impact: 'none', practicality_score: '5',
  });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Feature name is required'); return; }
    setSaving(true);
    const { error } = await supabase.from('features').insert({
      name: form.name.trim(), category: form.category, description: form.description || null,
      repair_risk: form.repair_risk, insurance_impact: form.insurance_impact,
      practicality_score: Number(form.practicality_score),
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Added feature: ${form.name}`);
    setForm({ name: '', category: 'comfort', description: '', repair_risk: 'low', insurance_impact: 'none', practicality_score: '5' });
    qc.invalidateQueries({ queryKey: ['admin-stats'] });
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-display">Add Feature</CardTitle>
        <CardDescription className="text-xs">Add a feature to the catalog.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Feature Name *</Label><Input placeholder="e.g. Sunroof" value={form.name} onChange={e => set('name', e.target.value)} /></div>
            <div><Label className="text-xs">Category</Label>
              <Select value={form.category} onValueChange={v => set('category', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{['comfort', 'safety', 'technology', 'performance', 'exterior', 'interior', 'convenience'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label className="text-xs">Repair Risk</Label>
              <Select value={form.repair_risk} onValueChange={v => set('repair_risk', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{['low', 'medium', 'high'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Insurance Impact</Label>
              <Select value={form.insurance_impact} onValueChange={v => set('insurance_impact', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{['none', 'moderate', 'high'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Practicality (1-10)</Label><Input type="number" min="1" max="10" value={form.practicality_score} onChange={e => set('practicality_score', e.target.value)} /></div>
          </div>
          <div><Label className="text-xs">Description</Label><Textarea placeholder="What this feature does" value={form.description} onChange={e => set('description', e.target.value)} rows={2} /></div>
          <Button type="submit" disabled={saving} className="w-full">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />} Add Feature
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

// ── City Pricing Form ─────────────────────────────────────
export const CityPricingForm = () => {
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const { data: variants } = useQuery({ queryKey: ['variants-list-all'], queryFn: async () => { const { data } = await supabase.from('variants').select('id, name, car_id, cars(brand, model)' as any).order('name'); return (data ?? []) as any[]; } });
  const [form, setForm] = useState({
    variant_id: '', city: '', on_road_price: '', registration_cost: '', insurance_cost: '', road_tax: '', other_charges: '',
  });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.variant_id || !form.city || !form.on_road_price) { toast.error('Variant, city, and on-road price are required'); return; }
    setSaving(true);
    const { error } = await supabase.from('city_pricing').insert({
      variant_id: form.variant_id, city: form.city,
      on_road_price: Number(form.on_road_price),
      registration_cost: form.registration_cost ? Number(form.registration_cost) : 0,
      insurance_cost: form.insurance_cost ? Number(form.insurance_cost) : 0,
      road_tax: form.road_tax ? Number(form.road_tax) : 0,
      other_charges: form.other_charges ? Number(form.other_charges) : 0,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Added pricing for ${form.city}`);
    setForm({ variant_id: form.variant_id, city: '', on_road_price: '', registration_cost: '', insurance_cost: '', road_tax: '', other_charges: '' });
    qc.invalidateQueries({ queryKey: ['admin-stats'] });
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-display">Add City Pricing</CardTitle>
        <CardDescription className="text-xs">Set on-road pricing for a variant in a specific city.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div><Label className="text-xs">Variant *</Label>
            <Select value={form.variant_id} onValueChange={v => set('variant_id', v)}>
              <SelectTrigger><SelectValue placeholder="Select variant" /></SelectTrigger>
              <SelectContent>{(variants ?? []).map((v: any) => <SelectItem key={v.id} value={v.id}>{v.cars?.brand} {v.cars?.model} — {v.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">City *</Label>
              <Select value={form.city} onValueChange={v => set('city', v)}>
                <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
                <SelectContent>{cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">On-Road Price (₹) *</Label><Input type="number" placeholder="1800000" value={form.on_road_price} onChange={e => set('on_road_price', e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Registration (₹)</Label><Input type="number" placeholder="50000" value={form.registration_cost} onChange={e => set('registration_cost', e.target.value)} /></div>
            <div><Label className="text-xs">Insurance (₹)</Label><Input type="number" placeholder="40000" value={form.insurance_cost} onChange={e => set('insurance_cost', e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Road Tax (₹)</Label><Input type="number" placeholder="30000" value={form.road_tax} onChange={e => set('road_tax', e.target.value)} /></div>
            <div><Label className="text-xs">Other Charges (₹)</Label><Input type="number" placeholder="15000" value={form.other_charges} onChange={e => set('other_charges', e.target.value)} /></div>
          </div>
          <Button type="submit" disabled={saving} className="w-full">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />} Add City Pricing
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

// ── Variant Features Form ─────────────────────────────────
export const VariantFeaturesForm = () => {
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const { data: variants } = useQuery({ queryKey: ['variants-list-all'], queryFn: async () => { const { data } = await supabase.from('variants').select('id, name, car_id, cars(brand, model)' as any).order('name'); return (data ?? []) as any[]; } });
  const { data: features } = useQuery({ queryKey: ['features-list-all'], queryFn: async () => { const { data } = await supabase.from('features').select('id, name, category').order('name'); return data ?? []; } });
  const [form, setForm] = useState({ variant_id: '', feature_id: '', incremental_cost: '0', usefulness_score: '5', resale_impact: 'neutral' });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.variant_id || !form.feature_id) { toast.error('Variant and feature are required'); return; }
    setSaving(true);
    const { error } = await supabase.from('variant_features').insert({
      variant_id: form.variant_id, feature_id: form.feature_id,
      incremental_cost: Number(form.incremental_cost),
      usefulness_score: Number(form.usefulness_score),
      resale_impact: form.resale_impact,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Linked feature to variant');
    setForm({ variant_id: form.variant_id, feature_id: '', incremental_cost: '0', usefulness_score: '5', resale_impact: 'neutral' });
    qc.invalidateQueries({ queryKey: ['admin-stats'] });
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-display">Link Feature to Variant</CardTitle>
        <CardDescription className="text-xs">Map a feature to a variant with cost and impact details.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div><Label className="text-xs">Variant *</Label>
            <Select value={form.variant_id} onValueChange={v => set('variant_id', v)}>
              <SelectTrigger><SelectValue placeholder="Select variant" /></SelectTrigger>
              <SelectContent>{(variants ?? []).map((v: any) => <SelectItem key={v.id} value={v.id}>{v.cars?.brand} {v.cars?.model} — {v.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label className="text-xs">Feature *</Label>
            <Select value={form.feature_id} onValueChange={v => set('feature_id', v)}>
              <SelectTrigger><SelectValue placeholder="Select feature" /></SelectTrigger>
              <SelectContent>{(features ?? []).map(f => <SelectItem key={f.id} value={f.id}>{f.name} ({f.category})</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label className="text-xs">Incremental Cost (₹)</Label><Input type="number" value={form.incremental_cost} onChange={e => set('incremental_cost', e.target.value)} /></div>
            <div><Label className="text-xs">Usefulness (1-10)</Label><Input type="number" min="1" max="10" value={form.usefulness_score} onChange={e => set('usefulness_score', e.target.value)} /></div>
            <div><Label className="text-xs">Resale Impact</Label>
              <Select value={form.resale_impact} onValueChange={v => set('resale_impact', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{['positive', 'neutral', 'negative'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" disabled={saving} className="w-full">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />} Link Feature
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

// ── Depreciation Form ─────────────────────────────────────
export const DepreciationForm = () => {
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const { data: cars } = useQuery({ queryKey: ['cars-list-all'], queryFn: async () => { const { data } = await supabase.from('cars').select('id, brand, model').order('brand'); return data ?? []; } });
  const [form, setForm] = useState({ car_id: '', year1: '', year3: '', year5: '', year8: '' });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const y1 = Number(form.year1), y3 = Number(form.year3), y5 = Number(form.year5), y8 = Number(form.year8);
    if (!form.car_id || !form.year1 || !form.year3 || !form.year5 || !form.year8) { toast.error('All fields are required'); return; }
    if (!(y1 < y3 && y3 < y5 && y5 < y8)) { toast.error('Depreciation must increase: Y1 < Y3 < Y5 < Y8'); return; }
    if (y8 > 100) { toast.error('Depreciation cannot exceed 100%'); return; }
    setSaving(true);
    const entries = [
      { car_id: form.car_id, year_number: 1, depreciation_pct: y1, resale_value_pct: 100 - y1 },
      { car_id: form.car_id, year_number: 3, depreciation_pct: y3, resale_value_pct: 100 - y3 },
      { car_id: form.car_id, year_number: 5, depreciation_pct: y5, resale_value_pct: 100 - y5 },
      { car_id: form.car_id, year_number: 8, depreciation_pct: y8, resale_value_pct: 100 - y8 },
    ];
    const { error } = await supabase.from('depreciation_models').insert(entries);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Added depreciation curve');
    setForm({ car_id: form.car_id, year1: '', year3: '', year5: '', year8: '' });
    qc.invalidateQueries({ queryKey: ['admin-stats'] });
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-display">Add Depreciation</CardTitle>
        <CardDescription className="text-xs">Set year-wise depreciation % for a car model. Must be Y1 &lt; Y3 &lt; Y5 &lt; Y8.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div><Label className="text-xs">Car Model *</Label>
            <Select value={form.car_id} onValueChange={v => set('car_id', v)}>
              <SelectTrigger><SelectValue placeholder="Select car" /></SelectTrigger>
              <SelectContent>{(cars ?? []).map(c => <SelectItem key={c.id} value={c.id}>{c.brand} {c.model}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div><Label className="text-xs">Year 1 (%)</Label><Input type="number" min="0" max="100" placeholder="15" value={form.year1} onChange={e => set('year1', e.target.value)} /></div>
            <div><Label className="text-xs">Year 3 (%)</Label><Input type="number" min="0" max="100" placeholder="35" value={form.year3} onChange={e => set('year3', e.target.value)} /></div>
            <div><Label className="text-xs">Year 5 (%)</Label><Input type="number" min="0" max="100" placeholder="50" value={form.year5} onChange={e => set('year5', e.target.value)} /></div>
            <div><Label className="text-xs">Year 8 (%)</Label><Input type="number" min="0" max="100" placeholder="65" value={form.year8} onChange={e => set('year8', e.target.value)} /></div>
          </div>
          <Button type="submit" disabled={saving} className="w-full">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />} Add Depreciation
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
