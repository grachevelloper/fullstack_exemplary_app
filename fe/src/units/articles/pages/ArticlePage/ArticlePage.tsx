import {ClockCircleOutlined} from '@ant-design/icons';
import {Image, theme, Typography} from 'antd';
import block from 'bem-cn-lite';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';

import {CommentsWrapper} from '@/shared/components/CommentsWrapper';
import {MdEditor} from '@/shared/components/MdEditor';
import {Like, useToggleLikeMutation} from '@/shared/entities/Like';
import {NotFoundPage} from '@/shared/pages/NotFoundPage';
import {formatDate} from '@/shared/utils';

import {ArticleTag} from '../../components/ArticleTag';
import {DeleteArticleButton} from '../../components/DeleteArticleButton';
import {useGetArticleById} from '../../store';
import {type Tag} from '../../types';

import './ArticlePage.scss';

const b = block('article-page');

const {Title, Text} = Typography;

export const ArticlePage = () => {
    const {id} = useParams();
    const {t} = useTranslation('article');
    const {t: tCommon} = useTranslation('common');
    const {
        token: {
            colorBorder,
            borderRadius,
        },
    } = theme.useToken();
    const {data, error, isPending} = useGetArticleById(id);
    const {mutate: toggleLike, isPending: isLikePending} =
        useToggleLikeMutation();

    if (error) {
        return <NotFoundPage />;
    }

    const handleLikeClick = () => {
        if (!data) {
            return;
        }

        toggleLike({
            entityId: data.id,
            entityType: 'article',
            hasLiked: data.hasLiked,
        });
    };

    return (
        <div className={b()}>
            <header className={b('header')}>
                <div className={b('header-main')}>
                    <Text className={b('eyebrow')}>
                        {t('articles.status.published')}
                    </Text>
                    <Title level={1} className={b('title')}>
                        {data?.title}
                    </Title>
                    <div className={b('meta')}>
                        {data?.readTime && (
                            <Text type='secondary'>
                                <ClockCircleOutlined />{' '}
                                {t('articles.read_time', {
                                    minutes: data.readTime,
                                })}
                            </Text>
                        )}
                        {data?.updatedAt && (
                            <Text type='secondary'>
                                {tCommon('updated-at', {
                                    date: formatDate(data.updatedAt),
                                })}
                            </Text>
                        )}
                        {data?.createdAt && (
                            <Text type='secondary'>
                                {tCommon('created-at', {
                                    date: formatDate(data.createdAt),
                                })}
                            </Text>
                        )}
                    </div>
                </div>
                {data && <DeleteArticleButton article={data} />}
            </header>

            {data?.image && (
                <div className={b('cover')}>
                    <Image
                        src={data.image}
                        alt={data.title}
                        preview={false}
                        style={{
                            border: `1px solid ${colorBorder}`,
                            borderRadius,
                        }}
                    />
                </div>
            )}

            <div className={b('body')}>
                {Number(data?.tags?.length) > 0 && (
                    <div className={b('tags')}>
                        {data?.tags?.map((tag: Tag) => (
                            <ArticleTag key={tag.id} tag={tag} />
                        ))}
                    </div>
                )}

                {isPending ? (
                    <Text type='secondary'>{t('article.draft.saving')}</Text>
                ) : (
                    <MdEditor
                        markdown={data?.content || ''}
                        readOnly
                        entityId={data?.id || ''}
                        entityType='article'
                    />
                )}

                <div className={b('reactions')}>
                    <Like
                        isLiked={!!data?.hasLiked}
                        likesCount={data?.likesCount}
                        onClick={handleLikeClick}
                        disabled={!data || isLikePending}
                    />
                </div>

                <section className={b('comments')}>
                    <Title level={2}>
                        {tCommon('comments')}
                    </Title>
                    <CommentsWrapper
                        entityId={data?.id || ''}
                        entityType='article'
                    />
                </section>
            </div>
        </div>
    );
};
