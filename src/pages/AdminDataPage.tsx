import AdminLayout from '@/components/admin/AdminLayout';
import CSVUploader from '@/components/admin/CSVUploader';
import { CarForm, VariantForm, FeatureForm, CityPricingForm, VariantFeaturesForm, DepreciationForm } from '@/components/admin/DataEntryForms';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FormInput } from 'lucide-react';

const csvModules = [
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
        <p className="text-sm text-muted-foreground mt-1">Upload CSV files or use forms to add data to the intelligence engine.</p>
      </div>

      <Tabs defaultValue="forms" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-xs">
          <TabsTrigger value="forms" className="gap-1.5">
            <FormInput className="w-3.5 h-3.5" /> Forms
          </TabsTrigger>
          <TabsTrigger value="csv" className="gap-1.5">
            <Upload className="w-3.5 h-3.5" /> CSV Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="forms" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CarForm />
            <VariantForm />
            <FeatureForm />
            <CityPricingForm />
            <VariantFeaturesForm />
            <DepreciationForm />
          </div>
        </TabsContent>

        <TabsContent value="csv" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {csvModules.map(m => (
              <CSVUploader key={m.type} {...m} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  </AdminLayout>
);

export default AdminDataPage;
