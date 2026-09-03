import { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../i18n/useTranslation';
import { CareSyncLogo, PrimaryButton } from '../components/UI';
import { Heart, Sprout, Building2 } from 'lucide-react';

const onboardingIcons = [Heart, Sprout, Building2];
const onboardingGradients = [
  'linear-gradient(135deg, #F0EDFF 0%, #E8EEFF 100%)',
  'linear-gradient(135deg, #FFF9E6 0%, #FFF3CD 100%)',
  'linear-gradient(135deg, #E8EEFF 0%, #F0EDFF 100%)',
];

export function SplashScreen() {
  const { navigate, state } = useApp();
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(state.childProfile ? 'home' : 'onboarding');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100dvh',
      background: 'linear-gradient(180deg, #F7F7FB 0%, #F0EDFF 50%, #F7F7FB 100%)',
      gap: 24,
      padding: 40,
    }}>
      <div className="animate-scale-in">
        <CareSyncLogo size={100} />
      </div>
      <div className="animate-fade-in delay-2" style={{ textAlign: 'center' }}>
        <h1 style={{
          fontSize: 32,
          fontWeight: 700,
          color: 'var(--color-text)',
          letterSpacing: -0.5,
          marginTop: 8,
        }}>
          {t('appName')}
        </h1>
        <p style={{
          fontSize: 15,
          fontWeight: 500,
          color: 'var(--color-text-secondary)',
          marginTop: 6,
          letterSpacing: 0.5,
        }}>
          {t('tagline')}
        </p>
      </div>
      <div className="animate-fade-in delay-5" style={{
        width: 32,
        height: 32,
        border: '3px solid var(--color-border)',
        borderTopColor: 'var(--color-primary)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        marginTop: 16,
      }} />
    </div>
  );
}

export function OnboardingScreen() {
  const { state, dispatch, navigate } = useApp();
  const { t, isRTL } = useTranslation();
  const step = state.onboardingStep;
  const isLast = step === onboardingIcons.length - 1;
  const Icon = onboardingIcons[step];

  const screens = [
    { title: t('onboardingTitle1'), description: t('onboardingDesc1') },
    { title: t('onboardingTitle2'), description: t('onboardingDesc2') },
    { title: t('onboardingTitle3'), description: t('onboardingDesc3') },
  ];
  const current = screens[step];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100dvh',
      background: 'var(--color-background)',
    }}>
      {/* Illustration area */}
      <div style={{
        flex: 1,
        background: onboardingGradients[step],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        position: 'relative',
        minHeight: 340,
      }}>
        <div key={step} className="animate-scale-in" style={{
          width: 140,
          height: 140,
          borderRadius: 40,
          background: 'rgba(255,255,255,0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 12px 40px rgba(27, 31, 59, 0.08)',
        }}>
          <Icon size={64} color="var(--color-primary)" strokeWidth={1.5} />
        </div>
        {/* Dots */}
        <div style={{
          position: 'absolute',
          bottom: 24,
          display: 'flex',
          gap: 8,
          flexDirection: isRTL ? 'row-reverse' : 'row',
        }}>
          {onboardingIcons.map((_, i) => (
            <div key={i} style={{
              width: i === step ? 24 : 8,
              height: 8,
              borderRadius: 100,
              background: i === step ? 'var(--color-primary)' : 'rgba(107, 93, 251, 0.25)',
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '32px 28px 40px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div key={`text-${step}`} className="animate-fade-in">
          <h1 style={{
            fontSize: 26,
            fontWeight: 700,
            color: 'var(--color-text)',
            lineHeight: 1.25,
            marginBottom: 12,
            textAlign: isRTL ? 'right' : 'left',
          }}>
            {current.title}
          </h1>
          <p style={{
            fontSize: 15,
            color: 'var(--color-text-secondary)',
            lineHeight: 1.6,
            textAlign: isRTL ? 'right' : 'left',
          }}>
            {current.description}
          </p>
        </div>
        <PrimaryButton
          fullWidth
          onClick={() => {
            if (isLast) {
              navigate('profile-setup');
            } else {
              dispatch({ type: 'SET_ONBOARDING_STEP', step: step + 1 });
            }
          }}
        >
          {isLast ? t('getStarted') : t('next')}
        </PrimaryButton>
      </div>
    </div>
  );
}
