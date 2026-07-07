import {FloatButton, Popover, Typography, notification, theme} from 'antd';
import block from 'bem-cn-lite';
import {useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {RiLoginCircleLine} from 'react-icons/ri';
import {VscAccount} from 'react-icons/vsc';
import {useLocation, useNavigate} from 'react-router-dom';

import {useSessionStorage} from '@/shared/hooks/useSessionStorage';

import {PREV_AUTH_PAGE_VISITED} from '../../constants';
import './AuthNavigateButton.scss';

const b = block('auth-navigate-button');

type NavigateData = {
    icon: React.ReactNode | null;
    link: string;
    text: string;
    title: string;
};

export const AuthNavigateButton = () => {
    const {t} = useTranslation('auth');
    const {
        token: {borderRadius, colorPrimary, padding},
    } = theme.useToken();
    const [isPrevVisited, setPrevVisited] = useSessionStorage<boolean>(
        PREV_AUTH_PAGE_VISITED,
        false
    );
    const [isNotificationShown, setIsNotificationShown] =
        useState(isPrevVisited);
    const [showFloatButton, setShowFloatButton] = useState(isPrevVisited);
    const location = useLocation();
    const navigate = useNavigate();
    const [api, contextHolder] = notification.useNotification();

    const getLinkData = useCallback((): NavigateData => {
        const endOfPath = location.pathname.split('/').at(-1);
        switch (endOfPath) {
            case 'signin':
                return {
                    icon: <VscAccount color={colorPrimary} />,
                    link: '/auth/signup',
                    title: t('auth.signin.notification.title'),
                    text: t('auth.signin.notification.description'),
                };
            case 'signup':
                return {
                    icon: <RiLoginCircleLine color={colorPrimary} />,
                    link: '/auth/signin',
                    text: t('auth.signup.notification.description'),
                    title: t('auth.signup.notification.title'),
                };
            default:
                return {
                    icon: null,
                    link: '',
                    text: '',
                    title: '',
                };
        }
    }, [colorPrimary, location, t]);

    const {link, text, title, icon} = getLinkData();
    const marker =
        link === '/auth/signup' ? 'auth-signup-link' : 'auth-signin-link';

    useEffect(() => {
        if (!link || isNotificationShown || isPrevVisited) {
            setShowFloatButton(true);
            return;
        }

        setPrevVisited(true);
        api.open({
            message: (
                <Typography.Title className={b('title')} level={4}>
                    {title}
                </Typography.Title>
            ),
            description: (
                <Typography.Link
                    className={b('link')}
                    data-marker={marker}
                    onClick={() => {
                        navigate(link);
                        api.destroy();
                    }}
                    style={{fontWeight: 500}}
                >
                    {text}
                </Typography.Link>
            ),
            showProgress: true,
            pauseOnHover: true,
            placement: 'bottomRight',
            duration: 5,
            onClose: () => {
                setIsNotificationShown(true);
                setShowFloatButton(true);
            },

            style: {
                width: 270,
                padding,
                borderRadius,
            },
            className: b(),
        });

        const timer = setTimeout(() => {
            if (!isNotificationShown) {
                setIsNotificationShown(true);
                setShowFloatButton(true);
            }
        }, 5000);

        return () => {
            clearTimeout(timer);
        };
    }, [link, api, navigate, title, text]);

    if (!link) {
        return null;
    }

    return (
        <>
            {contextHolder}

            {showFloatButton && (
                <Popover
                    trigger='hover'
                    content={
                        <Typography.Link
                            data-marker={marker}
                            onClick={() => {
                                void navigate(link);
                            }}
                            style={{fontWeight: 500}}
                        >
                            {text}
                        </Typography.Link>
                    }
                    arrow
                    placement='left'
                    overlayStyle={{maxWidth: 200}}
                >
                    <FloatButton
                        icon={icon}
                        data-marker={marker}
                        aria-label={text}
                        style={{
                            transition: 'opacity 0.3s ease-in-out',
                            animation: 'floatButtonAppear 0.5s ease-out',
                        }}
                    />
                </Popover>
            )}
        </>
    );
};
