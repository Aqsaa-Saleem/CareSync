import React from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../i18n/useTranslation';
import {
  Home, Sparkles, MessageCircle, MapPin, User, Search, ChevronLeft,
  Bell, Headphones, X, Check, Heart, Bookmark, Share2, Clock, Star,
  Activity, Stethoscope, ShieldCheck, Phone, Navigation, AlertCircle,
  Settings, HelpCircle, Lock, Info, LogOut, ChevronRight, Plus,
  Calendar, FileText, Award, TrendingUp, Flame, BookOpen, ChevronDown,
  WifiOff, RefreshCw, CloudCheck
} from 'lucide-react';

/* ─── ICON MAP ─── */
export const Icons = {
  Home, Sparkles, MessageCircle, MapPin, User, Search, ChevronLeft,
  Bell, Headphones, X, Check, Heart, Bookmark, Share2, Clock, Star,
  Activity, Stethoscope, ShieldCheck, Phone, Navigation, AlertCircle,
  Settings, HelpCircle, Lock, Info, LogOut, ChevronRight, Plus,
  Calendar, FileText, Award, TrendingUp, Flame, BookOpen, WifiOff, RefreshCw, CloudCheck,
};

/* ─── PRIMARY BUTTON ─── */
export function PrimaryButton({ children, onClick, style, disabled, icon, fullWidth, type }: {
  children: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        background: disabled ? '#C4C4D0' : 'var(--color-primary)',
        color: '#fff',
        border: 'none',
        borderRadius: 'var(--radius-button)',
        padding: '14px 28px',
        fontSize: 15,
        fontWeight: 700,
        width: fullWidth ? '100%' : 'auto',
        opacity: disabled ? 0.7 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: disabled ? 'none' : '0 6px 20px rgba(109, 93, 251, 0.28)',
        ...style,
      }}
      aria-label={typeof children === 'string' ? children : undefined}
    >
      {icon}
      {children}
    </button>
  );
}

/* ─── SECONDARY BUTTON ─── */
export function SecondaryButton({ children, onClick, style, icon, fullWidth }: {
  children: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        background: 'var(--color-soft-lavender)',
        color: 'var(--color-primary)',
        border: '1.5px solid var(--color-border)',
        borderRadius: 'var(--radius-button)',
        padding: '12px 24px',
        fontSize: 15,
        fontWeight: 700,
        width: fullWidth ? '100%' : 'auto',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        ...style,
      }}
    >
      {icon}
      {children}
    </button>
  );
}

/* ─── ICON BUTTON ─── */
export function IconButton({ icon, onClick, badge, label, style }: {
  icon: React.ReactNode;
  onClick?: () => void;
  badge?: number;
  label?: string;
  style?: React.CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 46,
        height: 46,
        borderRadius: 16,
        background: 'var(--color-card)',
        border: '1px solid var(--color-border)',
        boxShadow: '0 2px 10px rgba(27, 31, 59, 0.05)',
        cursor: 'pointer',
        ...style,
      }}
    >
      {icon}
      {badge && badge > 0 ? (
        <span style={{
          position: 'absolute',
          top: 6,
          right: 6,
          background: 'var(--color-warm-accent)',
          color: '#fff',
          fontSize: 10,
          fontWeight: 700,
          borderRadius: '50%',
          width: 18,
          height: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {badge > 9 ? '9+' : badge}
        </span>
      ) : null}
    </button>
  );
}

/* ─── SEARCH BAR ─── */
export function SearchBar({ value, onChange, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      background: 'var(--color-card)',
      borderRadius: 'var(--radius-input)',
      padding: '12px 16px',
      border: '1.5px solid var(--color-border)',
      boxShadow: '0 2px 10px rgba(27, 31, 59, 0.04)',
    }}>
      <Search size={18} color="var(--color-muted)" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Search...'}
        style={{
          flex: 1,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          fontSize: 15,
          color: 'var(--color-text)',
          fontFamily: 'var(--font-body)',
        }}
        aria-label={placeholder || 'Search'}
      />
      {value && (
        <button onClick={() => onChange('')} style={{ display: 'flex', padding: 0, minWidth: 0, minHeight: 0 }} aria-label="Clear search">
          <X size={16} color="var(--color-muted)" />
        </button>
      )}
    </div>
  );
}

/* ─── SELECT DROPDOWN ─── */
export function Select({ label, value, options, onChange, placeholder = 'All' }: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 140 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%',
            appearance: 'none',
            padding: '11px 36px 11px 14px',
            borderRadius: 'var(--radius-input)',
            border: '1.5px solid var(--color-border)',
            background: 'var(--color-card)',
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--color-text)',
            outline: 'none',
            cursor: 'pointer',
          }}
          aria-label={label}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <ChevronDown size={16} color="var(--color-muted)" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
      </div>
    </div>
  );
}

/* ─── FILTER CHIP ─── */
export function FilterChip({ label, active, onClick }: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '9px 18px',
        borderRadius: 'var(--radius-chip)',
        fontSize: 13,
        fontWeight: 700,
        border: active ? 'none' : '1.5px solid var(--color-border)',
        background: active ? 'var(--color-primary)' : 'var(--color-card)',
        color: active ? '#fff' : 'var(--color-text-secondary)',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 0.2s ease',
        minHeight: 40,
        boxShadow: active ? '0 4px 14px rgba(109, 93, 251, 0.22)' : 'none',
      }}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}

/* ─── SECTION HEADER ─── */
export function SectionHeader({ title, action, onAction }: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', letterSpacing: -0.3 }}>{title}</h2>
      {action && (
        <button onClick={onAction} style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-primary)', minHeight: 44, display: 'flex', alignItems: 'center' }}>
          {action}
        </button>
      )}
    </div>
  );
}

/* ─── BOTTOM NAVIGATION ─── */
const navItems = [
  { screen: 'home' as const, key: 'home', Icon: Home },
  { screen: 'activities' as const, key: 'activities', Icon: Sparkles },
  { screen: 'progress' as const, key: 'progress', Icon: TrendingUp },
  { screen: 'centres' as const, key: 'centres', Icon: MapPin },
  { screen: 'profile' as const, key: 'profile', Icon: User },
];

export function BottomNav() {
  const { state, navigate } = useApp();
  const { t } = useTranslation();
  const active = state.currentScreen;

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 480,
        background: 'var(--color-card)',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '8px 0 calc(8px + var(--safe-bottom))',
        zIndex: 100,
        boxShadow: 'var(--shadow-nav)',
      }}
      role="navigation"
      aria-label="Main navigation"
    >
      {navItems.map(({ screen, key, Icon }) => {
        const label = t(key as import('../i18n/translations').TranslationKey);
        const profileScreens = ['profile', 'saved-activities', 'notifications', 'settings', 'help-support', 'child-profile', 'parent-notes', 'add-note', 'about', 'privacy'];
        const isActive = active === screen || (screen === 'profile' && profileScreens.includes(active));
        return (
          <button
            key={screen}
            onClick={() => navigate(screen)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              padding: '6px 12px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minWidth: 56,
              minHeight: 44,
            }}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon
              size={22}
              color={isActive ? 'var(--color-primary)' : 'var(--color-muted)'}
              strokeWidth={isActive ? 2.5 : 2}
              fill={isActive ? 'var(--color-primary)' : 'none'}
            />
            <span style={{
              fontSize: 11,
              fontWeight: isActive ? 700 : 600,
              color: isActive ? 'var(--color-primary)' : 'var(--color-muted)',
            }}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

/* ─── SCREEN HEADER (with back) ─── */
export function ScreenHeader({ title, subtitle, onBack, rightAction }: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '16px 20px',
      background: 'var(--color-background)',
      position: 'sticky',
      top: 0,
      zIndex: 20,
    }}>
      {onBack && (
        <button onClick={onBack} style={{ display: 'flex', padding: 4, borderRadius: 14, minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', background: 'var(--color-card)', border: '1px solid var(--color-border)' }} aria-label="Go back">
          <ChevronLeft size={24} color="var(--color-text)" />
        </button>
      )}
      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.2, letterSpacing: -0.3 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2, fontFamily: 'var(--font-body)' }}>{subtitle}</p>}
      </div>
      {rightAction}
    </div>
  );
}

/* ─── LOADING STATE ─── */
export function LoadingState() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, gap: 16 }}>
      <div style={{
        width: 36,
        height: 36,
        border: '3px solid var(--color-border)',
        borderTopColor: 'var(--color-primary)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>Loading...</p>
    </div>
  );
}

/* ─── EMPTY STATE ─── */
export function EmptyState({ icon, title, message, action, onAction }: {
  icon?: React.ReactNode;
  title: string;
  message: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', gap: 12, textAlign: 'center' }}>
      {icon && <div style={{ marginBottom: 8 }}>{icon}</div>}
      <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)' }}>{title}</h3>
      <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', maxWidth: 280 }}>{message}</p>
      {action && <PrimaryButton onClick={onAction} style={{ marginTop: 8 }}>{action}</PrimaryButton>}
    </div>
  );
}

/* ─── PROGRESS BAR ─── */
export function ProgressBar({ value, max, height, color }: {
  value: number;
  max: number;
  height?: number;
  color?: string;
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div style={{
      width: '100%',
      height: height || 8,
      background: 'var(--color-border)',
      borderRadius: 100,
      overflow: 'hidden',
    }} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      <div style={{
        width: `${pct}%`,
        height: '100%',
        background: color || 'var(--color-primary)',
        borderRadius: 100,
        transition: 'width 0.6s ease',
        boxShadow: '0 2px 8px rgba(109, 93, 251, 0.18)',
      }} />
    </div>
  );
}

/* ─── VERIFIED BADGE ─── */
export function VerifiedBadge() {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      fontSize: 11,
      fontWeight: 700,
      color: 'var(--color-success)',
      background: 'var(--color-success-bg)',
      padding: '4px 10px',
      borderRadius: 20,
    }}>
      <ShieldCheck size={12} />
      Verified
    </span>
  );
}

/* ─── CARESYNC LOGO ─── */
export function CareSyncLogo({ size = 80 }: { size?: number }) {
  return (
    <img
      src="/caresync-logo.jpg"
      alt="CareSync"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        objectFit: 'cover',
        boxShadow: '0 10px 36px rgba(109, 93, 251, 0.32)',
        display: 'block',
      }}
    />
  );
}

/* ─── CHILD AVATAR ─── */
export function ChildAvatar({ child, size = 96, style }: {
  child: { gender: import('../types').Gender; avatar?: string; photo?: string | null };
  size?: number;
  style?: React.CSSProperties;
}) {
  const defaultAvatar = child.gender === 'female'
    ? '/avatar-girl.jpg'
    : child.gender === 'male'
    ? '/avatar-boy.jpg'
    : '/avatar-other.jpg';
  return (
    <img
      src={child.photo || child.avatar || defaultAvatar}
      alt=""
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        objectFit: 'cover',
        border: '2px solid var(--color-border)',
        background: 'var(--color-soft-lavender)',
        display: 'block',
        ...style,
      }}
    />
  );
}

/* ─── CIRCULAR PROGRESS ─── */
export function CircularProgress({ value, max, size = 96, stroke = 10, color }: {
  value: number;
  max: number;
  size?: number;
  stroke?: number;
  color?: string;
}) {
  const pct = Math.min(100, Math.round((value / (max || 1)) * 100));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-border)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color || 'var(--color-primary)'}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div style={{ position: 'absolute', textAlign: 'center' }}>
        <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text)' }}>{pct}%</p>
      </div>
    </div>
  );
}

/* ─── 3D ICON ─── */
export function Icon3D({ emoji, size = 46, bg }: { emoji: string; size?: number; bg?: string }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: size * 0.32,
      background: bg || 'linear-gradient(135deg, var(--color-soft-lavender) 0%, var(--color-soft-blue-lavender) 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size * 0.55,
      lineHeight: 1,
      boxShadow: '0 6px 16px rgba(109, 93, 251, 0.18), inset 0 -2px 6px rgba(0,0,0,0.04)',
      textShadow: '0 2px 4px rgba(0,0,0,0.12)',
    }}>
      {emoji}
    </div>
  );
}

/* ─── FLOATING CARE AI BUTTON ─── */
export function FloatingCareAIButton({ onClick }: { onClick: () => void }) {
  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
  const isDesktop = typeof window !== 'undefined' ? window.innerWidth >= 768 : false;
  const size = isDesktop ? 120 : 84;

  return (
    <button
      onClick={onClick}
      aria-label="Open Care AI Assistant"
      style={{
        position: 'absolute',
        bottom: 'calc(88px + var(--safe-bottom))',
        right: isDesktop ? 24 : 16,
        width: size,
        height: size,
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        pointerEvents: 'auto',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: prefersReducedMotion ? 'none' : 'careAIFloat 4s ease-in-out infinite',
        transition: 'transform 0.2s ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.96)'; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; }}
      onTouchStart={(e) => { e.currentTarget.style.transform = 'scale(0.96)'; }}
      onTouchEnd={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      <img
        src="/careai-robot.png"
        alt=""
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
          filter: 'drop-shadow(0 8px 20px rgba(109, 93, 251, 0.28))',
        }}
      />
    </button>
  );
}

/* ─── SYNC STATUS BANNER ─── */
export function SyncStatusBanner() {
  const { state, retrySave } = useApp();
  const { t } = useTranslation();

  if (!state.syncError && state.syncStatus !== 'saving') return null;

  if (state.syncStatus === 'saving' && !state.syncError) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        background: 'var(--color-soft-blue-lavender)',
        color: 'var(--color-primary)',
        padding: '8px 16px',
        fontSize: 12,
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        maxWidth: 480,
        margin: '0 auto',
      }}>
        <CloudCheck size={14} />
        {t('saving') || 'Saving...'}
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 200,
      background: 'var(--color-error-bg)',
      color: 'var(--color-error-text)',
      padding: '10px 16px',
      fontSize: 13,
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      maxWidth: 480,
      margin: '0 auto',
      borderBottom: '1px solid rgba(229, 62, 62, 0.2)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
        <WifiOff size={16} />
        <span>{state.syncError || (t('syncError') || 'Could not sync your data.')}</span>
      </div>
      <button
        onClick={retrySave}
        style={{
          background: 'var(--color-error)',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '6px 12px',
          fontSize: 12,
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          whiteSpace: 'nowrap',
        }}
      >
        <RefreshCw size={12} />
        {t('retry') || 'Retry'}
      </button>
    </div>
  );
}

