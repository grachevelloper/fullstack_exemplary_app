import {
    BulbOutlined,
    GlobalOutlined,
    LoginOutlined,
    SettingOutlined,
    UserOutlined,
} from '@ant-design/icons';
import {message, notification} from 'antd';
import type {MenuItemType} from 'antd/es/menu/interface';
import {useTranslation} from 'react-i18next';
import {IoIosLogOut} from 'react-icons/io';
import {MdOutlineCreate} from 'react-icons/md';
import {RiTodoLine} from 'react-icons/ri';
import {useNavigate} from 'react-router-dom';

import {useAuth, useTodoForm} from '@/shared/context';
import {Role} from '@/typings/common';

import {useCreateArticle} from '@/articles/store';
import {INITIAL_DRAFT_CONTENT} from '@/articles/utils/constants';

interface UseSiderActionsProps {
    onLogoutClick: () => void;
}

export const useSiderActions = ({onLogoutClick}: UseSiderActionsProps) => {
    const {t, i18n} = useTranslation(['common', 'article']);
    const {user} = useAuth();
    const navigate = useNavigate();
    const {setIsOpen} = useTodoForm();
    const [notificationApi, contextNotificationHolder] =
        notification.useNotification();
    const [messageApi, contextMessageHolder] = message.useMessage();

    const {mutateAsync: createArticle} = useCreateArticle();

    const handleCreateArticle = () => {
        createArticle({
            content: INITIAL_DRAFT_CONTENT,
            title: t('article:article.new.title', {
                defaultValue: 'Untitled article',
            }),
        })
            .then((data) => {
                navigate(`/articles/draft/${data.id}`);
                messageApi.success(
                    t('layout.left.create_article.success.title')
                );
            })
            .catch(() => {
                notificationApi.error({
                    message: t('layout.left.create_article.error.title'),
                    description: t(
                        'layout.left.create_article.error.description'
                    ),
                });
            });
    };

    const currentLanguage = i18n.resolvedLanguage ?? i18n.language;
    const isCurrentLanguage = (language: 'ru' | 'en') =>
        currentLanguage.startsWith(language);
    const currentLanguageCode = isCurrentLanguage('ru') ? 'ru' : 'en';
    const nextLanguage = currentLanguageCode === 'ru' ? 'en' : 'ru';

    const languageAction: MenuItemType = {
        icon: <GlobalOutlined />,
        label: t('layout.language.current', {
            language: t(`layout.language.${currentLanguageCode}`),
        }),
        key: 'action-language',
        onClick: () => void i18n.changeLanguage(nextLanguage),
    };

    const getUserActions = (): MenuItemType[] => {
        if (!user) {
            return [
                languageAction,
                {
                    icon: <LoginOutlined />,
                    label: t('layout.top.user.signin'),
                    key: 'action-guest-0',
                    onClick: () => void navigate('/auth/signin'),
                },
                {
                    icon: <UserOutlined />,
                    label: t('layout.top.user.signup'),
                    key: 'action-guest-1',
                    onClick: () => void navigate('/auth/signup'),
                },
            ];
        }

        const userActions: MenuItemType[] = [
            {
                icon: <BulbOutlined />,
                label: t('layout.left.suggest'),
                key: 'action-user-0',
                onClick: () => setIsOpen(true),
            },
        ];

        const writerActions: MenuItemType[] = [
            {
                icon: <MdOutlineCreate />,
                label: t('layout.left.create_article'),
                key: 'action-writer-0',
                onClick: handleCreateArticle,
            },
        ];

        const adminActions: MenuItemType[] = [
            {
                icon: <RiTodoLine />,
                label: t('layout.left.create_todo'),
                key: 'action-admin-0',
                onClick: () => void navigate('/todos/new'),
            },
            {
                icon: <SettingOutlined />,
                label: t('layout.left.edit_nowadays'),
                key: 'action-admin-1',
                onClick: () => void navigate('/admin/nowadays'),
            },
        ];

        const logoutAction: MenuItemType = {
            icon: <IoIosLogOut />,
            label: <span data-marker='nav-logout-button'>{t('logout')}</span>,
            key: 'action-logout',
            onClick: onLogoutClick,
            className: 'sider__logout-option',
        };

        let actions = [...userActions];

        if (user.role === Role.ADMIN) {
            actions = [...adminActions, ...writerActions, ...userActions];
        } else if (user.role === Role.WRITER) {
            actions = [...writerActions, ...userActions];
        }

        return [...actions, languageAction, logoutAction];
    };

    return {
        getActionItems: getUserActions,
        contextNotificationHolder,
        contextMessageHolder,
    };
};
