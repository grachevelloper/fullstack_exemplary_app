import {CalendarOutlined} from '@ant-design/icons';
import {Card, Flex, Image, Tag, theme, Typography} from 'antd';
import block from 'bem-cn-lite';
import {useTranslation} from 'react-i18next';

import {Article} from '@/articles/types';

import {formatDate} from '../../../../shared/utils/date';
import './ArticleCard.scss';

const b = block('article-card');

const {Text, Title} = Typography;

interface ArticleCardProps {
    article: Article;
    onClick: () => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({article, onClick}) => {
    const {t} = useTranslation('article');
    const {
        token: {paddingSM, borderRadius},
    } = theme.useToken();
    return (
        <Card
            hoverable
            data-marker='article-card'
            className={b({'is-loaded': true})}
            onClick={onClick}
            size='default'
            style={{
                borderRadius,
            }}
            cover={
                <Image
                    alt={article.title}
                    src={article.image}
                    preview={false}
                    style={{
                        borderRadius,
                    }}
                    className={b('image')}
                />
            }
        >
            <Flex
                className={b('info-wrapper')}
                justify='end'
                align='start'
                vertical
                gap={8}
                style={{
                    padding: paddingSM,
                    borderRadius,
                }}
            >
                <Title
                    level={3}
                    className={b('title')}
                    data-marker='article-title'
                >
                    {article.title}
                </Title>
                <Flex justify='start' align='center' gap={4} wrap>
                    {article.tags?.slice(0, 3).map((tag) => (
                        <Tag key={tag.id} className={b('tag')}>
                            {tag.name}
                        </Tag>
                    ))}
                </Flex>

                <Flex
                    justify='space-between'
                    align='center'
                    gap={8}
                    className={b('footer')}
                >
                    <Flex gap={4}>
                        <CalendarOutlined />
                        <Typography.Text type='secondary'>
                            {formatDate(article?.createdAt)}
                        </Typography.Text>
                    </Flex>

                    <Text type='secondary' className={b('read-time')}>
                        {t('article.read_time', {
                            minutes: article.readTime,
                        })}
                    </Text>
                </Flex>
            </Flex>
        </Card>
    );
};
