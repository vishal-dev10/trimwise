export interface ValidationError {
  row: number;
  column: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  parsedData: Record<string, string>[];
}

export const parseCSV = (text: string): { headers: string[]; rows: Record<string, string>[] } => {
  const lines = text.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
  const rows = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] || ''; });
    return row;
  });
  
  return { headers, rows };
};

const requiredColumns: Record<string, string[]> = {
  cars: ['brand', 'model', 'segment', 'base_price', 'fuel_types', 'engine_options'],
  variants: ['car_model', 'variant_name', 'ex_showroom_price', 'fuel_type', 'transmission'],
  city_pricing: ['variant_name', 'city', 'rto', 'insurance', 'onroad_price'],
  features: ['feature_name', 'category', 'resale_impact_percent', 'insurance_impact_percent', 'repair_risk_score', 'description'],
  variant_features: ['variant_name', 'feature_name', 'incremental_cost'],
  depreciation_models: ['car_model', 'year1_percent', 'year3_percent', 'year5_percent', 'year8_percent'],
};

export const getRequiredColumns = (type: string): string[] => requiredColumns[type] || [];

export const generateTemplate = (type: string): string => {
  const cols = requiredColumns[type];
  if (!cols) return '';
  return cols.join(',') + '\n';
};

export const validateCSV = (
  type: string,
  text: string,
  existingData?: { cars?: string[]; variants?: string[]; features?: string[] }
): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const { headers, rows } = parseCSV(text);
  const required = requiredColumns[type];

  if (!required) {
    errors.push({ row: 0, column: '', message: `Unknown CSV type: ${type}`, severity: 'error' });
    return { valid: false, errors, warnings, parsedData: rows };
  }

  // Check required columns
  const missing = required.filter(c => !headers.includes(c));
  if (missing.length > 0) {
    errors.push({ row: 0, column: '', message: `Missing columns: ${missing.join(', ')}`, severity: 'error' });
    return { valid: false, errors, warnings, parsedData: rows };
  }

  if (rows.length === 0) {
    errors.push({ row: 0, column: '', message: 'CSV has no data rows', severity: 'error' });
    return { valid: false, errors, warnings, parsedData: rows };
  }

  // Type-specific validation
  const seen = new Set<string>();

  rows.forEach((row, i) => {
    const rowNum = i + 2; // 1-indexed + header

    switch (type) {
      case 'cars': {
        const key = `${row.brand}-${row.model}`.toLowerCase();
        if (seen.has(key)) errors.push({ row: rowNum, column: 'model', message: `Duplicate car: ${row.brand} ${row.model}`, severity: 'error' });
        seen.add(key);
        if (!row.brand) errors.push({ row: rowNum, column: 'brand', message: 'Brand is required', severity: 'error' });
        if (!row.model) errors.push({ row: rowNum, column: 'model', message: 'Model is required', severity: 'error' });
        const price = Number(row.base_price);
        if (isNaN(price) || price <= 0) errors.push({ row: rowNum, column: 'base_price', message: 'Invalid base price', severity: 'error' });
        break;
      }
      case 'variants': {
        const key = `${row.car_model}-${row.variant_name}`.toLowerCase();
        if (seen.has(key)) errors.push({ row: rowNum, column: 'variant_name', message: `Duplicate variant: ${row.variant_name}`, severity: 'error' });
        seen.add(key);
        const price = Number(row.ex_showroom_price);
        if (isNaN(price) || price <= 0) errors.push({ row: rowNum, column: 'ex_showroom_price', message: 'Invalid price', severity: 'error' });
        if (!['manual', 'automatic', 'cvt', 'dct', 'amt', 'imt'].includes(row.transmission?.toLowerCase()))
          warnings.push({ row: rowNum, column: 'transmission', message: `Unusual transmission: ${row.transmission}`, severity: 'warning' });
        break;
      }
      case 'city_pricing': {
        const price = Number(row.onroad_price);
        if (isNaN(price) || price <= 0) errors.push({ row: rowNum, column: 'onroad_price', message: 'Invalid on-road price', severity: 'error' });
        const rto = Number(row.rto);
        if (isNaN(rto) || rto < 0) errors.push({ row: rowNum, column: 'rto', message: 'Invalid RTO', severity: 'error' });
        break;
      }
      case 'features': {
        const resale = Number(row.resale_impact_percent);
        if (isNaN(resale) || resale < 0 || resale > 20)
          errors.push({ row: rowNum, column: 'resale_impact_percent', message: 'Must be 0-20%', severity: 'error' });
        const insurance = Number(row.insurance_impact_percent);
        if (isNaN(insurance) || insurance < 0 || insurance > 20)
          errors.push({ row: rowNum, column: 'insurance_impact_percent', message: 'Must be 0-20%', severity: 'error' });
        const risk = Number(row.repair_risk_score);
        if (isNaN(risk) || risk < 1 || risk > 10)
          errors.push({ row: rowNum, column: 'repair_risk_score', message: 'Must be 1-10', severity: 'error' });
        break;
      }
      case 'variant_features': {
        const cost = Number(row.incremental_cost);
        if (isNaN(cost)) errors.push({ row: rowNum, column: 'incremental_cost', message: 'Invalid cost', severity: 'error' });
        if (cost < 0) warnings.push({ row: rowNum, column: 'incremental_cost', message: 'Negative cost detected', severity: 'warning' });
        if (cost > 1000000) warnings.push({ row: rowNum, column: 'incremental_cost', message: 'Unusually high cost', severity: 'warning' });
        break;
      }
      case 'depreciation_models': {
        const y1 = Number(row.year1_percent);
        const y3 = Number(row.year3_percent);
        const y5 = Number(row.year5_percent);
        const y8 = Number(row.year8_percent);
        if ([y1, y3, y5, y8].some(isNaN))
          errors.push({ row: rowNum, column: 'year1_percent', message: 'All depreciation values must be numbers', severity: 'error' });
        else if (!(y1 < y3 && y3 < y5 && y5 < y8))
          errors.push({ row: rowNum, column: 'year1_percent', message: 'Depreciation must increase: Y1 < Y3 < Y5 < Y8', severity: 'error' });
        break;
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    parsedData: rows,
  };
};
