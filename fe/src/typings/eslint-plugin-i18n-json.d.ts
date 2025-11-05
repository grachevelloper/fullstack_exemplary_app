declare module 'eslint-plugin-i18n-json' {
    import {ESLint, Linter} from 'eslint';

    const plugin: ESLint.Plugin;
    export default plugin;

    export const configs: {
        recommended: Linter.Config;
    };

    export const processors: {
        '.json': ESLint.Processor;
    };
}
