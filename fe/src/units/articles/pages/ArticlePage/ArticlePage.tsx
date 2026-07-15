import {Col, Divider, Image, Row, theme, Typography} from 'antd';
import block from 'bem-cn-lite';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';

import {CommentsWrapper} from '@/shared/components/CommentsWrapper';
import {Like, useToggleLikeMutation} from '@/shared/entities/Like';
import {useLayout} from '@/shared/hooks';
import {NotFoundPage} from '@/shared/pages/NotFoundPage';
import {formatDate} from '@/shared/utils';

import {ArticleTag} from '../../components/ArticleTag';
import {useGetArticleById} from '../../store';
import {type Tag} from '../../types';

import './ArticlePage.scss';

const b = block('article-page');

const {Title, Text} = Typography;

export const ArticlePage = () => {
    const {isDesktop} = useLayout();
    const {id} = useParams();
    const {t} = useTranslation('article');
    const {t: tCommon} = useTranslation('common');
    const {
        token: {
            padding,
            fontSize,
            colorBorder,
            colorPrimary,
            colorTextSecondary,
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

    const renderTitle = () => {
        return (
            <Title
                level={1}
                style={{marginBottom: 0}}
                className={b('title')}
            >
                {data?.title}
            </Title>
        );
    };

    return (
        <div className={b()}>
            {!isDesktop ? (
                renderTitle()
            ) : (
                <Divider titlePlacement='start' orientationMargin={0}>
                    {renderTitle()}
                </Divider>
            )}

            <Row
                gutter={32}
                justify='space-between'
                align='middle'
                style={{marginBottom: 24}}
            >
                <Col>
                    <Row gutter={16} align='middle'>
                        {data?.readTime && (
                            <Col>
                                <Text type='secondary' style={{fontSize}}>
                                    {t('articles.read_time', {
                                        minutes: data?.readTime,
                                    })}
                                </Text>
                            </Col>
                        )}
                    </Row>
                </Col>
                <Col>
                    <Row gutter={8} align='middle'>
                        {data?.updatedAt && (
                            <Col>
                                <Text type='secondary' style={{fontSize}}>
                                    {tCommon('updated-at', {
                                        date: formatDate(data?.updatedAt),
                                    })}
                                </Text>
                            </Col>
                        )}
                        {data?.createdAt && (
                            <Col>
                                <Text type='secondary' style={{fontSize}}>
                                    {tCommon('created-at', {
                                        date: formatDate(data?.createdAt),
                                    })}
                                </Text>
                            </Col>
                        )}
                    </Row>
                </Col>
            </Row>

            {data?.image && (
                <Row style={{marginBottom: 32}}>
                    <Col span={24}>
                        <Image
                            src={data?.image}
                            alt={data?.title}
                            style={{
                                width: '100%',
                                maxHeight: 400,
                                objectFit: 'cover',
                                borderRadius: borderRadius,
                                border: `1px solid ${colorBorder}`,
                            }}
                            preview={false}
                        />
                    </Col>
                </Row>
            )}

            {Number(data?.tags?.length) > 0 && (
                <Row gutter={8} style={{marginBottom: 32}}>
                    {data?.tags?.map((tag: Tag) => (
                        <Col key={tag.id}>
                            <ArticleTag tag={tag} />
                        </Col>
                    ))}
                </Row>
            )}

            <Row>
                <Col span={24}>
                    <Typography.Text
                        className={b('content')}
                        style={{
                            fontSize,
                        }}
                    >
                        {isPending ? t('article.draft.saving') : data?.content}
                    </Typography.Text>
                </Col>
            </Row>

            <Row justify='end'>
                <Col span='24'>
                    <Like
                        isLiked={!!data?.hasLiked}
                        likesCount={data?.likesCount}
                        onClick={handleLikeClick}
                        disabled={!data || isLikePending}
                    />
                </Col>
            </Row>

            <Divider titlePlacement='start' orientationMargin={0}>
                <Title level={3} style={{marginBottom: 0}}>
                    {tCommon('comments')}
                </Title>
            </Divider>

            <Row>
                <Col span={24}>
                    <CommentsWrapper
                        entityId={data?.id || ''}
                        entityType='article'
                    />
                </Col>
            </Row>
        </div>
    );
};
