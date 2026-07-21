import {Typography} from 'antd';
import block from 'bem-cn-lite';

import {TODO_TITLE_MAX_LENGTH} from '@/shared/utils/constants';

import {BaseDetail} from '../types';

import './TodoTitile.scss';

const b = block('todo-title');

export const TodoTitle = ({content, onEnd}: BaseDetail<string>) => {
    return (
        <Typography.Title
            level={1}
            editable={{
                icon: <div />,
                maxLength: TODO_TITLE_MAX_LENGTH,
                triggerType: ['text'],
                enterIcon: null,
                autoSize: true,
                onChange: (value) => onEnd('title', value),
            }}
            rootClassName={b('textarea')}
        >
            {content}
        </Typography.Title>
    );
};
