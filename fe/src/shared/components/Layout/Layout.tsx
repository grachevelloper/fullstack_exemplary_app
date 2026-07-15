import {QueryErrorResetBoundary} from '@tanstack/react-query';
import {Layout as AntLayout, Button, Flex, theme} from 'antd';
import block from 'bem-cn-lite';
import {lazy, Suspense, useEffect} from 'react';
import {ErrorBoundary} from 'react-error-boundary';
import {useTranslation} from 'react-i18next';
import {MdOutlineMenuOpen} from 'react-icons/md';
import {Outlet, useLocation} from 'react-router-dom';

import {useSidebar} from '../../context/Sidebar';
import {useCookie} from '../../hooks/useCookie';
import {useLayout} from '../../hooks/useLayout';
import {useNetworkStatus} from '../../hooks/useNetworkStatus';

import {Animation} from './components/Animation';
import {Sider} from './components/Sider';
import './Layout.scss';
import {COOKIE_ACCEPT_KEY} from './constants';

const b = block('layout');

const {Content} = AntLayout;

const NewTodoForm = lazy(() =>
    import('../NewTodoForm').then(({NewTodoForm}) => ({default: NewTodoForm}))
);

const CookieMessage = lazy(() =>
    import('./components/CookieMessage').then(({CookieMessage}) => ({
        default: CookieMessage,
    }))
);

const OfflineOverlay = lazy(() =>
    import('./components/OfflineOverlay').then(({OfflineOverlay}) => ({
        default: OfflineOverlay,
    }))
);

const Footer = lazy(() =>
    import('./components/Footer').then(({Footer}) => ({default: Footer}))
);

export const Layout = () => {
    const {t} = useTranslation('common');
    const location = useLocation();
    const {isDesktop} = useLayout();
    const {isOffline} = useNetworkStatus();
    const {value} = useCookie(COOKIE_ACCEPT_KEY);
    const {isCollapsed, toggleCollapsed, setCollapsed} = useSidebar();

    const {
        token: {colorPrimary, colorTextLightSolid},
    } = theme.useToken();

    useEffect(() => {
        if (!isDesktop) {
            setCollapsed(true);
        }
    }, [location.pathname]);

    useEffect(() => {
        setCollapsed(!isDesktop);
    }, [isDesktop]);

    return (
        <QueryErrorResetBoundary>
            {({reset}) => (
                <ErrorBoundary
                    onReset={reset}
                    fallbackRender={({resetErrorBoundary}) => (
                        <Flex>
                            {/* <Lottie animationData={}></Lottie> */}
                            <Button onClick={() => resetErrorBoundary()}>
                                Try to refresh page
                            </Button>
                        </Flex>
                    )}
                >
                    {isOffline && (
                        <Suspense fallback={null}>
                            <OfflineOverlay />
                        </Suspense>
                    )}
                    <Animation />
                    <AntLayout className={b()} hasSider>
                        {!isCollapsed && !isDesktop && (
                            <div
                                className={b('overlay')}
                                onClick={toggleCollapsed}
                            />
                        )}
                        {isCollapsed && (
                            <Button
                                type='text'
                                className={b('sider-collapse-button')}
                                onClick={toggleCollapsed}
                                aria-label={t('layout.navigation.open')}
                                style={{
                                    backgroundColor: colorPrimary,
                                    color: colorTextLightSolid,
                                }}
                                icon={<MdOutlineMenuOpen size={28} />}
                            />
                        )}

                        <Suspense fallback={null}>
                            <NewTodoForm />
                        </Suspense>
                        {!value && (
                            <Suspense fallback={null}>
                                <CookieMessage />
                            </Suspense>
                        )}

                        <Sider />
                        <Content className={b('content')}>
                            <Outlet />
                            <Suspense fallback={null}>
                                <Footer />
                            </Suspense>
                        </Content>
                    </AntLayout>
                </ErrorBoundary>
            )}
        </QueryErrorResetBoundary>
    );
};
