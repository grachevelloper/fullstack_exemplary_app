import {Layout} from 'antd';
import {Content} from 'antd/es/layout/layout';
import block from 'bem-cn-lite';
import {Outlet} from 'react-router-dom';

import './AuthLayout.scss';

const b = block('auth-layout');

export const AuthLayout = () => {
    return (
        <Layout rootClassName={b()}>
            <Content className={b('content')}>
                <Outlet />
            </Content>
        </Layout>
    );
};
