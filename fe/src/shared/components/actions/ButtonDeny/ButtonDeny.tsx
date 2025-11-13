import {Button} from 'antd';
import {useTranslation} from 'react-i18next';

import {BaseAction} from '../types';

export const ButtonDeny = ({text, ...props}: BaseAction) => {
    const {t} = useTranslation('common');
    return (
        <Button type='default' variant='outlined' size='large' {...props}>
            {text ? text : t('button.back')}
        </Button>
    );
};
