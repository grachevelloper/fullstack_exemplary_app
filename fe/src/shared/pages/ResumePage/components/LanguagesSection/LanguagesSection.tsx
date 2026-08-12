import {GlobalOutlined} from '@ant-design/icons';
import {Flex, Typography} from 'antd';
import block from 'bem-cn-lite';
import {useEffect, useRef, useState} from 'react';

import './LanguagesSection.scss';

type Language = {
    code: string;
    level: string;
    name: string;
};

type LanguagesSectionProps = {
    colorPrimary: string;
    colorPrimaryBg: string;
    colorTextSecondary: string;
    colorWarning: string;
    colorWarningBg: string;
    languages: Language[];
    title: string;
};

const b = block('languages-section');

export const LanguagesSection = ({
    colorPrimary,
    colorPrimaryBg,
    colorTextSecondary,
    colorWarning,
    colorWarningBg,
    languages,
    title,
}: LanguagesSectionProps) => {
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
            {threshold: 0.8}
        );

        observer.observe(section);

        return () => observer.disconnect();
    }, []);

    return (
        <section ref={sectionRef} className={b({animated: isAnimated})}>
            <Flex align='center' gap={10} className={b('heading')}>
                <GlobalOutlined
                    className={b('icon')}
                    style={{color: colorPrimary}}
                />
                <Typography.Title level={2}>{title}</Typography.Title>
            </Flex>

            <div className={b('grid')}>
                {languages.map((language, index) => {
                    const isEnglish = index === 1;

                    return (
                        <article
                            key={language.code}
                            className={b('item', {featured: index === 0})}
                            style={{
                                backgroundColor: isEnglish
                                    ? colorWarningBg
                                    : colorPrimaryBg,
                            }}
                        >
                            <Typography.Text
                                strong
                                className={b('code')}
                                style={{
                                    color: isEnglish
                                        ? colorWarning
                                        : colorPrimary,
                                }}
                            >
                                {language.code}
                            </Typography.Text>
                            <div className={b('copy')}>
                                <Typography.Title level={3}>
                                    {language.name}
                                </Typography.Title>
                                <Typography.Text
                                    style={{color: colorTextSecondary}}
                                >
                                    {language.level}
                                </Typography.Text>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
};
