import {Card, Col, Row, Space, Typography} from 'antd';
import TextArea from 'antd/es/input/TextArea';
import block from 'bem-cn-lite';
import {useTranslation} from 'react-i18next';

import {CommentsWrapper} from '@/shared/components/CommentsWrapper';
import {useAuth} from '@/shared/context';
import {Like, useToggleLikeMutation} from '@/shared/entities/Like';

import {Priority} from '@/todos/components/Priority';
import {State} from '@/todos/components/State';
import {useTodoMutations} from '@/todos/store';
import {type Todo, type TodoPriority, type TodoState} from '@/todos/types';
import {getNextTodoPriority} from '@/todos/utils/todoMeta';

import {Checklist} from './components/Checklist';
import {TodoTitle} from './components/TodoTitle';
import {UpdateField} from './components/types';

import './BaseDetailts.scss';

const b = block('base-details');

interface BaseDetailsProps {
    initialData: Todo;
}

export const BaseDetails = ({initialData}: BaseDetailsProps) => {
    const {t} = useTranslation('todo');
    const {user} = useAuth();
    const {mutate: toggleLike, isPending: isLikePending} =
        useToggleLikeMutation();
    const {updateTitle, updatePriority, updateState, updateContent, isPending} =
        useTodoMutations();
    const priority = initialData.priority ?? 'Medium' as TodoPriority;
    const state = initialData.state ?? 'Planning' as TodoState;

    const handleEnd = <T extends UpdateField>(
        newValueType: T,
        newValue: Todo[T]
    ) => {
        switch (newValueType) {
            case 'title':
                updateTitle(initialData.id, newValue as string);
                break;
            case 'priority':
                updatePriority(initialData.id, newValue as TodoPriority);
                break;
            case 'state':
                updateState(initialData.id, newValue as TodoState);
                break;
            case 'content':
                updateContent(initialData.id, newValue as string);
                break;
        }
    };

    const handleContentChange = (value: string) => {
        handleEnd('content', value);
    };

    const handleLikeClick = () => {
        toggleLike({
            entityId: initialData.id,
            entityType: 'todo',
            hasLiked: initialData.hasLiked,
        });
    };

    return (
        <div className={b()}>
            <Row className={b('header')} gutter={[16, 16]} align='top'>
                <Col xs={24} md={18}>
                    <TodoTitle onEnd={handleEnd} content={initialData.title} />
                    <Space size={[12, 12]} wrap className={b('meta')}>
                        <Priority
                            priority={priority}
                            onUpdate={(priority: TodoPriority) =>
                                handleEnd(
                                    'priority',
                                    getNextTodoPriority(priority)
                                )
                            }
                            isLoading={isPending}
                        />
                        <State
                            state={state}
                            onUpdate={(state: TodoState) =>
                                handleEnd('state', state)
                            }
                            isLoading={isPending}
                        />
                    </Space>
                </Col>
                <Col xs={24} md={6} className={b('like')}>
                    <Like
                        isLiked={initialData.hasLiked}
                        likesCount={initialData.likesCount}
                        onClick={handleLikeClick}
                        disabled={isLikePending}
                    />
                </Col>
            </Row>

            <Row align='top' gutter={[24, 24]} className={b('body')}>
                <Col xs={24} lg={16} className={b('main')}>
                    <Card
                        className={b('panel')}
                        title={
                            <Typography.Text strong>
                                {t('todo.details.description')}
                            </Typography.Text>
                        }
                    >
                        <TextArea
                            className={b('content')}
                            defaultValue={initialData.content}
                            variant='borderless'
                            autoSize={{minRows: 8, maxRows: 24}}
                            onBlur={(e) => handleContentChange(e.target.value)}
                        />
                    </Card>

                    {user && (
                        <Card
                            className={b('panel')}
                            title={
                                <Typography.Text strong>
                                    {t('todo.details.comments')}
                                </Typography.Text>
                            }
                        >
                            <CommentsWrapper
                                entityId={initialData.id}
                                entityType='todo'
                            />
                        </Card>
                    )}
                </Col>
                {user && (
                    <Col xs={24} lg={8} className={b('aside')}>
                        <Checklist todoId={initialData.id} />
                    </Col>
                )}
            </Row>
        </div>
    );
};
