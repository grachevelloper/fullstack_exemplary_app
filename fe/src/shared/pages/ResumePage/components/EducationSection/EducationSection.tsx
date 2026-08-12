import {
    CalendarOutlined,
    ReadOutlined,
} from '@ant-design/icons';
import {Card, Flex, Typography} from 'antd';
import block from 'bem-cn-lite';
import {useEffect, useRef, useState} from 'react';

import type {ExperienceItem} from '../ExperienceSection';
import './EducationSection.scss';

type EducationSectionProps = {
    colorBgContainer: string;
    colorBorderSecondary: string;
    colorPrimary: string;
    colorTextSecondary: string;
    colorWarning: string;
    education: ExperienceItem[];
    educationTitle: string;
};

const b = block('education-section');

export const EducationSection = ({
    colorBgContainer,
    colorBorderSecondary,
    colorPrimary,
    colorTextSecondary,
    colorWarning,
    education,
    educationTitle,
}: EducationSectionProps) => {
    const sectionRef = useRef<HTMLElement>(null);
    const [isAnimated, setIsAnimated] = useState(false);

    useEffect(() => {
        const section = sectionRef.current;

        if (!section || !('IntersectionObserver' in window)) {
            setIsAnimated(true);

            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry?.isIntersecting) {
                    return;
                }

                setIsAnimated(true);
                observer.unobserve(entry.target);
            },
            {threshold: 0.15}
        );

        observer.observe(section);

        return () => observer.disconnect();
    }, []);

    return (
        <section ref={sectionRef} className={b({animated: isAnimated})}>
            <div className={b('education-layout')}>
                <div className={b('education-intro')}>
                    <Flex align='center' gap={10} className={b('heading')}>
                        <ReadOutlined
                            className={b('icon')}
                            style={{color: colorPrimary}}
                        />
                        <Typography.Title level={2}>
                            {educationTitle}
                        </Typography.Title>
                    </Flex>
                </div>
                <div className={b('education-cards')}>
                    {education.map((item) => (
                        <Card
                            key={item.key}
                            className={b('education-card')}
                            style={{
                                backgroundColor: colorBgContainer,
                                borderColor: colorBorderSecondary,
                            }}
                        >
                            <span
                                className={b('education-accent')}
                                style={{backgroundColor: colorWarning}}
                            />
                            <Typography.Title level={3}>
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
                </div>
            </div>

        </section>
    );
};
