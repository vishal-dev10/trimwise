import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const TermsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="font-display font-semibold text-foreground">Terms of Service</h1>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6 text-sm text-muted-foreground leading-relaxed">
        <p className="text-foreground font-medium">Last updated: March 8, 2026</p>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">1. Acceptance of Terms</h2>
          <p>By accessing and using TrimWise, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">2. Service Description</h2>
          <p>TrimWise is a car decision intelligence platform that provides data-driven insights for car variant selection in the Indian market. All scores, recommendations, and analyses are for informational purposes only and do not constitute financial or purchasing advice.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">3. User Accounts</h2>
          <p>You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate information during registration and keep your account information up to date.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">4. Data Accuracy</h2>
          <p>While we strive to provide accurate pricing, feature, and depreciation data, TrimWise does not guarantee the accuracy, completeness, or timeliness of any information. Prices and specifications may vary by dealer and location.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">5. Limitation of Liability</h2>
          <p>TrimWise shall not be liable for any direct, indirect, incidental, or consequential damages arising from the use of this platform or reliance on its data.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">6. Changes to Terms</h2>
          <p>We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the updated terms.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">7. Contact</h2>
          <p>For questions about these terms, please contact us through the platform.</p>
        </section>
      </main>
    </div>
  );
};

export default TermsPage;
