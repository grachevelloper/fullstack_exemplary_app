import {Carousel, Flex, Typography, theme} from 'antd';
import block from 'bem-cn-lite';
import Lottie from 'lottie-react';
import {useTranslation} from 'react-i18next';

import {useAuth} from '@/shared/context';

import booksAnimation from '@/public/lottie/books.json';
import movieAnimation from '@/public/lottie/movie.json';
import musicAnimation from '@/public/lottie/music.json';

import './Nowadays.scss';

const b = block('nowadays');

type NowadaysData = {
    title: string;
    content: string;
    lottie?: object;
};

export const Nowadays = () => {
    const {t} = useTranslation('todo');
    const {user} = useAuth();
    const {
        token: {colorBgSpotlight, borderRadius},
    } = theme.useToken();
    const data: NowadaysData[] = [
        {
            title: t('todo.nowadays.place.title'),
            content: user?.nowBeingIn ?? '',
        },
        {
            title: t('todo.nowadays.book.title'),
            content: user?.nowReading ?? '',
            lottie: booksAnimation,
        },
        {
            title: t('todo.nowadays.series.title'),
            content: user?.nowWatch ?? '',
            lottie: movieAnimation,
        },
        {
            title: t('todo.nowadays.music.title'),
            content: user?.nowListening ?? '',
            lottie: musicAnimation,
        },
    ].filter((one) => one.content);

    return (
        <Carousel
            className={b()}
            draggable
            waitForAnimate
            autoplay
        >
            {data.map((one) => (
                <Flex
                    key={one.title}
                    vertical
                    gap={8}
                    className={b('block')}
                    justify='center'
                    align='start'
                    style={{
                        borderRadius: borderRadius,
                    }}
                >
                    {one?.lottie && (
                        <Lottie
                            animationData={one?.lottie}
                            loop={true}
                            className={b('lottie')}
                        />
                    )}
                    <Typography.Title
                        className={b('title')}
                        level={3}
                        style={{
                            backgroundColor: colorBgSpotlight,
                        }}
                    >
                        {one.title}
                    </Typography.Title>
                    <Typography.Text
                        className={b('content')}
                    >
                        {one.content}
                    </Typography.Text>
                </Flex>
            ))}
        </Carousel>
    );
};
