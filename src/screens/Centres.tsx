import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../i18n/useTranslation';
import { SearchBar, ScreenHeader, EmptyState, VerifiedBadge, Select } from '../components/UI';
import { centres } from '../data/centres';
import { MapPin, Phone, Navigation, Building2, Star } from 'lucide-react';

const supportNeedToSupportArea: Record<string, string> = {
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

export function CentresScreen() {
  const { state, navigate, dispatch } = useApp();
  const { t, isRTL } = useTranslation();
  const profile = state.childProfile;
  const [search, setSearch] = useState('');
  const [provinceFilter, setProvinceFilter] = useState(profile?.province || '');
  const [cityFilter, setCityFilter] = useState('');
  const [supportAreaFilter, setSupportAreaFilter] = useState(
    profile ? supportNeedToSupportArea[profile.supportNeed] || '' : ''
  );
  const [centreTypeFilter, setCentreTypeFilter] = useState('');

  const provinces = useMemo(() => {
    const unique = [...new Set(centres.map((c) => c.province))];
    return unique.sort();
  }, []);

  const cities = useMemo(() => {
    let pool = centres;
    if (provinceFilter) pool = pool.filter((c) => c.province === provinceFilter);
    const unique = [...new Set(pool.map((c) => c.city))];
    return unique.sort();
  }, [provinceFilter]);

  const supportAreas = useMemo(() => {
    const unique = [...new Set(centres.map((c) => c.supportArea))];
    return unique.sort();
  }, []);

  const centreTypes = useMemo(() => {
    const unique = [...new Set(centres.map((c) => c.type))];
    return unique.sort();
  }, []);

  const filtered = useMemo(() => {
    let result = centres;
    if (provinceFilter) result = result.filter((c) => c.province === provinceFilter);
    if (cityFilter) result = result.filter((c) => c.city === cityFilter);
    if (supportAreaFilter) result = result.filter((c) => c.supportArea === supportAreaFilter);
    if (centreTypeFilter) result = result.filter((c) => c.type === centreTypeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((c) =>
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.province.toLowerCase().includes(q) ||
        c.supportArea.toLowerCase().includes(q) ||
        c.services.some((s) => s.toLowerCase().includes(q))
      );
    }
    return result;
  }, [search, provinceFilter, cityFilter, supportAreaFilter, centreTypeFilter]);

  const recommended = useMemo(() => {
    if (!profile) return [];
    const area = supportNeedToSupportArea[profile.supportNeed];
    if (!area) return [];
    let recs = centres.filter((c) => c.supportArea === area);
    if (profile.province) {
      recs = recs.filter((c) => c.province === profile.province);
    }
    if (profile.city) {
      recs = recs.filter((c) => c.city.toLowerCase() === profile.city.toLowerCase());
    }
    return recs.slice(0, 3);
  }, [profile]);

  const hasActiveFilters = provinceFilter || cityFilter || supportAreaFilter || centreTypeFilter;

  const clearFilters = () => {
    setProvinceFilter('');
    setCityFilter('');
    setSupportAreaFilter('');
    setCentreTypeFilter('');
    setSearch('');
  };

  return (
    <div className="screen" style={{ background: 'var(--color-background)' }}>
      <div className="screen-header">
        <h1 className="screen-title">{t('findSupportNearYou')}</h1>
        <p className="screen-subtitle">{t('centresSubtitle')}</p>
      </div>

      <div className="screen-content" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <SearchBar value={search} onChange={setSearch} placeholder={t('searchCentres')} />

        {/* Dropdown filters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            <Select label={t('province')} value={provinceFilter} options={provinces} onChange={(v) => { setProvinceFilter(v); setCityFilter(''); }} />
            <Select label={t('city')} value={cityFilter} options={cities} onChange={setCityFilter} />
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            <Select label={t('supportAreaLabel')} value={supportAreaFilter} options={supportAreas} onChange={setSupportAreaFilter} />
            <Select label={t('centreTypeLabel')} value={centreTypeFilter} options={centreTypes} onChange={setCentreTypeFilter} />
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
              {recommended.map((centre) => (
                <CentreCard key={centre.id} centre={centre} />
              ))}
            </div>
          </div>
        )}

        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 500 }}>
          {filtered.length} {filtered.length === 1 ? t('centreFound') : t('centresFound')}
        </p>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Building2 size={40} color="var(--color-text-secondary)" />}
            title={t('noMatchingCentre')}
            message={t('tryAdjustingFilters')}
            action={hasActiveFilters || search.trim() ? t('clearFilters') : undefined}
            onAction={hasActiveFilters || search.trim() ? clearFilters : undefined}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((centre, i) => (
              <div
                key={centre.id}
                className={`card animate-fade-in-up delay-${Math.min(i + 1, 8)}`}
                style={{ padding: 16 }}
              >
                <CentreCard centre={centre} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  function CentreCard({ centre }: { centre: typeof centres[0] }) {
    return (
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>{centre.name}</h3>
              {centre.verified && <VerifiedBadge />}
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2 }}>{centre.type}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 10, flexWrap: 'wrap', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <MapPin size={14} /> {formatValue(`${centre.city}, ${centre.province}`)}
          </span>
          <span>{formatValue(centre.supportArea)}</span>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
          {centre.services.map((s, si) => (
            <span key={si} style={{
              fontSize: 11,
              color: 'var(--color-primary)',
              background: 'var(--color-soft-lavender)',
              padding: '3px 8px',
              borderRadius: 10,
            }}>
              {s}
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
          <button
            onClick={() => {
              dispatch({ type: 'SELECT_CENTRE', centreId: centre.id });
              navigate('centre-detail');
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
            {t('viewDetails')}
          </button>
          {centre.phone && centre.phone !== 'Information unavailable' && (
            <a
              href={`tel:${centre.phone}`}
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
          {centre.address && centre.address !== 'Information currently unavailable.' && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(centre.address)}`}
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
          )}
        </div>
      </>
    );
  }
}

/* ─── CENTRE DETAIL ─── */
export function CentreDetailScreen() {
  const { state, goBack } = useApp();
  const { t, isRTL } = useTranslation();
  const centre = centres.find((c) => c.id === state.selectedCentreId);
  if (!centre) return null;

  const canCall = centre.phone && centre.phone !== 'Information unavailable';
  const canNavigate = centre.address && centre.address !== 'Information currently unavailable.';

  return (
    <div style={{ background: 'var(--color-background)', minHeight: '100dvh', paddingBottom: 120, position: 'relative' }}>
      <ScreenHeader title={t('centreDetails')} onBack={goBack} />
      <div style={{ padding: '0 20px' }}>
        <div className="card animate-fade-in" style={{ marginBottom: 16, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)' }}>{centre.name}</h1>
            {centre.verified && <VerifiedBadge />}
          </div>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 4 }}>{centre.type}</p>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 4, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            <MapPin size={14} /> {formatValue(centre.address)}
          </p>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 4 }}>
            {formatValue(`${centre.city}, ${centre.province}`)}
          </p>
        </div>

        <div className="card animate-fade-in delay-1" style={{ marginBottom: 16, padding: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, color: 'var(--color-text)' }}>{t('supportAreaLabel')}</h3>
          <span style={{
            display: 'inline-block',
            padding: '6px 14px',
            borderRadius: 20,
            background: 'var(--color-soft-lavender)',
            color: 'var(--color-primary)',
            fontSize: 14,
            fontWeight: 600,
          }}>
            {formatValue(centre.supportArea)}
          </span>
        </div>

        <div className="card animate-fade-in delay-2" style={{ marginBottom: 16, padding: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, color: 'var(--color-text)' }}>{t('services')}</h3>
          {centre.services.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              {centre.services.map((s, i) => (
                <span key={i} style={{
                  padding: '8px 14px',
                  borderRadius: 12,
                  background: 'var(--color-soft-lavender)',
                  fontSize: 13,
                  color: 'var(--color-text)',
                  fontWeight: 500,
                }}>
                  {s}
                </span>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>{t('informationUnavailable')}</p>
          )}
        </div>

        <div className="card animate-fade-in delay-3" style={{ marginBottom: 20, padding: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, color: 'var(--color-text)' }}>{t('contact')}</h3>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
            {t('phone')}: {formatValue(centre.phone)}
          </p>
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
            href={`tel:${centre.phone}`}
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
        {canNavigate ? (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(centre.address)}`}
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
            <Navigation size={18} /> {t('getDirections')}
          </button>
        )}
      </div>
    </div>
  );
}
