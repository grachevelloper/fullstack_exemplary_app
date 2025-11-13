import {Flex, Form} from 'antd';
import block from 'bem-cn-lite';
import {useCallback, useEffect, useState} from 'react';

import {useLocalStorage} from '@/shared/hooks';
import {type CardProps, type FormField} from '@/typings/components';
import {useSignUpMutation} from '@/users/hooks';
import {AuthEmitter, SIGN_UP_EVENT} from '@/users/utils';

import {SignStep} from './components/SignStep';
import {ANIMATION_FADE_OUT_IN_S, SIGN_UP_STEP_SLUG} from './constants';
import {useSignUpFields} from './hooks/useSignUpFields';

import './SignUpPage.scss';

const b = block('sign-up-page');

interface SignUpFormData {
    username: string;
    email: string;
    password: string;
}

export const SignUpPage = () => {
    const [signStep, setSignStep] = useLocalStorage(SIGN_UP_STEP_SLUG, 0);
    const [visibleStep, setVisibleStep] = useState(signStep);
    const [form] = Form.useForm<SignUpFormData>();
    const [username, setUsername] = useLocalStorage<string>('username', '');
    const [, setConfirmPassword] = useLocalStorage<string>(
        'username',
        ''
    );
    const [password, setPassword] = useLocalStorage<string>('password', '');
    const [email, setEmail] = useLocalStorage<string>('email', '');

    const {isPending, isError, mutateAsync} = useSignUpMutation();

    const handleSubmit = useCallback(() => {
        (async () => {
            const userData = await form.validateFields([
                'email',
                'password',
                'username',
            ]);
            await mutateAsync(userData);
            setConfirmPassword('')
            setPassword('')
            setUsername('')
            setEmail('')
        })();
    }, [form]);

    const signUpFields = useSignUpFields(form, {
        isLoading: isPending,
        onSubmit: handleSubmit,
    });

    const visibleStepData = signUpFields[visibleStep];

    useEffect(() => {
        const handleSignStepChange = (newStep: number) => {
            if (newStep !== signStep) {
                setSignStep(newStep);
                setTimeout(
                    () => setVisibleStep(newStep),
                    ANIMATION_FADE_OUT_IN_S
                );
            }
        };

        AuthEmitter.on(SIGN_UP_EVENT, handleSignStepChange);

        return () => {
            AuthEmitter.off(SIGN_UP_EVENT, handleSignStepChange);
        };
    }, [signStep, setSignStep]);

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
                initialValues={{
                    password: password || '',
                    email: email || '',
                    username: username || '',
                }}
                onFinish={handleSubmit}
            >
                {type === 'form' ? (
                    <SignStep
                        content={visibleStepData as FormField}
                        type='form'
                        key={`step-${visibleStep}`}
                        className={b('step', {
                            exit: signStep !== visibleStep,
                        })}
                    />
                ) : (
                    <SignStep
                        content={visibleStepData as CardProps}
                        type='text'
                        key={`step-${visibleStep}`}
                        className={b('step', {
                            exit: signStep !== visibleStep,
                        })}
                    />
                )}
            </Form>
        </Flex>
    );
};
