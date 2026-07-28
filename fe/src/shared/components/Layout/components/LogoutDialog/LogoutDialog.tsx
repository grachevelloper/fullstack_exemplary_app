import {Alert, Modal, theme} from 'antd';
import block from 'bem-cn-lite';
import {useCallback} from 'react';
import {useTranslation} from 'react-i18next';

import {useLogoutMutation} from '@/users/store';

import './LogoutDialog.scss';

const b = block('log-out-dialog');

interface LogoutDialogProps {
    isOpen: boolean;
    onCancel: () => void;
}

export const LogoutDialog = ({isOpen, onCancel}: LogoutDialogProps) => {
    const {mutate, isPending, isError} = useLogoutMutation();
    const {
        token: {colorPrimaryBg, colorPrimaryText, colorErrorBg, colorErrorText},
    } = theme.useToken();
    const {t} = useTranslation('common');

    const handleLogout = useCallback(() => {
        mutate();
        onCancel();
    }, [mutate]);

    return (
        <Modal
            centered
            className={b()}
            title={t('logout-modal.title')}
            closable={{'aria-label': 'Custom Close Button'}}
            cancelText={t('logout-modal.deny')}
            cancelButtonProps={{
                style: {
                    backgroundColor: colorPrimaryText,
                    color: colorPrimaryBg,
                },
                className: b('cancel-button'),
            }}
            okButtonProps={{
                style: {
                    backgroundColor: colorErrorText,
                    color: colorErrorBg,
                },
            }}
            okText={t('logout')}
            open={isOpen}
            confirmLoading={isPending}
            onOk={handleLogout}
            onCancel={onCancel}
            width={{
                xs: '98%',
                sm: '70%',
                md: '70%',
                lg: '40%',
                xl: '30%',
                xxl: '25%',
            }}
        >
            {isError && (
                <Alert
                    type='error'
                    showIcon
                    message={t('logout-modal.error')}
                />
            )}
        </Modal>
    );
};
