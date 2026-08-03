import {Alert, Flex, Form, Steps, Typography} from 'antd';
import axios from 'axios';
import block from 'bem-cn-lite';
import {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useSearchParams} from 'react-router-dom';

import {useAuth} from '@/shared/context';
import {type CardProps, type FormField} from '@/typings/components';
import {useSignupMutation} from '@/users/store';
import {type User} from '@/users/types';
import {ApiErrorResponse} from '@/typings/axios';

import {getYandexOAuthErrorKey} from '../../utils/yandexOAuth';

import {SignStep} from './components/SignStep';
import {useSignUpFields} from './hooks/useSignUpFields';

import './SignupPage.scss';

const b = block('sign-up-page');

interface SignUpFormData {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

const initialSignUpData: SignUpFormData = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
};

const getValidationErrorField = (messages: string[]) => {
    const message = messages.join(' ').toLowerCase();

    if (message.includes('парол') || message.includes('password')) {
        return {name: 'password', step: 3} as const;
    }

    if (message.includes('почт') || message.includes('email')) {
        return {name: 'email', step: 2} as const;
    }

    if (message.includes('имя') || message.includes('username')) {
        return {name: 'username', step: 1} as const;
    }

    return undefined;
};

export const SignupPage = () => {
    const {t} = useTranslation('auth');
    const [searchParams] = useSearchParams();
    const [signStep, setSignStep] = useState(0);
    const [registeredUser, setRegisteredUser] = useState<User | null>(null);
    const [form] = Form.useForm<SignUpFormData>();
    const {setUserData} = useAuth();

    const {isPending, isError, mutateAsync} = useSignupMutation();

    const handleSubmit = useCallback(async () => {
        try {
            const userData = await form.validateFields([
                'email',
                'password',
                'confirmPassword',
                'username',
            ]);
            const user = await mutateAsync({
                email: userData.email,
                password: userData.password,
                username: userData.username,
            });
            form.resetFields();
            setRegisteredUser(user);
        } catch (error) {
            if (!axios.isAxiosError<ApiErrorResponse>(error)) {
                throw error;
            }

            const messages = error.response?.data.message;
            const validationMessages = Array.isArray(messages)
                ? messages
                : messages
                  ? [messages]
                  : [];
            const validationField = getValidationErrorField(validationMessages);

            if (validationField) {
                form.setFields([
                    {name: validationField.name, errors: validationMessages},
                ]);
                setSignStep(validationField.step);
            }

            throw error;
        }
    }, [form, mutateAsync]);

    const signUpFields = useSignUpFields(
        form,
        {
            isLoading: isPending,
            onFinish: () => {
                if (registeredUser) {
                    setUserData(registeredUser);
                }
            },
            onSubmit: handleSubmit,
        },
        signStep,
        setSignStep
    );

    const visibleStepData = signUpFields[signStep];
    const oauthErrorKey = getYandexOAuthErrorKey(
        searchParams.get('oauthError')
    );
    const stepItems = [
        t('auth.step.intro'),
        t('auth.step.name'),
        t('auth.step.email'),
        t('auth.step.password'),
        t('auth.step.confirm'),
        t('auth.step.finish'),
    ].map((title) => ({title}));

    if (!visibleStepData) {
        return <div>Loading...</div>;
    }
    const type = 'placeholder' in visibleStepData ? 'form' : 'text';

    return (
        <Flex className={b()} align='center' justify='center'>
            <Form
                className={b('form')}
                layout='vertical'
                form={form}
                initialValues={initialSignUpData}
                autoComplete='off'
            >
                <div className={b('header')}>
                    <Typography.Text className={b('eyebrow')}>
                        {t('auth.signup.process')}
                    </Typography.Text>
                    <Steps
                        className={b('steps')}
                        current={signStep}
                        items={stepItems}
                        progressDot
                        responsive={false}
                    />
                </div>
                {isError && (
                    <Alert
                        className={b('error')}
                        message={t('auth.signup.error')}
                        type='error'
                        showIcon
                    />
                )}
                {oauthErrorKey && (
                    <Alert
                        className={b('error')}
                        message={t(oauthErrorKey)}
                        type='error'
                        showIcon
                    />
                )}
                {type === 'form' ? (
                    <SignStep
                        content={visibleStepData as FormField}
                        type='form'
                        key={`step-${signStep}`}
                        className={b('step')}
                    />
                ) : (
                    <SignStep
                        content={visibleStepData as CardProps}
                        type='text'
                        key={`step-${signStep}`}
                        className={b('step')}
                    />
                )}
            </Form>
        </Flex>
    );
};
