import {HeartFilled, HeartOutlined} from '@ant-design/icons';
import {Button, Popover, Space, theme, Tooltip, Typography} from 'antd';
import block from 'bem-cn-lite';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';

import {useAuth} from '@/shared/context';

import './Like.scss';

const b = block('like-button');

interface LikeProps {
    disabled?: boolean;
    isLiked: boolean;
    onClick: () => void;
    likesCount?: number;
}

export const Like = ({
    disabled = false,
    isLiked,
    onClick,
    likesCount,
}: LikeProps) => {
    const {t} = useTranslation('common');
    const navigate = useNavigate();
    const {isAuthLoading, user} = useAuth();
    const [isAuthPromptOpen, setAuthPromptOpen] = useState(false);
    const {
        token: {colorPrimary},
    } = theme.useToken();
    const HeartIcon = isLiked ? HeartFilled : HeartOutlined;
    const isAuthorized = Boolean(user);
    const isDisabled = disabled || isAuthLoading;
    const buttonLabel = isAuthorized
        ? t(isLiked ? 'unlike' : 'like')
        : t('like.auth.ariaLabel');

    const handleClick = () => {
        if (!isAuthorized) {
            setAuthPromptOpen(true);
            return;
        }

        onClick();
    };

    const handleAuthNavigate = (path: string) => {
        setAuthPromptOpen(false);
        navigate(path);
    };

    const likeButton = (
        <Button
            type='text'
            disabled={isDisabled}
            onClick={handleClick}
            className={b({liked: isLiked})}
            aria-pressed={isAuthorized ? isLiked : undefined}
            aria-label={buttonLabel}
        >
            <Space size={4} align='center'>
                <HeartIcon style={{color: isLiked ? colorPrimary : undefined}} />
                <Typography.Text className={b('count')}>
                    {likesCount ?? 0}
                </Typography.Text>
            </Space>
        </Button>
    );

    if (!isAuthorized) {
        return (
            <Popover
                trigger='click'
                open={isAuthPromptOpen}
                onOpenChange={setAuthPromptOpen}
                title={t('like.auth.title')}
                content={
                    <Space direction='vertical' size={12} className={b('auth')}>
                        <Typography.Text type='secondary'>
                            {t('like.auth.description')}
                        </Typography.Text>
                        <Space size={8} wrap>
                            <Button
                                type='primary'
                                size='small'
                                onClick={() => handleAuthNavigate('/auth/signin')}
                            >
                                {t('like.auth.signin')}
                            </Button>
                            <Button
                                size='small'
                                onClick={() => handleAuthNavigate('/auth/signup')}
                            >
                                {t('like.auth.signup')}
                            </Button>
                        </Space>
                    </Space>
                }
            >
                {likeButton}
            </Popover>
        );
    }

    return (
        <Tooltip title={buttonLabel}>{likeButton}</Tooltip>
    );
};
