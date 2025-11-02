import 'i18next';
import common from '../locales/en/common.json';
import todo from '../locales/en/todo.json';

declare module 'i18next' {
    interface CustomTypeOptions {
        defaultNS: 'common';
        resources: {
            common: typeof common;
            todo: typeof todo;
        };
    }
}
