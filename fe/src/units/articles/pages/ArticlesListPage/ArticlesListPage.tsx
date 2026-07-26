import {Card, Col, Flex, Row, theme, Typography} from 'antd';
import block from 'bem-cn-lite';
import {useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';

import {useAuth} from '@/shared/context';
import {Role} from '@/typings/common';

import {ArticlesList} from '../../components/ArticlesList';
import {CreateNewArticleButton} from '../../components/CreateNewArticleButton';
import {SearchPanel} from '../../components/SearchPanel';
import {useGetAllArticles, useGetAuthorDrafts} from '../../store';

import './ArticlesListPage.scss';

const b = block('aritcles-list-page');

const {Title, Text} = Typography;

export const ArticlesListPage = () => {
    const {t} = useTranslation('article');
    const {
        token: {colorBgContainer, colorBorderSecondary, colorPrimaryBg},
    } = theme.useToken();
    const {user} = useAuth();
    const [search, setSearch] = useState('');
    const role = user?.role || Role.USER;

    const canWriteArticle = role === Role.WRITER || role === Role.ADMIN;
    const normalizedSearch = search.trim();
    const {
        data: articlesPage,
        isPending,
        error,
    } = useGetAllArticles(normalizedSearch || undefined);
    const {
        data: drafts = [],
        isPending: isDraftsPending,
        error: draftsError,
    } = useGetAuthorDrafts(canWriteArticle);

    const articles = useMemo(() => {
        const published = articlesPage?.items ?? [];
        const filteredDrafts = normalizedSearch
            ? drafts.filter((draft) =>
                  draft.title
                      .toLowerCase()
                      .includes(normalizedSearch.toLowerCase())
              )
            : drafts;

        return [...filteredDrafts, ...published];
    }, [articlesPage?.items, drafts, normalizedSearch]);

    const renderNewArticleButton = () => {
        return canWriteArticle && <CreateNewArticleButton />;
    };

    return (
        <main className={b()}>
            <Card
                className={b('hero')}
                style={{
                    backgroundColor: colorBgContainer,
                    borderColor: colorBorderSecondary,
                }}
            >
                <Row gutter={[24, 24]} align='middle'>
                    <Col xs={24} lg={16}>
                        <Text className={b('eyebrow')}>
                            {t('articles.page.eyebrow')}
                        </Text>
                        <Title level={1} className={b('title')}>
                            {t('articles.page.title')}
                        </Title>
                        <Text type='secondary' className={b('subtitle')}>
                            {t('articles.page.subtitle')}
                        </Text>
                    </Col>
                    <Col xs={24} lg={8} className={b('actions')}>
                        {renderNewArticleButton()}
                    </Col>
                </Row>
            </Card>

            <Card
                className={b('search-card')}
                style={{
                    backgroundColor: colorBgContainer,
                    borderColor: colorBorderSecondary,
                }}
            >
                <Flex
                    className={b('search-layout')}
                    align='center'
                    justify='space-between'
                    gap={16}
                    wrap='wrap'
                >
                    <Flex vertical gap={2} className={b('search-copy')}>
                        <Text strong>{t('articles.search.title')}</Text>
                        <Text type='secondary'>
                            {t('articles.search.description')}
                        </Text>
                    </Flex>
                    <SearchPanel value={search} onSearchChange={setSearch} />
                </Flex>
            </Card>

            <section className={b('content')}>
                <Flex
                    className={b('content-heading')}
                    align='center'
                    justify='space-between'
                    gap={16}
                    wrap='wrap'
                >
                    <Title level={2}>{t('articles.recent')}</Title>
                </Flex>
                <ArticlesList
                    isPending={
                        isPending || (canWriteArticle && isDraftsPending)
                    }
                    data={articles}
                    error={error || draftsError}
                />
            </section>
        </main>
    );
};
