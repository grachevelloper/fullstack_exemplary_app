import {Flex, Form, theme, Typography} from 'antd';
import axios from 'axios';
import block from 'bem-cn-lite';
import {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';

import {ButtonAccept} from '@/shared/components/actions';
import {FlexibleCard} from '@/shared/components/FlexibleCard';
import {FormInput} from '@/shared/components/FormInput';
import {useAuth} from '@/shared/context';
import {ApiErrorResponse} from '@/typings/axios';

import {useSigninMutatuon} from '../../store';

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
    const {
        token: {colorError, paddingSM},
    } = theme.useToken();
    const {t} = useTranslation('auth');
    const [form] = Form.useForm<SignInForm>();
    const navigate = useNavigate();
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

    const renderSignInFields = useCallback(() => {
        return signInFields.map((field) => (
            <FormInput
                field={{...field, style: {marginBottom: paddingSM}}}
                key={field.name}
            />
        ));
    }, [paddingSM, signInFields]);

    const renderErrors = useCallback(() => {
        const errorKey = getSignInErrorKey(error);

        return (
            <span
                style={{
                    paddingLeft: paddingSM,
                    color: colorError,
                }}
                className={b('server-error')}
            >
                {errorKey ? t(errorKey) : null}
            </span>
        );
    }, [colorError, error, paddingSM, t]);

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
                        <Typography.Title level={2} className={b('title')}>
                            {t('auth.signin.title')}
                        </Typography.Title>
                    }
                    actionsAlign='end'
                    actions={[
                        <ButtonAccept
                            text={t('auth.signin.submit')}
                            key={'accept-signin'}
                            htmlType='submit'
                            data-marker='auth-submit'
                            loading={isPending}
                            disabled={isPending}
                        />,
                    ]}
                >
                    {renderSignInFields()}
                    {renderErrors()}
                </FlexibleCard>
            </Form>
        </Flex>
    );
};
