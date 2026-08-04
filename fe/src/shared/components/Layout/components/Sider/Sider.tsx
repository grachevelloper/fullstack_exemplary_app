import {MenuFoldOutlined} from '@ant-design/icons';
import {Button, Flex, Layout, Menu, Typography} from 'antd';
import block from 'bem-cn-lite';
import {Fragment, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';

import {useAuth} from '@/shared/context';
import {useSidebar} from '@/shared/context/Sidebar';

import {
    useNavigation as useInternalNavigation,
    useSiderActions,
} from '../../hooks';
import {LogoutDialog} from '../LogoutDialog';

import './Sider.scss';

const b = block('sider');

const {Sider: AntSider} = Layout;
const SIDER_WIDTH = 288;

export const Sider = () => {
    const {user} = useAuth();
    const navigate = useNavigate();
    const {t} = useTranslation('common');
    const {isCollapsed, toggleCollapsed} = useSidebar();

    const [isSignoutModalOpen, setSignoutModalOpen] = useState<boolean>(false);

    const {getNavigationItems, getDefaultSelectedKey} = useInternalNavigation(
        user?.role
    );
    const {getActionItems, contextNotificationHolder, contextMessageHolder} =
        useSiderActions({
            onLogoutClick: () => setSignoutModalOpen(true),
        });

    return (
        <Fragment>
            {contextNotificationHolder}
            {contextMessageHolder}
            <AntSider
                className={b()}
                breakpoint='lg'
                collapsedWidth={0}
                collapsed={isCollapsed}
                onCollapse={toggleCollapsed}
                theme='light'
                width={SIDER_WIDTH}
            >
                <Flex vertical className={b('container')}>
                    <Flex
                        className={b('top')}
                        justify='space-between'
                        align='start'
                        orientation='horizontal'
                    >
                        <div
                            className={b('brand')}
                            onClick={() => {
                                void navigate('/');
                            }}
                        >
                            <img src='/assets/favicon.ico' alt='' />
                            <div className={b('brand-copy')}>
                                <span className={b('brand-name')}>
                                    {t('layout.brand.name')}
                                </span>
                                <span className={b('brand-subtitle')}>
                                    {t('layout.brand.subtitle')}
                                </span>
                            </div>
                        </div>
                        <Menu
                            theme='light'
                            mode='vertical'
                            items={getNavigationItems()}
                            selectedKeys={getDefaultSelectedKey()}
                            className={b('menu')}
                        />
                        <Button
                            type='text'
                            className={b('collapse-control')}
                            aria-label={t('layout.navigation.open')}
                            icon={<MenuFoldOutlined />}
                            onClick={toggleCollapsed}
                        />
                    </Flex>

                    <div className={b('bottom')}>
                        {user && (
                            <Typography.Text
                                className={b('user-name')}
                                data-marker='nav-user-name'
                                ellipsis
                            >
                                {user.username}
                            </Typography.Text>
                        )}

                        <Menu
                            theme='light'
                            mode='vertical'
                            items={getActionItems()}
                            selectable={false}
                            className={b('menu')}
                        />
                    </div>
                </Flex>
                <LogoutDialog
                    isOpen={isSignoutModalOpen}
                    onCancel={() => setSignoutModalOpen((prev) => !prev)}
                />
            </AntSider>
        </Fragment>
    );
};
