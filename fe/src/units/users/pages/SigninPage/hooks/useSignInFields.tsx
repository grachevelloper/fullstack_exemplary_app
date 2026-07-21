import {FormInstance} from 'antd';
import {useTranslation} from 'react-i18next';

import {ButtonAccept, ButtonDeny} from '@/shared/components/actions';
import {useFieldValidation} from '@/shared/hooks';
import {FormField} from '@/typings/components';

interface SignInFieldActions {
    onNext: () => void;
    onPrevious: () => void;
}

export const useSignInFields = (
    form: FormInstance,
    startsWith = 0,
    actions?: SignInFieldActions
): FormField[] => {
    const {t} = useTranslation('auth');
    const isPasswordValid = useFieldValidation<string>(form, 'password');
    const isEmailValid = useFieldValidation<string>(form, 'email');

    return [
        {
            name: 'email',
            autoComplete: actions ? 'email' : 'off',
            dataMarker: 'auth-email-input',
            label: t('auth.email.label'),
            type: 'email',
            placeholder: t('auth.email.placeholder'),
            rules: [
                {required: true, message: t('auth.email.required')},
                {type: 'email', message: t('auth.email.invalid')},
            ],
            index: startsWith,
            actions: actions
                ? [
                      startsWith > 0 ? (
                          <ButtonDeny
                              onClick={actions.onPrevious}
                              key='email-prev'
                          />
                      ) : null,
                      <ButtonAccept
                          key='email-next'
                          onClick={actions.onNext}
                          disabled={!isEmailValid}
                      />,
                  ]
                : undefined,
        },
        {
            name: 'password',
            autoComplete: 'new-password',
            dataMarker: 'auth-password-input',
            label: t('auth.password.label'),
            type: 'password',
            placeholder: t('auth.password.placeholder'),
            rules: [{required: true, message: t('auth.password.required')}],
            index: startsWith + 1,
            actions: actions
                ? [
                      <ButtonDeny
                          onClick={actions.onPrevious}
                          key='password-prev'
                      />,
                      <ButtonAccept
                          key='password-next'
                          onClick={actions.onNext}
                          disabled={!isPasswordValid}
                      />,
                  ]
                : undefined,
        },
    ];
};
