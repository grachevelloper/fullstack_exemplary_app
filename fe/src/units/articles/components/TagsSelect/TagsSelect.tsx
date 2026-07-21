import {message, Select} from 'antd';
import block from 'bem-cn-lite';
import {Fragment, useCallback, useMemo} from 'react';
import {useTranslation} from 'react-i18next';

import {useGetTags} from '../../store/tags';
import {Tag} from '../../types';

import './TagsSelect.scss';

const b = block('tags-select');

interface TagsSelectProps {
    onChange: (tags: Tag[]) => void;
    value?: Tag[];
}

export const TagsSelect = ({onChange, value}: TagsSelectProps) => {
    const {t} = useTranslation('article');
    const {data: tags, error, isPending} = useGetTags();
    const [messageApi, messageContextHolder] = message.useMessage();

    const mappedTags = useMemo(() => {
        return (tags || []).map((tag: Tag) => {
            return {value: tag.name, label: tag.name, data: tag};
        });
    }, [tags]);

    const selectedValues = useMemo(() => {
        return (value || []).map((tag) => tag.name);
    }, [value]);

    const handleChange = useCallback(
        (selectedNames: string[]) => {
            if (!tags) return;

            const selectedTags = selectedNames
                .map((name) => tags.find((tag) => tag.name === name))
                .filter((tag): tag is Tag => tag !== undefined);
            onChange(selectedTags);
        },
        [onChange, tags]
    );

    if (error) {
        messageApi.open({
            type: 'error',
            content: t('article.tags.error'),
        });
    }

    return (
        <Fragment>
            {messageContextHolder}

            <Select
                allowClear
                mode='tags'
                placeholder={t('articles.tags.select.placeholder')}
                loading={isPending}
                showSearch
                size='middle'
                className={b()}
                data-marker='draft-tags-select'
                options={mappedTags}
                onChange={handleChange}
                value={selectedValues}
                title={t('articles.form.tags.select')}
            />
        </Fragment>
    );
};
