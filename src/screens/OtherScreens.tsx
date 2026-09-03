import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../i18n/useTranslation';
import { ScreenHeader, PrimaryButton, SectionHeader, EmptyState, ProgressBar, CareSyncLogo, CircularProgress, ChildAvatar } from '../components/UI';
import { activities } from '../data/activities';
import {
  FileText, ChevronRight,
  Bell, HelpCircle, Lock, Info, LogOut, Plus, Trash2,
  Bookmark, Users, Check, Puzzle, MessageCircle, Dumbbell, Eye, Ear,
  Activity, Pencil, Globe, X, Type, Shield, FileText as FileTextIcon,
  Heart, Sparkles, Bot, MapPin, Stethoscope, ShieldCheck,
  TrendingUp, Image as ImageIcon, UserCheck
} from 'lucide-react';

const categoryIconMap: Record<string, React.ReactNode> = {
  autism: <Puzzle size={22} color="var(--color-primary)" />,
  speech: <MessageCircle size={22} color="var(--color-primary)" />,
  motor: <Dumbbell size={22} color="var(--color-primary)" />,
  visual: <Eye size={22} color="var(--color-primary)" />,
  hearing: <Ear size={22} color="var(--color-primary)" />,
  sensory: <Puzzle size={22} color="var(--color-primary)" />,
};

/* ═══════════════ PROGRESS SCREEN ═══════════════ */
export function ProgressScreen() {
  const { state, goBack } = useApp();
  const { t, isRTL } = useTranslation();
  const profile = state.childProfile;
  const totalCompleted = state.completedActivities.length;
  const streak = state.streak;

  const focusLabels: Record<string, string> = {
    autism: 'Autism', speech: 'Speech Delay', motor: 'Physical / Motor',
    visual: 'Visual Impairment', hearing: 'Hearing Impairment', multiple: 'Multiple Needs', unsure: 'General Development',
  };

  const categoryProgress = profile
    ? [profile.supportNeed].filter((cat) => cat !== 'multiple' && cat !== 'unsure').map((cat) => {
        const catActivities = activities.filter((a) => a.category === cat);
        const completed = catActivities.filter((a) => state.completedActivities.includes(a.id)).length;
        return { category: cat, label: focusLabels[cat] || cat, completed, total: catActivities.length };
      })
    : [];

  const totalActivities = activities.length;
  const overallPct = totalActivities ? Math.round((totalCompleted / totalActivities) * 100) : 0;

  // Simple weekly chart data (mock last 7 days based on completed count distribution)
  const weekData = [0, 0, 0, 0, 0, 0, totalCompleted];
  const weekMax = Math.max(...weekData, 1);
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];

  return (
    <div className="screen" style={{ background: 'var(--color-background)' }}>
      <ScreenHeader title={t('progress')} onBack={goBack} />
      <div className="screen-content" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Overall circular progress */}
        <div className="card animate-fade-in delay-1" style={{ display: 'flex', alignItems: 'center', gap: 20, border: '1.5px solid var(--color-border)' }}>
          <CircularProgress value={totalCompleted} max={totalActivities || 1} size={96} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>{t('activitiesDone')}</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-primary)', marginTop: 2 }}>{totalCompleted} <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>/ {totalActivities}</span></p>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4 }}>{overallPct}% {t('activitiesFor').toLowerCase()} {profile?.name || t('appName')}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="card animate-fade-in delay-2" style={{ textAlign: 'center', padding: 22, border: '1.5px solid var(--color-border)' }}>
            <p style={{ fontSize: 32, fontWeight: 700, color: 'var(--color-text)' }}>{streak}</p>
            <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 600 }}>{t('dayStreak')}</p>
          </div>
          <div className="card animate-fade-in delay-3" style={{ textAlign: 'center', padding: 22, border: '1.5px solid var(--color-border)' }}>
            <p style={{ fontSize: 32, fontWeight: 700, color: 'var(--color-text)' }}>{state.savedActivities.length}</p>
            <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 600 }}>{t('saved')}</p>
          </div>
        </div>

        {/* Weekly chart */}
        <div className="card animate-fade-in delay-4" style={{ border: '1.5px solid var(--color-border)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18, color: 'var(--color-text)' }}>{t('thisWeek')}</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8, height: 120, paddingBottom: 8 }}>
            {weekData.map((val, i) => {
              const h = Math.round((val / weekMax) * 100);
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: '100%',
                    maxWidth: 28,
                    height: `${Math.max(h, 8)}%`,
                    minHeight: 8,
                    borderRadius: 8,
                    background: i === 6 ? 'var(--color-primary)' : 'var(--color-soft-lavender)',
                    transition: 'height 0.4s ease',
                  }} />
                  <span style={{ fontSize: 10, color: 'var(--color-text-secondary)', fontWeight: 600 }}>{dayLabels[i]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Focus Area */}
        <div className="card animate-fade-in delay-5" style={{ border: '1.5px solid var(--color-border)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18, color: 'var(--color-text)' }}>
            {t('focusArea')} {profile ? `— ${profile.name}` : ''}
          </h3>
          {categoryProgress.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {categoryProgress.map((cp) => (
                <div key={cp.category}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{cp.label}</span>
                    <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 700 }}>{cp.completed}/{cp.total}</span>
                  </div>
                  <ProgressBar value={cp.completed} max={cp.total || 1} />
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
              {profile
                ? `${t('focusArea')} ${focusLabels[profile.supportNeed] || profile.supportNeed} ${t('noActivitiesYet').toLowerCase()}`
                : 'No child profile selected.'}
            </p>
          )}
        </div>

        {/* Timeline */}
        <div className="card animate-fade-in delay-6" style={{ border: '1.5px solid var(--color-border)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: 'var(--color-text)' }}>{t('recentActivity')}</h3>
          {state.completedActivities.length === 0 ? (
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>{t('noActivitiesYet')}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {state.completedActivities.slice(-5).reverse().map((id) => {
                const act = activities.find((a) => a.id === id);
                return act ? (
                  <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 10, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      background: 'var(--color-success-bg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Check size={20} color="var(--color-success)" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{act.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{act.duration} min</p>
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ PROFILE SCREEN ═══════════════ */
export function ProfileScreen() {
  const { state, navigate, dispatch } = useApp();
  const { t, isRTL } = useTranslation();
  const profile = state.childProfile;
  if (!profile) return null;

  const age = Math.floor((Date.now() - new Date(profile.dateOfBirth).getTime()) / (365.25 * 24 * 3600000));

  const focusLabels: Record<string, string> = {
    autism: 'Autism', speech: 'Speech Delay', motor: 'Physical / Motor',
    visual: 'Visual Impairment', hearing: 'Hearing Impairment', multiple: 'Multiple Needs', unsure: 'Not Sure Yet',
  };

  const menuItems = [
    { icon: <Bookmark size={20} />, label: t('savedActivities'), screen: 'saved-activities' as const },
    { icon: <FileText size={20} />, label: t('parentNotes'), screen: 'parent-notes' as const },
    { icon: <Bell size={20} />, label: t('notifications'), screen: 'notifications' as const },
    { icon: <HelpCircle size={20} />, label: t('helpSupport'), screen: 'help-support' as const },
    { icon: <Lock size={20} />, label: t('privacy'), screen: 'privacy' as const },
    { icon: <Info size={20} />, label: t('about'), screen: 'about' as const },
  ];

  return (
    <div className="screen" style={{ background: 'var(--color-background)' }}>
      <div className="screen-header">
        <h1 className="screen-title">{t('profile')}</h1>
      </div>
      <div className="screen-content" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Active Child Card */}
        <div className="card animate-fade-in" style={{ textAlign: 'center', padding: 24, position: 'relative' }}>
          <button
            onClick={() => {
              dispatch({ type: 'SET_PROFILE_SETUP_MODE', mode: 'edit', editingChildId: profile.id });
              navigate('profile-setup');
            }}
            style={{
              position: 'absolute',
              top: 16,
              [isRTL ? 'left' : 'right']: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '8px 12px',
              borderRadius: 'var(--radius-input)',
              border: '1.5px solid var(--color-border)',
              background: 'var(--color-card)',
              color: 'var(--color-primary)',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Pencil size={14} /> Edit
          </button>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <ChildAvatar child={profile} size={72} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>{profile.name}</h2>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 4 }}>
            {age} {t('yearsOld')} • {focusLabels[profile.supportNeed] || profile.supportNeed}
          </p>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2 }}>
            {profile.city}, {profile.province}
          </p>
        </div>

        {/* Children Switcher */}
        <div className="card animate-fade-in delay-1" style={{ border: '1.5px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <Users size={16} color="var(--color-primary)" />
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)' }}>{t('yourChildren')}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {state.children.map((child) => {
              const isActive = child.id === state.activeChildId;
              const childAge = Math.floor((Date.now() - new Date(child.dateOfBirth).getTime()) / (365.25 * 24 * 3600000));
              return (
                <button
                  key={child.id}
                  onClick={() => {
                    if (!isActive) dispatch({ type: 'SET_ACTIVE_CHILD', childId: child.id });
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: 12,
                    borderRadius: 'var(--radius-input)',
                    border: isActive ? '2px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                    background: isActive ? 'var(--color-soft-lavender)' : 'var(--color-card)',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: isRTL ? 'right' : 'left',
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                  }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 14, overflow: 'hidden', flexShrink: 0 }}>
                    <ChildAvatar child={child} size={40} style={{ border: 'none', borderRadius: 14 }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>{child.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                      {childAge} {t('yearsOld')} • {focusLabels[child.supportNeed] || child.supportNeed}
                    </p>
                  </div>
                  {isActive && <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary)' }}>{t('active')}</span>}
                </button>
              );
            })}
            <button
              onClick={() => {
                dispatch({ type: 'SET_PROFILE_SETUP_MODE', mode: 'add' });
                navigate('profile-setup');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: 12,
                borderRadius: 'var(--radius-input)',
                border: '1.5px dashed var(--color-border)',
                background: 'var(--color-card)',
                cursor: 'pointer',
                width: '100%',
                color: 'var(--color-text-secondary)',
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              <Plus size={20} /> {t('addAnotherChild')}
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <div className="card animate-fade-in delay-2" style={{ padding: 0, overflow: 'hidden' }}>
          {menuItems.map((item, i) => (
            <button
              key={i}
              onClick={() => navigate(item.screen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '16px 18px',
                width: '100%',
                textAlign: 'left',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                borderBottom: i < menuItems.length - 1 ? '1px solid var(--color-border)' : 'none',
              }}
            >
              <div style={{ color: 'var(--color-primary)' }}>{item.icon}</div>
              <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: 'var(--color-text)' }}>{item.label}</span>
              <ChevronRight size={18} color="var(--color-text-secondary)" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ CHILD PROFILE VIEW ═══════════════ */
export function ChildProfileScreen() {
  const { state, goBack, navigate, dispatch } = useApp();
  const { t } = useTranslation();
  const p = state.childProfile;
  if (!p) return null;

  const supportLabels: Record<string, string> = {
    autism: 'Autism', speech: 'Speech Delay', motor: 'Physical / Motor',
    visual: 'Visual Impairment', hearing: 'Hearing Impairment', multiple: 'Multiple Needs', unsure: 'Not Sure Yet',
  };
  const diagLabels: Record<string, string> = {
    diagnosed: 'Diagnosed', under_assessment: 'Under Assessment',
    not_diagnosed: 'Not Diagnosed', prefer_not_to_say: 'Prefer Not to Say',
  };

  const age = Math.floor((Date.now() - new Date(p.dateOfBirth).getTime()) / (365.25 * 24 * 3600000));

  return (
    <div style={{ background: 'var(--color-background)', minHeight: '100vh', paddingBottom: 40 }}>
      <ScreenHeader
        title={t('childProfile')}
        onBack={goBack}
        rightAction={
          <button
            onClick={() => {
              dispatch({ type: 'SET_PROFILE_SETUP_MODE', mode: 'edit', editingChildId: p.id });
              navigate('profile-setup');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '8px 12px',
              borderRadius: 'var(--radius-input)',
              border: '1.5px solid var(--color-border)',
              background: 'var(--color-card)',
              color: 'var(--color-primary)',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Pencil size={14} /> {t('edit')}
          </button>
        }
      />
      <div style={{ padding: '0 20px' }}>
        <div className="card animate-fade-in" style={{ padding: 24, textAlign: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <ChildAvatar child={p} size={72} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>{p.name}</h2>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 4 }}>
            {age} years old • {supportLabels[p.supportNeed] || p.supportNeed}
          </p>
        </div>

        <div className="card" style={{ padding: 20 }}>
          {[
            [t('parentName'), p.parentName],
            [t('childName'), p.name],
            [t('dateOfBirth'), p.dateOfBirth],
            [t('age'), `${age} ${t('yearsOld')}`],
            [t('gender'), p.gender.charAt(0).toUpperCase() + p.gender.slice(1)],
            [t('city'), p.city],
            [t('province'), p.province],
            [t('supportNeed'), supportLabels[p.supportNeed] || p.supportNeed],
            [t('diagnosisStatus'), diagLabels[p.diagnosisStatus] || ''],
          ].map(([label, value], i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px 0',
              borderBottom: '1px solid var(--color-border)',
            }}>
              <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>{label}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ NOTIFICATIONS ═══════════════ */
export function NotificationsScreen() {
  const { state, dispatch, goBack } = useApp();
  const { t } = useTranslation();

  return (
    <div className="screen" style={{ background: 'var(--color-background)' }}>
      <ScreenHeader
        title={t('notifications')}
        onBack={goBack}
        rightAction={
          <button
            onClick={() => dispatch({ type: 'CLEAR_ALL_NOTIFICATIONS' })}
            style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary)', padding: '8px 12px', minHeight: 44 }}
          >
            {t('clearAll')}
          </button>
        }
      />
      <div className="screen-content" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {state.notifications.length === 0 ? (
          <EmptyState
            icon={<Bell size={40} color="var(--color-text-secondary)" />}
            title={t('noNotifications')}
            message={t('allCaughtUp')}
          />
        ) : (
          state.notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => dispatch({ type: 'MARK_NOTIFICATION_READ', notificationId: n.id })}
              className="card"
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
                cursor: 'pointer',
                border: 'none',
                width: '100%',
                textAlign: 'left',
                padding: 16,
                background: n.read ? 'var(--color-card)' : '#F0FAFA',
              }}
            >
              <div style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: n.read ? 'transparent' : 'var(--color-primary)',
                flexShrink: 0,
                marginTop: 5,
              }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{n.title}</p>
                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2, lineHeight: 1.4 }}>{n.message}</p>
                <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 6 }}>{n.time}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

/* ═══════════════ PARENT NOTES ═══════════════ */
export function ParentNotesScreen() {
  const { state, navigate, goBack, dispatch } = useApp();
  const { t } = useTranslation();

  return (
    <div className="screen" style={{ background: 'var(--color-background)' }}>
      <ScreenHeader
        title={t('parentNotes')}
        onBack={goBack}
        rightAction={
          <button
            onClick={() => navigate('add-note')}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 44,
              minHeight: 44,
            }}
            aria-label="Add note"
          >
            <Plus size={20} color="#fff" />
          </button>
        }
      />
      <div className="screen-content">
        {state.parentNotes.length === 0 ? (
          <EmptyState
            icon={<FileText size={40} color="var(--color-text-secondary)" />}
            title={t('noNotesYet')}
            message={t('notesMessage')}
            action={t('addFirstNote')}
            onAction={() => navigate('add-note')}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {state.parentNotes.map((note) => (
              <div key={note.id} className="card animate-fade-in" style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 600, background: 'var(--color-soft-lavender)', padding: '3px 10px', borderRadius: 10 }}>
                    {note.category}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{note.date}</span>
                </div>
                <p style={{ fontSize: 14, color: 'var(--color-text)', lineHeight: 1.6 }}>{note.note}</p>
                <button
                  onClick={() => {
                    if (confirm('Delete this note?')) {
                      dispatch({ type: 'DELETE_NOTE', noteId: note.id });
                    }
                  }}
                  style={{
                    marginTop: 10,
                    fontSize: 12,
                    color: 'var(--color-error)',
                    background: 'none',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    cursor: 'pointer',
                    padding: 0,
                    minHeight: 44,
                  }}
                >
                  <Trash2 size={14} /> {t('delete')}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════ ADD NOTE ═══════════════ */
export function AddNoteScreen() {
  const { dispatch, goBack } = useApp();
  const { t } = useTranslation();
  const [category, setCategory] = useState('Milestone');
  const [note, setNote] = useState('');

  const categories = ['Milestone', 'Observation', 'Concern', 'Achievement', 'General'];
  const categoryKeys: Record<string, string> = {
    Milestone: t('milestone'),
    Observation: t('observation'),
    Concern: t('concern'),
    Achievement: t('achievement'),
    General: t('general'),
  };

  const handleSave = () => {
    if (!note.trim()) return;
    dispatch({
      type: 'ADD_NOTE',
      note: {
        id: `note-${Date.now()}`,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        category,
        note: note.trim(),
      },
    });
    goBack();
  };

  return (
    <div style={{ background: 'var(--color-background)', minHeight: '100vh' }}>
      <ScreenHeader title={t('newNote')} onBack={goBack} />
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', display: 'block', marginBottom: 8 }}>{t('category')}</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                style={{
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-chip)',
                  border: category === c ? '2px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                  background: category === c ? 'var(--color-soft-lavender)' : 'var(--color-card)',
                  fontSize: 13,
                  fontWeight: 600,
                  color: category === c ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                }}
              >
                {categoryKeys[c]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', display: 'block', marginBottom: 8 }}>{t('yourNote')}</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('notePlaceholder')}
            rows={6}
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: 'var(--radius-input)',
              border: '1.5px solid var(--color-border)',
              background: 'var(--color-input-bg)',
              fontSize: 15,
              color: 'var(--color-text)',
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
          />
        </div>
        <PrimaryButton fullWidth onClick={handleSave} disabled={!note.trim()}>
          {t('saveNote')}
        </PrimaryButton>
      </div>
    </div>
  );
}

/* ═══════════════ SETTINGS ═══════════════ */
export function SettingsScreen() {
  const { state, dispatch, goBack, signOut } = useApp();
  const { t, language, setLanguage, isRTL } = useTranslation();
  const [modal, setModal] = useState<'language' | 'accessibility' | 'privacy' | 'terms' | 'logout' | 'switch' | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleLogout = async () => {
    setIsSigningOut(true);
    await signOut();
    setIsSigningOut(false);
    setModal(null);
  };

  const handleSwitchAccount = async () => {
    setIsSigningOut(true);
    await signOut();
    setIsSigningOut(false);
    setModal(null);
  };

  const handleSetLanguage = (lang: 'en' | 'ur') => {
    setLanguage(lang);
  };

  const settingItems = [
    { icon: <Globe size={20} />, label: t('language'), action: () => setModal('language') },
    { icon: <Type size={20} />, label: t('accessibility'), action: () => setModal('accessibility') },
    { icon: <Shield size={20} />, label: t('privacy'), action: () => setModal('privacy') },
    { icon: <FileTextIcon size={20} />, label: t('terms'), action: () => setModal('terms') },
  ];

  return (
    <div className="screen" style={{ background: 'var(--color-background)' }}>
      <ScreenHeader title={t('settings')} onBack={goBack} />
      <div className="screen-content" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Dark Mode */}
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>{t('darkMode')}</h3>
            <button
              onClick={() => dispatch({ type: 'TOGGLE_DARK_MODE' })}
              style={{
                width: 52,
                height: 30,
                borderRadius: 100,
                background: state.darkMode ? 'var(--color-primary)' : 'var(--color-border)',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.3s',
                minHeight: 30,
                minWidth: 52,
              }}
              aria-label={t('darkMode')}
            >
              <div style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: '#fff',
                position: 'absolute',
                top: 3,
                left: state.darkMode ? 25 : 3,
                transition: 'all 0.3s',
                boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
              }} />
            </button>
          </div>
        </div>

        {/* Other Settings */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {settingItems.map((item, index) => (
            <button
              key={item.label}
              onClick={item.action}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 18px',
                width: '100%',
                textAlign: isRTL ? 'right' : 'left',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                borderBottom: index < settingItems.length - 1 ? '1px solid var(--color-border)' : 'none',
                color: 'var(--color-text)',
                flexDirection: isRTL ? 'row-reverse' : 'row',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, fontWeight: 500, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                {item.icon} {item.label}
              </span>
              <ChevronRight size={18} color="var(--color-text-secondary)" style={{ transform: isRTL ? 'scaleX(-1)' : undefined }} />
            </button>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={() => setModal('logout')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '14px',
            borderRadius: 'var(--radius-button)',
            background: 'var(--color-error-bg)',
            color: 'var(--color-error)',
            fontSize: 15,
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            marginTop: 8,
          }}
        >
          <LogOut size={18} /> {t('logOut')}
        </button>

        <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', textAlign: 'center', marginTop: 16 }}>
          CareSync v1.0.0 — {t('tagline')}
        </p>
      </div>

      {/* Modals */}
      {modal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.45)',
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }} onClick={() => setModal(null)}>
          <div style={{
            background: 'var(--color-card)',
            borderRadius: 24,
            padding: 24,
            width: '100%',
            maxWidth: 360,
            maxHeight: '80vh',
            overflow: 'auto',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)' }}>
                {modal === 'language' && t('language')}
                {modal === 'accessibility' && t('accessibility')}
                {modal === 'privacy' && t('privacy')}
                {modal === 'terms' && t('terms')}
                {modal === 'logout' && t('logOut')}
                {modal === 'switch' && t('switchExistingAccount')}
              </h3>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <X size={22} color="var(--color-text-secondary)" />
              </button>
            </div>

            {modal === 'language' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {([
                  { code: 'en' as const, label: t('english') },
                  { code: 'ur' as const, label: t('urdu') },
                ]).map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleSetLanguage(lang.code)}
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-input)',
                      border: language === lang.code ? '2px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                      background: language === lang.code ? 'var(--color-soft-lavender)' : 'var(--color-input-bg)',
                      color: language === lang.code ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: isRTL ? 'right' : 'left',
                    }}
                  >
                    {lang.label} {language === lang.code ? `(${t('active')})` : ''}
                  </button>
                ))}
              </div>
            )}

            {modal === 'accessibility' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>{t('accessibility')}</p>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)' }}>{t('fontSize')}</h4>
                <div style={{ display: 'flex', gap: 10 }}>
                  {(['small', 'medium', 'large'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => dispatch({ type: 'SET_FONT_SIZE', size })}
                      style={{
                        flex: 1,
                        padding: '12px 8px',
                        borderRadius: 'var(--radius-input)',
                        border: state.fontSize === size ? '2px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                        background: state.fontSize === size ? 'var(--color-soft-lavender)' : 'var(--color-input-bg)',
                        color: state.fontSize === size ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: size === 'small' ? 12 : size === 'medium' ? 14 : 16,
                      }}
                    >
                      {t(size)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {modal === 'privacy' && (
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                <p>{t('privacyText')}</p>
              </div>
            )}

            {modal === 'terms' && (
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                <p>{t('termsText')}</p>
              </div>
            )}

            {modal === 'logout' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                  {t('logOutConfirmMessage')}
                </p>
                <PrimaryButton onClick={handleLogout} disabled={isSigningOut}>
                  {isSigningOut ? t('pleaseWait') || 'Please wait...' : t('logOut')}
                </PrimaryButton>
                <button
                  onClick={handleSwitchAccount}
                  disabled={isSigningOut}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-button)',
                    border: '1.5px solid var(--color-border)',
                    background: 'var(--color-input-bg)',
                    color: 'var(--color-text)',
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: 'pointer',
                    opacity: isSigningOut ? 0.7 : 1,
                  }}
                >
                  {isSigningOut ? t('pleaseWait') || 'Please wait...' : t('switchExistingAccount')}
                </button>
                <button
                  onClick={() => setModal(null)}
                  disabled={isSigningOut}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-button)',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--color-text-secondary)',
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {t('cancel')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════ HELP & SUPPORT ═══════════════ */
export function HelpSupportScreen() {
  const { goBack } = useApp();
  const { t } = useTranslation();

  const faqs = [
    { q: t('whatIsCareSync'), a: t('whatIsCareSyncAnswer') },
    { q: t('isMedicalApp'), a: t('isMedicalAppAnswer') },
    { q: t('howFindSpecialist'), a: t('howFindSpecialistAnswer') },
    { q: t('offlineUse'), a: t('offlineUseAnswer') },
    { q: t('howTrackProgress'), a: t('howTrackProgressAnswer') },
  ];

  return (
    <div className="screen" style={{ background: 'var(--color-background)' }}>
      <ScreenHeader title={t('helpSupport')} onBack={goBack} />
      <div className="screen-content" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* About */}
        <div className="card animate-fade-in" style={{ textAlign: 'center', padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <CareSyncLogo size={60} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 12 }}>{t('appName')}</h2>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 4 }}>{t('tagline')}</p>
          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 8, lineHeight: 1.6 }}>
            {t('aboutText')}
          </p>
        </div>

        {/* FAQs */}
        <SectionHeader title={t('faq')} />
        {faqs.map((faq, i) => (
          <details
            key={i}
            className="card"
            style={{ padding: 16, cursor: 'pointer' }}
          >
            <summary style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', listStyle: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
              <ChevronRight size={16} style={{ transition: 'transform 0.2s' }} />
              {faq.q}
            </summary>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 10, lineHeight: 1.6, paddingLeft: 24 }}>
              {faq.a}
            </p>
          </details>
        ))}

        {/* Contact */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <HelpCircle size={20} color="var(--color-primary)" /> {t('contactSupport')}
          </h3>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
            {t('supportEmailText')}
          </p>
          <a
            href="mailto:caresync0@gmail.com"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 16px',
              borderRadius: 'var(--radius-input)',
              background: 'var(--color-soft-lavender)',
              color: 'var(--color-primary)',
              fontSize: 14,
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            caresync0@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ SAVED ACTIVITIES ═══════════════ */
export function SavedActivitiesScreen() {
  const { state, navigate, dispatch, goBack } = useApp();
  const { t } = useTranslation();
  const savedActs = activities.filter((a) => state.savedActivities.includes(a.id));

  return (
    <div className="screen" style={{ background: 'var(--color-background)' }}>
      <ScreenHeader title={t('savedActivities')} onBack={goBack} />
      <div className="screen-content">
        {savedActs.length === 0 ? (
          <EmptyState
            icon={<Bookmark size={40} color="var(--color-text-secondary)" />}
            title={t('noSavedActivities')}
            message={t('savedActivitiesMessage')}
            action={t('browseActivities')}
            onAction={() => navigate('activities')}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {savedActs.map((act) => (
              <button
                key={act.id}
                onClick={() => {
                  dispatch({ type: 'SELECT_ACTIVITY', activityId: act.id });
                  navigate('activity-detail');
                }}
                className="card"
                style={{
                  display: 'flex',
                  gap: 14,
                  alignItems: 'center',
                  cursor: 'pointer',
                  border: 'none',
                  width: '100%',
                  textAlign: 'left',
                  padding: 14,
                }}
              >
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: 'var(--color-soft-lavender)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {categoryIconMap[act.category] || <Activity size={22} color="var(--color-primary)" />}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)' }}>{act.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{act.duration} min • {act.difficulty}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch({ type: 'UNSAVE_ACTIVITY', activityId: act.id });
                  }}
                  style={{ padding: 8, fontSize: 12, color: 'var(--color-error)', minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  aria-label={t('removeFromSaved')}
                >
                  <Trash2 size={16} />
                </button>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════ ABOUT CARESYNC ═══════════════ */
export function AboutScreen() {
  const { goBack } = useApp();
  const { t, isRTL } = useTranslation();

  const features = [
    {
      icon: <Bot size={22} color="var(--color-primary)" />,
      title: t('careAI'),
      description: t('aboutCareAI'),
    },
    {
      icon: <Activity size={22} color="var(--color-primary)" />,
      title: t('activities'),
      description: t('aboutActivities'),
    },
    {
      icon: <TrendingUp size={22} color="var(--color-primary)" />,
      title: t('progress'),
      description: t('aboutProgress'),
    },
    {
      icon: <Stethoscope size={22} color="var(--color-primary)" />,
      title: t('professionals'),
      description: t('aboutProfessionals'),
    },
    {
      icon: <MapPin size={22} color="var(--color-primary)" />,
      title: t('centres'),
      description: t('aboutCentres'),
    },
    {
      icon: <Heart size={22} color="var(--color-primary)" />,
      title: t('personalizedSupport'),
      description: t('aboutPersonalizedSupport'),
    },
  ];

  return (
    <div className="screen" style={{ background: 'var(--color-background)' }}>
      <ScreenHeader title={t('about')} onBack={goBack} />
      <div className="screen-content" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Hero */}
        <div className="card animate-fade-in" style={{ textAlign: 'center', padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <CareSyncLogo size={64} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 14 }}>{t('appName')}</h2>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 6 }}>{t('tagline')}</p>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 12, lineHeight: 1.7 }}>
            {t('aboutText')}
          </p>
        </div>

        {/* Mission */}
        <div className="card animate-fade-in" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            <Sparkles size={20} color="var(--color-primary)" />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>{t('ourMission')}</h3>
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.7, textAlign: isRTL ? 'right' : 'left' }}>
            {t('missionText')}
          </p>
        </div>

        {/* Features */}
        <SectionHeader title={t('keyFeatures')} />
        {features.map((feature, i) => (
          <div key={i} className="card animate-fade-in" style={{ padding: 16, display: 'flex', gap: 14, alignItems: 'flex-start', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: 'var(--color-soft-lavender)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              {feature.icon}
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>{feature.title}</h4>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4, lineHeight: 1.6, textAlign: isRTL ? 'right' : 'left' }}>
                {feature.description}
              </p>
            </div>
          </div>
        ))}

        {/* Tagline banner */}
        <div className="card animate-fade-in" style={{
          padding: 20,
          background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)',
          color: '#fff',
          textAlign: 'center',
        }}>
          <Heart size={28} style={{ margin: '0 auto 10px' }} />
          <p style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.5 }}>{t('tagline')}</p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ PRIVACY ═══════════════ */
export function PrivacyScreen() {
  const { goBack } = useApp();
  const { t, isRTL } = useTranslation();

  const sections = [
    {
      icon: <Users size={22} color="var(--color-primary)" />,
      title: t('privacyProfiles'),
      description: t('privacyProfilesText'),
    },
    {
      icon: <ImageIcon size={22} color="var(--color-primary)" />,
      title: t('privacyPhotos'),
      description: t('privacyPhotosText'),
    },
    {
      icon: <Lock size={22} color="var(--color-primary)" />,
      title: t('privacyAuth'),
      description: t('privacyAuthText'),
    },
    {
      icon: <ShieldCheck size={22} color="var(--color-primary)" />,
      title: t('privacyProtection'),
      description: t('privacyProtectionText'),
    },
    {
      icon: <UserCheck size={22} color="var(--color-primary)" />,
      title: t('privacyControl'),
      description: t('privacyControlText'),
    },
  ];

  return (
    <div className="screen" style={{ background: 'var(--color-background)' }}>
      <ScreenHeader title={t('privacy')} onBack={goBack} />
      <div className="screen-content" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Overview */}
        <div className="card animate-fade-in" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            <Shield size={20} color="var(--color-primary)" />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>{t('privacyOverview')}</h3>
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.7, textAlign: isRTL ? 'right' : 'left' }}>
            {t('privacyText')}
          </p>
        </div>

        {/* Sections */}
        <SectionHeader title={t('privacyPractices')} />
        {sections.map((section, i) => (
          <div key={i} className="card animate-fade-in" style={{ padding: 16, display: 'flex', gap: 14, alignItems: 'flex-start', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: 'var(--color-soft-lavender)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              {section.icon}
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>{section.title}</h4>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4, lineHeight: 1.6, textAlign: isRTL ? 'right' : 'left' }}>
                {section.description}
              </p>
            </div>
          </div>
        ))}

        {/* Contact / more info */}
        <div className="card animate-fade-in" style={{ padding: 18, textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            {t('privacyQuestions')}
          </p>
        </div>
      </div>
    </div>
  );
}
