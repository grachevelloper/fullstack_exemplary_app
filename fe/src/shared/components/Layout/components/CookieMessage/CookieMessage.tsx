import {Button, notification, theme, Typography} from 'antd';
import {useCallback, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {LuCookie} from 'react-icons/lu';

import {ANIMATION__DURATION_IN_MS} from '../../constants';

const {Text} = Typography;

type CookieMessageProps = {
    onAccept: () => void;
};

export const CookieMessage = ({onAccept}: CookieMessageProps) => {
    const {t} = useTranslation('common');
    const {token} = theme.useToken();
    const [api, contextHolder] = notification.useNotification();
    const notificationKey = 'cookie-notification';

    const handleAccept = useCallback(() => {
        onAccept();
        api.destroy(notificationKey);
    }, [api, onAccept]);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            api.open({
                key: notificationKey,
                message: (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: token.marginSM,
                            whiteSpace: 'pre-wrap',
                        }}
                    >
                        <LuCookie
                            size={40}
                            style={{
                                color: token.colorPrimary,
                            }}
                        />
                        <Text
                            strong
                            style={{color: token.colorText, margin: 0}}
                        >
                            {t('layout.cookie.accept')}
                        </Text>
                    </div>
                ),
                duration: 0,
                placement: 'topRight',
                btn: (
                    <Button
                        type='primary'
                        size='small'
                        onClick={handleAccept}
                        style={{
                            background: token.colorPrimary,
                            borderColor: token.colorPrimary,
                            borderRadius: token.borderRadiusSM,
                            fontWeight: token.fontWeightStrong,
                        }}
                    >
                        {t('accept')}
                    </Button>
                ),
                style: {
                    width: 320,
                    background: token.colorBgContainer,
                    border: `1px solid ${token.colorBorder}`,
                    borderRadius: token.borderRadius,
                    boxShadow: token.boxShadowSecondary,
                    padding: `${token.paddingSM}px ${token.padding}px`,
                },
            });
        }, ANIMATION__DURATION_IN_MS);
        return () => {
            window.clearTimeout(timeoutId);
            api.destroy(notificationKey);
        };
    }, [api, handleAccept, t, token]);

    return contextHolder;
};
