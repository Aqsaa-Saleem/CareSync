import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../i18n/useTranslation';
import { SectionHeader, IconButton, ProgressBar, Icons, Icon3D, ChildAvatar } from '../components/UI';
import { activities, getTodayActivities, categoryLabels } from '../data/activities';
import { careTips, professionals } from '../data/professionals';
import { centres } from '../data/centres';
import { Clock, ChevronRight, Bell, Settings, Check, Star } from 'lucide-react';

const focusLabels: Record<string, string> = {
  autism: 'Autism Support',
  speech: 'Speech + Communication',
  motor: 'Motor Skills',
  visual: 'Visual Support',
  hearing: 'Hearing Support',
  multiple: 'Multiple Needs',
  unsure: 'General Development',
};

const categoryIcons3D: Record<string, string> = {
  autism: '🧩',
  speech: '💬',
  motor: '🏃',
  visual: '👁️',
  hearing: '👂',
  sensory: '✨',
  communication: '🗣️',
};

const supportNeedToFocusArea: Record<string, string> = {
  autism: 'Autism',
  speech: 'Speech Delay',
  motor: 'Physical / Motor',
  visual: 'Visual Impairment',
  hearing: 'Hearing Impairment',
  multiple: 'Multiple Needs',
  unsure: '',
};

function getTimeOfDay(t: (key: import('../i18n/translations').TranslationKey) => string): string {
  const h = new Date().getHours();
  if (h < 12) return t('goodMorning');
  if (h < 17) return t('goodAfternoon');
  return t('goodEvening');
}

export function HomeScreen() {
  const { state, navigate, dispatch } = useApp();
  const { t, isRTL } = useTranslation();
  const profile = state.childProfile!;
  const todayActs = useMemo(() => getTodayActivities(), []);
  const tip = useMemo(() => careTips[new Date().getDate() % careTips.length], []);
  const completedToday = state.completedActivities.filter((id) =>
    todayActs.some((a) => a.id === id)
  ).length;
  const progressPct = Math.round((state.completedActivities.length / activities.length) * 100);
  const unreadNotifs = state.notifications.filter((n) => !n.read).length;

  const focusArea = supportNeedToFocusArea[profile.supportNeed];
  const recommendedProfessionals = focusArea
    ? professionals
        .filter((p) => p.supportArea === focusArea)
        .filter((p) => (profile.province ? p.province === profile.province : true))
        .filter((p) => (profile.city ? p.city.toLowerCase() === profile.city.toLowerCase() : true))
        .slice(0, 2)
    : [];
  const recommendedCentres = focusArea
    ? centres
        .filter((c) => c.supportArea === focusArea)
        .filter((c) => (profile.province ? c.province === profile.province : true))
        .filter((c) => (profile.city ? c.city.toLowerCase() === profile.city.toLowerCase() : true))
        .slice(0, 2)
    : [];

  return (
    <div className="screen" style={{ background: 'var(--color-background)' }}>
      {/* Top Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px 8px',
        flexDirection: isRTL ? 'row-reverse' : 'row',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
          <div style={{ width: 46, height: 46, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
            <ChildAvatar child={profile} size={46} style={{ border: 'none', borderRadius: '50%' }} />
          </div>
          <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>
              {getTimeOfDay(t)}, {profile.parentName.split(' ')[0]}
            </p>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
              {t('howIsToday').replace('{{name}}', profile.name)}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <IconButton
            icon={<Settings size={20} color="var(--color-text-secondary)" />}
            onClick={() => navigate('settings')}
            label={t('settings')}
          />
          <IconButton
            icon={<Bell size={20} color="var(--color-text-secondary)" />}
            badge={unreadNotifs}
            onClick={() => navigate('notifications')}
            label={t('notifications')}
          />
        </div>
      </div>

      <div className="screen-content" style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 12 }}>
        {/* Child Summary Card */}
        <div className="card animate-fade-in delay-1" style={{
          background: 'linear-gradient(135deg, #1B1F3B 0%, #6D5DFB 100%)',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
          border: 'none',
        }}>
          <div style={{
            position: 'absolute',
            top: -30,
            right: -30,
            width: 140,
            height: 140,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
          }} />
          <div style={{
            position: 'absolute',
            bottom: -20,
            left: -20,
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
          }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
              <p style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{profile.name}</p>
              <p style={{ fontSize: 13, opacity: 0.85 }}>
                {Math.floor((Date.now() - new Date(profile.dateOfBirth).getTime()) / (365.25 * 24 * 3600000))} {t('yearsOld')}
              </p>
              <p style={{ fontSize: 13, opacity: 0.85, marginTop: 2 }}>
                {focusLabels[profile.supportNeed] || 'General Development'}
              </p>
            </div>
            <div style={{ textAlign: isRTL ? 'left' : 'right' }}>
              <p style={{ fontSize: 28, fontWeight: 700 }}>{progressPct}%</p>
              <p style={{ fontSize: 11, opacity: 0.8 }}>{t('progress')}</p>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <ProgressBar value={progressPct} max={100} color="#B8A7FF" height={6} />
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { emoji: '🎯', title: t('todaysActivities'), desc: `${todayActs.length} ${t('activitiesWaiting')}`, screen: 'activities' as const, bg: 'var(--color-soft-lavender)' },
              { emoji: '🩺', title: t('findSpecialist'), desc: t('doctorsAndTherapists'), screen: 'professionals' as const, bg: 'var(--color-warning-bg)' },
              { emoji: '🏫', title: t('findCentre'), desc: t('schoolsAndTherapy'), screen: 'centres' as const, bg: 'var(--color-success-bg)' },
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => navigate(item.screen)}
                className={`card animate-fade-in-up delay-${i + 2}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  textAlign: isRTL ? 'right' : 'left',
                  cursor: 'pointer',
                  padding: 16,
                  border: '1.5px solid var(--color-border)',
                  alignItems: isRTL ? 'flex-end' : 'flex-start',
                }}
              >
                <Icon3D emoji={item.emoji} size={48} bg={item.bg} />
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)' }}>{item.title}</p>
                  <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2, fontFamily: 'var(--font-body)' }}>{item.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Today's Plan */}
        <div>
          <SectionHeader title={t('todayPlan')} action={t('seeAll')} onAction={() => navigate('activities')} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {todayActs.map((act, i) => {
              const isComplete = state.completedActivities.includes(act.id);
              return (
                <button
                  key={act.id}
                  onClick={() => {
                    dispatch({ type: 'SELECT_ACTIVITY', activityId: act.id });
                    navigate('activity-detail');
                  }}
                  className={`card animate-fade-in-up delay-${i + 3}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    cursor: 'pointer',
                    border: 'none',
                    width: '100%',
                    textAlign: isRTL ? 'right' : 'left',
                    padding: 14,
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                  }}
                >
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 16,
                    background: isComplete ? 'var(--color-success-bg)' : 'var(--color-soft-lavender)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {isComplete ? <Check size={22} color="var(--color-success)" /> : <Icon3D emoji={categoryIcons3D[act.category] || '✨'} size={40} bg="transparent" />}
                  </div>
                  <div style={{ flex: 1, textAlign: isRTL ? 'right' : 'left' }}>
                    <p style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: 'var(--color-text)',
                      textDecoration: isComplete ? 'line-through' : 'none',
                      opacity: isComplete ? 0.6 : 1,
                    }}>
                      {act.name}
                    </p>
                    <div style={{ display: 'flex', gap: 12, marginTop: 4, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                      <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={12} /> {act.duration} {t('minutesShort')}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                        {categoryLabels[act.category]}
                      </span>
                    </div>
                  </div>
                  {!isComplete && (
                    <span style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: 'var(--color-primary)',
                      padding: '6px 14px',
                      background: 'var(--color-soft-lavender)',
                      borderRadius: 20,
                    }}>
                      {t('start')}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Recommended for your child */}
        {(recommendedProfessionals.length > 0 || recommendedCentres.length > 0) && (
          <div className="animate-fade-in delay-6">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <Star size={18} color="var(--color-warm-accent)" fill="var(--color-warm-accent)" />
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', letterSpacing: -0.3 }}>{t('recommendedFor')} {profile.name}</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recommendedProfessionals.map((prof) => (
                <button
                  key={prof.id}
                  onClick={() => {
                    dispatch({ type: 'SELECT_PROFESSIONAL', professionalId: prof.id });
                    navigate('professional-detail');
                  }}
                  className="card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    textAlign: isRTL ? 'right' : 'left',
                    cursor: 'pointer',
                    border: 'none',
                    width: '100%',
                    padding: 14,
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                  }}
                >
                  <Icon3D emoji='🩺' size={46} bg='var(--color-soft-lavender)' />
                  <div style={{ flex: 1, minWidth: 0, textAlign: isRTL ? 'right' : 'left' }}>
                    <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)' }}>{prof.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{prof.specialization} · {prof.city}</p>
                  </div>
                  <ChevronRight size={18} color="var(--color-muted)" style={{ transform: isRTL ? 'scaleX(-1)' : undefined }} />
                </button>
              ))}
              {recommendedCentres.map((centre) => (
                <button
                  key={centre.id}
                  onClick={() => {
                    dispatch({ type: 'SELECT_CENTRE', centreId: centre.id });
                    navigate('centre-detail');
                  }}
                  className="card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    textAlign: isRTL ? 'right' : 'left',
                    cursor: 'pointer',
                    border: 'none',
                    width: '100%',
                    padding: 14,
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                  }}
                >
                  <Icon3D emoji='🏫' size={46} bg='var(--color-success-bg)' />
                  <div style={{ flex: 1, minWidth: 0, textAlign: isRTL ? 'right' : 'left' }}>
                    <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)' }}>{centre.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{centre.type} · {centre.city}</p>
                  </div>
                  <ChevronRight size={18} color="var(--color-muted)" style={{ transform: isRTL ? 'scaleX(-1)' : undefined }} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Daily Progress */}
        <div className="card animate-fade-in delay-7" style={{ border: '1.5px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>{t('todayProgress')}</p>
            <span style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-warm-accent)', fontWeight: 700 }}>
              <Icons.Flame size={14} /> {state.streak} {t('dayStreak').toLowerCase()}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
              {t('activitiesCompleted')}: <strong style={{ color: 'var(--color-text)' }}>{completedToday} / {todayActs.length}</strong>
            </p>
          </div>
          <ProgressBar value={completedToday} max={todayActs.length || 1} />
        </div>

        {/* Care Tip */}
        <div className="card animate-fade-in delay-8" style={{
          background: 'linear-gradient(135deg, var(--color-warning-bg) 0%, var(--color-warning-bg) 100%)',
          border: '1.5px solid rgba(232, 184, 109, 0.25)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            <Star size={18} color="var(--color-warm-accent)" fill="var(--color-warm-accent)" />
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-warning-text)' }}>{t('todaysCareTip')}</p>
          </div>
          <p style={{ fontSize: 14, color: 'var(--color-warning-text)', lineHeight: 1.6, fontFamily: 'var(--font-body)', textAlign: isRTL ? 'right' : 'left' }}>
            {tip}
          </p>
          <button
            onClick={() => navigate('care-ai')}
            style={{
              marginTop: 12,
              fontSize: 14,
              fontWeight: 700,
              color: 'var(--color-warning-text)',
              background: 'rgba(232, 184, 109, 0.18)',
              border: 'none',
              borderRadius: 'var(--radius-button)',
              padding: '10px 18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              minHeight: 44,
              flexDirection: isRTL ? 'row-reverse' : 'row',
            }}
          >
            {t('learnMore')} <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
