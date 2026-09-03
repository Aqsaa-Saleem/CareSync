import { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../i18n/useTranslation';
import { SearchBar, ScreenHeader, EmptyState, Select } from '../components/UI';
import { activities, categoryLabels, activityTypes, skillAreas, difficultyLevels } from '../data/activities';
import { getVideosByCategory, type CareVideo } from '../data/videos';
import { Clock, BookOpen, Play, ChevronRight, Check, AlertCircle } from 'lucide-react';

const categoryThumbnails: Record<string, { gradient: string; emoji: string }> = {
  autism: { gradient: 'linear-gradient(135deg, #F0EDFF 0%, #E8EEFF 100%)', emoji: '🧩' },
  speech: { gradient: 'linear-gradient(135deg, #E8F5E9 0%, #D1F2EB 100%)', emoji: '💬' },
  motor: { gradient: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)', emoji: '🏃' },
  visual: { gradient: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)', emoji: '👁️' },
  hearing: { gradient: 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)', emoji: '👂' },
  sensory: { gradient: 'linear-gradient(135deg, #E0F7FA 0%, #B2EBF2 100%)', emoji: '✨' },
  communication: { gradient: 'linear-gradient(135deg, #E8EAF6 0%, #C5CAE9 100%)', emoji: '🗣️' },
};

function ActivityThumbnail({ category, emoji, size = 56 }: { category: string; emoji?: string; size?: number }) {
  const style = categoryThumbnails[category] || categoryThumbnails.sensory;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: style.gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.55,
        lineHeight: 1,
        boxShadow: '0 6px 16px rgba(27, 31, 59, 0.10), inset 0 -2px 6px rgba(0,0,0,0.04)',
        textShadow: '0 2px 4px rgba(0,0,0,0.12)',
        flexShrink: 0,
      }}
    >
      {emoji || style.emoji}
    </div>
  );
}

function CareGuideVideoCard({ video }: { video: CareVideo }) {
  const [imgError, setImgError] = useState(false);
  const { t } = useTranslation();
  const showFallback = imgError || !video.thumbnail;

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        gap: 14,
        padding: 14,
        alignItems: 'center',
        border: '1.5px solid var(--color-border)',
      }}
    >
      <div style={{ position: 'relative', flexShrink: 0 }}>
        {showFallback ? (
          <div style={{
            width: 100,
            height: 70,
            borderRadius: 14,
            background: 'linear-gradient(135deg, var(--color-soft-lavender) 0%, var(--color-soft-blue-lavender) 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 8,
            textAlign: 'center',
          }}>
            <Play size={24} color="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.2} />
            <span style={{ fontSize: 9, color: 'var(--color-primary-deep)', fontWeight: 700, marginTop: 4, lineHeight: 1.2 }}>
              {video.title}
            </span>
          </div>
        ) : (
          <img
            src={video.thumbnail}
            alt={video.title}
            style={{
              width: 100,
              height: 70,
              borderRadius: 14,
              objectFit: 'cover',
              background: 'var(--color-soft-lavender)',
            }}
            onError={() => setImgError(true)}
          />
        )}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: 'rgba(109, 93, 251, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Play size={14} color="#fff" fill="#fff" />
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4, lineHeight: 1.3 }}>
          {video.title}
        </p>
        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--color-primary)',
            textDecoration: 'none',
            minHeight: 32,
          }}
        >
          {t('careGuides')} <ChevronRight size={14} />
        </a>
      </div>
    </div>
  );
}

export function ActivitiesScreen() {
  const { state, navigate, dispatch } = useApp();
  const { t, isRTL } = useTranslation();
  const profile = state.childProfile;
  const [search, setSearch] = useState('');
  const [activityTypeFilter, setActivityTypeFilter] = useState('');
  const [skillAreaFilter, setSkillAreaFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');

  const childFocusCategory = profile?.supportNeed && !['multiple', 'unsure'].includes(profile.supportNeed)
    ? profile.supportNeed
    : '';
  const categoryVideos = childFocusCategory ? getVideosByCategory(childFocusCategory) : [];

  const filtered = useMemo(() => {
    let result = activities;
    // Auto-filter by child's focus area from profile (not by age, to support all ages)
    if (childFocusCategory) {
      result = result.filter((a) => a.category === childFocusCategory);
    }
    if (activityTypeFilter) {
      result = result.filter((a) => a.activityType === activityTypeFilter);
    }
    if (skillAreaFilter) {
      result = result.filter((a) => a.skillArea === skillAreaFilter);
    }
    if (difficultyFilter) {
      result = result.filter((a) => a.difficulty === difficultyFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((a) =>
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.activityType.toLowerCase().includes(q) ||
        a.skillArea.toLowerCase().includes(q)
      );
    }
    return result;
  }, [search, childFocusCategory, activityTypeFilter, skillAreaFilter, difficultyFilter]);

  const hasActiveFilters = activityTypeFilter || skillAreaFilter || difficultyFilter;

  const clearFilters = () => {
    setActivityTypeFilter('');
    setSkillAreaFilter('');
    setDifficultyFilter('');
    setSearch('');
  };

  return (
    <div className="screen" style={{ background: 'var(--color-background)' }}>
      <div className="screen-header">
        <h1 className="screen-title">{t('activities')}</h1>
        <p className="screen-subtitle">{t('activitiesFor')} {profile?.name || t('appName')}</p>
      </div>

      <div className="screen-content" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <SearchBar value={search} onChange={setSearch} placeholder={t('searchActivities')} />

        {/* Dropdown filters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            <Select
              label={t('activityType')}
              value={activityTypeFilter}
              options={activityTypes}
              onChange={setActivityTypeFilter}
            />
            <Select
              label={t('skill')}
              value={skillAreaFilter}
              options={skillAreas}
              onChange={setSkillAreaFilter}
            />
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            <Select
              label={t('difficulty')}
              value={difficultyFilter}
              options={difficultyLevels}
              onChange={setDifficultyFilter}
            />
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                style={{
                  padding: '11px 16px',
                  borderRadius: 'var(--radius-input)',
                  border: '1.5px solid var(--color-border)',
                  background: 'var(--color-card)',
                  color: 'var(--color-text-secondary)',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  minHeight: 44,
                }}
              >
                {t('clearFilters')}
              </button>
            )}
          </div>
        </div>

        {/* Care Guide Videos */}
        {categoryVideos.length > 0 && !search.trim() && !activityTypeFilter && !skillAreaFilter && !difficultyFilter && childFocusCategory && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', letterSpacing: -0.3 }}>{t('careGuides')}</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {categoryVideos.map((video) => (
                <CareGuideVideoCard key={video.id} video={video} />
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
          <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', letterSpacing: -0.3 }}>
            {t('activitiesFor')} {profile?.name || t('appName')}
          </p>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            {filtered.length} {filtered.length === 1 ? t('activityFound') : t('activitiesFound')}
          </p>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<BookOpen size={40} color="var(--color-text-secondary)" />}
            title={t('noActivitiesFound')}
            message={t('tryAdjustingFilters')}
            action={hasActiveFilters ? t('clearFilters') : undefined}
            onAction={hasActiveFilters ? clearFilters : undefined}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((act, i) => {
              const isComplete = state.completedActivities.includes(act.id);
              return (
                <button
                  key={act.id}
                  onClick={() => {
                    dispatch({ type: 'SELECT_ACTIVITY', activityId: act.id });
                    navigate('activity-detail');
                  }}
                  className={`card animate-fade-in-up delay-${Math.min(i + 1, 8)}`}
                  style={{
                    display: 'flex',
                    gap: 14,
                    cursor: 'pointer',
                    border: 'none',
                    width: '100%',
                    textAlign: isRTL ? 'right' : 'left',
                    padding: 14,
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                    alignItems: isRTL ? 'flex-end' : 'flex-start',
                  }}
                >
                  <ActivityThumbnail category={act.category} emoji={act.imageEmoji} size={56} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                      <p style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: 'var(--color-text)',
                        textDecoration: isComplete ? 'line-through' : 'none',
                      }}>
                        {act.name}
                      </p>
                      {isComplete && <Check size={16} color="var(--color-success)" />}
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4, lineHeight: 1.4 }}>
                      {act.description.slice(0, 80)}...
                    </p>
                    <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                      <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', background: 'var(--color-background)', padding: '4px 10px', borderRadius: 12, fontWeight: 600 }}>
                        {t('age')} {act.ageRange}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', background: 'var(--color-background)', padding: '4px 10px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 3, fontWeight: 600 }}>
                        <Clock size={10} /> {act.duration} {t('minutesShort')}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--color-primary)', background: 'var(--color-soft-lavender)', padding: '4px 10px', borderRadius: 12, fontWeight: 700 }}>
                        {categoryLabels[act.category]}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', background: 'var(--color-background)', padding: '4px 10px', borderRadius: 12, fontWeight: 600 }}>
                        {act.difficulty}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', background: 'var(--color-background)', padding: '4px 10px', borderRadius: 12, fontWeight: 600 }}>
                        {act.activityType}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--color-primary)', background: 'var(--color-soft-lavender)', padding: '4px 10px', borderRadius: 12, fontWeight: 600 }}>
                        {act.skillArea}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── ACTIVITY DETAIL ─── */
export function ActivityDetailScreen() {
  const { state, dispatch, goBack } = useApp();
  const { t, isRTL } = useTranslation();
  const activity = activities.find((a) => a.id === state.selectedActivityId);
  const [timer, setTimer] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  if (!activity) return null;

  const isComplete = state.completedActivities.includes(activity.id);
  const isSaved = state.savedActivities.includes(activity.id);

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTimerRunning(false);
  };

  const startTimer = () => {
    if (timerRunning) {
      stopTimer();
      return;
    }
    setTimer(activity.duration * 60);
    setTimerRunning(true);
    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev === null || prev <= 1) {
          stopTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleComplete = () => {
    stopTimer();
    dispatch({ type: 'COMPLETE_ACTIVITY', activityId: activity.id });
    setShowComplete(true);
    setTimeout(() => setShowComplete(false), 2000);
  };

  const handleSave = () => {
    if (isSaved) {
      dispatch({ type: 'UNSAVE_ACTIVITY', activityId: activity.id });
    } else {
      dispatch({ type: 'SAVE_ACTIVITY', activityId: activity.id });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: activity.name, text: activity.description });
    }
  };

  return (
    <div style={{ background: 'var(--color-background)', minHeight: '100vh', paddingBottom: 40 }}>
      <ScreenHeader title={t('activities')} onBack={goBack} />

      {showComplete && (
        <div className="animate-scale-in" style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'var(--color-success)',
          color: '#fff',
          padding: '20px 32px',
          borderRadius: 20,
          fontSize: 18,
          fontWeight: 700,
          zIndex: 200,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          textAlign: 'center',
        }}>
          <Check size={24} color="#fff" style={{ marginBottom: 8 }} /> {t('activityComplete')}
          <p style={{ fontSize: 13, fontWeight: 500, marginTop: 4 }}>{t('greatJob')}</p>
        </div>
      )}

      <div style={{ padding: '0 20px' }}>
        {/* Hero */}
        <div style={{
          background: 'linear-gradient(135deg, var(--color-soft-lavender) 0%, var(--color-soft-blue-lavender) 100%)',
          borderRadius: 24,
          padding: '40px 24px',
          textAlign: 'center',
          marginBottom: 20,
        }}>
          <div style={{
            width: 90,
            height: 90,
            borderRadius: 28,
            background: 'rgba(255,255,255,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <ActivityThumbnail category={activity.category} emoji={activity.imageEmoji} size={72} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text)' }}>{activity.name}</h1>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 12, flexWrap: 'wrap', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            <span style={{ fontSize: 13, background: 'var(--color-card)', padding: '6px 14px', borderRadius: 20, color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              {t('age')} {activity.ageRange}
            </span>
            <span style={{ fontSize: 13, background: 'var(--color-card)', padding: '6px 14px', borderRadius: 20, color: 'var(--color-text-secondary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={14} /> {activity.duration} {t('minutesShort')}
            </span>
            <span style={{ fontSize: 13, background: 'var(--color-soft-lavender)', padding: '6px 14px', borderRadius: 20, color: 'var(--color-primary)', fontWeight: 600 }}>
              {activity.difficulty}
            </span>
            <span style={{ fontSize: 13, background: 'var(--color-card)', padding: '6px 14px', borderRadius: 20, color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              {activity.activityType}
            </span>
            <span style={{ fontSize: 13, background: 'var(--color-soft-lavender)', padding: '6px 14px', borderRadius: 20, color: 'var(--color-primary)', fontWeight: 600 }}>
              {activity.skillArea}
            </span>
          </div>
        </div>

        {/* Timer */}
        {timer !== null && (
          <div className="card animate-fade-in" style={{ textAlign: 'center', marginBottom: 16 }}>
            <p style={{ fontSize: 36, fontWeight: 700, color: timer === 0 ? 'var(--color-success)' : 'var(--color-primary)', fontVariantNumeric: 'tabular-nums' }}>
              {formatTime(timer)}
            </p>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4 }}>
              {timer === 0 ? t('timeIsUp') : timerRunning ? t('timerRunning') : t('paused')}
            </p>
          </div>
        )}

        {/* Purpose */}
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>{t('purpose')}</h3>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{activity.purpose}</p>
        </div>

        {/* Materials */}
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>{t('materialsNeeded')}</h3>
          <ul style={{ paddingLeft: isRTL ? 0 : 20, paddingRight: isRTL ? 20 : 0 }}>
            {activity.materials.map((m, i) => (
              <li key={i} style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>{m}</li>
            ))}
          </ul>
        </div>

        {/* Steps */}
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)', marginBottom: 12 }}>{t('instructions')}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {activity.steps.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'var(--color-primary)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 700,
                  flexShrink: 0,
                  marginTop: 1,
                }}>
                  {i + 1}
                </div>
                <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6, textAlign: isRTL ? 'right' : 'left' }}>{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Note */}
        <div style={{
          background: 'var(--color-error-bg)',
          borderRadius: 14,
          padding: '14px 16px',
          marginBottom: 24,
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start',
          flexDirection: isRTL ? 'row-reverse' : 'row',
        }}>
          <AlertCircle size={20} color="var(--color-error)" style={{ marginTop: 2, flexShrink: 0 }} />
          <p style={{ fontSize: 13, color: 'var(--color-error-text)', lineHeight: 1.5, textAlign: isRTL ? 'right' : 'left' }}>
            <strong>{t('safetyNote')}:</strong> {activity.safetyNote}
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 32 }}>
          {!isComplete ? (
            <button
              onClick={startTimer}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 'var(--radius-button)',
                background: timerRunning ? 'var(--color-warm-accent)' : 'var(--color-primary)',
                color: '#fff',
                fontSize: 15,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(109, 93, 251, 0.25)',
              }}
            >
              {timerRunning ? t('pauseTimer') : timer !== null ? t('resumeTimer') : t('startActivity')}
            </button>
          ) : null}

          <button
            onClick={handleComplete}
            disabled={isComplete}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 'var(--radius-button)',
              background: isComplete ? 'var(--color-success-bg)' : 'var(--color-success)',
              color: isComplete ? 'var(--color-success)' : '#fff',
              fontSize: 15,
              fontWeight: 600,
              border: 'none',
              cursor: isComplete ? 'default' : 'pointer',
            }}
          >
            {isComplete ? t('completed') : t('markComplete')}
          </button>

          <div style={{ display: 'flex', gap: 10, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            <button
              onClick={handleSave}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: 'var(--radius-button)',
                background: isSaved ? 'var(--color-soft-lavender)' : 'var(--color-input-bg)',
                color: isSaved ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontSize: 14,
                fontWeight: 600,
                border: isSaved ? '2px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                cursor: 'pointer',
              }}
            >
              {isSaved ? `⭐ ${t('savedStar')}` : `☆ ${t('save')}`}
            </button>
            <button
              onClick={handleShare}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: 'var(--radius-button)',
                background: 'var(--color-input-bg)',
                color: 'var(--color-text-secondary)',
                fontSize: 14,
                fontWeight: 600,
                border: '1.5px solid var(--color-border)',
                cursor: 'pointer',
              }}
            >
              {t('share')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
