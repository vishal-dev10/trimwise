import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useUserRole } from '@/hooks/use-user-role';
import { useUserProfile } from '@/hooks/use-user-profile';
import OnboardingFlow from '@/components/OnboardingFlow';
import CarGrid from '@/components/CarGrid';
import VariantComparison from '@/components/VariantComparison';
import VariantDeepDive from '@/components/VariantDeepDive';
import AuthPage from '@/pages/AuthPage';
import type { OnboardingData } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { LogOut, User, RotateCcw, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type View = 'cars' | 'onboarding' | 'variants' | 'deepdive';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { profile: savedProfile, isLoading: profileLoading, saveProfile } = useUserProfile();
  const [view, setView] = useState<View>('cars');
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [selectedCarId, setSelectedCarId] = useState<string>('');
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [hasCheckedProfile, setHasCheckedProfile] = useState(false);

  // Redirect admin users to /admin
  useEffect(() => {
    if (!roleLoading && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [roleLoading, isAdmin, navigate]);

  // Pre-load saved profile if user has one
  useEffect(() => {
    if (!user || profileLoading || hasCheckedProfile || isAdmin) return;
    setHasCheckedProfile(true);
    if (savedProfile) {
      setOnboardingData(savedProfile);
    }
  }, [user, profileLoading, savedProfile, hasCheckedProfile, isAdmin]);

  const handleOnboardingComplete = async (data: OnboardingData) => {
    setOnboardingData(data);
    setView('cars');
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
  const isPersonalized = onboardingData !== null;

  if (authLoading || roleLoading || (user && profileLoading && !hasCheckedProfile)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Auth required
  if (!user) {
    return <AuthPage />;
  }

  // If admin, don't render anything (redirect is happening)
  if (isAdmin) return null;

  const handleResetPreferences = () => {
    setOnboardingData(null);
    setHasCheckedProfile(false);
    setView('cars');
  };

  const handlePersonalize = () => {
    setView('onboarding');
  };

  const UserBar = () => (
    <div className="fixed top-3 right-3 z-50 flex items-center gap-2">
      {view !== 'onboarding' && (
        <>
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => navigate('/shortlist')}>
            <Heart className="w-3.5 h-3.5" />
          </Button>
          {isPersonalized && (
            <Button variant="outline" size="sm" className="h-8 rounded-full text-xs" onClick={handleResetPreferences}>
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reset
            </Button>
          )}
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

  const renderView = () => {
    switch (view) {
      case 'onboarding':
        return (
          <OnboardingFlow
            onComplete={handleOnboardingComplete}
            onBack={() => setView('cars')}
          />
        );
      case 'cars':
        return (
          <CarGrid
            onSelectCar={handleSelectCar}
            isPersonalized={isPersonalized}
            onPersonalize={handlePersonalize}
          />
        );
      case 'variants':
        return (
          <VariantComparison
            carId={selectedCarId}
            onBack={() => setView('cars')}
            onSelectVariant={handleSelectVariant}
            profile={profile}
            isPersonalized={isPersonalized}
            onPersonalize={handlePersonalize}
          />
        );
      case 'deepdive':
        return (
          <VariantDeepDive
            carId={selectedCarId}
            variantId={selectedVariantId}
            onBack={() => setView('variants')}
            profile={profile}
            isPersonalized={isPersonalized}
            onPersonalize={handlePersonalize}
          />
        );
      default:
        return <CarGrid onSelectCar={handleSelectCar} isPersonalized={isPersonalized} onPersonalize={handlePersonalize} />;
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
