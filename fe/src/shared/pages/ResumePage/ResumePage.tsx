import {
    BookOutlined,
    CalendarOutlined,
    CodeOutlined,
    DownOutlined,
    IdcardOutlined,
    ReadOutlined,
    UpOutlined,
} from '@ant-design/icons';
import {Button, Card, Flex, Image, Tag, theme, Tooltip, Typography} from 'antd';
import block from 'bem-cn-lite';
import {useCallback, useMemo, useState} from 'react';
import {Trans, useTranslation} from 'react-i18next';

import './ResumePage.scss';

type ResumeItem = {
    company?: string;
    description?: string;
    details?: string[];
    key: string;
    period: string;
    translationKey?: string;
    technologies?: string[];
    title: string;
    unit?: string;
};

type SkillGroup = {
    items: SkillItem[];
    title: string;
};

type SkillItem = {
    description: string;
    title: string;
};

const b = block('resume-page');

export const ResumePage = () => {
    const {t} = useTranslation('common');
    const [expandedExperience, setExpandedExperience] = useState<
        Record<string, boolean>
    >({
        avito: false,
        yandex: false,
    });
    const {
        token: {
            colorBgContainer,
            colorBgElevated,
            colorBorderSecondary,
            colorPrimary,
            colorPrimaryBg,
            colorTextSecondary,
        },
    } = theme.useToken();

    const getStringList = useCallback((key: string) => {
        const value = t(key, {returnObjects: true});

        return Array.isArray(value)
            ? value.filter((item): item is string => typeof item === 'string')
            : [];
    }, [t]);

    const experience = useMemo<ResumeItem[]>(
        () => [
            {
                key: 'avito',
                title: t('resume.experience.avito.title'),
                company: t('resume.experience.avito.company'),
                unit: t('resume.experience.avito.unit'),
                period: t('about.timeline.avi.date'),
                translationKey: 'resume.experience.avito',
                description: t('resume.experience.avito.description'),
                details: getStringList('resume.experience.avito.details'),
                technologies: getStringList(
                    'resume.experience.avito.technologies'
                ),
            },
            {
                key: 'yandex',
                title: t('resume.experience.yandex.title'),
                company: t('resume.experience.yandex.company'),
                unit: t('resume.experience.yandex.unit'),
                period: t('about.timeline.ya.date'),
                translationKey: 'resume.experience.yandex',
                description: t('resume.experience.yandex.description'),
                details: getStringList('resume.experience.yandex.details'),
                technologies: getStringList(
                    'resume.experience.yandex.technologies'
                ),
            },
        ],
        [getStringList, t]
    );

    const education = useMemo<ResumeItem[]>(
        () => [
            {
                key: 'mirea',
                title: t('resume.education.mirea.title'),
                company: t('resume.education.mirea.company'),
                period: t('about.timeline.uni.date'),
            },
        ],
        [t]
    );

    const skills = useMemo<SkillGroup[]>(
        () => [
            {
                title: t('skill.frontend'),
                items: [
                    {
                        title: 'React',
                        description: t('resume.skills.react.description'),
                    },
                    {
                        title: 'TypeScript',
                        description: t('resume.skills.typescript.description'),
                    },
                    {
                        title: 'Angular',
                        description: t('resume.skills.angular.description'),
                    },
                    {
                        title: 'HTML',
                        description: t('resume.skills.html.description'),
                    },
                    {
                        title: 'CSS / SCSS',
                        description: t('resume.skills.scss.description'),
                    },
                    {
                        title: 'REST API',
                        description: t('resume.skills.rest.description'),
                    },
                    {
                        title: 'BDUI',
                        description: t('resume.skills.deeplinks.description'),
                    },
                ],
            },
            {
                title: t('skill.backend'),
                items: [
                    {
                        title: 'Go',
                        description: t('resume.skills.go.description'),
                    },
                    {
                        title: 'Node.js',
                        description: t('resume.skills.node.description'),
                    },
                    {
                        title: 'Express',
                        description: t('resume.skills.express.description'),
                    },
                    {
                        title: 'NestJS',
                        description: t('resume.skills.nest.description'),
                    },
                    {
                        title: 'PostgreSQL',
                        description: t('resume.skills.postgresql.description'),
                    },
                    {
                        title: 'SQL',
                        description: t('resume.skills.sql.description'),
                    },
                ],
            },
            {
                title: t('skill.infrastructure'),
                items: [
                    {
                        title: 'Docker',
                        description: t('resume.skills.docker.description'),
                    },
                    {
                        title: 'Nginx',
                        description: t('resume.skills.nginx.description'),
                    },
                    {
                        title: 'TeamCity',
                        description: t('resume.skills.teamcity.description'),
                    },
                    {
                        title: 'Git',
                        description: t('resume.skills.git.description'),
                    },
                    {
                        title: 'Linux',
                        description: t('resume.skills.linux.description'),
                    },
                ],
            },
            {
                title: t('skill.observability'),
                items: [
                    {
                        title: 'Grafana',
                        description: t('resume.skills.grafana.description'),
                    },
                    {
                        title: 'Sentry',
                        description: t('resume.skills.sentry.description'),
                    },
                    {
                        title: 'Redash',
                        description: t('resume.skills.redash.description'),
                    },
                    {
                        title: 'Logging',
                        description: t('resume.skills.logging.description'),
                    },
                    {
                        title: 'Monitoring',
                        description: t('resume.skills.monitoring.description'),
                    },
                ],
            },
            {
                title: t('skill.ai'),
                items: [
                    {
                        title: 'Claude',
                        description: t('resume.skills.claude.description'),
                    },
                    {
                        title: 'Codex',
                        description: t('resume.skills.codex.description'),
                    },
                    {
                        title: 'Prompt engineering',
                        description: t('resume.skills.prompt.description'),
                    },
                    {
                        title: 'Skills',
                        description: t(
                            'resume.skills.technicalWriting.description'
                        ),
                    },
                ],
            },
            {
                title: t('skill.team'),
                items: [
                    {
                        title: 'Agile',
                        description: t('resume.skills.agile.description'),
                    },
                    {
                        title: 'Jira',
                        description: t('resume.skills.jira.description'),
                    },
                    {
                        title: 'Confluence',
                        description: t('resume.skills.confluence.description'),
                    },
                ],
            },
        ],
        [t]
    );

    const sectionStyle = {
        backgroundColor: colorBgContainer,
        borderColor: colorBorderSecondary,
    };

    const toggleExperience = (key: string) => {
        setExpandedExperience((current) => ({
            ...current,
            [key]: !current[key],
        }));
    };

    const emphasisComponents = {
        strong: (
            <Typography.Text
                strong
                className={b('highlight')}
                style={{color: colorPrimary}}
            />
        ),
    };

    return (
        <main className={b()}>
            <section
                className={b('hero')}
                style={{
                    backgroundColor: colorBgContainer,
                    borderColor: colorBorderSecondary,
                }}
            >
                <div className={b('avatar-wrap')}>
                    <Image
                        src='/assets/me.png'
                        alt={t('about.photo')}
                        preview={false}
                        className={b('avatar')}
                    />
                </div>
                <div className={b('hero-content')}>
                    <Typography.Title level={2} className={b('title')}>
                        {t('resume.name')}
                    </Typography.Title>
                    <Typography.Text
                        className={b('role')}
                        style={{color: colorPrimary}}
                    >
                        {t('resume.role')}
                    </Typography.Text>
                    <Typography.Paragraph
                        className={b('summary')}
                        style={{color: colorTextSecondary}}
                    >
                        {t('about.subtitle')}
                    </Typography.Paragraph>
                </div>
            </section>

            <section className={b('section')}>
                <Flex align='center' gap={10} className={b('section-heading')}>
                    <IdcardOutlined style={{color: colorPrimary}} />
                    <Typography.Title level={2}>
                        {t('about.work_experience')}
                    </Typography.Title>
                </Flex>
                <div className={b('timeline')}>
                    {experience.map((item) => {
                        const isExpanded = expandedExperience[item.key];

                        return (
                            <article
                                className={b('timeline-item', {
                                    expanded: isExpanded,
                                })}
                                key={item.key}
                                onClick={() => toggleExperience(item.key)}
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
                                                    style={{
                                                        color: colorPrimary,
                                                    }}
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
                                                <CalendarOutlined />{' '}
                                                {item.period}
                                            </Typography.Text>
                                        </div>
                                        <Button
                                            type='text'
                                            shape='circle'
                                            className={b('experience-toggle')}
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
                                                                            t={
                                                                                t
                                                                            }
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
                                                    className={b(
                                                        'technologies'
                                                    )}
                                                    style={{
                                                        color: colorTextSecondary,
                                                    }}
                                                >
                                                    <Typography.Text strong>
                                                        {t(
                                                            'resume.experience.technologies'
                                                        )}
                                                    </Typography.Text>{' '}
                                                    {item.technologies.join(
                                                        ', '
                                                    )}
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

            <section className={b('section')}>
                <Flex align='center' gap={10} className={b('section-heading')}>
                    <ReadOutlined style={{color: colorPrimary}} />
                    <Typography.Title level={2}>
                        {t('resume.education.title')}
                    </Typography.Title>
                </Flex>
                {education.map((item) => (
                    <Card
                        key={item.period}
                        className={b('education-card')}
                        style={sectionStyle}
                    >
                        <Typography.Title level={4}>
                            {item.title}
                        </Typography.Title>
                        {item.company && (
                            <Typography.Text
                                strong
                                className={b('education-company')}
                                style={{color: colorPrimary}}
                            >
                                {item.company}
                            </Typography.Text>
                        )}
                        {item.description && (
                            <Typography.Paragraph
                                className={b('description')}
                                style={{color: colorTextSecondary}}
                            >
                                {item.description}
                            </Typography.Paragraph>
                        )}
                        <Typography.Text
                            className={b('period')}
                            style={{color: colorTextSecondary}}
                        >
                            <CalendarOutlined /> {item.period}
                        </Typography.Text>
                    </Card>
                ))}
            </section>

            <section className={b('section')}>
                <Flex align='center' gap={10} className={b('section-heading')}>
                    <BookOutlined style={{color: colorPrimary}} />
                    <Typography.Title level={2}>
                        {t('about.specialization.title')}
                    </Typography.Title>
                </Flex>
                <div className={b('skills-grid')}>
                    {skills.map((group) => (
                        <Card
                            key={group.title}
                            className={b('skill-card')}
                            style={{
                                backgroundColor: colorBgElevated,
                                borderColor: colorBorderSecondary,
                            }}
                        >
                            <Flex
                                align='center'
                                gap={8}
                                className={b('skill-card-title')}
                            >
                                <CodeOutlined style={{color: colorPrimary}} />
                                <Typography.Text
                                    strong
                                    className={b('skill-title')}
                                    style={{color: colorTextSecondary}}
                                >
                                    {group.title}
                                </Typography.Text>
                            </Flex>
                            <Flex gap={8} wrap='wrap'>
                                {group.items.map((skill) => (
                                    <Tooltip
                                        key={skill.title}
                                        title={skill.description}
                                        placement='top'
                                        rootClassName={b('skill-tooltip')}
                                        styles={{
                                            container: {
                                                backgroundColor: '#fff',
                                                border: `1px solid ${colorBorderSecondary}`,
                                                borderRadius: 8,
                                                boxShadow:
                                                    '0 10px 28px rgb(15 23 42 / 14%)',
                                                color: 'rgba(0, 0, 0, 0.88)',
                                            },
                                        }}
                                    >
                                        <Tag
                                            className={b('skill-tag')}
                                            style={{
                                                backgroundColor: colorPrimaryBg,
                                                borderColor:
                                                    colorBorderSecondary,
                                            }}
                                        >
                                            {skill.title}
                                        </Tag>
                                    </Tooltip>
                                ))}
                            </Flex>
                        </Card>
                    ))}
                </div>
            </section>
        </main>
    );
};
