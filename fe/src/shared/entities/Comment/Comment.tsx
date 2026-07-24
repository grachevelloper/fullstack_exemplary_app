import {DeleteOutlined, EditOutlined} from '@ant-design/icons';
import {Button, Divider, Flex, Spin, Typography} from 'antd';
import block from 'bem-cn-lite';
import {type CSSProperties, Fragment, useState} from 'react';
import {useTranslation} from 'react-i18next';

import {Like, useToggleLikeMutation} from '@/shared/entities/Like';
import {Role} from '@/typings/common';

import {User} from '../../components/User';
import {useAuth} from '../../context';
import {useLocalStorage} from '../../hooks';
import {formatDate} from '../../utils/date';

import {CommentForm} from './components/CommentForm';
import {useCommentMutations, useCreateCommentMutation} from './store';
import {type CommentType} from './types';

import './Comment.scss';

const b = block('comment');

interface CommentProps {
    comment: CommentType;
    isNew?: boolean;
    className?: string;
}

export const Comment = ({comment, className, isNew = false}: CommentProps) => {
    const {user} = useAuth();
    const {
        createdAt,
        updatedAt,
        likesCount,
        hasLiked,
        depth,
        parentId,
        entityId,
        entityType,
        content,
        id,
        author,
    } = comment || {
        parentId: null,
    };

    const [isReplyVisible, setReplyVisible] = useState<boolean>(false);
    const {t} = useTranslation('common');
    const {updateMutation, deleteMutation} = useCommentMutations();
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [formResetKey, setFormResetKey] = useState(0);
    const [localContent, setLocalContent] = useLocalStorage<string>(
        `comment-${id}`,
        content
    );

    const {
        mutateAsync: mutateDelete,
        isPending: isPendindDelete,
    } = deleteMutation;

    const {
        mutateAsync: mutateUpdate,
        isPending: isPendindUpdate,
    } = updateMutation;

    const {
        mutateAsync: mutateCreate,
        isPending: isPendingCreate,
    } = useCreateCommentMutation();
    const {mutate: toggleLike, isPending: isLikePending} =
        useToggleLikeMutation();

    const isEditable = user?.id === author?.id || user?.role === Role.ADMIN;
    const isLiked = Boolean(hasLiked);

    const handleCreate = async (content: string, isResponse = false) => {
        await mutateCreate({
            entityId,
            entityType,
            parentId: isResponse ? id! : parentId,
            content: content.trim(),
        });
        setLocalContent('');
        setFormResetKey((currentKey) => currentKey + 1);
        setReplyVisible(false);
    };

    const handleUpdate = async (content: string) => {
        await mutateUpdate({
            id: id!,
            content,
        });
        setIsEditing(false);
    };

    const handleRemove = async () => {
        if (!id) {
            return;
        }

        await mutateDelete(id);
        setReplyVisible(false);
        setIsEditing(false);
    };

    const handleSetEditing = () => {
        setIsEditing(true);
    };

    const handleReply = () => {
        setReplyVisible(true);
    };

    const handleLike = () => {
        if (!id) {
            return;
        }

        toggleLike({
            entityId: id,
            entityType: 'comment',
            hasLiked: isLiked,
        });
    };

    if (isNew || isEditing) {
        return (
            <CommentForm
                key={isEditing ? id : formResetKey}
                isCompletePending={
                    isEditing ? isPendindUpdate : isPendingCreate
                }
                depth={depth}
                onCancel={isEditing ? () => setIsEditing(false) : undefined}
                onComplete={isEditing ? handleUpdate : handleCreate}
                content={localContent}
            />
        );
    }

    return (
        <Fragment>
            <Flex
                justify='start'
                vertical
                align='start'
                className={b(undefined, className)}
                style={
                    {
                        '--comment-depth': depth,
                    } as CSSProperties
                }
            >
                <Flex
                    justify='space-between'
                    align='center'
                    className={b('title')}
                >
                    <Flex
                        align='start'
                        justify='start'
                        gap={8}
                        className={b('author')}
                    >
                        <User data={author} />
                        {createdAt && (
                            <Typography.Text rootClassName={b('created-at')}>
                                {formatDate(createdAt)}
                            </Typography.Text>
                        )}
                    </Flex>
                    <Flex className={b('updated-at')}>
                        {updatedAt && updatedAt !== createdAt && (
                            <Typography.Text rootClassName={b('created-at')}>
                                {t('updated-at', {date: formatDate(updatedAt)})}
                            </Typography.Text>
                        )}
                    </Flex>
                </Flex>
                <Typography.Text className={b('content')}>
                    {content}
                </Typography.Text>
                <Flex className={b('actions')} justify='start' align='center'>
                    <Like
                        isLiked={isLiked}
                        likesCount={likesCount}
                        onClick={handleLike}
                        disabled={!id || isLikePending}
                    />
                    {user ? (
                        <Button
                            className={b('action')}
                            type='text'
                            size='small'
                            onClick={handleReply}
                        >
                            {t('comments.reply')}
                        </Button>
                    ) : null}
                    {isEditable && (
                        <Fragment>
                            <Button
                                className={b('action')}
                                type='text'
                                size='small'
                                icon={<EditOutlined />}
                                onClick={handleSetEditing}
                            >
                                {t('comments.edit')}
                            </Button>
                            <Button
                                className={b('action', {danger: true})}
                                type='text'
                                size='small'
                                icon={
                                    isPendindDelete ? (
                                        <Spin size='small' />
                                    ) : (
                                        <DeleteOutlined />
                                    )
                                }
                                onClick={() => void handleRemove()}
                                disabled={isPendindDelete}
                            >
                                {t('comments.delete')}
                            </Button>
                        </Fragment>
                    )}
                </Flex>
                <Divider rootClassName={b('divider')} />
            </Flex>
            {isReplyVisible ? (
                <CommentForm
                    depth={depth}
                    onCancel={() => setReplyVisible(false)}
                    onComplete={handleCreate}
                    isCompletePending={isPendingCreate}
                />
            ) : null}
        </Fragment>
    );
};
