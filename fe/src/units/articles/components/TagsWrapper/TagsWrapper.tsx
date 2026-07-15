import {Flex, Form, notification, theme} from 'antd';
import block from 'bem-cn-lite';
import {useCallback, useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {FiChevronsRight} from 'react-icons/fi';

import {FormInput} from '@/shared/components/FormInput';

import {ButtonAccept} from '../../../../shared/components/actions';
import {useCreateTag} from '../../store/tags';
import {Tag} from '../../types';
import {ArticleTag} from '../ArticleTag';

import './TagsWrapper.scss';

const b = block('tags-wrapper');

interface TagsWrapperProps {
    isPending: boolean;
    tags?: Tag[];
    editable?: {
        onChange: (tags: Tag[]) => void;
    };
}

type FormType = {
    name: string;
};

export const TagsWrapper = ({tags, editable}: TagsWrapperProps) => {
    const {
        token: {colorPrimary, colorBgContainer},
    } = theme.useToken();
    const {t} = useTranslation(['article', 'common']);
    const [notificationApi, contextNotificationHolder] =
        notification.useNotification();
    const {
        mutateAsync: createTag,
        error: createTagError,
        isPending: isCreateTagPending,
    } = useCreateTag();

    const [form] = Form.useForm<FormType>();
    const [submittable, setSubmittable] = useState<boolean>(false);
    const [expanded, setExpanded] = useState<boolean>(false);
    const [shouldShowExpand, setShouldShowExpand] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const name = Form.useWatch([], form);

    const maxVisibleTags = editable ? 2 : 4;

    useEffect(() => {
        if (tags && tags.length > maxVisibleTags) {
            setShouldShowExpand(true);
        } else {
            setShouldShowExpand(false);
            setExpanded(false);
        }
    }, [tags]);

    const handleOk = useCallback(async () => {
        try {
            const values = await form.validateFields();

            const newTag = await createTag(values);
            if (editable && tags) {
                editable.onChange([...tags, newTag]);
            }
            form.resetFields();
        } catch (error) {
            console.error('Validation failed:', error);
        }
    }, [name, form, editable, tags]);

    const handleDelete = useCallback(
        (id: string) => {
            if (tags) editable?.onChange(tags.filter((tag) => tag.id !== id));
        },
        [tags, editable]
    );

    const toggleExpanded = () => {
        setExpanded(!expanded);
    };

    useEffect(() => {
        form.validateFields({validateOnly: true})
            .then(() => setSubmittable(true))
            .catch(() => setSubmittable(false));
    }, [form, name]);

    useEffect(() => {
        if (createTagError) {
            notificationApi.error({
                message: t('article.tags.create.error.message'),
            });
        }
    }, [createTagError, notificationApi, t]);

    const renderCreateTagPopover = useCallback(() => {
        return (
            <Form
                form={form}
                onFinish={() => {
                    void handleOk();
                }}
                layout='vertical'
                className={b('create-tag-popover')}
                autoComplete='off'
            >
                <FormInput
                    field={{
                        placeholder: t('articles.tags.create.placeholder'),
                        name: 'name',
                        label: t('articles.tags.create.label'),
                        index: 0,
                        rules: [
                            {
                                required: true,
                                message: t('article.tags.name.required'),
                            },
                            {min: 2, message: t('article.tags.name.min')},
                        ],
                        className: b('create-tag-name-field'),
                    }}
                />
                <ButtonAccept
                    loading={isCreateTagPending}
                    onClick={() => {
                        void handleOk();
                    }}
                    disabled={!submittable || isCreateTagPending}
                    className={b('create-button')}
                    text={t('create')}
                />
            </Form>
        );
    }, [handleOk, isCreateTagPending, form, submittable, t]);

    const visibleTags = expanded ? tags : tags?.slice(0, maxVisibleTags);

    return (
        <div className={b()} ref={containerRef}>
            {contextNotificationHolder}
            <Flex
                className={b('content', {expanded})}
                ref={contentRef}
                style={{
                    maxHeight: expanded ? 'none' : '40px',
                }}
                justify='start'
                align='start'
                vertical
                gap={8}
            >
                {/* {editable && (
                    <Popover
                        trigger='click'
                        placement='rightTop'
                        content={renderCreateTagPopover}
                    >
                        <Button
                            variant='solid'
                            style={{backgroundColor: colorPrimary}}
                            className={b('add-button')}
                        >
                            {t('articles.tags.create.button')}
                        </Button>
                    </Popover>
                )} */}
                <Flex
                    align='center'
                    justify='start'
                    gap={4}
                    wrap={expanded ? 'wrap' : 'nowrap'}
                >
                    {visibleTags?.map((tag: Tag) => (
                        <ArticleTag
                            tag={tag}
                            key={tag.id}
                            deletable={{
                                onDelete: (id) => {
                                    handleDelete(id);
                                },
                            }}
                        />
                    ))}
                    {shouldShowExpand && !expanded && (
                        <div
                            className={b('expand-icon')}
                            onClick={toggleExpanded}
                        >
                            <FiChevronsRight
                                size={20}
                                style={{color: colorPrimary}}
                            />
                        </div>
                    )}
                </Flex>
            </Flex>
        </div>
    );
};
