import {UserOutlined} from '@ant-design/icons';
import {Card, Flex, Image, theme, Typography} from 'antd';
import block from 'bem-cn-lite';
import gsap from 'gsap';
import {
    lazy,
    Suspense,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {Trans, useTranslation} from 'react-i18next';

import type {ExperienceItem} from './components/ExperienceSection';
import type {SkillGroup} from './components/SpecializationSection';
import './ResumePage.scss';

type Language = {
    code: string;
    level: string;
    name: string;
};

const b = block('resume-page');

const SpecializationSection = lazy(() =>
    import('./components/SpecializationSection').then(
        ({SpecializationSection}) => ({
            default: SpecializationSection,
        })
    )
);

const ExperienceSection = lazy(() =>
    import('./components/ExperienceSection').then(({ExperienceSection}) => ({
        default: ExperienceSection,
    }))
);

const EducationSection = lazy(() =>
    import('./components/EducationSection').then(({EducationSection}) => ({
        default: EducationSection,
    }))
);

const LanguagesSection = lazy(() =>
    import('./components/LanguagesSection').then(({LanguagesSection}) => ({
        default: LanguagesSection,
    }))
);

export const ResumePage = () => {
    const {t} = useTranslation('common');
    const roleRef = useRef<HTMLElement>(null);
    const summaryRef = useRef<HTMLDivElement>(null);
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
            colorWarning,
            colorWarningBg,
        },
    } = theme.useToken();

    const getStringList = useCallback(
        (key: string) => {
            const value = t(key, {returnObjects: true});

            return Array.isArray(value)
                ? value.filter(
                      (item): item is string => typeof item === 'string'
                  )
                : [];
        },
        [t]
    );

    const experience = useMemo<ExperienceItem[]>(
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

    const education = useMemo<ExperienceItem[]>(
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

    const languages = useMemo<Language[]>(
        () => [
            {
                code: 'RU',
                name: t('resume.languages.russian.name'),
                level: t('resume.languages.russian.level'),
            },
            {
                code: 'EN',
                name: t('resume.languages.english.name'),
                level: t('resume.languages.english.level'),
            },
            {
                code: 'DE',
                name: t('resume.languages.german.name'),
                level: t('resume.languages.german.level'),
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
                    {
                        title: 'Redux',
                        description: t('resume.skills.redux.description'),
                    },
                    {
                        title: 'TanStack Query',
                        description: t(
                            'resume.skills.tanstackQuery.description'
                        ),
                    },
                    {
                        title: 'MobX',
                        description: t('resume.skills.mobx.description'),
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
                    {
                        title: 'MongoDB',
                        description: t('resume.skills.mongodb.description'),
                    },
                    {
                        title: 'gRPC',
                        description: t('resume.skills.grpc.description'),
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
                    {
                        title: t('resume.skills.designReview.title'),
                        description: t(
                            'resume.skills.designReview.description'
                        ),
                    },
                    {
                        title: 'Code review',
                        description: t('resume.skills.codeReview.description'),
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

    const role = t('resume.role');

    useLayoutEffect(() => {
        const roleElement = roleRef.current;
        const summaryElement = summaryRef.current;
        if (!roleElement || !summaryElement) return;

        const context = gsap.context(() => {
            const characters = roleElement.querySelectorAll<HTMLElement>(
                `.${b('role-character')}`
            );

            if (
                !characters.length ||
                window.matchMedia('(prefers-reduced-motion: reduce)').matches
            ) {
                return;
            }

            const timeline = gsap.timeline({delay: 0.5});

            timeline
                .fromTo(
                    characters,
                    {
                        filter: 'blur(5px)',
                        opacity: 0,
                        rotation: () => gsap.utils.random(-8, 8),
                        scale: 2.2,
                        x: () => gsap.utils.random(-90, 90),
                        y: () => gsap.utils.random(-130, -55),
                    },
                    {
                        duration: 1.2,
                        ease: 'power3.out',
                        filter: 'blur(0px)',
                        opacity: 1,
                        rotation: 0,
                        scale: 1,
                        stagger: 0.035,
                        x: 0,
                        y: 0,
                    }
                )
                .fromTo(
                    summaryElement,
                    {
                        clipPath: 'inset(0 0 100% 0)',
                        opacity: 0,
                        y: 24,
                    },
                    {
                        clipPath: 'inset(0 0 0% 0)',
                        duration: 0.6,
                        ease: 'power2.out',
                        opacity: 1,
                        y: 0,
                    },
                    '-=0.32'
                );

            return () => timeline.kill();
        }, roleElement);

        return () => context.revert();
    }, [role]);

    useEffect(() => {
        const revealClassName = b('reveal');
        const revealedClassName = `${b()}__reveal_visible`;
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    entry.target.classList.add(revealedClassName);
                    observer.unobserve(entry.target);
                });
            },
            {threshold: 0.5}
        );

        document
            .querySelectorAll<HTMLElement>(`.${revealClassName}`)
            .forEach((element) => observer.observe(element));

        return () => observer.disconnect();
    }, []);

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
                        ref={roleRef}
                        className={b('role')}
                        aria-label={role}
                        style={{color: colorPrimary}}
                    >
                        {Array.from(role).map((character, index) => (
                            <span
                                aria-hidden='true'
                                className={b('role-character')}
                                key={`${character}-${index}`}
                            >
                                {character}
                            </span>
                        ))}
                    </Typography.Text>
                    <div ref={summaryRef} className={b('summary')}>
                        <Trans
                            i18nKey='about.subtitle'
                            components={emphasisComponents}
                            t={t}
                        />
                    </div>
                </div>
            </section>

            <section className={`${b('section')} ${b('reveal')}`}>
                <Flex align='center' gap={10} className={b('section-heading')}>
                    <UserOutlined
                        className={b('section-icon')}
                        style={{color: colorPrimary}}
                    />
                    <Typography.Title level={2}>
                        {t('resume.about.title')}
                    </Typography.Title>
                </Flex>
                <Card className={b('about-card')} style={sectionStyle}>
                    <Typography.Paragraph
                        className={b('about-text')}
                        style={{color: colorTextSecondary}}
                    >
                        {t('resume.about.professional')}
                    </Typography.Paragraph>
                    <Typography.Paragraph
                        className={b('about-text')}
                        style={{color: colorTextSecondary}}
                    >
                        {t('resume.about.personal')}
                    </Typography.Paragraph>
                </Card>
            </section>

            <Suspense fallback={null}>
                <ExperienceSection
                    colorPrimary={colorPrimary}
                    colorTextSecondary={colorTextSecondary}
                    expandedExperience={expandedExperience}
                    items={experience}
                    onToggle={toggleExperience}
                />
            </Suspense>

            <Suspense fallback={null}>
                <EducationSection
                    colorBgContainer={colorBgContainer}
                    colorBorderSecondary={colorBorderSecondary}
                    colorPrimary={colorPrimary}
                    colorTextSecondary={colorTextSecondary}
                    colorWarning={colorWarning}
                    education={education}
                    educationTitle={t('resume.education.title')}
                />
            </Suspense>

            <Suspense fallback={null}>
                <LanguagesSection
                    colorPrimary={colorPrimary}
                    colorPrimaryBg={colorPrimaryBg}
                    colorTextSecondary={colorTextSecondary}
                    colorWarning={colorWarning}
                    colorWarningBg={colorWarningBg}
                    languages={languages}
                    title={t('resume.languages.title')}
                />
            </Suspense>

            <Suspense fallback={null}>
                <SpecializationSection
                    colorBgElevated={colorBgElevated}
                    colorBorderSecondary={colorBorderSecondary}
                    colorPrimary={colorPrimary}
                    colorPrimaryBg={colorPrimaryBg}
                    colorTextSecondary={colorTextSecondary}
                    skills={skills}
                    title={t('about.specialization.title')}
                />
            </Suspense>
        </main>
    );
};
