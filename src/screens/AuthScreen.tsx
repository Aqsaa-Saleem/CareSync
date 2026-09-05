import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../i18n/useTranslation';
import { PrimaryButton, CareSyncLogo } from '../components/UI';
import { Mail, Lock, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export function AuthScreen() {
  const { t } = useTranslation();
  const { state, signIn, signUp, signInWithGoogle, sendPasswordReset, setAuthError } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isLoading = state.authLoading;
  const error = state.authError;
  const showLoginInstead = isSignUp && state.authErrorCode === 'auth/email-already-in-use';
  const showSignUpOption = !isSignUp && !isResetMode && [
    'auth/user-not-found',
    'auth/invalid-credential',
  ].includes(state.authErrorCode || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail || (!isResetMode && !password.trim())) {
      setAuthError(t('fillAllFields') || 'Please fill in all fields');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setAuthError(t('invalidEmail') || 'Please enter a valid email address.');
      return;
    }

    if (isResetMode) {
      const wasSent = await sendPasswordReset(trimmedEmail);
      if (wasSent) setResetSent(true);
      return;
    }

    if (isSignUp) {
      await signUp(trimmedEmail, password);
    } else {
      await signIn(trimmedEmail, password);
    }
  };

  const toggleMode = () => {
    setIsSignUp((prev) => !prev);
    setPassword('');
    setAuthError(null);
  };

  const openPasswordReset = () => {
    setIsResetMode(true);
    setIsSignUp(false);
    setPassword('');
    setResetSent(false);
    setAuthError(null);
  };

  const returnToLogin = () => {
    setIsResetMode(false);
    setResetSent(false);
    setAuthError(null);
  };

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--color-background)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '32px 28px',
      gap: 28,
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'center' }}>
          <CareSyncLogo size={80} />
        </div>
        <h1 style={{
          fontSize: 28,
          fontWeight: 700,
          color: 'var(--color-text)',
          marginBottom: 8,
        }}>
          {isResetMode ? (t('resetPassword') || 'Reset Password') : t('appName')}
        </h1>
        <p style={{
          fontSize: 15,
          color: 'var(--color-text-secondary)',
          maxWidth: 320,
          margin: '0 auto',
        }}>
          {isResetMode
            ? (t('resetPasswordInstruction') || 'Enter your email and we will send you a password reset link.')
            : t('tagline')}
        </p>
      </div>

      <form noValidate onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error && (
          <div
            role="alert"
            style={{
              background: 'var(--color-error-bg)',
              border: '1px solid #FFB3A8',
              borderRadius: 12,
              padding: '12px 14px',
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
            }}
          >
            <AlertCircle size={18} color="var(--color-error)" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ fontSize: 13, color: 'var(--color-error-text)', lineHeight: 1.5 }}>{error}</p>
              {showLoginInstead && (
                <button
                  type="button"
                  onClick={toggleMode}
                  style={{
                    marginTop: 6,
                    padding: 0,
                    color: 'var(--color-primary)',
                    fontWeight: 700,
                    background: 'none',
                    border: 'none',
                    textDecoration: 'underline',
                    textUnderlineOffset: 3,
                  }}
                >
                  {t('logIn') || 'Log In'}
                </button>
              )}
              {showSignUpOption && (
                <button
                  type="button"
                  onClick={toggleMode}
                  style={{
                    marginTop: 6,
                    padding: 0,
                    color: 'var(--color-primary)',
                    fontWeight: 700,
                    background: 'none',
                    border: 'none',
                    textDecoration: 'underline',
                    textUnderlineOffset: 3,
                  }}
                >
                  {t('signUp') || 'Sign Up'}
                </button>
              )}
            </div>
          </div>
        )}

        <div>
          <label style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--color-text)',
            marginBottom: 6,
            display: 'block',
          }}>
            {t('email') || 'Email'}
          </label>
          <div style={{ position: 'relative' }}>
            <Mail size={18} color="var(--color-text-secondary)" style={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
            }} />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setResetSent(false);
              }}
              placeholder={t('emailPlaceholder') || 'you@example.com'}
              autoComplete="email"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px 16px 14px 44px',
                borderRadius: 'var(--radius-input)',
                border: '1.5px solid var(--color-border)',
                background: 'var(--color-input-bg)',
                fontSize: 15,
                color: 'var(--color-text)',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {!isResetMode && (
          <div>
            <label style={{
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--color-text)',
              marginBottom: 6,
              display: 'block',
            }}>
              {t('password') || 'Password'}
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--color-text-secondary)" style={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
              }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('passwordPlaceholder') || '••••••••'}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 44px',
                  borderRadius: 'var(--radius-input)',
                  border: '1.5px solid var(--color-border)',
                  background: 'var(--color-input-bg)',
                  fontSize: 15,
                  color: 'var(--color-text)',
                  outline: 'none',
                }}
              />
            </div>
            {!isSignUp && (
              <button
                type="button"
                onClick={openPasswordReset}
                disabled={isLoading}
                style={{
                  display: 'inline-flex',
                  marginTop: 8,
                  padding: '2px 0',
                  color: 'var(--color-primary)',
                  fontSize: 13,
                  fontWeight: 700,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  textUnderlineOffset: 3,
                }}
              >
                {t('forgotPassword') || 'Forgot Password?'}
              </button>
            )}
          </div>
        )}

        {resetSent && (
          <div
            role="status"
            style={{
              background: 'var(--color-success-bg)',
              border: '1px solid rgba(56, 161, 105, 0.35)',
              borderRadius: 12,
              padding: '12px 14px',
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
            }}
          >
            <CheckCircle2 size={18} color="var(--color-success)" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 13, color: 'var(--color-success)', lineHeight: 1.5 }}>
              {t('passwordResetSent') || 'Password reset email sent. Please check your inbox and spam folder.'}
            </p>
          </div>
        )}

        <PrimaryButton
          type="submit"
          fullWidth
          disabled={isLoading}
          style={{ marginTop: 8 }}
        >
          {isLoading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              {t('pleaseWait') || 'Please wait...'}
            </span>
          ) : isResetMode ? (
            t('sendResetLink') || 'Send Reset Link'
          ) : (
            isSignUp ? (t('signUp') || 'Create Account') : (t('logIn') || 'Log In')
          )}
        </PrimaryButton>
      </form>

      {!isResetMode && (
        <button
          type="button"
          onClick={signInWithGoogle}
          disabled={isLoading}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            width: '100%',
            padding: '14px 20px',
            borderRadius: 'var(--radius-button)',
            border: '1.5px solid var(--color-border)',
            background: 'var(--color-card)',
            color: 'var(--color-text)',
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <svg width={20} height={20} viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {t('signInWithGoogle') || 'Sign in with Google'}
        </button>
      )}

      {isResetMode ? (
        <button
          type="button"
          onClick={returnToLogin}
          disabled={isLoading}
          style={{
            alignSelf: 'center',
            background: 'none',
            border: 'none',
            color: 'var(--color-primary)',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          {t('returnToLogin') || 'Return to Log In'}
        </button>
      ) : (
        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--color-text-secondary)' }}>
          {isSignUp ? (t('alreadyHaveAccount') || 'Already have an account?') : (t('noAccount') || "Don't have an account?")}{' '}
          <button
            type="button"
            onClick={toggleMode}
            disabled={isLoading}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-primary)',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            {isSignUp ? (t('logIn') || 'Log In') : (t('signUp') || 'Sign Up')}
          </button>
        </p>
      )}
    </div>
  );
}
