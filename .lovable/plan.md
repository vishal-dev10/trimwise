

# Fix Mobile Layout + Convert to Native Mobile App

## Part 1: Mobile Layout Fix

The issue is that the splash screen uses `min-h-screen` with `justify-center`, and on small mobile screens the content overflows below the viewport, pushing the bottom elements (feature tags like "Trim Optimizer", "TCO Simulator", "Resale Planner") off-screen.

Similarly, the onboarding flow footer button can be pushed off-screen on shorter devices because the content area uses `flex-1` but doesn't account for safe areas or dynamic viewport height.

### Changes

**`src/components/SplashScreen.tsx`**
- Change `min-h-screen` to `min-h-[100dvh]` (uses dynamic viewport height, accounts for mobile browser chrome)
- Reduce spacing on mobile: smaller `mb` values, use responsive spacing (`mb-6 md:mb-8`)
- Make the bottom feature tags wrap properly on small screens with `flex-wrap gap-3`
- Reduce `mt-12` to `mt-6 md:mt-12`

**`src/components/OnboardingFlow.tsx`**
- Change `min-h-screen` to `min-h-[100dvh]`
- Add `safe-area-inset` padding for notched devices
- Ensure the footer "Continue" button is always visible by using `sticky bottom-0` or keeping the current flex layout with dvh

**`src/index.css`**
- Add a utility for safe area insets: `padding-bottom: env(safe-area-inset-bottom)`

**`src/pages/AuthPage.tsx`** — Same `dvh` fix if applicable

## Part 2: Convert to Native Mobile App

For publishing to App Store and Play Store, the best approach is **Capacitor** — it wraps your existing web app in a native shell with full access to device APIs.

### Setup Steps
1. Install Capacitor dependencies (`@capacitor/core`, `@capacitor/cli`, `@capacitor/ios`, `@capacitor/android`)
2. Initialize with `npx cap init` using:
   - `appId: app.lovable.6deef59583a74c978379e0eb2a140a35`
   - `appName: trimwise`
3. Configure hot-reload server URL for development
4. Add viewport meta tag updates for native feel (status bar, safe areas)
5. User then exports to GitHub, runs `npx cap add ios/android`, builds and syncs

### What I'll implement now
- The mobile layout fixes (Part 1)
- Capacitor package installation and configuration (Part 2)
- Safe area CSS utilities for notched devices
- Proper viewport meta for native mobile rendering

### Files to modify
1. `src/components/SplashScreen.tsx` — dvh + responsive spacing
2. `src/components/OnboardingFlow.tsx` — dvh + safe area padding
3. `src/index.css` — safe area utilities
4. `index.html` — viewport meta for mobile app
5. Install Capacitor packages + init config

