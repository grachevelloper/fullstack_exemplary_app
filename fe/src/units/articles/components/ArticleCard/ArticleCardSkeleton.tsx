import {Card, Skeleton} from 'antd';
import block from 'bem-cn-lite';

import './ArticleCard.scss';

const b = block('article-card');

export const ArticleCardSkeleton = () => {
    return (
        <Card
            className={b({skeleton: true})}
            cover={<Skeleton.Image active className={b('skeleton-image')} />}
        >
            <div className={b('skeleton-content')}>
                <Skeleton active paragraph={{rows: 4}} />
            </div>
        </Card>
    );
};
