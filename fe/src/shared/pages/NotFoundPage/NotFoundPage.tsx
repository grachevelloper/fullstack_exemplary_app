import notFound from '@/public/lottie/not-found.json';

import {StatusPage} from '../../components/StatusPage';

export const NotFoundPage = () => {
    return (
        <StatusPage
            animationData={notFound}
            titleKey='page.not_found.title'
            descriptionKey='page.not_found.description'
        />
    );
};
