import i18next from 'i18next';
import {initReactI18next} from 'react-i18next';

import enArticle from '@/public/locales/en/article.json';
import enAuth from '@/public/locales/en/auth.json';
import enCommon from '@/public/locales/en/common.json';
import enTodo from '@/public/locales/en/todo.json';
import ruArticle from '@/public/locales/ru/article.json';
import ruAuth from '@/public/locales/ru/auth.json';
import ruCommon from '@/public/locales/ru/common.json';
import ruTodo from '@/public/locales/ru/todo.json';

const resources = {
    en: {
        common: enCommon,
        todo: enTodo,
        auth: enAuth,
        article: enArticle,
    },
    ru: {
        common: ruCommon,
        todo: ruTodo,
        auth: ruAuth,
        article: ruArticle,
    },
};

const updateDocumentLanguage = (language: string) => {
    document.documentElement.lang = language;
};

i18next.on('languageChanged', updateDocumentLanguage);

void i18next.use(initReactI18next).init({
    resources,
    lng: 'ru',
    fallbackLng: 'en',
}).then(() => {
    updateDocumentLanguage(i18next.resolvedLanguage ?? i18next.language);
});
