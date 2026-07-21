import {Alert, Flex, Form} from 'antd';
import block from 'bem-cn-lite';
import {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';

import {useAuth} from '@/shared/context';
import {type CardProps, type FormField} from '@/typings/components';
import {type User} from '@/users/types';
import {useSignupMutation} from '@/users/store';

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

export const SignupPage = () => {
    const {t} = useTranslation('auth');
    const [signStep, setSignStep] = useState(0);
    const [registeredUser, setRegisteredUser] = useState<User | null>(null);
    const [form] = Form.useForm<SignUpFormData>();
    const {setUserData} = useAuth();

    const {isPending, isError, mutateAsync} = useSignupMutation();

    const handleSubmit = useCallback(async () => {
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
                {isError && (
                    <Alert
                        className={b('error')}
                        message={t('auth.signup.error')}
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
