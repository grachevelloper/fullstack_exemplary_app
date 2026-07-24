import noPermission from '@/public/lottie/no-permission.json';

import {StatusPage} from '../../components/StatusPage';

export const NoPermissionPage = () => {
    return (
        <StatusPage
            animationData={noPermission}
            titleKey='page.no_permission.title'
            descriptionKey='page.no_permission.description'
        />
    );
};
