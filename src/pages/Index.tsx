import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useUserProfile } from '@/hooks/use-user-profile';
import SplashScreen from '@/components/SplashScreen';
import OnboardingFlow from '@/components/OnboardingFlow';
import CarGrid from '@/components/CarGrid';
import VariantComparison from '@/components/VariantComparison';
import VariantDeepDive from '@/components/VariantDeepDive';
import AuthPage from '@/pages/AuthPage';
import type { OnboardingData } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { LogOut, User, RotateCcw, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type View = 'splash' | 'onboarding' | 'cars' | 'variants' | 'deepdive';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { profile: savedProfile, isLoading: profileLoading, saveProfile } = useUserProfile();
  const [view, setView] = useState<View>('splash');
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [selectedCarId, setSelectedCarId] = useState<string>('');
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [hasCheckedProfile, setHasCheckedProfile] = useState(false);

  // When user is logged in and profile loads, auto-skip onboarding
  useEffect(() => {
    if (!user || profileLoading || hasCheckedProfile) return;
    setHasCheckedProfile(true);
    if (savedProfile) {
      setOnboardingData(savedProfile);
      setView('cars');
    }
  }, [user, profileLoading, savedProfile, hasCheckedProfile]);

  const handleOnboardingComplete = async (data: OnboardingData) => {
    setOnboardingData(data);
    setView('cars');
    // Persist to DB in background
    if (user) {
      try { await saveProfile(data); } catch { /* silent */ }
    }
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

  if (authLoading || (user && profileLoading && !hasCheckedProfile)) {
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

  const handleResetPreferences = () => {
    setOnboardingData(null);
    setHasCheckedProfile(false);
    setView('onboarding');
  };

  const UserBar = () => {
    if (!user || view === 'splash') return null;
    return (
      <div className="fixed top-3 right-3 z-50 flex items-center gap-2">
        {view !== 'onboarding' && (
          <>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => navigate('/shortlist')}>
              <Heart className="w-3.5 h-3.5" />
            </Button>
            <Button variant="outline" size="sm" className="h-8 rounded-full text-xs" onClick={handleResetPreferences}>
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reset
            </Button>
          </>
        )}
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
