import {MDXEditorMethods} from '@mdxeditor/editor';
import {
    Button,
    Col,
    Image,
    Input,
    InputNumber,
    Row,
    Space,
    Spin,
    theme,
    Typography,
} from 'antd';
import block from 'bem-cn-lite';
import {useCallback, useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate, useParams} from 'react-router-dom';

import {ButtonAccept} from '@/shared/components/actions';
import {MdEditor} from '@/shared/components/MdEditor';
import {useAuth} from '@/shared/context';
import {useSidebar} from '@/shared/context/Sidebar';
import {useDebouncedCallback} from '@/shared/hooks';
import {FIVE_SECONDS_IN_MS} from '@/shared/utils';

import {TagsSelect} from '../../components/TagsSelect';
import {TagsWrapper} from '../../components/TagsWrapper';
import {ViewModeToggle} from '../../components/ViewModeToggle';
import {useUpdateErrors} from '../../hooks/useErrorHandler';
import {useGetArticleById, useUpdateArticle} from '../../store';
import {Article, Tag, UpdateDraftField} from '../../types';

import './DraftArticlePage.scss';

const b = block('draft-article-page');

export const DraftArticlePage = () => {
    const {user} = useAuth();
    const mdRef = useRef<MDXEditorMethods>(null);
    const {
        token: {padding},
    } = theme.useToken();
    const {t} = useTranslation('article');
    const {t: tCommon} = useTranslation('common');
    const navigate = useNavigate();
    const {id: draftId} = useParams();
    const {isCollapsed} = useSidebar();

    const {
        updateTitle,
        updateContent,
        updateTags,
        updateImage,
        updateReadTime,
        updateDraftStatus,
    } = useUpdateArticle();

    // Для первого запроса
    const {
        data: serverArticle,
        isLoading: isArticleLoading,
    } = useGetArticleById(draftId);

    // Локальное состояние
    const [localArticle, setLocalArticle] = useState<Partial<Article> | null>(
        null
    );
    const {
        title = '',
        content = '',
        updatedAt,
        tags = [],
        author,
        image = '',
        readTime,
    } = localArticle || {};

    const {error: errorUpdatingContent, mutateAsync: mutateContent} =
        updateContent;

    const {error: errorUpdatingTitle, mutateAsync: mutateTitle} = updateTitle;

    const {
        error: errorPublish,
        isPending: isPublishingPending,
        mutateAsync: mutatePublishDraft,
    } = updateDraftStatus;

    const {
        error: errorUpdatingReadTime,
        mutateAsync: mutateReadTime,
    } = updateReadTime;

    const {
        error: errorUpdatingImage,
        mutateAsync: mutateImage,
    } = updateImage;

    const updateErrors = {
        title: !!errorUpdatingTitle,
        content: !!errorUpdatingContent,
        tags: !!updateTags.error,
        image: !!errorUpdatingImage,
        readTime: !!errorUpdatingReadTime,
        isDraft: !!errorPublish,
    };

    const errorFields: UpdateDraftField[] = Object.entries(updateErrors)
        .filter(([, hasError]) => hasError)
        .map(([field]) => field as UpdateDraftField);

    const contextHolder = useUpdateErrors(errorFields);
    const isSaving =
        updateTitle.isPending ||
        updateContent.isPending ||
        updateTags.isPending ||
        updateImage.isPending ||
        updateReadTime.isPending;

    useEffect(() => {
        if (!isArticleLoading && serverArticle) {
            setLocalArticle(serverArticle);
        }
    }, [serverArticle, isArticleLoading]);

    const debouncedUpdateTitle = useDebouncedCallback(
        async (title: string) => {
            if (!draftId) return;

            await mutateTitle(draftId, title);
        },
        FIVE_SECONDS_IN_MS,
        [draftId, mutateTitle]
    );

    const debouncedUpdateContent = useDebouncedCallback(
        async (content: string) => {
            if (!draftId) return;

            await mutateContent(draftId, content);
        },
        FIVE_SECONDS_IN_MS,
        [draftId, mutateContent]
    );

    const debouncedUpdateImage = useDebouncedCallback(
        async (newImage: string) => {
            if (!draftId) return;

            await mutateImage(draftId, newImage);
        },
        FIVE_SECONDS_IN_MS,
        [draftId, mutateImage]
    );

    const debouncedUpdateReadTime = useDebouncedCallback(
        async (newReadTime: number) => {
            if (!draftId) return;

            await mutateReadTime(draftId, newReadTime);
        },
        FIVE_SECONDS_IN_MS,
        [draftId, mutateReadTime]
    );

    const handleTagsChange = useCallback(
        async (newTags: Tag[]) => {
            if (!draftId) return;
            setLocalArticle((prev) => ({...prev, tags: newTags}));
            await updateTags.mutateAsync(draftId, newTags);
        },
        [draftId, updateTags]
    );

    const handleTitleChange = useCallback(
        (newTitle: string) => {
            setLocalArticle((prev) => ({...prev, title: newTitle}));
            debouncedUpdateTitle(newTitle);
        },
        [debouncedUpdateTitle]
    );

    const handleContentChange = useCallback(
        (newContent: string) => {
            setLocalArticle((prev) => ({...prev, content: newContent}));
            debouncedUpdateContent(newContent);
        },
        [debouncedUpdateContent]
    );

    const handleImageChange = useCallback(
        (newImage: string) => {
            setLocalArticle((prev) => ({...prev, image: newImage}));
            debouncedUpdateImage(newImage);
        },
        [debouncedUpdateImage]
    );

    const handleImageBlur = useCallback(
        (newImage: string) => {
            if (!draftId) return;
            void mutateImage(draftId, newImage);
        },
        [draftId, mutateImage]
    );

    const handleReadTimeChange = useCallback(
        (newReadTime: number | null) => {
            const normalizedReadTime = newReadTime ?? 1;

            setLocalArticle((prev) => ({
                ...prev,
                readTime: normalizedReadTime,
            }));
            debouncedUpdateReadTime(normalizedReadTime);
        },
        [debouncedUpdateReadTime]
    );

    const handlePublish = useCallback(async () => {
        if (draftId) {
            await mutatePublishDraft(draftId, false);
            navigate(`/articles/${draftId}`);
        }
    }, [draftId, mutatePublishDraft, navigate]);

    useEffect(() => {
        if (!isArticleLoading && serverArticle?.content) {
            mdRef.current?.setMarkdown(serverArticle?.content || '');
        }
    }, [isArticleLoading, serverArticle?.content]);

    useEffect(() => {
        if (user?.id && author?.id && user.id !== author.id) {
            navigate('/no-permission');
        }
    }, [author?.id, navigate, user?.id]);

    if (isArticleLoading && !localArticle) {
        return (
            <div className={b('loading')}>
                <Spin size='large' />
            </div>
        );
    }

    return (
        <div className={b({reading: isCollapsed})} style={{padding}}>
            {contextHolder}

            <ViewModeToggle />
            <Row gutter={[16, 16]} align='top' className={b('header')}>
                <Col xs={24} lg={16}>
                    <Input
                        value={title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder={t('articles.form.title.placeholder')}
                        variant='borderless'
                        data-marker='draft-title-input'
                        disabled={updateTitle.isPending}
                        className={b('title-input')}
                    />
                </Col>
                <Col xs={24} lg={8} className={b('meta')}>
                    <Space wrap size={[8, 8]} className={b('meta-actions')}>
                        {updatedAt && (
                            <Typography.Text type='secondary'>
                                {tCommon('updated-at', {
                                    date: new Date(updatedAt).toLocaleString(),
                                })}
                            </Typography.Text>
                        )}
                        {isSaving && (
                            <Typography.Text
                                type='secondary'
                                data-marker='draft-save-button'
                            >
                                {t('article.draft.saving')}
                            </Typography.Text>
                        )}
                        <Button
                            type='primary'
                            loading={isPublishingPending}
                            onClick={() => {
                                void handlePublish();
                            }}
                            data-marker='draft-publish-button'
                        >
                            {t('article.draft.publish')}
                        </Button>
                    </Space>
                </Col>
            </Row>

            <Row gutter={[16, 16]} className={b('settings')}>
                <Col xs={24} lg={16}>
                    <Input
                        value={image}
                        onChange={(e) => handleImageChange(e.target.value)}
                        onBlur={(e) => handleImageBlur(e.target.value)}
                        placeholder={t('articles.form.image.placeholder')}
                        addonBefore={t('articles.form.image.label')}
                        disabled={updateImage.isPending}
                        data-marker='draft-image-input'
                    />
                </Col>
                <Col xs={24} lg={8}>
                    <InputNumber
                        min={1}
                        value={readTime}
                        onChange={handleReadTimeChange}
                        addonBefore={t('articles.form.readTime.label')}
                        addonAfter={t('articles.form.readTime.after')}
                        disabled={updateReadTime.isPending}
                        data-marker='draft-read-time-input'
                        className={b('read-time-input')}
                    />
                </Col>
            </Row>

            {image && (
                <Row className={b('cover')}>
                    <Col span={24}>
                        <Image
                            src={image}
                            alt={title}
                            className={b('cover-image')}
                            preview={false}
                        />
                    </Col>
                </Row>
            )}

            <Row align='middle' gutter={[12, 12]} className={b('tags-row')}>
                <Col>
                    <Typography.Text type='secondary'>
                        {t('articles.form.tags.label')}
                    </Typography.Text>
                </Col>
                <Col flex='auto'>
                    <Space wrap size={[8, 8]}>
                        <TagsSelect
                            onChange={(newTags) => {
                                void handleTagsChange(newTags);
                            }}
                            value={tags}
                        />
                        <TagsWrapper
                            tags={tags}
                            editable={{
                                onChange: (newTags) => {
                                    void handleTagsChange(newTags);
                                },
                            }}
                            isPending={updateTags.isPending}
                        />
                    </Space>
                </Col>
            </Row>

            <Row className={b('editor-row')}>
                <Col span={24}>
                    <MdEditor
                        ref={mdRef}
                        placeholder={t('article.placeholder')}
                        markdown={content || ''}
                        onChange={handleContentChange}
                        dataMarker='draft-content-editor'
                        editable
                        entityId={draftId || ''}
                        entityType='article'
                    />
                </Col>
            </Row>
            <Row justify='end' className={b('footer')}>
                <Col>
                    <ButtonAccept
                        text={t('article.draft.publish')}
                        loading={isPublishingPending}
                        onClick={() => {
                            void handlePublish();
                        }}
                        className={b('button-publish')}
                    />
                </Col>
            </Row>
        </div>
    );
};
