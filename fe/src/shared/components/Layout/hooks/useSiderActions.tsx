import {BulbOutlined, LoginOutlined, UserOutlined} from '@ant-design/icons';
import {message, notification} from 'antd';
import {MenuItemType} from 'antd/es/menu/interface';
import {useTranslation} from 'react-i18next';
import {IoIosLogOut} from 'react-icons/io';
import {MdOutlineCreate} from 'react-icons/md';
import {RiTodoLine} from 'react-icons/ri';
import {useNavigate} from 'react-router-dom';

import {useAuth, useTodoForm} from '@/shared/context';
import {Role} from '@/typings/common';

import {useCreateArticle} from '@/articles/store';

interface UseSiderActionsProps {
    onLogoutClick: () => void;
}

export const useSiderActions = ({onLogoutClick}: UseSiderActionsProps) => {
    const {t} = useTranslation('common');
    const {user} = useAuth();
    const navigate = useNavigate();
    const {setIsOpen} = useTodoForm();
    const [notificationApi, contextNotificationHolder] =
        notification.useNotification();
    const [messageApi, contextMessageHolder] = message.useMessage();

    const {mutateAsync: createArticle} = useCreateArticle();

    const handleCreateArticle = () => {
        createArticle()
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

    const getUserActions = (): MenuItemType[] => {
        if (!user) {
            return [
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
        ];

        const logoutAction: MenuItemType = {
            icon: <IoIosLogOut />,
            label: <span data-marker='nav-logout-button'>{t('logout')}</span>,
            key: 'action-logout',
            onClick: onLogoutClick,
            className: 'logout-option',
        };

        let actions = [...userActions];

        if (user.role === Role.ADMIN) {
            actions = [...adminActions, ...writerActions, ...userActions];
        } else if (user.role === Role.WRITER) {
            actions = [...writerActions, ...userActions];
        }

        return [...actions, logoutAction];
    };

    return {
        getActionItems: getUserActions,
        contextNotificationHolder,
        contextMessageHolder,
    };
};
