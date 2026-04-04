import { Button } from '@/components/ui/button';
import { Download, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserManualPage = () => {
  const navigate = useNavigate();

  return (
    <div className="manual-print bg-white text-gray-900 min-h-screen">
      {/* Top bar — hidden in print */}
      <div className="print:hidden sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <Button size="sm" onClick={() => window.print()}>
          <Download className="w-4 h-4 mr-1" /> Download as PDF
        </Button>
      </div>

      <article className="max-w-3xl mx-auto px-6 py-10 print:px-0 print:py-0 print:max-w-none">
        {/* Cover */}
        <header className="text-center mb-12 print:mb-8 print:pt-16">
          <h1 className="text-4xl font-bold tracking-tight mb-2">TrimWise — User Manual</h1>
          <p className="text-lg text-gray-500">Your guide to smarter car buying decisions</p>
          <p className="text-sm text-gray-400 mt-4">Version 2.0 · April 2026</p>
        </header>

        {/* TOC */}
        <section className="mb-12 print:break-after-page">
          <h2 className="text-2xl font-semibold mb-4 border-b border-gray-200 pb-2">Table of Contents</h2>
          <ol className="list-decimal list-inside space-y-1.5 text-sm">
            <li><a href="#getting-started" className="text-blue-600 hover:underline print:text-gray-900">Getting Started</a></li>
            <li><a href="#onboarding" className="text-blue-600 hover:underline print:text-gray-900">Onboarding — Setting Your Preferences</a></li>
            <li><a href="#car-grid" className="text-blue-600 hover:underline print:text-gray-900">Browsing Cars</a></li>
            <li><a href="#variant-comparison" className="text-blue-600 hover:underline print:text-gray-900">Variant Comparison</a></li>
            <li><a href="#deep-dive" className="text-blue-600 hover:underline print:text-gray-900">Variant Deep Dive</a></li>
            <li><a href="#shortlist" className="text-blue-600 hover:underline print:text-gray-900">Your Shortlist</a></li>
            <li><a href="#chat-advisor" className="text-blue-600 hover:underline print:text-gray-900">Chat Advisor</a></li>
            <li><a href="#reset" className="text-blue-600 hover:underline print:text-gray-900">Resetting Preferences</a></li>
            <li><a href="#tips" className="text-blue-600 hover:underline print:text-gray-900">Tips &amp; Best Practices</a></li>
          </ol>
        </section>

        {/* 1. Getting Started */}
        <Section id="getting-started" title="1. Getting Started">
          <h3 className="font-semibold text-lg mt-4 mb-2">Creating Your Account</h3>
          <ol className="list-decimal list-inside space-y-1.5 ml-2">
            <li>Open the TrimWise app — you'll see the landing screen with the <strong>"Get Started"</strong> button.</li>
            <li>Tap "Get Started" and you'll be redirected to the <strong>Sign Up</strong> page.</li>
            <li>Enter your email and a strong password, then submit.</li>
            <li>Check your inbox for a <strong>verification email</strong> and click the confirmation link.</li>
            <li>Return to TrimWise and <strong>Sign In</strong> with your verified credentials.</li>
          </ol>

          <h3 className="font-semibold text-lg mt-6 mb-2">Forgot Password?</h3>
          <p>Click <strong>"Forgot password?"</strong> on the sign-in page. Enter your email, and you'll receive a password reset link. Follow the link to set a new password.</p>
        </Section>

        {/* 2. Onboarding */}
        <Section id="onboarding" title="2. Onboarding — Setting Your Preferences">
          <p>After your first login, TrimWise walks you through a 5-step onboarding flow to personalise your experience:</p>

          <h3 className="font-semibold text-lg mt-4 mb-2">Step 1: Budget Range</h3>
          <p>Set your <strong>minimum and maximum budget</strong> in Indian Rupees (₹). Use the sliders to define your price range. Cars outside this range will be filtered out.</p>

          <h3 className="font-semibold text-lg mt-4 mb-2">Step 2: Ownership Plan</h3>
          <p>How long do you plan to keep the car? Choose from <strong>3, 5, or 8 years</strong>. This affects Total Cost of Ownership (TCO) and depreciation calculations throughout the app.</p>

          <h3 className="font-semibold text-lg mt-4 mb-2">Step 3: Your City</h3>
          <p>Select your primary city from the dropdown (e.g., Mumbai, Delhi, Bengaluru). This determines <strong>on-road pricing</strong> — road tax, registration, and insurance costs vary by city.</p>

          <h3 className="font-semibold text-lg mt-4 mb-2">Step 4: Daily Usage</h3>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li><strong>Daily kilometres</strong> — Your typical daily driving distance (5–150 km)</li>
            <li><strong>Highway percentage</strong> — What fraction of your driving is highway vs city (0–100%)</li>
          </ul>

          <h3 className="font-semibold text-lg mt-4 mb-2">Step 5: About You</h3>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li><strong>Driving style</strong> — Relaxed, Balanced, or Spirited</li>
            <li><strong>Family size</strong> — Number of members (1–8), affects space recommendations</li>
            <li><strong>Tech preference</strong> — Minimal, Moderate, or Tech-savvy</li>
          </ul>

          <Tip>Be accurate here — all intelligence scores, recommendations, and feature relevance analysis are personalised based on these inputs.</Tip>
        </Section>

        {/* 3. Car Grid */}
        <Section id="car-grid" title="3. Browsing Cars">
          <p>After onboarding, you'll see the <strong>Car Grid</strong> — a gallery of car models available in the system.</p>
          <ul className="list-disc list-inside ml-2 space-y-1.5">
            <li>Each card shows the car's <strong>brand, model, body type, fuel type</strong>, and ex-showroom starting price.</li>
            <li>Use the <strong>search bar</strong> at the top to find specific models by name or brand.</li>
            <li>Tap any car card to view its <strong>variant lineup</strong>.</li>
          </ul>
        </Section>

        {/* 4. Variant Comparison */}
        <Section id="variant-comparison" title="4. Variant Comparison">
          <p>After selecting a car, you see all available <strong>variants (trims)</strong> as individual cards.</p>

          <h3 className="font-semibold text-lg mt-4 mb-2">Variant Cards</h3>
          <p>Each variant card displays:</p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>Variant name and ex-showroom price</li>
            <li>Engine specs (CC, HP, torque) and transmission type</li>
            <li>Mileage and safety rating</li>
            <li><strong>Trim Score</strong> — A composite score (0–100) reflecting overall value</li>
            <li><strong>Ownership Stress</strong> — Risk level (Low/Medium/High) based on repair complexity</li>
          </ul>

          <h3 className="font-semibold text-lg mt-4 mb-2">Compare Mode</h3>
          <p>Select two variants using the checkboxes and tap <strong>"Compare"</strong> to see a side-by-side explainer highlighting the differences between them.</p>

          <h3 className="font-semibold text-lg mt-4 mb-2">Shortlisting</h3>
          <p>Tap the <strong>♥ heart icon</strong> on any variant card to add it to your shortlist for later review.</p>

          <h3 className="font-semibold text-lg mt-4 mb-2">Deep Dive</h3>
          <p>Tap <strong>"Deep Dive"</strong> on any variant card to access the detailed analysis view.</p>
        </Section>

        {/* 5. Deep Dive */}
        <Section id="deep-dive" title="5. Variant Deep Dive">
          <p>The deep dive view provides comprehensive analysis across <strong>three tabs</strong>:</p>

          <h3 className="font-semibold text-lg mt-4 mb-2">Overview Tab</h3>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li><strong>On-Road Price Breakdown</strong> — City-specific pricing with registration, road tax, insurance, and other charges</li>
            <li><strong>Key Specs</strong> — Engine CC, transmission, mileage, and horsepower at a glance</li>
            <li><strong>Trim Score</strong> — Composite score with expandable breakdown (Feature Utility, Resale Strength, Reliability, Cost Deviation, Overpriced Penalty, Stress Factor)</li>
            <li><strong>Ownership Stress Index</strong> — Risk assessment based on feature repair complexity and insurance impact</li>
            <li><strong>AI Decision Explainer</strong> — A template-driven verdict (Strong Match / Good Fit / Consider Alternatives / Caution) with reasoning across Usage-Profile Fit, Composite Trim Analysis, Ownership Complexity, and Feature Gap Risk</li>
            <li><strong>EMI Estimate</strong> — Monthly payment calculation (80% financing, 8.5% rate, 5-year tenure)</li>
          </ul>

          <h3 className="font-semibold text-lg mt-4 mb-2">Features Tab</h3>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li><strong>Feature Cards</strong> — Each feature shows its incremental cost, usefulness score, repair risk, resale impact, and a personalised regret risk assessment</li>
            <li><strong>Feature Relevance Analysis</strong> — Summary of how each feature aligns with your driving pattern and preferences</li>
            <li><strong>Variant Delta Analyzer</strong> — Compare what you gain/lose between consecutive variants to see if the price jump is worth it</li>
          </ul>

          <h3 className="font-semibold text-lg mt-4 mb-2">Money Tab</h3>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li><strong>TCO Simulator</strong> — Total Cost of Ownership over your planned ownership period, including fuel, insurance, maintenance, and depreciation</li>
            <li><strong>EMI Estimate</strong> — Quick monthly payment reference</li>
            <li><strong>Resale Value Timeline</strong> — Year-by-year value retention with visual progress bars showing depreciation percentages and estimated resale amounts</li>
            <li><strong>Best Time to Sell</strong> — Guidance on optimal selling window</li>
          </ul>
        </Section>

        {/* 6. Shortlist */}
        <Section id="shortlist" title="6. Your Shortlist">
          <p>Access your shortlist by tapping the <strong>♥ heart icon</strong> in the top-right corner of the app.</p>
          <ul className="list-disc list-inside ml-2 space-y-1.5">
            <li>View all shortlisted variants across different car models</li>
            <li>Remove variants by tapping the heart icon again</li>
            <li>Your shortlist is saved to your account and syncs across devices</li>
          </ul>
        </Section>

        {/* 7. Chat Advisor */}
        <Section id="chat-advisor" title="7. Chat Advisor">
          <p>The <strong>AI Chat Advisor</strong> is available on the variant comparison and deep dive screens. Tap the chat bubble icon in the bottom-right corner to open the assistant. It can:</p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>Answer questions about the specific car and variant you're viewing</li>
            <li>Explain feature differences in plain language</li>
            <li>Provide personalised recommendations based on your profile</li>
            <li>Help you decide between options</li>
          </ul>
          <Tip>Be specific — e.g., "Is the Creta SX worth ₹2L more than the S?" gets better answers than "Which car should I buy?"</Tip>
        </Section>

        {/* 8. Reset */}
        <Section id="reset" title="8. Resetting Preferences">
          <p>To redo your onboarding preferences at any time:</p>
          <ol className="list-decimal list-inside ml-2 space-y-1">
            <li>Tap the <strong>"Reset"</strong> button in the top-right user bar (visible on the car grid and comparison screens).</li>
            <li>You'll be taken back through the 5-step onboarding flow.</li>
            <li>Your new preferences will update all recommendations and scores.</li>
          </ol>
          <p className="mt-2">Your shortlist and account remain intact — only the preference profile is reset.</p>
        </Section>

        {/* 9. Tips */}
        <Section id="tips" title="9. Tips & Best Practices">
          <ul className="list-disc list-inside ml-2 space-y-2">
            <li><strong>Be honest in onboarding</strong> — The more accurate your daily usage and budget inputs, the better the recommendations.</li>
            <li><strong>Compare within a model</strong> — The app is designed to compare trims within the same car model, not across models.</li>
            <li><strong>Check TCO, not just price</strong> — A cheaper variant may cost more over 5 years due to higher fuel consumption or lower resale value.</li>
            <li><strong>Use the AI Decision Explainer</strong> — It synthesises dozens of data points into a clear verdict. Trust the data.</li>
            <li><strong>Shortlist 3–5 variants</strong> — Too many options lead to decision paralysis. Narrow down, then deep-dive.</li>
            <li><strong>Check the Features tab</strong> — The regret analysis tells you if a feature is actually worth paying for based on your usage.</li>
          </ul>
        </Section>

        {/* Footer */}
        <footer className="mt-16 pt-6 border-t border-gray-200 text-center text-sm text-gray-400 print:mt-8">
          <p>TrimWise User Manual · v2.0 · © 2026 TrimWise. All rights reserved.</p>
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

export default UserManualPage;
