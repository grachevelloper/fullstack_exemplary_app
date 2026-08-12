import {
    CalendarOutlined,
    DownOutlined,
    IdcardOutlined,
    UpOutlined,
} from '@ant-design/icons';
import {Button, Flex, Typography} from 'antd';
import block from 'bem-cn-lite';
import {Trans, useTranslation} from 'react-i18next';

import './ExperienceSection.scss';

export type ExperienceItem = {
    company?: string;
    description?: string;
    details?: string[];
    key: string;
    period: string;
    technologies?: string[];
    title: string;
    translationKey?: string;
    unit?: string;
};

type ExperienceSectionProps = {
    colorPrimary: string;
    colorTextSecondary: string;
    expandedExperience: Record<string, boolean>;
    items: ExperienceItem[];
    onToggle: (key: string) => void;
};

const b = block('experience-section');

export const ExperienceSection = ({
    colorPrimary,
    colorTextSecondary,
    expandedExperience,
    items,
    onToggle,
}: ExperienceSectionProps) => {
    const {t} = useTranslation('common');
    const emphasisComponents = {
        strong: <Typography.Text strong style={{color: colorPrimary}} />,
    };

    return (
        <section className={b()}>
            <Flex align='center' gap={10} className={b('heading')}>
                <IdcardOutlined
                    className={b('icon')}
                    style={{color: colorPrimary}}
                />
                <Typography.Title level={2}>
                    {t('about.work_experience')}
                </Typography.Title>
            </Flex>
            <div className={b('timeline')}>
                {items.map((item) => {
                    const isExpanded = expandedExperience[item.key];

                    return (
                        <article
                            className={b('timeline-item', {
                                expanded: isExpanded,
                            })}
                            key={item.key}
                            onClick={() => onToggle(item.key)}
                        >
                            <div
                                className={b('dot')}
                                style={{backgroundColor: colorPrimary}}
                            />
                            <div className={b('timeline-content')}>
                                <Flex
                                    align='flex-start'
                                    gap={12}
                                    wrap='wrap'
                                    className={b('item-head')}
                                >
                                    <div className={b('item-heading-copy')}>
                                        <Typography.Title level={3}>
                                            {item.title}
                                        </Typography.Title>
                                        {item.company && (
                                            <Typography.Text
                                                strong
                                                style={{color: colorPrimary}}
                                            >
                                                {item.company}
                                            </Typography.Text>
                                        )}
                                        {item.unit && (
                                            <Typography.Text
                                                style={{
                                                    color: colorTextSecondary,
                                                }}
                                            >
                                                {item.unit}
                                            </Typography.Text>
                                        )}
                                        <Typography.Text
                                            className={b('period')}
                                            style={{
                                                color: colorTextSecondary,
                                            }}
                                        >
                                            <CalendarOutlined /> {item.period}
                                        </Typography.Text>
                                    </div>
                                    <Button
                                        type='text'
                                        shape='circle'
                                        className={b('toggle')}
                                        aria-label={t(
                                            isExpanded
                                                ? 'resume.experience.collapse'
                                                : 'resume.experience.expand'
                                        )}
                                        aria-expanded={isExpanded}
                                        icon={
                                            isExpanded ? (
                                                <UpOutlined />
                                            ) : (
                                                <DownOutlined />
                                            )
                                        }
                                    />
                                </Flex>
                                <div
                                    className={b('description-wrap', {
                                        expanded: isExpanded,
                                    })}
                                >
                                    <div className={b('description-body')}>
                                        <Typography.Paragraph
                                            className={b('description')}
                                            style={{
                                                color: colorTextSecondary,
                                            }}
                                        >
                                            {item.translationKey ? (
                                                <Trans
                                                    i18nKey={`${item.translationKey}.description`}
                                                    components={
                                                        emphasisComponents
                                                    }
                                                    t={t}
                                                />
                                            ) : (
                                                item.description
                                            )}
                                        </Typography.Paragraph>
                                        {item.details?.length ? (
                                            <ul className={b('details')}>
                                                {item.details.map(
                                                    (detail, index) => (
                                                        <li key={detail}>
                                                            <Typography.Text
                                                                style={{
                                                                    color: colorTextSecondary,
                                                                }}
                                                            >
                                                                {item.translationKey ? (
                                                                    <Trans
                                                                        i18nKey={`${item.translationKey}.details.${index}`}
                                                                        components={
                                                                            emphasisComponents
                                                                        }
                                                                        t={t}
                                                                    />
                                                                ) : (
                                                                    detail
                                                                )}
                                                            </Typography.Text>
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        ) : null}
                                        {item.technologies?.length ? (
                                            <Typography.Paragraph
                                                className={b('technologies')}
                                                style={{
                                                    color: colorTextSecondary,
                                                }}
                                            >
                                                <Typography.Text strong>
                                                    {t(
                                                        'resume.experience.technologies'
                                                    )}
                                                </Typography.Text>{' '}
                                                {item.technologies.join(', ')}
                                            </Typography.Paragraph>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
};
