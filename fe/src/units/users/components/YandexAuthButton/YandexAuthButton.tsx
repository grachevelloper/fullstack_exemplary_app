import block from 'bem-cn-lite';
import {useTranslation} from 'react-i18next';
import {FaYandex} from 'react-icons/fa';

import './YandexAuthButton.scss';

const b = block('yandex-auth-button');

interface YandexAuthButtonProps {
    source: 'signin' | 'signup';
}

export const YandexAuthButton = ({source}: YandexAuthButtonProps) => {
    const {t} = useTranslation('auth');

    return (
        <button
            className={b()}
            type='button'
            onClick={() => {
                window.location.assign(`/api/auth/yandex?source=${source}`);
            }}
        >
            <span className={b('icon')} aria-hidden='true'>
                <FaYandex />
            </span>
            <span className={b('text')}>{t('auth.yandex.submit')}</span>
        </button>
    );
};
