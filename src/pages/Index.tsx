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
          dailyKm={onboardingData?.dailyUsageKm}
          ownershipYears={onboardingData?.ownershipYears}
        />
      );
    case 'deepdive':
      return (
        <VariantDeepDive
          carId={selectedCarId}
          variantId={selectedVariantId}
          onBack={() => setView('variants')}
          dailyKm={onboardingData?.dailyUsageKm}
          ownershipYears={onboardingData?.ownershipYears}
          city={onboardingData?.city}
        />
      );
    default:
      return <SplashScreen onGetStarted={() => setView('onboarding')} />;
  }
};

export default Index;
