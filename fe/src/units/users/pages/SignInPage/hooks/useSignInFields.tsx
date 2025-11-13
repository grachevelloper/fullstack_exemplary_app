import {FormInstance} from 'antd';
import {useCallback, useEffect} from 'react';
import {useTranslation} from 'react-i18next';

import {ButtonAccept, ButtonDeny} from '@/shared/components/actions';
import {useFieldValidation, useLocalStorage} from '@/shared/hooks';
import {FormField} from '@/typings/components';

import {AuthEmitter, SIGN_UP_EVENT} from '../../../utils';
import {SIGN_UP_STEP_SLUG} from '../../SignUpPage/constants';

export const useSignInFields = (
    form: FormInstance,
    // sumbitData?: {
    //     isError: boolean;
    //     isLoading: boolean;
    //     handleSumbit: () => void;
    // },
    startsWith = 0
): FormField[] => {
    const {t} = useTranslation('auth');
    const [signStep, setSignStep] = useLocalStorage(SIGN_UP_STEP_SLUG, 0);
    const isPasswordValid = useFieldValidation<string>(form, 'password');
    const isEmailValid = useFieldValidation<string>(form, 'email');

    useEffect(() => {
        const handleSignStepChange = (newStep: number) => {
            if (newStep !== signStep) {
                setSignStep(newStep);
            }
        };

        AuthEmitter.on(SIGN_UP_EVENT, handleSignStepChange);

        return () => {
            AuthEmitter.off(SIGN_UP_EVENT, handleSignStepChange);
        };
    }, [signStep, setSignStep, AuthEmitter]);

    const handleNextStep = useCallback(() => {
        setSignStep((prev) => {
            AuthEmitter.emit(SIGN_UP_EVENT, prev + 1);
            return prev + 1;
        });
    }, [setSignStep, signStep]);

    const handlePrevStep = useCallback(() => {
        setSignStep((prev) => {
            AuthEmitter.emit(SIGN_UP_EVENT, prev - 1);
            return prev - 1;
        });
    }, [setSignStep]);

    return [
        {
            name: 'email',
            label: t('auth.email.label'),
            type: 'email',
            placeholder: t('auth.email.placeholder'),
            rules: [
                {required: true, message: t('auth.email.required')},
                {type: 'email', message: t('auth.email.invalid')},
            ],
            index: startsWith,
            actions: [
                startsWith > 0 ? (
                    <ButtonDeny onClick={handlePrevStep} key='email-prev' />
                ) : null,
                <ButtonAccept
                    key='email-next'
                    onClick={handleNextStep}
                    disabled={!isEmailValid}
                />,
            ],
        },
        {
            name: 'password',
            label: t('auth.password.label'),
            type: 'password',
            placeholder: t('auth.password.placeholder'),
            rules: [{required: true, message: t('auth.password.required')}],
            index: startsWith + 1,
            actions: [
                <ButtonDeny onClick={handlePrevStep} key='password-prev' />,
                <ButtonAccept
                    key='password-next'
                    onClick={handleNextStep}
                    disabled={!isPasswordValid}
                />,
            ],
        },
    ];
};
