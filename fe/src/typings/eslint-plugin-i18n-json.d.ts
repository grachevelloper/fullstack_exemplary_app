declare module 'eslint-plugin-i18n-json' {
    import {Linter, ESLint} from 'eslint';

    const plugin: ESLint.Plugin;
    export default plugin;

    export const configs: {
        recommended: Linter.Config;
    };

    export const processors: {
        '.json': ESLint.Processor;
    };
}
