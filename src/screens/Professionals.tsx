import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../i18n/useTranslation';
import { SearchBar, ScreenHeader, EmptyState, VerifiedBadge, Select } from '../components/UI';
import { professionals } from '../data/professionals';
import { MapPin, Phone, Navigation, Stethoscope, Clock, User, Star } from 'lucide-react';

const supportNeedToFocusArea: Record<string, string> = {
  autism: 'Autism',
  speech: 'Speech Delay',
  motor: 'Physical / Motor',
  visual: 'Visual Impairment',
  hearing: 'Hearing Impairment',
  multiple: 'Multiple Needs',
  unsure: '',
};

function formatValue(value: string): string {
  return value && value.trim() !== '' ? value : 'Information currently unavailable.';
}

export function ProfessionalsScreen() {
  const { state, navigate, dispatch } = useApp();
  const { t, isRTL } = useTranslation();
  const profile = state.childProfile;
  const [search, setSearch] = useState('');
  const [provinceFilter, setProvinceFilter] = useState(profile?.province || '');
  const [cityFilter, setCityFilter] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('');
  const [focusAreaFilter, setFocusAreaFilter] = useState(
    profile ? supportNeedToFocusArea[profile.supportNeed] || '' : ''
  );

  const provinces = useMemo(() => {
    const unique = [...new Set(professionals.map((p) => p.province))];
    return unique.sort();
  }, []);

  const cities = useMemo(() => {
    let pool = professionals;
    if (provinceFilter) pool = pool.filter((p) => p.province === provinceFilter);
    const unique = [...new Set(pool.map((p) => p.city))];
    return unique.sort();
  }, [provinceFilter]);

  const specializations = useMemo(() => {
    const unique = [...new Set(professionals.map((p) => p.specialization))];
    return unique.sort();
  }, []);

  const focusAreas = useMemo(() => {
    const unique = [...new Set(professionals.map((p) => p.supportArea))];
    return unique.sort();
  }, []);

  const filtered = useMemo(() => {
    let result = professionals;
    if (provinceFilter) result = result.filter((p) => p.province === provinceFilter);
    if (cityFilter) result = result.filter((p) => p.city === cityFilter);
    if (specializationFilter) result = result.filter((p) => p.specialization === specializationFilter);
    if (focusAreaFilter) result = result.filter((p) => p.supportArea === focusAreaFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.specialization.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.supportArea.toLowerCase().includes(q) ||
        p.clinic.toLowerCase().includes(q)
      );
    }
    return result;
  }, [search, provinceFilter, cityFilter, specializationFilter, focusAreaFilter]);

  const recommended = useMemo(() => {
    if (!profile) return [];
    const focus = supportNeedToFocusArea[profile.supportNeed];
    if (!focus) return [];
    let recs = professionals.filter((p) => p.supportArea === focus);
    if (profile.province) {
      recs = recs.filter((p) => p.province === profile.province);
    }
    if (profile.city) {
      recs = recs.filter((p) => p.city.toLowerCase() === profile.city.toLowerCase());
    }
    return recs.slice(0, 3);
  }, [profile]);

  const hasActiveFilters = provinceFilter || cityFilter || specializationFilter || focusAreaFilter;

  const clearFilters = () => {
    setProvinceFilter('');
    setCityFilter('');
    setSpecializationFilter('');
    setFocusAreaFilter('');
    setSearch('');
  };

  return (
    <div className="screen" style={{ background: 'var(--color-background)' }}>
      <ScreenHeader title={t('findASpecialist')} subtitle={t('specialistsSubtitle')} onBack={() => navigate('home')} />

      <div className="screen-content" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <SearchBar value={search} onChange={setSearch} placeholder={t('searchSpecialists')} />

        {/* Dropdown filters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            <Select label={t('province')} value={provinceFilter} options={provinces} onChange={(v) => { setProvinceFilter(v); setCityFilter(''); }} />
            <Select label={t('city')} value={cityFilter} options={cities} onChange={setCityFilter} />
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            <Select label={t('specializationLabel')} value={specializationFilter} options={specializations} onChange={setSpecializationFilter} />
            <Select label={t('focusAreaLabel')} value={focusAreaFilter} options={focusAreas} onChange={setFocusAreaFilter} />
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              style={{
                alignSelf: isRTL ? 'flex-end' : 'flex-start',
                padding: '10px 16px',
                borderRadius: 'var(--radius-input)',
                border: '1.5px solid var(--color-border)',
                background: 'var(--color-card)',
                color: 'var(--color-text-secondary)',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {t('clearFilters')}
            </button>
          )}
        </div>

        {/* Recommendations */}
        {!hasActiveFilters && !search.trim() && recommended.length > 0 && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <Star size={18} color="var(--color-warm-accent)" fill="var(--color-warm-accent)" />
              <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text)' }}>{t('recommendedFor')} {profile?.name}</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recommended.map((prof) => (
                <ProfessionalCard key={prof.id} prof={prof} />
              ))}
            </div>
          </div>
        )}

        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 500 }}>
          {filtered.length} {filtered.length === 1 ? t('specialistFound') : t('specialistsFound')}
        </p>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Stethoscope size={40} color="var(--color-text-secondary)" />}
            title={t('noMatchingProfessional')}
            message={t('tryAdjustingFilters')}
            action={hasActiveFilters || search.trim() ? t('clearFilters') : undefined}
            onAction={hasActiveFilters || search.trim() ? clearFilters : undefined}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((prof, i) => (
              <div
                key={prof.id}
                className={`card animate-fade-in-up delay-${Math.min(i + 1, 8)}`}
                style={{ padding: 16 }}
              >
                <ProfessionalCard prof={prof} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  function ProfessionalCard({ prof }: { prof: typeof professionals[0] }) {
    return (
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>{prof.name}</h3>
              {prof.verified && <VerifiedBadge />}
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 600, marginTop: 2 }}>{prof.specialization}</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            <Stethoscope size={14} /> {formatValue(prof.clinic)}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            <MapPin size={14} /> {formatValue(`${prof.city}, ${prof.province}`)}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            <Clock size={14} /> {formatValue(prof.availability)}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
          <button
            onClick={() => {
              dispatch({ type: 'SELECT_PROFESSIONAL', professionalId: prof.id });
              navigate('professional-detail');
            }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: 'var(--radius-button)',
              background: 'var(--color-primary)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              minHeight: 44,
            }}
          >
            {t('viewProfile')}
          </button>
          {prof.phone && prof.phone !== 'Information unavailable' && (
            <a
              href={`tel:${prof.phone}`}
              style={{
                padding: '10px 16px',
                borderRadius: 'var(--radius-button)',
                background: 'var(--color-soft-lavender)',
                color: 'var(--color-primary)',
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                minHeight: 44,
                textDecoration: 'none',
              }}
            >
              <Phone size={14} /> {t('call')}
            </a>
          )}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(prof.address || prof.clinic)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '10px 16px',
              borderRadius: 'var(--radius-button)',
              background: 'var(--color-warning-bg)',
              color: 'var(--color-warning-text)',
              fontSize: 13,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              minHeight: 44,
              textDecoration: 'none',
            }}
          >
            <Navigation size={14} /> {t('directions')}
          </a>
        </div>
      </>
    );
  }
}

/* ─── PROFESSIONAL DETAIL ─── */
export function ProfessionalDetailScreen() {
  const { state, goBack } = useApp();
  const { t, isRTL } = useTranslation();
  const prof = professionals.find((p) => p.id === state.selectedProfessionalId);
  if (!prof) return null;

  const canCall = prof.phone && prof.phone !== 'Information unavailable';

  return (
    <div style={{ background: 'var(--color-background)', minHeight: '100dvh', paddingBottom: 120, position: 'relative' }}>
      <ScreenHeader title={t('specialistProfile')} onBack={goBack} />
      <div style={{ padding: '0 20px' }}>
        <div className="card animate-fade-in" style={{ marginBottom: 16, padding: 20, textAlign: 'center' }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'var(--color-soft-lavender)',
            border: '2px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
          }}>
            <User size={32} color="var(--color-primary)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)' }}>{prof.name}</h1>
            {prof.verified && <VerifiedBadge />}
          </div>
          <p style={{ fontSize: 15, color: 'var(--color-primary)', fontWeight: 600 }}>{prof.specialization}</p>
        </div>

        <div className="card animate-fade-in delay-1" style={{ marginBottom: 16, padding: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: 'var(--color-text)' }}>{t('details')}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>{t('clinic')}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', textAlign: isRTL ? 'left' : 'right', maxWidth: '60%' }}>{formatValue(prof.clinic)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>{t('supportAreaLabel')}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', textAlign: isRTL ? 'left' : 'right' }}>{formatValue(prof.supportArea)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>{t('location')}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', textAlign: isRTL ? 'left' : 'right', maxWidth: '60%' }}>{formatValue(`${prof.city}, ${prof.province}`)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>{t('availability')}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', textAlign: isRTL ? 'left' : 'right', maxWidth: '60%' }}>{formatValue(prof.availability)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>{t('phone')}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', textAlign: isRTL ? 'left' : 'right' }}>{formatValue(prof.phone)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>{t('address')}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', textAlign: isRTL ? 'left' : 'right', maxWidth: '60%' }}>{formatValue(prof.address)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky action buttons */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        maxWidth: 480,
        margin: '0 auto',
        padding: '12px 20px calc(12px + env(safe-area-inset-bottom, 0px))',
        background: 'var(--color-background)',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        gap: 10,
        zIndex: 50,
        flexDirection: isRTL ? 'row-reverse' : 'row',
      }}>
        {canCall ? (
          <a
            href={`tel:${prof.phone}`}
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: 'var(--radius-button)',
              background: 'var(--color-primary)',
              color: '#fff',
              fontSize: 15,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              minHeight: 48,
              textDecoration: 'none',
            }}
          >
            <Phone size={18} /> {t('call')}
          </a>
        ) : (
          <button
            disabled
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: 'var(--radius-button)',
              background: 'var(--color-input-bg)',
              color: 'var(--color-text-secondary)',
              fontSize: 15,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              minHeight: 48,
              border: '1.5px solid var(--color-border)',
              opacity: 0.7,
              cursor: 'not-allowed',
            }}
          >
            <Phone size={18} /> {t('call')}
          </button>
        )}
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(prof.address || prof.clinic)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1,
            padding: '14px',
            borderRadius: 'var(--radius-button)',
            background: 'var(--color-card)',
            color: 'var(--color-text)',
            fontSize: 15,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            minHeight: 48,
            border: '1.5px solid var(--color-border)',
            textDecoration: 'none',
          }}
        >
          <Navigation size={18} /> {t('getDirections')}
        </a>
      </div>
    </div>
  );
}
