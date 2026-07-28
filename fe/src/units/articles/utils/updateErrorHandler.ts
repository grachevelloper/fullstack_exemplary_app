import {notification} from 'antd';
import {useTranslation} from 'react-i18next';

import {UpdateDraftField} from '../types';

export const updateErrorHandler = (updateFields: UpdateDraftField[]) => {
    const [api, contextHolder] = notification.useNotification();
    const {t} = useTranslation('article');

    const errorMessage = t('article.draft.error.generic');

    const showNotification = () => {
        if (updateFields.length === 0) {
            api.error({
                message: t('article.draft.error.generic.title'),
                description: `${t(
                    'article.draft.error.generic.description'
                )}: ${errorMessage}`,
            });
            return;
        }

        // Если есть несколько ошибок, показываем общее сообщение
        if (updateFields.length > 1) {
            const fieldNames = updateFields
                .map((field) => t(`article.draft.error.${field}.title`))
                .join(', ');

            api.error({
                message: t('article.draft.error.multiple.title'),
                description: `${t('article.draft.error.multiple.description', {
                    fields: fieldNames,
                })}: ${errorMessage}`,
            });
            return;
        }

        // Для одной ошибки показываем специфичное сообщение
        const field = updateFields[0];

        const messages: Record<
            UpdateDraftField,
            {message: string; description: string}
        > = {
            content: {
                message: t('article.draft.error.content.title'),
                description: `${t(
                    'article.draft.error.content.description'
                )}: ${errorMessage}`,
            },
            title: {
                message: t('article.draft.error.title.title'),
                description: `${t(
                    'article.draft.error.title.description'
                )}: ${errorMessage}`,
            },
            description: {
                message: t('article.draft.error.description.title'),
                description: `${t(
                    'article.draft.error.description.description'
                )}: ${errorMessage}`,
            },
            tags: {
                message: t('article.draft.error.tags.title'),
                description: `${t(
                    'article.draft.error.tags.description'
                )}: ${errorMessage}`,
            },
            image: {
                message: t('article.draft.error.image.title'),
                description: `${t(
                    'article.draft.error.image.description'
                )}: ${errorMessage}`,
            },
            readTime: {
                message: t('article.draft.error.readTime.title'),
                description: `${t(
                    'article.draft.error.readTime.description'
                )}: ${errorMessage}`,
            },
            isDraft: {
                message: t('article.draft.error.publish.title'),
                description: `${t(
                    'article.draft.error.publish.description'
                )}: ${errorMessage}`,
            },
        };

        if (!field) {
            return;
        }

        const {message, description} = messages[field];
        api.error({message, description});
    };

    return {contextHolder, showNotification};
};
