import i18next from 'i18next';
import {initReactI18next} from 'react-i18next';
import enCommon from './en/common.json';
import enTodo from './en/todo.json';
import ruCommon from './ru/common.json';
import ruTodo from './ru/todo.json';

const resources = {
    en: {
        common: enCommon,
        todo: enTodo,
    },
    ru: {
        common: ruCommon,
        todo: ruTodo,
    },
};

i18next.use(initReactI18next).init({
    resources,
    lng: 'ru',
    fallbackLng: 'en',
});

export default i18next;
