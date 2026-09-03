import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../i18n/useTranslation';
import { PrimaryButton } from '../components/UI';
import type { SupportNeed, DiagnosisStatus, Gender, ChildProfile } from '../types';
import { AlertCircle, ChevronLeft, Plus, X } from 'lucide-react';

const pakistanProvinces = ['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 'Islamabad'];

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: 'var(--radius-input)',
  border: '1.5px solid var(--color-border)',
  background: 'var(--color-input-bg)',
  fontSize: 15,
  color: 'var(--color-text)',
  outline: 'none',
  transition: 'border-color 0.2s',
};

const labelStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: 'var(--color-text)',
  marginBottom: 6,
  display: 'block',
};

function generateChildId(): string {
  return `child-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getDefaultAvatar(gender: Gender): string {
  switch (gender) {
    case 'female':
      return '/avatar-girl.jpg';
    case 'male':
      return '/avatar-boy.jpg';
    default:
      return '/avatar-other.jpg';
  }
}

export function ProfileSetupScreen() {
  const { state, dispatch, navigate, goBack } = useApp();
  const { t, isRTL } = useTranslation();
  const mode = state.profileSetupMode;
  const editingChild = mode === 'edit' && state.editingChildId
    ? state.children.find((c) => c.id === state.editingChildId)
    : null;

  const supportOptions = useMemo<{ value: SupportNeed; label: string }[]>(() => [
    { value: 'autism', label: t('autism') || 'Autism' },
    { value: 'speech', label: t('speechDelay') || 'Speech Delay' },
    { value: 'motor', label: t('physicalMotor') || 'Physical / Motor Difficulty' },
    { value: 'visual', label: t('visualImpairment') || 'Visual Impairment' },
    { value: 'hearing', label: t('hearingImpairment') || 'Hearing Impairment' },
    { value: 'multiple', label: t('multipleNeeds') || 'Multiple Needs' },
    { value: 'unsure', label: t('notSureYet') },
  ], [t]);

  const diagnosisOptions = useMemo<{ value: DiagnosisStatus; label: string }[]>(() => [
    { value: 'diagnosed', label: t('diagnosed') },
    { value: 'under_assessment', label: t('underAssessment') },
    { value: 'not_diagnosed', label: t('notDiagnosed') },
    { value: 'prefer_not_to_say', label: t('preferNotToSay') },
  ], [t]);

  const genderOptions = useMemo<{ value: Gender; label: string }[]>(() => [
    { value: 'male', label: t('boy') },
    { value: 'female', label: t('girl') },
    { value: 'other', label: t('other') },
  ], [t]);

  const [form, setForm] = useState({
    parentName: editingChild?.parentName || state.children[0]?.parentName || '',
    childName: editingChild?.name || '',
    dateOfBirth: editingChild?.dateOfBirth || '',
    gender: (editingChild?.gender || '') as Gender | '',
    city: editingChild?.city || '',
    province: editingChild?.province || '',
    supportNeed: (editingChild?.supportNeed || '') as SupportNeed | '',
    diagnosisStatus: (editingChild?.diagnosisStatus || '') as DiagnosisStatus | '',
  });
  const [photo, setPhoto] = useState<string | null>(editingChild?.photo || null);
  const [errors, setErrors] = useState<string[]>([]);

  const isFirstChild = state.children.length === 0 || (mode === 'create');
  const isEdit = mode === 'edit' && editingChild;
  const title = isEdit ? t('editChildProfile') : mode === 'add' ? t('addChildProfile') : t('createChildProfile');
  const subtitle = isEdit
    ? t('editChildProfileSubtitle') || 'Update your child\'s information.'
    : mode === 'add'
    ? t('addChildProfileSubtitle') || 'Tell us about your other child so we can personalize their experience.'
    : t('createChildProfileSubtitle') || 'Tell us a little about your child so we can personalize their experience.';

  const age = form.dateOfBirth
    ? Math.floor((Date.now() - new Date(form.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  const handleSubmit = () => {
    const errs: string[] = [];
    if (!form.parentName.trim()) errs.push(t('parentNameRequired') || 'Parent name is required');
    if (!form.childName.trim()) errs.push(t('childNameRequired') || 'Child name is required');
    if (!form.dateOfBirth) errs.push(t('dobRequired') || 'Date of birth is required');
    if (!form.gender) errs.push(t('genderRequired') || 'Please select gender');
    if (!form.city.trim()) errs.push(t('cityRequired') || 'City is required');
    if (!form.province) errs.push(t('provinceRequired') || 'Province is required');
    if (!form.supportNeed) errs.push(t('supportNeedRequired') || 'Primary support need is required');

    if (errs.length > 0) {
      setErrors(errs);
      return;
    }

    const gender = form.gender as Gender;
    const profile: ChildProfile = {
      id: editingChild?.id || generateChildId(),
      parentName: form.parentName.trim(),
      name: form.childName.trim(),
      dateOfBirth: form.dateOfBirth,
      gender,
      city: form.city.trim(),
      province: form.province,
      supportNeed: form.supportNeed as SupportNeed,
      diagnosisStatus: (form.diagnosisStatus || 'prefer_not_to_say') as DiagnosisStatus,
      avatar: getDefaultAvatar(gender),
      photo,
    };

    dispatch({ type: 'SET_CHILD_PROFILE', profile });

    if (isFirstChild && !isEdit) {
      navigate('home');
    } else {
      goBack();
    }
  };

  const handleBack = () => {
    dispatch({ type: 'SET_PROFILE_SETUP_MODE', mode: 'create' });
    goBack();
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-background)' }}>
      <div style={{ padding: '20px 24px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
          {!isFirstChild && (
            <button
              onClick={handleBack}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: 14,
                background: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                cursor: 'pointer',
              }}
              aria-label={t('back') || 'Go back'}
            >
              <ChevronLeft size={24} color="var(--color-text)" style={{ transform: isRTL ? 'scaleX(-1)' : undefined }} />
            </button>
          )}
          <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>
              {title}
            </h1>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>{subtitle}</p>
          </div>
        </div>

        {errors.length > 0 && (
          <div className="animate-fade-in" style={{
            background: 'var(--color-error-bg)',
            border: '1px solid #FFB3A8',
            borderRadius: 12,
            padding: '12px 16px',
            marginBottom: 20,
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start',
            flexDirection: isRTL ? 'row-reverse' : 'row',
          }}>
            <AlertCircle size={18} color="var(--color-error)" style={{ marginTop: 2, flexShrink: 0 }} />
            <div>
              {errors.map((e, i) => (
                <p key={i} style={{ fontSize: 13, color: '#C0392B', lineHeight: 1.5, textAlign: isRTL ? 'right' : 'left' }}>{e}</p>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Parent + Child Names + Avatar */}
          <div style={{
            display: 'flex',
            gap: 20,
            alignItems: 'flex-start',
            flexDirection: isRTL ? 'row-reverse' : 'row',
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, flex: 1, minWidth: 200 }}>
              {/* Parent Name */}
              <div>
                <label style={labelStyle}>{t('yourName')}</label>
                <input
                  style={inputStyle}
                  placeholder={t('yourNamePlaceholder') || 'e.g., Ayesha Ahmed'}
                  value={form.parentName}
                  onChange={(e) => setForm({ ...form, parentName: e.target.value })}
                />
              </div>

              {/* Child Name */}
              <div>
                <label style={labelStyle}>{t('childName')}</label>
                <input
                  style={inputStyle}
                  placeholder={t('childNamePlaceholder') || 'e.g., Ali'}
                  value={form.childName}
                  onChange={(e) => setForm({ ...form, childName: e.target.value })}
                />
              </div>
            </div>

            {/* Child Avatar / Photo */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
              paddingTop: 22,
              flexShrink: 0,
              margin: '0 auto',
            }}>
              <div style={{ position: 'relative', width: 96, height: 96 }}>
                <img
                  src={photo || (form.gender ? getDefaultAvatar(form.gender as Gender) : '/avatar-other.jpg')}
                  alt={t('childProfile')}
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid var(--color-border)',
                    background: 'var(--color-soft-lavender)',
                  }}
                />
                <input
                  type="file"
                  accept="image/*"
                  id="child-photo-input"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => setPhoto(ev.target?.result as string);
                    reader.readAsDataURL(file);
                  }}
                  style={{ display: 'none' }}
                />
                <label
                  htmlFor="child-photo-input"
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'var(--color-primary)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    border: '3px solid var(--color-card)',
                    boxShadow: '0 2px 8px rgba(109, 93, 251, 0.3)',
                  }}
                  aria-label={t('addPhoto') || 'Add photo'}
                >
                  <Plus size={18} />
                </label>
              </div>
              {photo && (
                <button
                  type="button"
                  onClick={() => setPhoto(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 13,
                    color: 'var(--color-error)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  <X size={14} /> {t('removePhoto') || 'Remove photo'}
                </button>
              )}
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <label style={labelStyle}>{t('dateOfBirth')}</label>
            <input
              type="date"
              style={inputStyle}
              value={form.dateOfBirth}
              onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
            />
            {age !== null && age >= 0 && (
              <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                {t('age')}: {age} {age === 1 ? t('yearOld') : t('yearsOld')}
              </p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label style={labelStyle}>{t('gender')}</label>
            <div style={{ display: 'flex', gap: 10, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              {genderOptions.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setForm({ ...form, gender: g.value })}
                  style={{
                    flex: 1,
                    padding: '12px 8px',
                    borderRadius: 'var(--radius-input)',
                    border: form.gender === g.value ? '2px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                    background: form.gender === g.value ? 'var(--color-soft-lavender)' : 'var(--color-input-bg)',
                    fontSize: 14,
                    fontWeight: 600,
                    color: form.gender === g.value ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* City + Province */}
          <div style={{ display: 'flex', gap: 12, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>{t('city')}</label>
              <input
                style={inputStyle}
                placeholder={t('cityPlaceholder') || 'e.g., Lahore'}
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>{t('province')}</label>
              <select
                style={{ ...inputStyle, appearance: 'none' }}
                value={form.province}
                onChange={(e) => setForm({ ...form, province: e.target.value })}
              >
                <option value="">{t('select')}</option>
                {pakistanProvinces.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Support Need */}
          <div>
            <label style={labelStyle}>{t('supportNeed')}</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              {supportOptions.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setForm({ ...form, supportNeed: s.value })}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-chip)',
                    border: form.supportNeed === s.value ? '2px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                    background: form.supportNeed === s.value ? 'var(--color-soft-lavender)' : 'var(--color-card)',
                    fontSize: 13,
                    fontWeight: 600,
                    color: form.supportNeed === s.value ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Diagnosis Status (optional) */}
          <div>
            <label style={labelStyle}>{t('diagnosisStatus')} <span style={{ fontWeight: 400, color: 'var(--color-text-secondary)' }}>({t('optional')})</span></label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              {diagnosisOptions.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setForm({ ...form, diagnosisStatus: d.value })}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-chip)',
                    border: form.diagnosisStatus === d.value ? '2px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                    background: form.diagnosisStatus === d.value ? 'var(--color-soft-lavender)' : 'var(--color-card)',
                    fontSize: 13,
                    fontWeight: 600,
                    color: form.diagnosisStatus === d.value ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div style={{
            background: 'var(--color-warning-bg)',
            borderRadius: 12,
            padding: '14px 16px',
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start',
            flexDirection: isRTL ? 'row-reverse' : 'row',
          }}>
            <AlertCircle size={18} color="#D4A017" style={{ marginTop: 1, flexShrink: 0 }} />
            <p style={{ fontSize: 12, color: '#8B7000', lineHeight: 1.5, textAlign: isRTL ? 'right' : 'left' }}>
              {t('medicalDisclaimer')}
            </p>
          </div>

          {/* Submit */}
          <PrimaryButton fullWidth onClick={handleSubmit} style={{ marginTop: 8 }}>
            {isEdit ? t('saveProfile') : mode === 'add' ? t('addChildProfile') : t('createChildProfile')}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
