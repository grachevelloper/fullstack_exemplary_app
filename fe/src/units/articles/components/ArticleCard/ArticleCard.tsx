import {CalendarOutlined, FileImageOutlined} from '@ant-design/icons';
import {Card, Flex, Image, Tag, theme, Typography} from 'antd';
import block from 'bem-cn-lite';
import {useState} from 'react';
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
    const [isCoverUnavailable, setIsCoverUnavailable] = useState(
        !article.image
    );
    const {
        token: {
            paddingSM,
            borderRadius,
            colorFillSecondary,
            colorTextTertiary,
        },
    } = theme.useToken();

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onClick();
        }
    };

    return (
        <Card
            hoverable
            data-marker='article-card'
            className={b()}
            onClick={onClick}
            onKeyDown={handleKeyDown}
            role='link'
            size='default'
            tabIndex={0}
            style={{
                borderRadius,
            }}
            cover={
                isCoverUnavailable ? (
                    <div
                        className={b('cover-placeholder')}
                        style={{
                            backgroundColor: colorFillSecondary,
                            color: colorTextTertiary,
                        }}
                    >
                        <FileImageOutlined aria-hidden />
                    </div>
                ) : (
                    <Image
                        alt={article.title}
                        src={article.image}
                        preview={false}
                        onError={() => setIsCoverUnavailable(true)}
                        className={b('image')}
                    />
                )
            }
        >
            <Flex
                className={b('info-wrapper')}
                align='start'
                vertical
                gap={12}
                style={{
                    padding: paddingSM,
                }}
            >
                <Title
                    level={3}
                    className={b('title')}
                    data-marker='article-title'
                >
                    {article.title}
                </Title>
                <Text type='secondary' className={b('description')}>
                    {article.description}
                </Text>
                <Flex
                    className={b('tags')}
                    justify='start'
                    align='center'
                    gap={6}
                    wrap
                >
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
                    <Flex className={b('date')} gap={6} align='center'>
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
