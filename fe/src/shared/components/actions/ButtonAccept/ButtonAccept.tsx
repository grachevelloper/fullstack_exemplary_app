import {Button} from 'antd';
import {useTranslation} from 'react-i18next';

import {BaseAction} from '../types';

export const ButtonAccept = ({text, ...props}: BaseAction) => {
    const {t} = useTranslation('common');
    return (
        <Button type='primary' variant='solid' size='large' {...props}>
            {text ? text : t('button.continue')}
        </Button>
    );
};
