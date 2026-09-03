import { useApp } from '../context/AppContext';
import { getText, type TranslationKey, type Language } from './translations';

export function useTranslation() {
  const { state, dispatch } = useApp();
  const language = state.language || 'en';
  const isRTL = language === 'ur';

  const t = (key: TranslationKey) => getText(key, language);

  const setLanguage = (lang: Language) => {
    dispatch({ type: 'SET_LANGUAGE', language: lang });
  };

  return { t, language, setLanguage, isRTL };
}
