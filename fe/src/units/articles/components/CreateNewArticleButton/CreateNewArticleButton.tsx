import {notification} from 'antd';
import block from 'bem-cn-lite';
import {Fragment, useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';

import {ButtonAccept} from '@/shared/components/actions';

import {useCreateArticle} from '../../store';
import {INITIAL_DRAFT_CONTENT} from '../../utils/constants';
import './CreateNewArticleButton.scss';

const b = block('create-new-article-button');

export const CreateNewArticleButton = () => {
    const [, contextHolder] = notification.useNotification();
    const {t} = useTranslation('article');
    const {mutateAsync} = useCreateArticle();

    const navigate = useNavigate();

    const handleNewArticle = useCallback(() => {
        mutateAsync({
            content: INITIAL_DRAFT_CONTENT,
            title: t('article.new.title', {
                defaultValue: 'Untitled article',
            }),
        })
            .then((data) => {
                navigate(`/articles/draft/${data.id}`);
            })
            .catch(() => {
                notification.error({
                    message: t('article.new.title.error'),
                    description: t('article.new.description.error'),
                    placement: 'bottomRight',
                });
            });
    }, [mutateAsync, navigate, t]);

    return (
        <Fragment>
            {contextHolder}
            <ButtonAccept
                className={b()}
                text={t('articles.create')}
                onClick={handleNewArticle}
            />
        </Fragment>
    );
};
