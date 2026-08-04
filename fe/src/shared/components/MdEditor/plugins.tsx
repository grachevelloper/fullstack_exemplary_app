import {DeleteOutlined, SettingOutlined} from '@ant-design/icons';
import {
    activeEditor$,
    codeBlockPlugin,
    headingsPlugin,
    imagePlugin,
    linkDialogPlugin,
    linkPlugin,
    listsPlugin,
    markdownShortcutPlugin,
    openEditImageDialog$,
    parseImageDimension,
    quotePlugin,
    tablePlugin,
    thematicBreakPlugin,
    toolbarPlugin,
    useCellValue,
    usePublisher,
} from '@mdxeditor/editor';
import {Button, Typography} from 'antd';
import {$getNodeByKey} from 'lexical';
import {JSX, useState} from 'react';
import {useTranslation} from 'react-i18next';

import {attachmentsApi} from '../../entities/Attachment';

import {EntityAttachmentType} from './MdEditor';

type WritePluginsProps = {
    attachmentIdsByUrl: Map<string, string>;
    entityId: string;
    entityType: EntityAttachmentType;
    toolbar: () => JSX.Element;
};

type EditImageToolbarProps = {
    alt?: string;
    height?: number | 'inherit';
    imageSource?: string;
    initialImagePath?: string | null;
    nodeKey?: string;
    title?: string;
    width?: number | 'inherit';
};

export const readPlugins = [
    headingsPlugin({allowedHeadingLevels: [1, 2, 3, 4, 5, 6]}),
    codeBlockPlugin(),
    linkPlugin(),
    listsPlugin(),
    linkDialogPlugin(),
    quotePlugin(),
    tablePlugin(),
    thematicBreakPlugin(),
    markdownShortcutPlugin(),
];

export const writePlugins = ({
    attachmentIdsByUrl,
    entityType,
    entityId,
    toolbar,
}: WritePluginsProps) => {
    return [
        ...readPlugins,
        toolbarPlugin({
            toolbarContents: toolbar,
        }),
        imagePlugin({
            EditImageToolbar: createEditImageToolbar(attachmentIdsByUrl),
            imageUploadHandler: imageUploadHandler(
                entityType,
                entityId,
                attachmentIdsByUrl
            ),
        }),
    ];
};

const imageUploadHandler = (
    entityType: EntityAttachmentType,
    entityId: string,
    attachmentIdsByUrl: Map<string, string>
) => {
    return async (file: File) => {
        const attachment = await attachmentsApi.uploadAttachment(
            entityType,
            entityId,
            file
        );
        attachmentIdsByUrl.set(attachment.url, attachment.id);

        return attachment.url;
    };
};

const createEditImageToolbar = (
    attachmentIdsByUrl: Map<string, string>
) => {
    return function EditImageToolbar({
        alt,
        height,
        imageSource,
        initialImagePath,
        nodeKey,
        title,
        width,
    }: EditImageToolbarProps) {
        const editor = useCellValue(activeEditor$);
        const openEditImageDialog = usePublisher(openEditImageDialog$);
        const {t} = useTranslation('common');
        const [isDeleting, setIsDeleting] = useState(false);
        const [deleteFailed, setDeleteFailed] = useState(false);
        const source = initialImagePath || imageSource || '';

        const handleDelete = async () => {
            if (!editor || !nodeKey || isDeleting) {
                return;
            }

            const attachmentId = attachmentIdsByUrl.get(source);
            setIsDeleting(true);
            setDeleteFailed(false);

            try {
                if (attachmentId) {
                    await attachmentsApi.deleteAttachment(attachmentId);
                    attachmentIdsByUrl.delete(source);
                }

                editor.update(() => {
                    $getNodeByKey(nodeKey)?.remove();
                });
            } catch {
                setDeleteFailed(true);
            } finally {
                setIsDeleting(false);
            }
        };

        return (
            <div className='md-editor__image-toolbar'>
                <Button
                    aria-label={t('md-editor.image.delete')}
                    disabled={!editor || !nodeKey}
                    icon={<DeleteOutlined />}
                    loading={isDeleting}
                    onClick={() => void handleDelete()}
                    size='small'
                    title={t('md-editor.image.delete')}
                    type='text'
                />
                <Button
                    aria-label={t('md-editor.image.edit')}
                    disabled={!editor || !nodeKey || isDeleting}
                    icon={<SettingOutlined />}
                    onClick={() =>
                        nodeKey &&
                        openEditImageDialog({
                            nodeKey,
                            initialValues: {
                                src: source,
                                title: title || '',
                                altText: alt || '',
                                width: parseImageDimension(width),
                                height: parseImageDimension(height),
                            },
                        })
                    }
                    size='small'
                    title={t('md-editor.image.edit')}
                    type='text'
                />
                {deleteFailed && (
                    <Typography.Text role='alert' type='danger'>
                        {t('md-editor.image.delete-error')}
                    </Typography.Text>
                )}
            </div>
        );
    };
};
