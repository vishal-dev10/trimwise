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
          <p className="text-sm text-gray-400 mt-4">Version 1.0 · March 2026</p>
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
            <li>Open the TrimWise app — you'll see the splash screen with the <strong>"Get Started"</strong> button.</li>
            <li>You'll be redirected to the <strong>Sign Up</strong> page. Enter your email and a strong password.</li>
            <li>Check your inbox for a <strong>verification email</strong> and click the confirmation link.</li>
            <li>Return to TrimWise and <strong>Sign In</strong> with your verified credentials.</li>
          </ol>
          <Tip>You can also sign in with Google for a faster experience.</Tip>

          <h3 className="font-semibold text-lg mt-6 mb-2">Forgot Password?</h3>
          <p>Click <strong>"Forgot password?"</strong> on the sign-in page. Enter your email, and you'll receive a password reset link. Follow the link to set a new password.</p>
        </Section>

        {/* 2. Onboarding */}
        <Section id="onboarding" title="2. Onboarding — Setting Your Preferences">
          <p>After your first login, TrimWise walks you through a quick onboarding flow to personalise your experience. Here's what each step captures:</p>

          <h3 className="font-semibold text-lg mt-4 mb-2">Step 1: Budget Range</h3>
          <p>Set your <strong>minimum and maximum budget</strong> in Indian Rupees (₹). This filters the car grid to show only models within your price range. You can use the dual-slider or type exact values.</p>

          <h3 className="font-semibold text-lg mt-4 mb-2">Step 2: Ownership Plan</h3>
          <p>How long do you plan to keep the car? Choose from <strong>3, 5, 7, or 10+ years</strong>. This directly affects the Total Cost of Ownership (TCO) and depreciation calculations.</p>

          <h3 className="font-semibold text-lg mt-4 mb-2">Step 3: City</h3>
          <p>Select your primary city (e.g., Mumbai, Delhi, Bengaluru). City selection affects <strong>on-road pricing</strong> (road tax, registration, insurance) and fuel cost estimates.</p>

          <h3 className="font-semibold text-lg mt-4 mb-2">Step 4: Daily Usage</h3>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li><strong>Daily kilometres</strong> — Your typical daily driving distance</li>
            <li><strong>Highway percentage</strong> — What fraction of driving is highway vs city</li>
          </ul>

          <h3 className="font-semibold text-lg mt-4 mb-2">Step 5: Lifestyle &amp; Tech</h3>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li><strong>Driving style</strong> — Calm, Balanced, or Spirited</li>
            <li><strong>Family size</strong> — Affects space and safety recommendations</li>
            <li><strong>Tech preference</strong> — Minimal, Moderate, or Tech-heavy</li>
          </ul>

          <h3 className="font-semibold text-lg mt-4 mb-2">Step 6: Future Plans</h3>
          <p>Do you plan to <strong>keep</strong>, <strong>upgrade</strong>, or <strong>sell</strong> after your ownership period? This influences resale value weighting in the intelligence scores.</p>

          <h3 className="font-semibold text-lg mt-4 mb-2">Step 7: Financial Fit</h3>
          <p>Optional financial details (monthly income, existing EMIs) to gauge your <strong>Financial Stretch</strong> — how comfortably the car fits your budget.</p>
        </Section>

        {/* 3. Car Grid */}
        <Section id="car-grid" title="3. Browsing Cars">
          <p>After onboarding, you'll see the <strong>Car Grid</strong> — a filterable gallery of cars matching your budget.</p>
          <ul className="list-disc list-inside ml-2 space-y-1.5">
            <li>Each card shows the car's <strong>brand, model, body type, fuel type</strong>, and a starting price.</li>
            <li>Use the <strong>search bar</strong> to find specific models.</li>
            <li>Filter by <strong>fuel type, body type, brand,</strong> or <strong>segment</strong>.</li>
            <li>Tap a car card to view its <strong>variant lineup</strong>.</li>
          </ul>
        </Section>

        {/* 4. Variant Comparison */}
        <Section id="variant-comparison" title="4. Variant Comparison">
          <p>Once you select a car, you see all available <strong>variants/trims</strong> side by side.</p>

          <h3 className="font-semibold text-lg mt-4 mb-2">Variant Cards</h3>
          <p>Each variant card displays:</p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>Variant name and ex-showroom price</li>
            <li>Engine specs (CC, HP, torque)</li>
            <li>Transmission type and mileage</li>
            <li>Safety rating</li>
            <li><strong>Trim Score</strong> — A composite score (0–100) showing overall value</li>
          </ul>

          <h3 className="font-semibold text-lg mt-4 mb-2">Compare Mode</h3>
          <p>Select two or more variants and tap <strong>"Compare"</strong> to see a detailed side-by-side view with feature differences highlighted.</p>

          <h3 className="font-semibold text-lg mt-4 mb-2">Shortlisting</h3>
          <p>Tap the <strong>♥ heart icon</strong> on any variant card to add it to your shortlist for later review.</p>
        </Section>

        {/* 5. Deep Dive */}
        <Section id="deep-dive" title="5. Variant Deep Dive">
          <p>Tap <strong>"Deep Dive"</strong> on any variant to access comprehensive analysis across three tabs:</p>

          <h3 className="font-semibold text-lg mt-4 mb-2">Overview Tab</h3>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>Full specifications and feature list</li>
            <li>Trim Score breakdown (Feature Utility, Resale Strength, On-Road Value, Reliability)</li>
            <li>Ownership Stress Index — risk level based on repair complexity and insurance impact</li>
          </ul>

          <h3 className="font-semibold text-lg mt-4 mb-2">Costs Tab</h3>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li><strong>TCO Simulator</strong> — Total Cost of Ownership over your planned ownership period, including fuel, insurance, maintenance, depreciation, and resale</li>
            <li><strong>EMI Calculator</strong> — Monthly payment estimates based on down payment and loan tenure</li>
            <li><strong>Depreciation Forecast</strong> — Year-by-year value loss with visual chart</li>
            <li><strong>Financial Stretch Meter</strong> — How this car fits your monthly budget</li>
          </ul>

          <h3 className="font-semibold text-lg mt-4 mb-2">Intelligence Tab</h3>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li><strong>AI Decision Explainer</strong> — A template-driven verdict (Strong Match / Good Fit / Consider Alternatives / Caution) with four reasoning blocks:
              <ol className="list-decimal list-inside ml-4 mt-1 space-y-0.5">
                <li>Usage-Profile Fit</li>
                <li>Composite Trim Analysis</li>
                <li>Ownership Complexity</li>
                <li>Feature Gap Risk</li>
              </ol>
            </li>
            <li><strong>Feature Worth Analysis</strong> — Whether each feature justifies its incremental cost</li>
            <li><strong>Ownership Story</strong> — A narrative projection of your ownership experience</li>
            <li><strong>Negotiation Tips</strong> — AI-generated talking points for dealer negotiations</li>
          </ul>
        </Section>

        {/* 6. Shortlist */}
        <Section id="shortlist" title="6. Your Shortlist">
          <p>Access your shortlist by tapping the <strong>♥ heart icon</strong> in the top-right corner of the app.</p>
          <ul className="list-disc list-inside ml-2 space-y-1.5">
            <li>View all shortlisted variants across different car models</li>
            <li>Compare shortlisted variants side by side</li>
            <li>Remove variants by tapping the heart icon again</li>
            <li>Your shortlist is saved to your account and syncs across devices</li>
          </ul>
        </Section>

        {/* 7. Chat Advisor */}
        <Section id="chat-advisor" title="7. Chat Advisor">
          <p>The <strong>AI Chat Advisor</strong> is available on the car browsing and comparison screens. Tap the chat icon to open a conversational assistant that can:</p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>Answer questions about specific cars or variants</li>
            <li>Explain feature differences in plain language</li>
            <li>Provide personalised recommendations based on your profile</li>
            <li>Help you decide between shortlisted options</li>
          </ul>
          <Tip>Be specific in your questions — e.g., "Is the Creta SX worth ₹2L more than the S?" gets better answers than "Which car should I buy?"</Tip>
        </Section>

        {/* 8. Reset */}
        <Section id="reset" title="8. Resetting Preferences">
          <p>To redo your onboarding preferences at any time:</p>
          <ol className="list-decimal list-inside ml-2 space-y-1">
            <li>Tap the <strong>"Reset"</strong> button in the top-right user bar.</li>
            <li>You'll be taken back through the onboarding flow.</li>
            <li>Your new preferences will update all recommendations and scores.</li>
          </ol>
          <p className="mt-2">Your shortlist and account remain intact — only the preference profile is reset.</p>
        </Section>

        {/* 9. Tips */}
        <Section id="tips" title="9. Tips & Best Practices">
          <ul className="list-disc list-inside ml-2 space-y-2">
            <li><strong>Be honest in onboarding</strong> — The more accurate your daily usage and budget inputs, the better the recommendations.</li>
            <li><strong>Compare within a segment</strong> — Comparing a hatchback to an SUV isn't as useful as comparing trims within the same model.</li>
            <li><strong>Check TCO, not just price</strong> — A cheaper variant may cost more over 5 years due to higher fuel consumption or lower resale value.</li>
            <li><strong>Use the Intelligence tab</strong> — The AI Decision Explainer synthesises dozens of data points into a clear verdict. Trust the data.</li>
            <li><strong>Shortlist 3–5 variants</strong> — Too many options lead to decision paralysis. Narrow down, then deep-dive.</li>
          </ul>
        </Section>

        {/* Footer */}
        <footer className="mt-16 pt-6 border-t border-gray-200 text-center text-sm text-gray-400 print:mt-8">
          <p>TrimWise User Manual · v1.0 · © 2026 TrimWise. All rights reserved.</p>
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
