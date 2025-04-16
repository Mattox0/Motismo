'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslations from '@root/translations/en.json';
import frTranslations from '@root/translations/fr.json';

i18n.use(initReactI18next);

const config = {
  resources: {
    fr: {
      translation: frTranslations,
    },
    en: {
      translation: enTranslations,
    },
  },
  lng: 'fr',
  fallbackLng: 'fr',
  defaultNS: 'translation',
  ns: ['translation'],
  debug: false, // process.env.NODE_ENV === 'development',
  interpolation: {
    escapeValue: false,
  },
};

i18n.init(config);

export default i18n;
