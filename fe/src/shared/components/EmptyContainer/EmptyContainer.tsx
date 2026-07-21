import {Empty, EmptyProps} from 'antd';
import block from 'bem-cn-lite';

import './EmptyContainer.scss';

const b = block('empty-container');

export const EmptyContainer = ({...props}: EmptyProps) => {
    return <Empty className={b()} {...props} />;
};
