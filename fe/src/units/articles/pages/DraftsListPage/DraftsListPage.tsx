import {Col, Flex, Row, Typography} from 'antd';
import block from 'bem-cn-lite';
import {useTranslation} from 'react-i18next';

import {ArticlesList} from '../../components/ArticlesList';
import {CreateNewArticleButton} from '../../components/CreateNewArticleButton';
import {SearchPanel} from '../../components/SearchPanel';
import {useGetAuthorDrafts} from '../../store';
import './DraftsListPage.scss';

const b = block('drafts-list-page');

const {Title} = Typography;

export const DraftsListPage = () => {
    const {t} = useTranslation('article');

    const {data: articles, error, isPending} = useGetAuthorDrafts();

    return (
        <Flex vertical gap='large' className={b()}>
            <Row>
                <Col xs={24} md={16}>
                    <Title level={1}>{t('articles.drafts.page.title')}</Title>
                </Col>
                <Col xs={16} sm={8} className={b('create-article-button-row')}>
                    <CreateNewArticleButton />
                </Col>
            </Row>
            <SearchPanel />
            <ArticlesList isPending={isPending} data={articles} error={error} />
        </Flex>
    );
};
