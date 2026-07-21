import {Layout, Spin, theme} from 'antd';
import {Content} from 'antd/es/layout/layout';
import block from 'bem-cn-lite';
import {lazy, Suspense} from 'react';
import {Navigate, Outlet} from 'react-router-dom';

import {useAuth} from '@/shared/context';
import {useNetworkStatus} from '@/shared/hooks';

import authBackground from '@/public/assets/auth.jpeg';

import {AuthNavigateButton} from './components/AuthNavigateButton';

import './AuthLayout.scss';

const b = block('auth-layout');
const authBackgroundUrl =
    process.env.NODE_ENV === 'development'
        ? '/assets/auth.jpeg'
        : authBackground;
const OfflineOverlay = lazy(() =>
    import('../Layout/components/OfflineOverlay').then(({OfflineOverlay}) => ({
        default: OfflineOverlay,
    }))
);

export const AuthLayout = () => {
    const {
        token: {colorBgMask},
    } = theme.useToken();
    const {isAuthLoading, user} = useAuth();
    const {isOffline} = useNetworkStatus();

    if (isAuthLoading) {
        return (
            <div className={b('loader')}>
                <Spin size='large' />
            </div>
        );
    }

    if (user) {
        return <Navigate to='/' replace />;
    }

    return (
        <Layout className={b()}>
            {isOffline && (
                <Suspense fallback={null}>
                    <OfflineOverlay />
                </Suspense>
            )}
            <img className={b('background')} src={authBackgroundUrl} alt='' />
            <div
                aria-hidden='true'
                className={b('backdrop')}
                style={{backgroundColor: colorBgMask}}
            />
            <Content className={b('content')}>
                <Outlet />
            </Content>
            <AuthNavigateButton />
        </Layout>
    );
};
