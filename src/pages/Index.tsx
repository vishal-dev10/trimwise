import { useState } from 'react';
import SplashScreen from '@/components/SplashScreen';
import OnboardingFlow from '@/components/OnboardingFlow';
import CarGrid from '@/components/CarGrid';
import VariantComparison from '@/components/VariantComparison';
import VariantDeepDive from '@/components/VariantDeepDive';
import type { OnboardingData } from '@/lib/mock-data';

type View = 'splash' | 'onboarding' | 'cars' | 'variants' | 'deepdive';

const Index = () => {
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

  // Default profile for fallback
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

export default Index;
