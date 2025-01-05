import i18n from 'i18next';
import HttpBackend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

i18n
    .use(HttpBackend)
    .use(initReactI18next)
    .init({
    fallbackLng: 'en',
    lng: 'en',
    backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;