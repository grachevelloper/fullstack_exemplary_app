import {Typography} from 'antd';
import block from 'bem-cn-lite';
import {useEffect, useState} from 'react';

import {TODO_TITLE_MAX_LENGTH} from '@/shared/utils/constants';

import {BaseDetail} from '../types';

import './TodoTitile.scss';

const b = block('todo-title');

export const TodoTitle = ({content, onEnd}: BaseDetail<string>) => {
    const title = content ?? '';
    const [newTitle, setNewTitle] = useState<string>(title);

    useEffect(() => {
        setNewTitle(title);
    }, [title]);

    const handleEnd = () => {
        const trimmedTitle = newTitle.trim();

        if (!trimmedTitle || trimmedTitle === title) {
            setNewTitle(title);
            return;
        }

        onEnd('title', trimmedTitle);
    };

    return (
        <Typography.Title
            level={1}
            editable={{
                icon: <div />,
                maxLength: TODO_TITLE_MAX_LENGTH,
                triggerType: ['text'],
                enterIcon: null,
                autoSize: true,
                onChange: setNewTitle,
                onEnd: handleEnd,
            }}
            rootClassName={b('textarea')}
        >
            {title}
        </Typography.Title>
    );
};
