import { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { BottomNav, FloatingCareAIButton, SyncStatusBanner } from './components/UI';
import { SplashScreen, OnboardingScreen } from './screens/SplashOnboarding';
import { ProfileSetupScreen } from './screens/ProfileSetup';
import { AuthScreen } from './screens/AuthScreen';
import { HomeScreen } from './screens/HomeScreen';
import { ActivitiesScreen, ActivityDetailScreen } from './screens/Activities';
import { CareAIScreen } from './screens/CareAI';
import { CentresScreen, CentreDetailScreen } from './screens/Centres';
import { ProfessionalsScreen, ProfessionalDetailScreen } from './screens/Professionals';
import {
  ProgressScreen,
  ProfileScreen,
  ChildProfileScreen,
  NotificationsScreen,
  ParentNotesScreen,
  AddNoteScreen,
  SettingsScreen,
  HelpSupportScreen,
  SavedActivitiesScreen,
  AboutScreen,
  PrivacyScreen,
} from './screens/OtherScreens';

function AppRouter() {
  const { state, navigate } = useApp();
  const screen = state.currentScreen;

  useEffect(() => {
    document.body.classList.toggle('dark', state.darkMode);
    document.documentElement.dir = state.language === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.lang = state.language === 'ur' ? 'ur' : 'en';
    const rootSize = state.fontSize === 'small' ? 14 : state.fontSize === 'large' ? 18 : 16;
    document.documentElement.style.fontSize = `${rootSize}px`;
  }, [state.darkMode, state.language, state.fontSize]);

  // Show loading spinner while checking auth state
  if (state.authLoading && !state.authUser) {
    return (
      <div style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-background)',
      }}>
        <div style={{
          width: 40,
          height: 40,
          border: '4px solid var(--color-border)',
          borderTopColor: 'var(--color-primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }

  // Show auth screen when no user is signed in
  if (!state.authUser) {
    return <AuthScreen />;
  }

  const hideBottomNav = ['splash', 'onboarding', 'profile-setup', 'care-ai'].includes(screen);
  const showFloatingAI = !['splash', 'onboarding', 'profile-setup', 'care-ai'].includes(screen) && state.childProfile;

  const renderScreen = () => {
    switch (screen) {
      case 'splash': return <SplashScreen />;
      case 'onboarding': return <OnboardingScreen />;
      case 'profile-setup': return <ProfileSetupScreen />;
      case 'home': return <HomeScreen />;
      case 'activities': return <ActivitiesScreen />;
      case 'activity-detail': return <ActivityDetailScreen />;
      case 'care-ai': return <CareAIScreen />;
      case 'centres': return <CentresScreen />;
      case 'centre-detail': return <CentreDetailScreen />;
      case 'professionals': return <ProfessionalsScreen />;
      case 'professional-detail': return <ProfessionalDetailScreen />;
      case 'progress': return <ProgressScreen />;
      case 'profile': return <ProfileScreen />;
      case 'child-profile': return <ChildProfileScreen />;
      case 'notifications': return <NotificationsScreen />;
      case 'parent-notes': return <ParentNotesScreen />;
      case 'add-note': return <AddNoteScreen />;
      case 'settings': return <SettingsScreen />;
      case 'help-support': return <HelpSupportScreen />;
      case 'saved-activities': return <SavedActivitiesScreen />;
      case 'about': return <AboutScreen />;
      case 'privacy': return <PrivacyScreen />;
      default: return <HomeScreen />;
    }
  };

  return (
    <div style={{
      minHeight: '100dvh',
      maxWidth: 480,
      margin: '0 auto',
      position: 'relative',
    }}>
      <SyncStatusBanner />
      <div key={screen} className="animate-fade-in" style={{ animationDuration: '0.25s' }}>
        {renderScreen()}
      </div>
      {!hideBottomNav && state.childProfile && <BottomNav />}
      {showFloatingAI && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 480,
          height: 0,
          zIndex: 9999,
          pointerEvents: 'none',
        }}>
          <FloatingCareAIButton onClick={() => navigate('care-ai')} />
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}
