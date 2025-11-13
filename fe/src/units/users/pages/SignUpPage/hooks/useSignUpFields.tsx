import {Button, Divider, Flex, FormInstance, Image} from 'antd';
import {useCallback, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';

import {ButtonAccept, ButtonDeny} from '@/shared/components/actions';
import {useFieldValidation, useLocalStorage} from '@/shared/hooks';
import {CardProps, FormField} from '@/typings/components';
import {SubmitData} from '@/users/types';
import {AuthEmitter, SIGN_UP_EVENT} from '@/users/utils';

import {useSignInFields} from '../../SignInPage/hooks/useSignInFields';
import {SIGN_UP_STEP_SLUG} from '../constants';

export const useSignUpFields = (
    form: FormInstance,
    sumbitData: SubmitData
): Array<FormField | CardProps> => {
    const {isLoading, onSubmit} = sumbitData;
    const {t} = useTranslation('auth');
    const navigate = useNavigate();
    const [signStep, setSignStep] = useLocalStorage(SIGN_UP_STEP_SLUG, 0);
    const isConfirmPasswordValid = useFieldValidation<string>(
        form,
        'confirmPassword'
    );
    const isUsernameValid = useFieldValidation<string>(form, 'username');
    const signInSteps = useSignInFields(form, 3);

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

    const handleSubmit = useCallback(async () => {
        await onSubmit();

        setSignStep((prev) => {
            const nextStep = prev + 1;
            AuthEmitter.emit(SIGN_UP_EVENT, nextStep);
            return nextStep;
        });
    }, [onSubmit, setSignStep]);

    const handleEndAuth = useCallback(() => {
        navigate('/todos');
    }, [navigate]);

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
    }, [signStep, setSignStep]);

    return [
        {
            title: t('auth.init.title'),
            content: t('auth.init.content'),
            index: 0,
            actions: [
                <ButtonAccept key='init-next' onClick={handleNextStep} />,
            ],
        },
        {
            title: t('auth.signup.way.title'),
            content: (
                <Flex justify='center' vertical>
                    <Button onClick={handleNextStep}>
                        {t('auth.signup.way.email')}
                    </Button>
                    <Divider size='middle' />
                    <Button>Yandex</Button>
                </Flex>
            ),
            index: 1,
            actions: [
                <ButtonDeny key='way-prev' onClick={handlePrevStep} />,
                <ButtonAccept key='way-next' onClick={handleNextStep} />,
            ],
        },
        {
            title: t('auth.name.username.title'),
            name: 'username',
            label: t('auth.username.label'),
            type: 'text',
            placeholder: t('auth.username.placeholder'),
            rules: [{required: true, message: t('auth.username.required')}],
            index: 2,
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
            index: 5,
            actions: [
                <ButtonDeny key='confirm-prev' onClick={handlePrevStep} />,
                <ButtonAccept
                    key='confirm-next'
                    onClick={handleSubmit}
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
            index: 6,
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
