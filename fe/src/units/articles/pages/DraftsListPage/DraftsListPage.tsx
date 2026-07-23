import {Col, Row, Typography} from 'antd';
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
        <main className={b()}>
            <Row className={b('header')} gutter={[16, 16]} align='middle'>
                <Col xs={24} md={16}>
                    <Title className={b('title')} level={1}>
                        {t('articles.drafts.page.title')}
                    </Title>
                </Col>
                <Col xs={24} md={8} className={b('create-article-button-row')}>
                    <CreateNewArticleButton />
                </Col>
            </Row>

            <section className={b('search')}>
                <SearchPanel />
            </section>

            <section className={b('content')}>
                <ArticlesList
                    isPending={isPending}
                    data={articles}
                    error={error}
                />
            </section>
        </main>
    );
};
