import {Alert, Divider, Flex, Form, Typography} from 'antd';
import axios from 'axios';
import block from 'bem-cn-lite';
import {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate, useSearchParams} from 'react-router-dom';

import {ButtonAccept} from '@/shared/components/actions';
import {FlexibleCard} from '@/shared/components/FlexibleCard';
import {FormInput} from '@/shared/components/FormInput';
import {useAuth} from '@/shared/context';
import {ApiErrorResponse} from '@/typings/axios';

import {YandexAuthButton} from '../../components/YandexAuthButton';
import {useSigninMutatuon} from '../../store';
import {getYandexOAuthErrorKey} from '../../utils/yandexOAuth';

import {useSignInFields} from './hooks';

import './SigninPage.scss';

const b = block('sign-in-page');

interface SignInForm {
    email: string;
    password: string;
}

const getSignInErrorKey = (error: Error | null): string | undefined => {
    if (!error) return undefined;

    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.message;
        const apiMessage = Array.isArray(message) ? message[0] : message;

        if (apiMessage === 'Incorrect password') {
            return 'auth.sign.incorrect_password';
        }

        if (
            status === 400 ||
            status === 401 ||
            apiMessage === 'Invalid credentials' ||
            apiMessage === 'User not found'
        ) {
            return 'auth.sign.invalid_credentials';
        }

        return undefined;
    }

    return undefined;
};

export const SigninPage = () => {
    const {t} = useTranslation('auth');
    const [form] = Form.useForm<SignInForm>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const {isPending, error, mutateAsync} = useSigninMutatuon();
    const {refreshUser, setUserData} = useAuth();
    const handleSubmit = useCallback(async () => {
        try {
            const userData = await form.validateFields(['email', 'password']);
            const user = await mutateAsync(userData);
            form.resetFields();
            const refreshedUser = await refreshUser();
            setUserData(refreshedUser ?? user);
            navigate('/');
        } catch (submitError) {
            if (!axios.isAxiosError(submitError)) {
                return;
            }
        }
    }, [form, mutateAsync, navigate, refreshUser, setUserData]);
    const signInFields = useSignInFields(form);
    const oauthErrorKey = getYandexOAuthErrorKey(
        searchParams.get('oauthError')
    );

    const renderSignInFields = useCallback(() => {
        return signInFields.map((field) => (
            <FormInput
                field={{...field, className: b('field')}}
                key={field.name}
            />
        ));
    }, [signInFields]);

    const renderErrors = useCallback(() => {
        const errorKey = getSignInErrorKey(error);

        return (
            <div className={b('server-error')} role='alert'>
                {errorKey ? t(errorKey) : null}
            </div>
        );
    }, [error, t]);

    return (
        <Flex className={b()} align='center' justify='center'>
            <Form
                className={b('form')}
                form={form}
                layout='vertical'
                autoComplete='off'
                onFinish={() => {
                    void handleSubmit();
                }}
                initialValues={{email: '', password: ''}}
            >
                <FlexibleCard
                    className={b('container')}
                    title={
                        <div className={b('heading')}>
                            <Typography.Text className={b('eyebrow')}>
                                {t('auth.signin.eyebrow')}
                            </Typography.Text>
                            <Typography.Title
                                level={2}
                                className={b('title')}
                            >
                                {t('auth.signin.title')}
                            </Typography.Title>
                        </div>
                    }
                >
                    {oauthErrorKey && (
                        <Alert
                            className={b('oauth-error')}
                            message={t(oauthErrorKey)}
                            type='error'
                            showIcon
                        />
                    )}
                    {renderSignInFields()}
                    {renderErrors()}
                    <ButtonAccept
                        className={b('submit')}
                        text={t('auth.signin.submit')}
                        htmlType='submit'
                        data-marker='auth-submit'
                        loading={isPending}
                        disabled={isPending}
                    />
                    <Divider className={b('divider')}>
                        {t('auth.signin.divider')}
                    </Divider>
                    <YandexAuthButton source='signin' />
                </FlexibleCard>
            </Form>
        </Flex>
    );
};
