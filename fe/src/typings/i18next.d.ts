import 'i18next';

import auth from '../locales/ru/auth.json';
import common from '../locales/ru/common.json';
import todo from '../locales/ru/todo.json';

declare module 'i18next' {
    interface CustomTypeOptions {
        defaultNS: 'common';
        resources: {
            common: typeof common;
            todo: typeof todo;
            auth: typeof auth;
        };
    }
}
