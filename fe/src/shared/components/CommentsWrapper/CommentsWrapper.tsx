import {Empty, Flex, Spin, Typography} from 'antd';
import block from 'bem-cn-lite';
import {useTranslation} from 'react-i18next';

import {useAuth} from '@/shared/context';
import {
    Comment,
    CommentForm,
    type CommentType,
    EntityCommentType,
    useCommentsQuery,
} from '@/shared/entities/Comment';

import './CommentsWrapper.scss';

const b = block('comments-wrapper');

interface CommentsContainer {
    entityType: EntityCommentType;
    entityId: string;
}

export const CommentsWrapper = ({entityId, entityType}: CommentsContainer) => {
    const {user} = useAuth();
    const {t} = useTranslation('common');
    const {comments, isError, isPending} = useCommentsQuery({
        entityId,
        entityType,
        order: 'ASC',
    });

    if (!entityId) {
        return null;
    }

    return (
        <Flex align='start' justify='start' vertical rootClassName={b()}>
            {user ? (
                <Comment
                    isNew
                    comment={{
                        author: user,
                        content: '',
                        depth: 0,
                        entityType,
                        parentId: null,
                        entityId: entityId,
                        likesCount: 0,
                    }}
                />
            ) : (
                <CommentForm
                    depth={0}
                    isCompletePending={false}
                    onComplete={() => undefined}
                />
            )}
            {isPending && (
                <Flex justify='center' className={b('state')}>
                    <Spin />
                </Flex>
            )}
            {isError && (
                <Typography.Text type='danger' className={b('state')}>
                    {t('comments.error')}
                </Typography.Text>
            )}
            {!isPending && !isError && comments?.length === 0 && (
                <Empty
                    className={b('state')}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={t('comments.noComments')}
                />
            )}
            {(comments || []).map((comment: CommentType) => (
                <Comment key={comment.id} comment={comment} />
            ))}
        </Flex>
    );
};
