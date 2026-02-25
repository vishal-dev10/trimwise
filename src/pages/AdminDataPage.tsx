import AdminLayout from '@/components/admin/AdminLayout';
import CSVUploader from '@/components/admin/CSVUploader';

const modules = [
  { type: 'cars', title: 'Cars', description: 'Brand, model, segment, base price, fuel types, engine options' },
  { type: 'variants', title: 'Variants', description: 'Car model, variant name, ex-showroom price, fuel type, transmission' },
  { type: 'city_pricing', title: 'City Pricing', description: 'Variant name, city, RTO, insurance, on-road price' },
  { type: 'features', title: 'Features', description: 'Feature name, category, resale/insurance impact, repair risk, description' },
  { type: 'variant_features', title: 'Variant Features', description: 'Variant name, feature name, incremental cost' },
  { type: 'depreciation_models', title: 'Depreciation Models', description: 'Car model, year1/3/5/8 depreciation percentages' },
];

const AdminDataPage = () => (
  <AdminLayout>
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-lg font-semibold text-foreground">Data Management</h2>
        <p className="text-sm text-muted-foreground mt-1">Upload structured CSV files to populate the intelligence engine.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {modules.map(m => (
          <CSVUploader key={m.type} {...m} />
        ))}
      </div>
    </div>
  </AdminLayout>
);

export default AdminDataPage;
