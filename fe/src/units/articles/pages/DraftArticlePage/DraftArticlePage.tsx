import {MDXEditorMethods} from '@mdxeditor/editor';
import {
    Col,
    Form,
    Grid,
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
import {DEBOUNCE_ARTICLE_UPDATE_MS} from '@/shared/utils';
import {Role} from '@/typings/common';

import {DeleteArticleButton} from '../../components/DeleteArticleButton';
import {TagsSelect} from '../../components/TagsSelect';
import {TagsWrapper} from '../../components/TagsWrapper';
import {ViewModeToggle} from '../../components/ViewModeToggle';
import {useUpdateErrors} from '../../hooks/useErrorHandler';
import {useGetArticleById, useUpdateArticle} from '../../store';
import {Article, Tag, UpdateDraftField} from '../../types';

import './DraftArticlePage.scss';

const b = block('draft-article-page');
const DESCRIPTION_MAX_LENGTH = 300;

export const DraftArticlePage = () => {
    const [form] = Form.useForm<{description: string}>();
    const {user} = useAuth();
    const mdRef = useRef<MDXEditorMethods>(null);
    const {
        token: {padding, paddingXL},
    } = theme.useToken();
    const screens = Grid.useBreakpoint();
    const {t} = useTranslation('article');
    const {t: tCommon} = useTranslation('common');
    const navigate = useNavigate();
    const {id: draftId} = useParams();
    const {isCollapsed} = useSidebar();

    const {
        updateTitle,
        updateDescription,
        updateContent,
        updateTags,
        updateImage,
        updateReadTime,
        updateDraftStatus,
    } = useUpdateArticle();

    // Для первого запроса
    const {data: serverArticle, isLoading: isArticleLoading} =
        useGetArticleById(draftId);

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

    const {error: errorUpdatingDescription, mutateAsync: mutateDescription} =
        updateDescription;

    const {
        error: errorPublish,
        isPending: isPublishingPending,
        mutateAsync: mutatePublishDraft,
    } = updateDraftStatus;

    const {error: errorUpdatingReadTime, mutateAsync: mutateReadTime} =
        updateReadTime;

    const {error: errorUpdatingImage, mutateAsync: mutateImage} = updateImage;

    const updateErrors = {
        title: !!errorUpdatingTitle,
        description: !!errorUpdatingDescription,
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
        updateDescription.isPending ||
        updateContent.isPending ||
        updateTags.isPending ||
        updateImage.isPending ||
        updateReadTime.isPending;

    useEffect(() => {
        if (!isArticleLoading && serverArticle) {
            setLocalArticle(serverArticle);
            form.setFieldsValue({
                description: serverArticle.description || '',
            });
        }
    }, [form, serverArticle, isArticleLoading]);

    const debouncedUpdateTitle = useDebouncedCallback(
        async (title: string) => {
            if (!draftId) return;

            await mutateTitle(draftId, title);
        },
        DEBOUNCE_ARTICLE_UPDATE_MS,
        [draftId, mutateTitle]
    );

    const debouncedUpdateContent = useDebouncedCallback(
        async (content: string) => {
            if (!draftId) return;

            await mutateContent(draftId, content);
        },
        DEBOUNCE_ARTICLE_UPDATE_MS,
        [draftId, mutateContent]
    );

    const debouncedUpdateDescription = useDebouncedCallback(
        async (newDescription: string) => {
            if (!draftId) return;

            await mutateDescription(draftId, newDescription);
        },
        DEBOUNCE_ARTICLE_UPDATE_MS,
        [draftId, mutateDescription]
    );

    const debouncedUpdateImage = useDebouncedCallback(
        async (newImage: string) => {
            if (!draftId) return;

            await mutateImage(draftId, newImage);
        },
        DEBOUNCE_ARTICLE_UPDATE_MS,
        [draftId, mutateImage]
    );

    const debouncedUpdateReadTime = useDebouncedCallback(
        async (newReadTime: number) => {
            if (!draftId) return;

            await mutateReadTime(draftId, newReadTime);
        },
        DEBOUNCE_ARTICLE_UPDATE_MS,
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

    const handleDescriptionChange = useCallback(
        (newDescription: string) => {
            setLocalArticle((prev) => ({
                ...prev,
                description: newDescription,
            }));
            if (
                newDescription.trim() &&
                form.getFieldError('description').length
            ) {
                form.setFields([{name: 'description', errors: []}]);
            }
            debouncedUpdateDescription(newDescription);
        },
        [debouncedUpdateDescription, form]
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
        if (!draftId) return;

        await mutatePublishDraft(draftId, false);
        navigate(`/articles/${draftId}`);
    }, [draftId, mutatePublishDraft, navigate]);

    useEffect(() => {
        if (!isArticleLoading && serverArticle?.content) {
            mdRef.current?.setMarkdown(serverArticle?.content || '');
        }
    }, [isArticleLoading, serverArticle?.content]);

    useEffect(() => {
        if (
            user?.id &&
            author?.id &&
            user.id !== author.id &&
            user.role !== Role.ADMIN
        ) {
            navigate('/no-permission');
        }
    }, [author?.id, navigate, user?.id, user?.role]);

    if (!localArticle) {
        return (
            <div className={b('loading')}>
                <Spin size='large' />
            </div>
        );
    }

    return (
        <div
            className={b({reading: isCollapsed})}
            style={{
                paddingBlock: padding,
                paddingInline: screens.md ? paddingXL : padding,
            }}
        >
            {contextHolder}

            <ViewModeToggle />
            <Form
                form={form}
                component={false}
                onFinish={() => {
                    void handlePublish();
                }}
            >
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
                                        date: new Date(
                                            updatedAt
                                        ).toLocaleString(),
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
                        </Space>
                    </Col>
                </Row>

                <Row className={b('description-row')}>
                    <Col span={24}>
                        <Typography.Text
                            className={b('description-label')}
                            strong
                        >
                            {t('articles.form.description.label')}
                        </Typography.Text>
                        <Form.Item
                            name='description'
                            validateTrigger={[]}
                            rules={[
                                {
                                    required: true,
                                    whitespace: true,
                                    message: t(
                                        'articles.form.description.required'
                                    ),
                                },
                            ]}
                        >
                            <Input.TextArea
                                onChange={(event) =>
                                    handleDescriptionChange(event.target.value)
                                }
                                placeholder={t(
                                    'articles.form.description.placeholder'
                                )}
                                maxLength={DESCRIPTION_MAX_LENGTH}
                                showCount
                                autoSize={{minRows: 2, maxRows: 5}}
                                disabled={updateDescription.isPending}
                                data-marker='draft-description-input'
                                className={b('description-input')}
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>

            <Row gutter={[24, 24]} align='top' className={b('workspace')}>
                <Col xs={24} xl={17} className={b('editor-column')}>
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
                <Col xs={24} xl={7}>
                    <aside className={b('sidebar')}>
                        <div className={b('sidebar-section')}>
                            <Typography.Text
                                className={b('sidebar-label')}
                                strong
                            >
                                {t('articles.form.image.label')}
                            </Typography.Text>
                            <Input
                                value={image}
                                onChange={(e) =>
                                    handleImageChange(e.target.value)
                                }
                                onBlur={(e) => handleImageBlur(e.target.value)}
                                placeholder={t(
                                    'articles.form.image.placeholder'
                                )}
                                disabled={updateImage.isPending}
                                data-marker='draft-image-input'
                            />
                            {image && (
                                <Image
                                    src={image}
                                    alt={title}
                                    className={b('cover-image')}
                                    rootClassName={b('cover')}
                                    preview={false}
                                />
                            )}
                        </div>

                        <div className={b('sidebar-section')}>
                            <Typography.Text
                                className={b('sidebar-label')}
                                strong
                            >
                                {t('articles.form.readTime.label')}
                            </Typography.Text>
                            <InputNumber
                                min={1}
                                value={readTime}
                                onChange={handleReadTimeChange}
                                addonAfter={t('articles.form.readTime.after')}
                                disabled={updateReadTime.isPending}
                                data-marker='draft-read-time-input'
                                className={b('read-time-input')}
                            />
                        </div>

                        <div className={b('sidebar-section')}>
                            <Typography.Text
                                className={b('sidebar-label')}
                                strong
                            >
                                {t('articles.form.tags.label')}
                            </Typography.Text>
                            <Space
                                direction='vertical'
                                size={10}
                                className={b('tags')}
                            >
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
                        </div>
                    </aside>
                </Col>
            </Row>
            <Row justify='end' className={b('footer')}>
                <Col>
                    <Space wrap>
                        <ButtonAccept
                            text={t('article.draft.publish')}
                            loading={isPublishingPending}
                            onClick={() => form.submit()}
                            className={b('button-publish')}
                        />
                        {serverArticle && (
                            <DeleteArticleButton article={serverArticle} />
                        )}
                    </Space>
                </Col>
            </Row>
        </div>
    );
};
