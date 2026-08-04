export const getYandexOAuthErrorKey = (
    error: string | null
): string | undefined => {
    switch (error) {
        case 'email_conflict':
            return 'auth.yandex.error.email_conflict';
        case 'access_denied':
            return 'auth.yandex.error.access_denied';
        case 'invalid_state':
            return 'auth.yandex.error.invalid_state';
        case 'provider_error':
        case 'unauthorized':
            return 'auth.yandex.error.provider';
        default:
            return undefined;
    }
};
