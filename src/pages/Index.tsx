import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import SplashScreen from '@/components/SplashScreen';
import OnboardingFlow from '@/components/OnboardingFlow';
import CarGrid from '@/components/CarGrid';
import VariantComparison from '@/components/VariantComparison';
import VariantDeepDive from '@/components/VariantDeepDive';
import AuthPage from '@/pages/AuthPage';
import type { OnboardingData } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

type View = 'splash' | 'onboarding' | 'cars' | 'variants' | 'deepdive';

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const [view, setView] = useState<View>('splash');
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [selectedCarId, setSelectedCarId] = useState<string>('');
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');

  const handleOnboardingComplete = (data: OnboardingData) => {
    setOnboardingData(data);
    setView('cars');
  };

  const handleSelectCar = (carId: string) => {
    setSelectedCarId(carId);
    setView('variants');
  };

  const handleSelectVariant = (variantId: string) => {
    setSelectedVariantId(variantId);
    setView('deepdive');
  };

  const defaultProfile: OnboardingData = {
    budgetMin: 800000,
    budgetMax: 2000000,
    ownershipYears: 5,
    city: 'Mumbai',
    dailyUsageKm: 30,
    highwayPct: 30,
    drivingStyle: 'balanced',
    familySize: 4,
    techPreference: 'moderate',
    futurePlans: 'keep',
  };

  const profile = onboardingData ?? defaultProfile;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show auth if not logged in and past splash
  if (!user && view !== 'splash') {
    return <AuthPage />;
  }

  // User avatar bar (shown when logged in and past splash)
  const UserBar = () => {
    if (!user || view === 'splash') return null;
    return (
      <div className="fixed top-3 right-3 z-50 flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border text-xs text-muted-foreground">
          <User className="w-3.5 h-3.5" />
          <span className="max-w-[120px] truncate">{user.email}</span>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => signOut()}>
          <LogOut className="w-3.5 h-3.5" />
        </Button>
      </div>
    );
  };

  const renderView = () => {
    switch (view) {
      case 'splash':
        return <SplashScreen onGetStarted={() => setView('onboarding')} />;
      case 'onboarding':
        return (
          <OnboardingFlow
            onComplete={handleOnboardingComplete}
            onBack={() => setView('splash')}
          />
        );
      case 'cars':
        return <CarGrid onSelectCar={handleSelectCar} />;
      case 'variants':
        return (
          <VariantComparison
            carId={selectedCarId}
            onBack={() => setView('cars')}
            onSelectVariant={handleSelectVariant}
            profile={profile}
          />
        );
      case 'deepdive':
        return (
          <VariantDeepDive
            carId={selectedCarId}
            variantId={selectedVariantId}
            onBack={() => setView('variants')}
            profile={profile}
          />
        );
      default:
        return <SplashScreen onGetStarted={() => setView('onboarding')} />;
    }
  };

  return (
    <>
      <UserBar />
      {renderView()}
    </>
  );
};

export default Index;
