import {BookOutlined, CodeOutlined} from '@ant-design/icons';
import {Card, Flex, Tag, Tooltip, Typography} from 'antd';
import block from 'bem-cn-lite';
import {useEffect, useRef, useState} from 'react';

import './SpecializationSection.scss';

export type SkillItem = {
    description: string;
    title: string;
};

export type SkillGroup = {
    items: SkillItem[];
    title: string;
};

type SpecializationSectionProps = {
    colorBgElevated: string;
    colorBorderSecondary: string;
    colorPrimary: string;
    colorPrimaryBg: string;
    colorTextSecondary: string;
    skills: SkillGroup[];
    title: string;
};

const b = block('specialization-section');
const cardDelay = 460;
const tagDelay = 45;
const tagsStartDelay = 180;

export const SpecializationSection = ({
    colorBgElevated,
    colorBorderSecondary,
    colorPrimary,
    colorPrimaryBg,
    colorTextSecondary,
    skills,
    title,
}: SpecializationSectionProps) => {
    const sectionRef = useRef<HTMLElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry?.isIntersecting) return;

                setIsVisible(true);
                observer.disconnect();
            },
            {threshold: 0.5}
        );

        observer.observe(section);

        return () => observer.disconnect();
    }, []);

    return (
        <section
            ref={sectionRef}
            className={b({visible: isVisible})}
            aria-label={title}
        >
            <Flex align='center' gap={10} className={b('heading')}>
                <BookOutlined
                    className={b('icon')}
                    style={{color: colorPrimary}}
                />
                <Typography.Title level={2}>{title}</Typography.Title>
            </Flex>
            <div className={b('grid')}>
                {skills.map((group, groupIndex) => (
                    <Card
                        key={group.title}
                        className={b('card')}
                        style={{
                            animationDelay: `${groupIndex * cardDelay}ms`,
                            backgroundColor: colorBgElevated,
                            borderColor: colorBorderSecondary,
                        }}
                    >
                        <Flex
                            align='center'
                            gap={8}
                            className={b('card-title')}
                        >
                            <CodeOutlined style={{color: colorPrimary}} />
                            <Typography.Text
                                strong
                                className={b('title')}
                                style={{color: colorTextSecondary}}
                            >
                                {group.title}
                            </Typography.Text>
                        </Flex>
                        <Flex gap={8} wrap='wrap'>
                            {group.items.map((skill, skillIndex) => (
                                <Tooltip
                                    key={skill.title}
                                    title={skill.description}
                                    trigger={['hover', 'focus']}
                                    placement='top'
                                    rootClassName={b('tooltip')}
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
                                        className={b('tag')}
                                        tabIndex={0}
                                        style={{
                                            animationDelay: `${groupIndex * cardDelay + tagsStartDelay + skillIndex * tagDelay}ms`,
                                            backgroundColor: colorPrimaryBg,
                                            borderColor: colorBorderSecondary,
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
    );
};
