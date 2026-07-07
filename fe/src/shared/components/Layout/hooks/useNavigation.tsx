import {HomeOutlined, UserOutlined} from '@ant-design/icons';
import {MenuItemType} from 'antd/es/menu/interface';
import {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {RiArticleLine, RiDraftLine} from 'react-icons/ri';
import {useLocation, useNavigate} from 'react-router-dom';

import {Role} from '@/typings/common';

const markerLabel = (marker: string, label: string) => (
    <span data-marker={marker}>{label}</span>
);

export const useNavigation = (userRole?: Role) => {
    const {t} = useTranslation('common');
    const navigate = useNavigate();
    const location = useLocation();

    const getNavigationItems = useCallback((): MenuItemType[] => {
        const baseItems: MenuItemType[] = [
            {
                icon: <HomeOutlined />,
                label: markerLabel('nav-home-link', t('layout.top.main')),
                key: 'nav-0',
                onClick: () => void navigate('/'),
            },
            {
                icon: <UserOutlined />,
                label: markerLabel('nav-resume-link', t('layout.top.resume')),
                key: 'nav-1',
                onClick: () => void navigate('/resume'),
            },
            {
                icon: <RiDraftLine />,
                label: markerLabel(
                    'nav-articles-link',
                    t('layout.top.articles')
                ),
                key: 'nav-2',
                onClick: () => void navigate('/articles'),
            },
        ];

        const writerItems: MenuItemType[] = [
            {
                icon: <RiArticleLine />,
                label: markerLabel('nav-drafts-link', t('layout.top.drafts')),
                key: 'nav-4',
                onClick: () => void navigate('/articles/drafts'),
            },
        ];

        if (userRole === Role.ADMIN) {
            return [...baseItems, ...writerItems];
        } else if (userRole === Role.WRITER) {
            return [...baseItems, ...writerItems];
        }

        return baseItems;
    }, [t, navigate, userRole]);

    const getDefaultSelectedKey = useCallback((): string[] => {
        const path = location.pathname.split('/').at(-1);
        switch (path) {
            case '':
            case 'todos':
                return ['nav-0'];
            case 'resume':
                return ['nav-1'];
            case 'articles':
                return ['nav-2'];
            case 'user':
                return ['nav-3'];
            case 'drafts':
                return ['nav-4'];
            default:
                return [''];
        }
    }, [location]);

    return {
        getNavigationItems,
        getDefaultSelectedKey,
    };
};
