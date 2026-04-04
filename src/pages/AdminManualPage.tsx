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
          <p className="text-sm text-gray-400 mt-4">Version 2.0 · April 2026</p>
        </header>

        {/* TOC */}
        <section className="mb-12 print:break-after-page">
          <h2 className="text-2xl font-semibold mb-4 border-b border-gray-200 pb-2">Table of Contents</h2>
          <ol className="list-decimal list-inside space-y-1.5 text-sm">
            <li><a href="#access" className="text-blue-600 hover:underline print:text-gray-900">Accessing the Admin Panel</a></li>
            <li><a href="#dashboard" className="text-blue-600 hover:underline print:text-gray-900">Dashboard Overview</a></li>
            <li><a href="#data-forms" className="text-blue-600 hover:underline print:text-gray-900">Data Entry — Forms</a></li>
            <li><a href="#data-csv" className="text-blue-600 hover:underline print:text-gray-900">Data Entry — CSV Upload</a></li>
            <li><a href="#versions" className="text-blue-600 hover:underline print:text-gray-900">Version History</a></li>
            <li><a href="#data-order" className="text-blue-600 hover:underline print:text-gray-900">Data Entry Order &amp; Dependencies</a></li>
            <li><a href="#security" className="text-blue-600 hover:underline print:text-gray-900">Security &amp; Roles</a></li>
            <li><a href="#best-practices" className="text-blue-600 hover:underline print:text-gray-900">Best Practices</a></li>
          </ol>
        </section>

        {/* 1. Access */}
        <Section id="access" title="1. Accessing the Admin Panel">
          <p>Admin users are <strong>automatically redirected</strong> to the admin panel upon login. Non-admin users cannot access admin routes.</p>

          <h3 className="font-semibold text-lg mt-4 mb-2">Prerequisites</h3>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>You must have a verified TrimWise account.</li>
            <li>Your account must have the <strong>admin</strong> role assigned in the database.</li>
            <li>Non-admin users attempting to access <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">/admin</code> will see an access denied message.</li>
          </ul>

          <h3 className="font-semibold text-lg mt-4 mb-2">Admin Sidebar Navigation</h3>
          <p>The sidebar provides access to all admin sections:</p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li><strong>Dashboard</strong> — Overview stats and charts</li>
            <li><strong>Data Management</strong> — Forms and CSV upload for all data entities</li>
            <li><strong>Version History</strong> — Audit trail of data changes</li>
            <li><strong>Admin Manual</strong> — This document</li>
            <li><strong>User Manual</strong> — End-user documentation</li>
            <li><strong>Back to App</strong> — Switch to the regular user view</li>
            <li><strong>Sign Out</strong> — Log out of TrimWise</li>
          </ul>
        </Section>

        {/* 2. Dashboard */}
        <Section id="dashboard" title="2. Dashboard Overview">
          <p>The dashboard provides a real-time snapshot of the TrimWise data ecosystem.</p>

          <h3 className="font-semibold text-lg mt-4 mb-2">Stats Cards</h3>
          <p>The top row displays key metrics:</p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li><strong>Total Cars</strong> — Number of active car models</li>
            <li><strong>Total Variants</strong> — Total trim variants across all cars</li>
            <li><strong>Total Features</strong> — Feature catalog size</li>
            <li><strong>Cities Covered</strong> — Number of cities with pricing data</li>
          </ul>

          <h3 className="font-semibold text-lg mt-4 mb-2">Charts</h3>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li><strong>Features by Category</strong> — Distribution of features across categories (Safety, Comfort, Technology, etc.)</li>
            <li><strong>Cars by Segment</strong> — Breakdown of car models by market segment</li>
          </ul>

          <h3 className="font-semibold text-lg mt-4 mb-2">Intelligence Widgets</h3>
          <p>Below the charts, three analytical widgets provide deeper insights:</p>
          <ul className="list-disc list-inside ml-2 space-y-1.5">
            <li><strong>Avg Ownership Stress by Segment</strong> — Horizontal bar chart showing mean Ownership Stress Index across segments</li>
            <li><strong>Most Overpriced Variants</strong> — Ranked list of variants whose price exceeds segment average, with percentage premium</li>
            <li><strong>Feature Regret Frequency</strong> — Heatmap of high-demand features most frequently missing from variants</li>
          </ul>
        </Section>

        {/* 3. Forms */}
        <Section id="data-forms" title="3. Data Entry — Forms">
          <p>Navigate to <strong>Data Management → Forms</strong> tab to add individual records. Six form types are available:</p>

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
          <p>This links a feature from the catalog to a specific variant with per-variant pricing:</p>
          <TableSpec rows={[
            ['Variant', 'Dropdown', 'Required — Select from existing variants'],
            ['Feature', 'Dropdown', 'Required — Select from feature catalog'],
            ['Incremental Cost (₹)', 'Number', 'Optional — Cost this feature adds to this specific variant'],
            ['Usefulness Score', 'Number', 'Optional — 1 to 10'],
            ['Resale Impact', 'Select', 'Positive, Neutral, Negative'],
          ]} />
          <Tip>The incremental cost is per-variant. A sunroof on a Creta can have a different cost than on a Harrier. Calculate it as the price difference between the variant with and without the feature.</Tip>

          <h3 className="font-semibold text-lg mt-4 mb-2">Add Depreciation Model</h3>
          <TableSpec rows={[
            ['Car', 'Dropdown', 'Required — Select from existing cars'],
            ['Year 1 Depreciation %', 'Number', 'Required — Must be less than Year 3'],
            ['Year 3 Depreciation %', 'Number', 'Required — Must be between Y1 and Y5'],
            ['Year 5 Depreciation %', 'Number', 'Required — Must be between Y3 and Y8'],
            ['Year 8 Depreciation %', 'Number', 'Required — Must be greater than Y5'],
          ]} />
          <Tip>The depreciation curve must be monotonically increasing: Y1 &lt; Y3 &lt; Y5 &lt; Y8.</Tip>
        </Section>

        {/* 4. CSV */}
        <Section id="data-csv" title="4. Data Entry — CSV Upload">
          <p>Navigate to <strong>Data Management → CSV Upload</strong> tab for bulk data imports.</p>

          <h3 className="font-semibold text-lg mt-4 mb-2">How It Works</h3>
          <ol className="list-decimal list-inside ml-2 space-y-1.5">
            <li>Select the appropriate CSV module (Cars, Variants, City Pricing, Features, Variant Features, or Depreciation Models).</li>
            <li>Click <strong>"Choose File"</strong> and select your CSV file.</li>
            <li>The system validates the file structure and data types.</li>
            <li>If validation passes, click <strong>"Upload"</strong> to import.</li>
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

        {/* 5. Versions */}
        <Section id="versions" title="5. Version History">
          <p>Navigate to <strong>Version History</strong> in the admin sidebar to view the audit trail.</p>
          <ul className="list-disc list-inside ml-2 space-y-1.5">
            <li>Every CSV upload creates a new <strong>dataset version</strong> with a version number, timestamp, and upload summary.</li>
            <li>The summary shows <strong>rows added, updated, and deleted</strong> for each operation.</li>
            <li>Versions are grouped by entity type (Cars, Variants, Features, etc.).</li>
          </ul>
        </Section>

        {/* 6. Data Order */}
        <Section id="data-order" title="6. Data Entry Order & Dependencies">
          <p>Data must be entered in a specific order due to relational dependencies:</p>
          <ol className="list-decimal list-inside ml-2 space-y-1.5">
            <li><strong>Cars</strong> — Add car models first (no dependencies)</li>
            <li><strong>Variants</strong> — Requires a parent car to exist</li>
            <li><strong>Features</strong> — Add to the feature catalog (no dependencies)</li>
            <li><strong>Variant Features</strong> — Requires both a variant and a feature to exist</li>
            <li><strong>City Pricing</strong> — Requires a variant to exist</li>
            <li><strong>Depreciation Models</strong> — Requires a car to exist</li>
          </ol>
          <Warning>Adding data out of order will result in errors. For example, you cannot add city pricing before the variant exists.</Warning>
        </Section>

        {/* 7. Security */}
        <Section id="security" title="7. Security & Roles">
          <h3 className="font-semibold text-lg mt-4 mb-2">Role-Based Access</h3>
          <p>TrimWise uses two roles:</p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li><strong>user</strong> — Default role. Can browse cars, compare variants, use intelligence features, and manage their shortlist.</li>
            <li><strong>admin</strong> — Full access to admin panel, data management, CSV uploads, and version history. Auto-redirected to admin panel on login.</li>
          </ul>

          <h3 className="font-semibold text-lg mt-4 mb-2">Row-Level Security</h3>
          <p>All database tables have security policies ensuring:</p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>Car, variant, feature, and pricing data is publicly readable</li>
            <li>Users can only manage their own profiles and shortlists</li>
            <li>Only admins can insert, update, or delete core data tables</li>
          </ul>

          <Warning>Never grant admin access via client-side checks. Admin status is always verified server-side.</Warning>
        </Section>

        {/* 8. Best Practices */}
        <Section id="best-practices" title="8. Best Practices">
          <ul className="list-disc list-inside ml-2 space-y-2">
            <li><strong>Follow the data entry order</strong> — Cars → Variants → Features → Variant Features → City Pricing → Depreciation.</li>
            <li><strong>Use verified sources</strong> — Official brand websites, Team-BHP, and Autocar India for specs. CarWale and Cars24 for depreciation trends.</li>
            <li><strong>Calculate incremental costs accurately</strong> — Compare consecutive variant prices to determine what each feature costs on that specific model.</li>
            <li><strong>Validate depreciation curves</strong> — Ensure Y1 &lt; Y3 &lt; Y5 &lt; Y8 for realistic modelling.</li>
            <li><strong>Use forms for small updates, CSV for bulk</strong> — Forms are ideal for 1–5 records; CSV is better for 10+ records.</li>
            <li><strong>Keep city pricing current</strong> — Road tax and registration costs change frequently. Update at least quarterly.</li>
            <li><strong>Test after adding data</strong> — Use "Back to App" to browse as a regular user and verify scores and comparisons look correct.</li>
          </ul>
        </Section>

        <footer className="mt-16 pt-6 border-t border-gray-200 text-center text-sm text-gray-400 print:mt-8">
          <p>TrimWise Admin Manual · v2.0 · © 2026 TrimWise. All rights reserved.</p>
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
