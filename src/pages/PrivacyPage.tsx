import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const PrivacyPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="font-display font-semibold text-foreground">Privacy Policy</h1>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6 text-sm text-muted-foreground leading-relaxed">
        <p className="text-foreground font-medium">Last updated: March 8, 2026</p>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">1. Information We Collect</h2>
          <p>We collect information you provide directly: email address, car preferences (budget, city, usage patterns, family size), and shortlisted vehicles. We also collect usage data such as pages visited and features used.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">2. How We Use Your Information</h2>
          <p>Your data is used to provide personalized car recommendations, calculate ownership costs, and improve the platform. We do not sell your personal information to third parties.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">3. Data Storage & Security</h2>
          <p>Your data is stored securely using industry-standard encryption and access controls. We use row-level security policies to ensure users can only access their own data.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">4. Cookies & Local Storage</h2>
          <p>We use local storage for session management and temporary UI preferences. No third-party tracking cookies are used.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">5. Your Rights</h2>
          <p>You can request access to, correction of, or deletion of your personal data at any time by contacting us. You can also delete your account, which will remove all associated data.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">6. Third-Party Services</h2>
          <p>We use third-party services for authentication and AI-powered features. These services have their own privacy policies governing data handling.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">7. Changes to This Policy</h2>
          <p>We may update this privacy policy from time to time. We will notify you of any material changes through the platform.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">8. Contact</h2>
          <p>For privacy-related inquiries, please contact us through the platform.</p>
        </section>
      </main>
    </div>
  );
};

export default PrivacyPage;
