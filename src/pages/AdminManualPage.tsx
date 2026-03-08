import { Button } from '@/components/ui/button';
import { Download, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminManualPage = () => {
  const navigate = useNavigate();

  return (
    <div className="manual-print bg-white text-gray-900 min-h-screen">
      <div className="print:hidden sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <Button size="sm" onClick={() => window.print()}>
          <Download className="w-4 h-4 mr-1" /> Download as PDF
        </Button>
      </div>

      <article className="max-w-3xl mx-auto px-6 py-10 print:px-0 print:py-0 print:max-w-none">
        <header className="text-center mb-12 print:mb-8 print:pt-16">
          <h1 className="text-4xl font-bold tracking-tight mb-2">TrimWise — Admin Manual</h1>
          <p className="text-lg text-gray-500">Data management &amp; intelligence operations guide</p>
          <p className="text-sm text-gray-400 mt-4">Version 1.0 · March 2026</p>
        </header>

        {/* TOC */}
        <section className="mb-12 print:break-after-page">
          <h2 className="text-2xl font-semibold mb-4 border-b border-gray-200 pb-2">Table of Contents</h2>
          <ol className="list-decimal list-inside space-y-1.5 text-sm">
            <li><a href="#access" className="text-blue-600 hover:underline print:text-gray-900">Accessing the Admin Panel</a></li>
            <li><a href="#dashboard" className="text-blue-600 hover:underline print:text-gray-900">Dashboard Overview</a></li>
            <li><a href="#intelligence" className="text-blue-600 hover:underline print:text-gray-900">Intelligence Widgets</a></li>
            <li><a href="#forms" className="text-blue-600 hover:underline print:text-gray-900">Data Entry — Forms</a></li>
            <li><a href="#csv" className="text-blue-600 hover:underline print:text-gray-900">Data Entry — CSV Upload</a></li>
            <li><a href="#versions" className="text-blue-600 hover:underline print:text-gray-900">Version History</a></li>
            <li><a href="#security" className="text-blue-600 hover:underline print:text-gray-900">Security &amp; Roles</a></li>
            <li><a href="#best-practices" className="text-blue-600 hover:underline print:text-gray-900">Best Practices</a></li>
          </ol>
        </section>

        {/* 1. Access */}
        <Section id="access" title="1. Accessing the Admin Panel">
          <p>The admin panel is accessible at <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">/admin</code>.</p>
          <h3 className="font-semibold text-lg mt-4 mb-2">Prerequisites</h3>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>You must have a verified TrimWise account.</li>
            <li>Your account must have the <strong>admin</strong> role assigned in the <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">user_roles</code> table.</li>
            <li>Non-admin users attempting to access <code>/admin</code> will see an access denied message.</li>
          </ul>

          <h3 className="font-semibold text-lg mt-4 mb-2">Admin Sidebar Navigation</h3>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li><strong>Dashboard</strong> — Overview stats and intelligence widgets</li>
            <li><strong>Data Management</strong> — Forms and CSV upload for all data entities</li>
            <li><strong>Version History</strong> — Audit trail of data changes</li>
          </ul>
        </Section>

        {/* 2. Dashboard */}
        <Section id="dashboard" title="2. Dashboard Overview">
          <p>The dashboard provides a real-time snapshot of the TrimWise data ecosystem.</p>

          <h3 className="font-semibold text-lg mt-4 mb-2">Stats Cards</h3>
          <p>The top row displays key metrics:</p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li><strong>Total Cars</strong> — Number of active car models in the system</li>
            <li><strong>Total Variants</strong> — Total trim variants across all cars</li>
            <li><strong>Total Features</strong> — Feature catalog size</li>
            <li><strong>Cities Covered</strong> — Number of cities with pricing data</li>
          </ul>

          <h3 className="font-semibold text-lg mt-4 mb-2">Charts</h3>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li><strong>Features by Category</strong> — Distribution of features across categories (Safety, Comfort, Technology, etc.)</li>
            <li><strong>Cars by Segment</strong> — Breakdown of car models by market segment</li>
          </ul>
        </Section>

        {/* 3. Intelligence */}
        <Section id="intelligence" title="3. Intelligence Widgets">
          <p>Below the main dashboard, three intelligence widgets provide deeper analytical insights:</p>

          <h3 className="font-semibold text-lg mt-4 mb-2">Average Ownership Stress by Segment</h3>
          <p>A horizontal bar chart showing the mean Ownership Stress Index across car segments. Higher values indicate segments with more complex ownership (higher repair risks, insurance impacts, tech complexity).</p>
          <Tip>Use this to identify which segments may need better feature curation or pricing adjustments.</Tip>

          <h3 className="font-semibold text-lg mt-4 mb-2">Most Overpriced Variants</h3>
          <p>A ranked list of variants whose ex-showroom price exceeds the segment average by the highest percentage. Each entry shows:</p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>Variant name and parent car model</li>
            <li>Percentage premium over segment average</li>
            <li>Actual price vs segment average price</li>
          </ul>

          <h3 className="font-semibold text-lg mt-4 mb-2">Feature Regret Frequency</h3>
          <p>A colour-coded heatmap showing which high-demand features are most frequently missing from variants. Features are ranked by how often users would "regret" not having them based on profile analysis.</p>
        </Section>

        {/* 4. Forms */}
        <Section id="forms" title="4. Data Entry — Forms">
          <p>Navigate to <strong>Data Management → Forms</strong> tab to add individual records.</p>

          <h3 className="font-semibold text-lg mt-4 mb-2">Add Car</h3>
          <TableSpec rows={[
            ['Brand', 'Text', 'Required — e.g., Hyundai, Tata, Maruti Suzuki'],
            ['Model', 'Text', 'Required — e.g., Creta, Nexon, Brezza'],
            ['Year', 'Number', 'Required — Model year (e.g., 2025)'],
            ['Body Type', 'Select', 'SUV, Sedan, Hatchback, MPV, Coupe'],
            ['Fuel Type', 'Select', 'Petrol, Diesel, Hybrid, Electric, CNG'],
            ['Segment', 'Text', 'Optional — e.g., Compact SUV, Mid-Size Sedan'],
            ['Description', 'Textarea', 'Optional — Brief model description'],
          ]} />

          <h3 className="font-semibold text-lg mt-4 mb-2">Add Variant</h3>
          <TableSpec rows={[
            ['Car', 'Dropdown', 'Required — Select from existing cars'],
            ['Variant Name', 'Text', 'Required — e.g., SX(O) Turbo DCT'],
            ['Ex-Showroom Price (₹)', 'Number', 'Required — Price in Rupees'],
            ['Transmission', 'Select', 'Manual or Automatic'],
            ['Engine CC', 'Number', 'Optional — Engine displacement'],
            ['Horsepower', 'Number', 'Optional — BHP'],
            ['Torque (Nm)', 'Number', 'Optional — Newton-metres'],
            ['Mileage (km/l)', 'Number', 'Optional — ARAI certified'],
            ['Safety Rating', 'Number', 'Optional — NCAP rating (0–5)'],
            ['Fuel Tank (L)', 'Number', 'Optional — Litres'],
          ]} />

          <h3 className="font-semibold text-lg mt-4 mb-2">Add Feature</h3>
          <TableSpec rows={[
            ['Feature Name', 'Text', 'Required — e.g., Sunroof, ADAS, Ventilated Seats'],
            ['Category', 'Select', 'Safety, Comfort, Technology, Exterior, Interior, Performance, Convenience'],
            ['Practicality Score', 'Number', 'Optional — 1 to 10'],
            ['Repair Risk', 'Select', 'Low, Medium, High'],
            ['Insurance Impact', 'Select', 'None, Low, Medium, High'],
            ['Description', 'Textarea', 'Optional'],
          ]} />

          <h3 className="font-semibold text-lg mt-4 mb-2">Add City Pricing</h3>
          <TableSpec rows={[
            ['Variant', 'Dropdown', 'Required — Select from existing variants'],
            ['City', 'Select', 'Mumbai, Delhi, Bengaluru, Chennai, Hyderabad, Kolkata, Pune, Ahmedabad'],
            ['On-Road Price (₹)', 'Number', 'Required'],
            ['Road Tax (₹)', 'Number', 'Optional'],
            ['Registration (₹)', 'Number', 'Optional'],
            ['Insurance (₹)', 'Number', 'Optional'],
          ]} />

          <h3 className="font-semibold text-lg mt-4 mb-2">Link Variant Features</h3>
          <TableSpec rows={[
            ['Variant', 'Dropdown', 'Required — Select from existing variants'],
            ['Feature', 'Dropdown', 'Required — Select from feature catalog'],
            ['Incremental Cost (₹)', 'Number', 'Optional — Cost this feature adds'],
            ['Usefulness Score', 'Number', 'Optional — 1 to 10'],
            ['Resale Impact', 'Select', 'Positive, Neutral, Negative'],
          ]} />

          <h3 className="font-semibold text-lg mt-4 mb-2">Add Depreciation Model</h3>
          <TableSpec rows={[
            ['Car', 'Dropdown', 'Required — Select from existing cars'],
            ['Year 1 Depreciation %', 'Number', 'Required — Must be less than Year 3'],
            ['Year 3 Depreciation %', 'Number', 'Required — Must be between Y1 and Y5'],
            ['Year 5 Depreciation %', 'Number', 'Required — Must be between Y3 and Y8'],
            ['Year 8 Depreciation %', 'Number', 'Required — Must be greater than Y5'],
          ]} />
          <Tip>The depreciation curve must be monotonically increasing: Y1 &lt; Y3 &lt; Y5 &lt; Y8. The form validates this before submission.</Tip>
        </Section>

        {/* 5. CSV */}
        <Section id="csv" title="5. Data Entry — CSV Upload">
          <p>Navigate to <strong>Data Management → CSV Upload</strong> tab for bulk data imports.</p>

          <h3 className="font-semibold text-lg mt-4 mb-2">How CSV Upload Works</h3>
          <ol className="list-decimal list-inside ml-2 space-y-1.5">
            <li>Select the appropriate CSV module (Cars, Variants, City Pricing, etc.).</li>
            <li>Click <strong>"Choose File"</strong> and select your CSV file.</li>
            <li>The system validates the file structure and data types.</li>
            <li>If validation passes, click <strong>"Upload"</strong> to import the data.</li>
            <li>A success message confirms the number of rows imported.</li>
          </ol>

          <h3 className="font-semibold text-lg mt-4 mb-2">CSV Column Requirements</h3>

          <h4 className="font-medium mt-3 mb-1">Cars CSV</h4>
          <p className="text-xs font-mono bg-gray-50 p-2 rounded">brand, model, year, body_type, fuel_type, segment, description, engine_options, image_url</p>

          <h4 className="font-medium mt-3 mb-1">Variants CSV</h4>
          <p className="text-xs font-mono bg-gray-50 p-2 rounded">car_id, name, ex_showroom_price, transmission, engine_cc, horsepower, torque_nm, mileage_kmpl, safety_rating, fuel_tank_liters</p>

          <h4 className="font-medium mt-3 mb-1">City Pricing CSV</h4>
          <p className="text-xs font-mono bg-gray-50 p-2 rounded">variant_id, city, on_road_price, road_tax, registration_cost, insurance_cost, other_charges</p>

          <h4 className="font-medium mt-3 mb-1">Features CSV</h4>
          <p className="text-xs font-mono bg-gray-50 p-2 rounded">name, category, practicality_score, repair_risk, insurance_impact, description, plain_explanation</p>

          <h4 className="font-medium mt-3 mb-1">Variant Features CSV</h4>
          <p className="text-xs font-mono bg-gray-50 p-2 rounded">variant_id, feature_id, incremental_cost, usefulness_score, resale_impact</p>

          <h4 className="font-medium mt-3 mb-1">Depreciation Models CSV</h4>
          <p className="text-xs font-mono bg-gray-50 p-2 rounded">car_id, year_number, depreciation_pct, resale_value_pct</p>

          <Tip>Always use UTF-8 encoding. The first row must be the header row. Empty optional columns are acceptable.</Tip>
        </Section>

        {/* 6. Versions */}
        <Section id="versions" title="6. Version History">
          <p>Navigate to <strong>Version History</strong> in the admin sidebar to view the audit trail.</p>
          <ul className="list-disc list-inside ml-2 space-y-1.5">
            <li>Every CSV upload creates a new <strong>dataset version</strong> with a version number, timestamp, and upload summary.</li>
            <li>The summary shows <strong>rows added, updated, and deleted</strong> for each operation.</li>
            <li>Versions are grouped by entity type (Cars, Variants, Features, etc.).</li>
            <li>Admin actions are also logged in the <strong>audit log</strong> for accountability.</li>
          </ul>
        </Section>

        {/* 7. Security */}
        <Section id="security" title="7. Security & Roles">
          <h3 className="font-semibold text-lg mt-4 mb-2">Role-Based Access</h3>
          <p>TrimWise uses a separate <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">user_roles</code> table with two roles:</p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li><strong>user</strong> — Default role. Can browse cars, compare variants, use intelligence features, manage shortlist.</li>
            <li><strong>admin</strong> — Full access to admin panel, data management, CSV uploads, and version history.</li>
          </ul>

          <h3 className="font-semibold text-lg mt-4 mb-2">Row-Level Security (RLS)</h3>
          <p>All database tables have RLS policies ensuring:</p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>Users can only read car/variant/feature data (public read access)</li>
            <li>Users can only manage their own profiles and shortlists</li>
            <li>Only admins can insert, update, or delete data in core tables</li>
            <li>Admin role checks use a <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">has_role()</code> security definer function to prevent RLS recursion</li>
          </ul>

          <Warning>Never grant admin access via client-side checks or hardcoded credentials. Admin status must always be verified server-side through the user_roles table.</Warning>
        </Section>

        {/* 8. Best Practices */}
        <Section id="best-practices" title="8. Best Practices">
          <ul className="list-disc list-inside ml-2 space-y-2">
            <li><strong>Add cars before variants</strong> — Variants require a parent car. Always create the car record first.</li>
            <li><strong>Add features before linking</strong> — The variant-features form requires both a variant and a feature to exist.</li>
            <li><strong>Validate depreciation curves</strong> — Ensure Y1 &lt; Y3 &lt; Y5 &lt; Y8 for realistic depreciation modelling.</li>
            <li><strong>Use forms for small updates, CSV for bulk</strong> — Forms are ideal for adding 1–5 records; CSV is better for 10+ records.</li>
            <li><strong>Check version history after uploads</strong> — Verify the row counts match your expectations.</li>
            <li><strong>Keep city pricing current</strong> — Road tax and registration costs change frequently. Update at least quarterly.</li>
            <li><strong>Test with the user view</strong> — After adding data, browse the app as a regular user to verify scores and comparisons look correct.</li>
          </ul>
        </Section>

        <footer className="mt-16 pt-6 border-t border-gray-200 text-center text-sm text-gray-400 print:mt-8">
          <p>TrimWise Admin Manual · v1.0 · © 2026 TrimWise. All rights reserved.</p>
        </footer>
      </article>
    </div>
  );
};

const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
  <section id={id} className="mb-10 print:break-inside-avoid">
    <h2 className="text-2xl font-semibold mb-3 border-b border-gray-200 pb-2">{title}</h2>
    <div className="text-sm leading-relaxed text-gray-700 space-y-2">{children}</div>
  </section>
);

const Tip = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r text-sm text-blue-800 print:bg-gray-50 print:border-gray-400 print:text-gray-700">
    <strong>💡 Tip:</strong> {children}
  </div>
);

const Warning = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-3 p-3 bg-red-50 border-l-4 border-red-400 rounded-r text-sm text-red-800 print:bg-gray-50 print:border-gray-400 print:text-gray-700">
    <strong>⚠️ Warning:</strong> {children}
  </div>
);

const TableSpec = ({ rows }: { rows: string[][] }) => (
  <div className="mt-2 overflow-x-auto">
    <table className="w-full text-xs border border-gray-200 rounded">
      <thead>
        <tr className="bg-gray-50">
          <th className="text-left px-3 py-1.5 border-b border-gray-200 font-medium">Field</th>
          <th className="text-left px-3 py-1.5 border-b border-gray-200 font-medium">Type</th>
          <th className="text-left px-3 py-1.5 border-b border-gray-200 font-medium">Notes</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className={i % 2 === 1 ? 'bg-gray-50/50' : ''}>
            <td className="px-3 py-1.5 border-b border-gray-100 font-medium">{row[0]}</td>
            <td className="px-3 py-1.5 border-b border-gray-100 text-gray-500">{row[1]}</td>
            <td className="px-3 py-1.5 border-b border-gray-100">{row[2]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default AdminManualPage;
