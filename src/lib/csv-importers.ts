import { supabase } from '@/integrations/supabase/client';

const logAction = async (action: string, entityType: string, details: Record<string, unknown>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('admin_audit_log' as any).insert({
    admin_user_id: user.id,
    action,
    entity_type: entityType,
    details,
  } as any);
};

const createVersion = async (entityType: string, rowsAdded: number, rowsUpdated: number, snapshot: unknown) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('dataset_versions' as any).insert({
    entity_type: entityType,
    rows_added: rowsAdded,
    rows_updated: rowsUpdated,
    snapshot: snapshot as any,
    uploaded_by: user.id,
  } as any);
};

export const importCars = async (rows: Record<string, string>[]) => {
  let added = 0;
  for (const row of rows) {
    const fuelTypes = row.fuel_types?.split('|').map(s => s.trim()) || ['petrol'];
    const { error } = await supabase.from('cars').insert({
      brand: row.brand,
      model: row.model,
      fuel_type: fuelTypes[0],
      year: new Date().getFullYear(),
      body_type: row.segment || 'suv',
    } as any);
    if (!error) added++;
  }
  await createVersion('cars', added, 0, rows);
  await logAction('csv_import', 'cars', { rows_count: rows.length });
  return added;
};

export const importVariants = async (rows: Record<string, string>[]) => {
  let added = 0;
  for (const row of rows) {
    // Find car by model name
    const { data: cars } = await supabase.from('cars').select('id').ilike('model', row.car_model).limit(1);
    if (!cars?.length) continue;
    
    const { error } = await supabase.from('variants').insert({
      car_id: cars[0].id,
      name: row.variant_name,
      ex_showroom_price: Number(row.ex_showroom_price),
      transmission: row.transmission?.toLowerCase() || 'manual',
    });
    if (!error) added++;
  }
  await createVersion('variants', added, 0, rows);
  await logAction('csv_import', 'variants', { rows_count: rows.length });
  return added;
};

export const importCityPricing = async (rows: Record<string, string>[]) => {
  let added = 0;
  for (const row of rows) {
    const { data: variants } = await supabase.from('variants').select('id').ilike('name', row.variant_name).limit(1);
    if (!variants?.length) continue;

    const { error } = await supabase.from('city_pricing').insert({
      variant_id: variants[0].id,
      city: row.city,
      registration_cost: Number(row.rto) || 0,
      insurance_cost: Number(row.insurance) || 0,
      on_road_price: Number(row.onroad_price),
    });
    if (!error) added++;
  }
  await createVersion('city_pricing', added, 0, rows);
  await logAction('csv_import', 'city_pricing', { rows_count: rows.length });
  return added;
};

export const importFeatures = async (rows: Record<string, string>[]) => {
  let added = 0;
  for (const row of rows) {
    const riskMap: Record<string, string> = { '1': 'low', '2': 'low', '3': 'low', '4': 'medium', '5': 'medium', '6': 'medium', '7': 'high', '8': 'high', '9': 'high', '10': 'high' };
    const { error } = await supabase.from('features').insert({
      name: row.feature_name,
      category: row.category || 'comfort',
      description: row.description || '',
      repair_risk: riskMap[row.repair_risk_score] || 'low',
      insurance_impact: Number(row.insurance_impact_percent) > 5 ? 'moderate' : 'none',
      practicality_score: Math.round(10 - Number(row.repair_risk_score || 5)),
    });
    if (!error) added++;
  }
  await createVersion('features', added, 0, rows);
  await logAction('csv_import', 'features', { rows_count: rows.length });
  return added;
};

export const importVariantFeatures = async (rows: Record<string, string>[]) => {
  let added = 0;
  for (const row of rows) {
    const { data: variants } = await supabase.from('variants').select('id').ilike('name', row.variant_name).limit(1);
    const { data: features } = await supabase.from('features').select('id').ilike('name', row.feature_name).limit(1);
    if (!variants?.length || !features?.length) continue;

    const { error } = await supabase.from('variant_features').insert({
      variant_id: variants[0].id,
      feature_id: features[0].id,
      incremental_cost: Number(row.incremental_cost) || 0,
    });
    if (!error) added++;
  }
  await createVersion('variant_features', added, 0, rows);
  await logAction('csv_import', 'variant_features', { rows_count: rows.length });
  return added;
};

export const importDepreciation = async (rows: Record<string, string>[]) => {
  let added = 0;
  for (const row of rows) {
    const { data: cars } = await supabase.from('cars').select('id').ilike('model', row.car_model).limit(1);
    if (!cars?.length) continue;

    const years = [
      { year_number: 1, pct: Number(row.year1_percent) },
      { year_number: 3, pct: Number(row.year3_percent) },
      { year_number: 5, pct: Number(row.year5_percent) },
      { year_number: 8, pct: Number(row.year8_percent) },
    ];

    for (const y of years) {
      await supabase.from('depreciation_models').insert({
        car_id: cars[0].id,
        year_number: y.year_number,
        depreciation_pct: y.pct,
        resale_value_pct: 100 - y.pct,
      });
    }
    added++;
  }
  await createVersion('depreciation_models', added, 0, rows);
  await logAction('csv_import', 'depreciation_models', { rows_count: rows.length });
  return added;
};

export const getImporter = (type: string) => {
  const map: Record<string, (rows: Record<string, string>[]) => Promise<number>> = {
    cars: importCars,
    variants: importVariants,
    city_pricing: importCityPricing,
    features: importFeatures,
    variant_features: importVariantFeatures,
    depreciation_models: importDepreciation,
  };
  return map[type];
};
