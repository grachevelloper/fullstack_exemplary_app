import {ThemeConfig} from 'antd';

export interface CustomThemeConfig extends ThemeConfig {
    name: 'light' | 'dark';
}

export type ThemeMode = 'light' | 'dark';

const CARD = {
    bodyPadding: 20,
    bodyPaddingSM: 8,
    headerFontSize: 20,
    headerFontSizeSM: 16,
    headerPadding: 20,
    headerPaddingSM: 8,
    actionsLiMargin: '8px auto 16px 0',
};

const BUTTON_PADDING = {
    paddingBlock: 8,
    paddingBlockLG: 14,
    paddingBlockSM: 2,
    paddingInline: 20,
    paddingInlineLG: 20,
    paddingInlineSM: 10,
};
const lightTheme: CustomThemeConfig = {
    name: 'light',
    token: {
        colorPrimary: '#f6bb72ff',
        colorBgBase: '#ffffff',
        colorTextBase: '#000000',
        colorBgContainer: '#fafafa',
        colorBorder: '#d9d9d9',
        borderRadius: 6,

        colorPrimaryBg: '#f0f8ff',
        colorPrimaryBorder: '#91d5ff',
    },
    components: {
        Input: {
            colorBgContainer: 'transparent',
            hoverBorderColor: '#40a9ff',
            activeBorderColor: '#1890ff',
        },
        Button: {
            ...BUTTON_PADDING,
            colorPrimary: '#1890ff',
            colorPrimaryHover: '#40a9ff',
        },
        Card: CARD,
    },
};

const darkTheme: CustomThemeConfig = {
    name: 'dark',
    token: {
        colorPrimary: '#177ddc',
        colorBgBase: '#141414',
        colorTextBase: '#ffffff',
        colorBgContainer: '#1f1f1f',
        colorBorder: '#434343',
        borderRadius: 6,

        colorPrimaryBg: '#111d2c',
        colorPrimaryBorder: '#153450',
    },
    components: {
        Input: {
            colorBgContainer: '#1f1f1f',
            hoverBorderColor: '#177ddc',
            activeBorderColor: '#177ddc',
            colorText: '#ffffff',
        },
        Button: {
            ...BUTTON_PADDING,
            colorPrimary: '#177ddc',
            colorPrimaryHover: '#3c9ae8',
        },
        Card: CARD,
    },
};
export const themes: Record<ThemeMode, CustomThemeConfig> = {
    light: lightTheme,
    dark: darkTheme,
};
