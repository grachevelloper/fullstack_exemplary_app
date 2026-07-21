import {Flex, FormInstance, Image} from 'antd';
import {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';

import {ButtonAccept, ButtonDeny} from '@/shared/components/actions';
import {useFieldValidation} from '@/shared/hooks';
import {CardProps, FormField} from '@/typings/components';
import {SubmitData} from '@/users/types';

import {useSignInFields} from '../../SigninPage/hooks/useSignInFields';

export const useSignUpFields = (
    form: FormInstance,
    submitData: SubmitData,
    signStep: number,
    onStepChange: (step: number) => void
): Array<FormField | CardProps> => {
    const {isLoading, onFinish, onSubmit} = submitData;
    const {t} = useTranslation('auth');
    const navigate = useNavigate();
    const isConfirmPasswordValid = useFieldValidation<string>(
        form,
        'confirmPassword'
    );
    const isUsernameValid = useFieldValidation<string>(form, 'username');
    const handleNextStep = useCallback(() => {
        onStepChange(signStep + 1);
    }, [onStepChange, signStep]);

    const handlePrevStep = useCallback(() => {
        onStepChange(Math.max(0, signStep - 1));
    }, [onStepChange, signStep]);

    const handleSubmit = useCallback(async () => {
        try {
            await onSubmit();
            onStepChange(signStep + 1);
        } catch {
            // Mutation state renders the actionable error without advancing.
        }
    }, [onStepChange, onSubmit, signStep]);

    const handleEndAuth = useCallback(() => {
        onFinish?.();
        onStepChange(0);
        navigate('/');
    }, [navigate, onFinish, onStepChange]);

    const signInSteps = useSignInFields(form, 2, {
        onNext: handleNextStep,
        onPrevious: handlePrevStep,
    });

    return [
        {
            title: t('auth.init.title'),
            content: t('auth.init.content'),
            index: 0,
            actions: [
                <ButtonAccept key='init-next' onClick={handleNextStep} />,
            ],
        },
        // {
        //     title: t('auth.signup.way.title'),
        //     content: (
        //         <Flex justify='center' vertical>
        //             <Button onClick={handleNextStep}>
        //                 {t('auth.signup.way.email')}
        //             </Button>
        //             <Divider size='middle' />
        //             <Button>Yandex</Button>
        //         </Flex>
        //     ),
        //     index: 1,
        //     actions: [
        //         <ButtonDeny key='way-prev' onClick={handlePrevStep} />,
        //         <ButtonAccept key='way-next' onClick={handleNextStep} />,
        //     ],
        // },
        {
            title: t('auth.name.username.title'),
            name: 'username',
            autoComplete: 'username',
            label: t('auth.username.label'),
            placeholder: t('auth.username.placeholder'),
            rules: [{required: true, message: t('auth.username.required')}],
            index: 1,
            actions: [
                <ButtonDeny key='username-prev' onClick={handlePrevStep} />,
                <ButtonAccept
                    key='username-next'
                    onClick={handleNextStep}
                    disabled={!isUsernameValid}
                />,
            ],
        },
        ...signInSteps,
        {
            name: 'confirmPassword',
            autoComplete: 'new-password',
            label: t('auth.confirmPassword.label'),
            type: 'password',
            placeholder: t('auth.confirmPassword.placeholder'),
            dependencies: ['password'],
            rules: [
                {required: true, message: t('auth.confirmPassword.required')},
                ({getFieldValue}) => ({
                    validator: (_rule, value, callback) => {
                        const passwordValue = getFieldValue('password');

                        if (!value || passwordValue === value) {
                            callback();
                        } else {
                            callback(t('auth.confirmPassword.mismatch'));
                        }
                    },
                }),
            ],
            index: 4,
            actions: [
                <ButtonDeny key='confirm-prev' onClick={handlePrevStep} />,
                <ButtonAccept
                    key='confirm-next'
                    onClick={() => {
                        void handleSubmit();
                    }}
                    data-marker='auth-submit'
                    loading={isLoading}
                    text={t('auth.signup.end-apply')}
                    disabled={!isConfirmPasswordValid}
                />,
            ],
        },
        {
            title: t('auth.end.title'),
            content: (
                <Flex vertical justify='center'>
                    <Image
                        src='/assets/congratulations.png'
                        alt={t('auth.end.content.alt')}
                        height={'80'}
                        style={{
                            objectFit: 'contain',
                        }}
                    />
                </Flex>
            ),
            index: 5,
            actions: [
                <ButtonAccept
                    key='end-next'
                    onClick={handleEndAuth}
                    text={t('auth.end.content.alt')}
                />,
            ],
        },
    ];
};
