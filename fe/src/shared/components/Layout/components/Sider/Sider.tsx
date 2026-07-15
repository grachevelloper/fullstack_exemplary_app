import {MenuFoldOutlined} from '@ant-design/icons';
import {Button, Flex, Layout, Menu, theme, Typography} from 'antd';
import block from 'bem-cn-lite';
import {Fragment, useState} from 'react';
import {useTranslation} from 'react-i18next';

import {useAuth} from '@/shared/context';
import {useSidebar} from '@/shared/context/Sidebar';
import {useLayout} from '@/shared/hooks';

import {useNavigation, useSiderActions} from '../../hooks';
import {LogoutDialog} from '../LogoutDialog';

import './Sider.scss';

const b = block('sider');

const {Sider: AntSider} = Layout;

export const Sider = () => {
    const {user} = useAuth();
    const {t} = useTranslation('common');
    const {isDesktop, isTablet, isMobile} = useLayout();
    const {isCollapsed, toggleCollapsed} = useSidebar();
    const {
        token: {fontSizeLG},
    } = theme.useToken();

    const [isSignoutModalOpen, setSignoutModalOpen] = useState<boolean>(false);

    const {getNavigationItems, getDefaultSelectedKey} = useNavigation(
        user?.role
    );
    const {getActionItems, contextNotificationHolder, contextMessageHolder} =
        useSiderActions({
            onLogoutClick: () => setSignoutModalOpen(true),
        });

    const calculateWidth = () => {
        if (isTablet) return '25%';
        if (isMobile) return '250px';
        return '18%';
    };

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
                width={calculateWidth()}
                style={{maxWidth: '400px'}}
            >
                <Flex
                    vertical
                    justify='space-between'
                    className={b('container')}
                >
                    {isDesktop && (
                        <Button
                            type='text'
                            className={b('collapse-control')}
                            aria-label={t('layout.navigation.open')}
                            icon={<MenuFoldOutlined />}
                            onClick={toggleCollapsed}
                        />
                    )}
                    <Menu
                        theme='light'
                        mode='vertical'
                        items={getNavigationItems()}
                        defaultSelectedKeys={getDefaultSelectedKey()}
                        rootClassName={b('menu')}
                        style={{fontSize: fontSizeLG}}
                    />

                    {user && (
                        <Typography.Text
                            className={b('user-name')}
                            data-marker='nav-user-name'
                        >
                            {user.username}
                        </Typography.Text>
                    )}

                    <Menu
                        theme='light'
                        mode='vertical'
                        items={getActionItems()}
                        selectable={false}
                        rootClassName={b('menu')}
                        style={{fontSize: fontSizeLG}}
                    />
                </Flex>
                <LogoutDialog
                    isOpen={isSignoutModalOpen}
                    onCancel={() => setSignoutModalOpen(false)}
                />
            </AntSider>
        </Fragment>
    );
};
