import {Button, Flex, Layout, theme, Typography} from 'antd';
import block from 'bem-cn-lite';
import {useTranslation} from 'react-i18next';
import {FaTelegramPlane} from 'react-icons/fa';
import {LuMail} from 'react-icons/lu';

import {EMAIL, TELEGRAMM} from '../../constants';
import './Footer.scss';

const b = block('footer');

const {Footer: AntFooter} = Layout;

export const Footer = () => {
    const {t} = useTranslation('common');
    const {
        token: {colorBgContainer, colorBorderSecondary, colorTextSecondary},
    } = theme.useToken();

    return (
        <AntFooter
            className={b()}
            style={{
                backgroundColor: colorBgContainer,
                borderColor: colorBorderSecondary,
            }}
        >
            <Flex
                className={b('inner')}
                justify='space-between'
                align='center'
                gap={16}
                wrap='wrap'
            >
                <div className={b('copy')}>
                    <Typography.Text
                        className={b('subtitle')}
                        style={{color: colorTextSecondary}}
                    >
                        {t('footer.contacts')}
                    </Typography.Text>
                </div>
                <Flex className={b('contacts')} gap={10} wrap='wrap'>
                    <Button
                        className={b('contact-button')}
                        href='https://t.me/gracheveloper'
                        target='_blank'
                        rel='noreferrer'
                        icon={<FaTelegramPlane size={16} />}
                    >
                        {TELEGRAMM}
                    </Button>
                    <Button
                        className={b('contact-button')}
                        href={`mailto:${EMAIL}`}
                        icon={<LuMail size={16} />}
                    >
                        {EMAIL}
                    </Button>
                </Flex>
            </Flex>
        </AntFooter>
    );
};
