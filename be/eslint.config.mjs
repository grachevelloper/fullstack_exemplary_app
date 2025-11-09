import eslint from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import tseslint from "typescript-eslint";

const baseConfig = tseslint.config(
    {
        ignores: ["eslint.config.mjs", "dist/**", "node_modules/**"],
        settings: {
            react: {
                version: "detect",
            },
            "import/resolver": {
                alias: {
                    map: [
                        ["@/users/*", "./src/users/*"],
                        ["@/auth/*", "./src/auth/*"],
                        ["@/todos/*", "./src/users/*"],
                        ["@/guards/*", "./src/guards/*"],
                    ],
                },
            },
        },
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    {
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest,
            },
            sourceType: "commonjs",
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        plugins: {
            "simple-import-sort": simpleImportSort,
            "@stylistic": stylistic,
        },
        rules: {
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": "warn",
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-argument": "off",
            "@typescript-eslint/no-floating-promises": "off",
            "prefer-const": "error",
            "no-console": "warn",

            "@stylistic/object-curly-spacing": ["warn", "never"],

            "simple-import-sort/imports": "error",
            "simple-import-sort/exports": "error",
        },
    },
);

const testConfig = tseslint.config({
    files: ["**/*.e2e-spec.ts", "**/*.test.ts"],
    rules: {
        "@typescript-eslint/no-unsafe-return": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",
    },
});

export default [...baseConfig, ...testConfig];
