import {Flex, Typography} from 'antd';
import block from 'bem-cn-lite';
import Lottie from 'lottie-react';
import {useTranslation} from 'react-i18next';

import {RevertButton} from '@/shared/components/RevertButton';

import './StatusPage.scss';

const b = block('status-page');

type StatusPageProps = {
    animationData: object;
    descriptionKey: string;
    titleKey: string;
};

export const StatusPage = ({
    animationData,
    descriptionKey,
    titleKey,
}: StatusPageProps) => {
    const {t} = useTranslation('common');

    return (
        <Flex className={b()} vertical gap={16} justify='center' align='center'>
            <Lottie
                animationData={animationData}
                loop={true}
                className={b('lottie')}
            />
            <div className={b('copy')}>
                <Typography.Title level={1} className={b('title')}>
                    {t(titleKey)}
                </Typography.Title>
                <Typography.Paragraph className={b('description')}>
                    {t(descriptionKey)}
                </Typography.Paragraph>
            </div>
            <RevertButton />
        </Flex>
    );
};
