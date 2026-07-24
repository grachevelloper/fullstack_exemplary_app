import {
    CustomerServiceOutlined,
    EnvironmentOutlined,
    PlayCircleOutlined,
    ReadOutlined,
} from '@ant-design/icons';
import {Carousel, Typography, theme} from 'antd';
import block from 'bem-cn-lite';
import Lottie from 'lottie-react';
import type {ReactNode} from 'react';
import {useTranslation} from 'react-i18next';

import {useAuth} from '@/shared/context';

import booksAnimation from '@/public/lottie/books.json';
import movieAnimation from '@/public/lottie/movie.json';
import musicAnimation from '@/public/lottie/music.json';

import './Nowadays.scss';

const b = block('nowadays');
const placeAnimation = '/lottie/place.svg';

type NowadaysData = {
    title: string;
    content: string;
    icon: ReactNode;
    lottie?: object | string;
};

export const Nowadays = () => {
    const {t} = useTranslation('todo');
    const {user} = useAuth();
    const {
        token: {
            borderRadius,
            colorBgContainer,
            colorBorderSecondary,
            colorPrimary,
            colorText,
            colorTextSecondary,
        },
    } = theme.useToken();
    const data: NowadaysData[] = [
        {
            title: t('todo.nowadays.place.title'),
            content: user?.nowBeingIn ?? '',
            icon: <EnvironmentOutlined />,
            lottie: placeAnimation,
        },
        {
            title: t('todo.nowadays.book.title'),
            content: user?.nowReading ?? '',
            icon: <ReadOutlined />,
            lottie: booksAnimation,
        },
        {
            title: t('todo.nowadays.series.title'),
            content: user?.nowWatch ?? '',
            icon: <PlayCircleOutlined />,
            lottie: movieAnimation,
        },
        {
            title: t('todo.nowadays.music.title'),
            content: user?.nowListening ?? '',
            icon: <CustomerServiceOutlined />,
            lottie: musicAnimation,
        },
    ].filter((one) => one.content);

    if (!data.length) {
        return null;
    }

    return (
        <Carousel className={b()} draggable waitForAnimate autoplay>
            {data.map((one) => (
                <section key={one.title} className={b('block')} style={{}}>
                    <div
                        className={b('glow')}
                        style={{backgroundColor: colorPrimary}}
                    />
                    <div className={b('copy')}>
                        <div className={b('eyebrow')}>
                            <span
                                className={b('icon')}
                                style={{
                                    backgroundColor: colorPrimary,
                                }}
                            >
                                {one.icon}
                            </span>
                            <Typography.Text
                                className={b('label')}
                                style={{color: colorTextSecondary}}
                            >
                                {one.title}
                            </Typography.Text>
                        </div>

                        <Typography.Title
                            className={b('content')}
                            level={3}
                            style={{color: colorText}}
                        >
                            {one.content}
                        </Typography.Title>
                    </div>

                    <div className={b('media')} aria-hidden>
                        {one?.lottie && typeof one?.lottie === 'object' && (
                            <Lottie
                                animationData={one?.lottie}
                                loop={true}
                                className={b('lottie')}
                            />
                        )}
                        {one?.lottie && typeof one?.lottie === 'string' && (
                            <img
                                src={one?.lottie}
                                className={b('lottie')}
                                alt=''
                            />
                        )}
                    </div>
                </section>
            ))}
        </Carousel>
    );
};
