import {SaveOutlined} from '@ant-design/icons';
import {Button, Form, Input, notification, Typography} from 'antd';
import block from 'bem-cn-lite';
import {useEffect} from 'react';
import {useTranslation} from 'react-i18next';

import {useAuth} from '@/shared/context';
import {useUpdateMeMutation} from '@/users/store';

import './AdminNowadaysPage.scss';

const b = block('admin-nowadays-page');

type NowadaysFormValues = {
    nowBeingIn?: string | null;
    nowListening?: string | null;
    nowReading?: string | null;
    nowWatch?: string | null;
};

const normalizeValue = (value?: string | null) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
};

export const AdminNowadaysPage = () => {
    const {t} = useTranslation(['common', 'todo']);
    const {user, setUserData} = useAuth();
    const [form] = Form.useForm<NowadaysFormValues>();
    const [notificationApi, notificationHolder] = notification.useNotification();
    const {mutateAsync, isPending} = useUpdateMeMutation();

    useEffect(() => {
        form.setFieldsValue({
            nowBeingIn: user?.nowBeingIn ?? '',
            nowListening: user?.nowListening ?? '',
            nowReading: user?.nowReading ?? '',
            nowWatch: user?.nowWatch ?? '',
        });
    }, [form, user]);

    const handleFinish = async (values: NowadaysFormValues) => {
        try {
            const updatedUser = await mutateAsync({
                nowBeingIn: normalizeValue(values.nowBeingIn),
                nowListening: normalizeValue(values.nowListening),
                nowReading: normalizeValue(values.nowReading),
                nowWatch: normalizeValue(values.nowWatch),
            });
            setUserData(updatedUser);
            notificationApi.success({
                message: t('common:admin.nowadays.success.title'),
                description: t('common:admin.nowadays.success.description'),
            });
        } catch {
            notificationApi.error({
                message: t('common:admin.nowadays.error.title'),
                description: t('common:admin.nowadays.error.description'),
            });
        }
    };

    return (
        <section className={b()}>
            {notificationHolder}
            <div className={b('header')}>
                <Typography.Title level={2} className={b('title')}>
                    {t('common:admin.nowadays.title')}
                </Typography.Title>
                <Typography.Paragraph className={b('description')}>
                    {t('common:admin.nowadays.description')}
                </Typography.Paragraph>
            </div>

            <Form
                form={form}
                layout='vertical'
                className={b('form')}
                onFinish={(values) => {
                    void handleFinish(values);
                }}
            >
                <Form.Item
                    name='nowBeingIn'
                    label={t('todo:todo.nowadays.place.title')}
                >
                    <Input
                        maxLength={120}
                        showCount
                        placeholder={t(
                            'common:admin.nowadays.nowBeingIn.placeholder'
                        )}
                    />
                </Form.Item>
                <Form.Item
                    name='nowListening'
                    label={t('todo:todo.nowadays.music.title')}
                >
                    <Input
                        maxLength={120}
                        showCount
                        placeholder={t(
                            'common:admin.nowadays.nowListening.placeholder'
                        )}
                    />
                </Form.Item>
                <Form.Item
                    name='nowReading'
                    label={t('todo:todo.nowadays.book.title')}
                >
                    <Input
                        maxLength={120}
                        showCount
                        placeholder={t(
                            'common:admin.nowadays.nowReading.placeholder'
                        )}
                    />
                </Form.Item>
                <Form.Item
                    name='nowWatch'
                    label={t('todo:todo.nowadays.series.title')}
                >
                    <Input
                        maxLength={120}
                        showCount
                        placeholder={t(
                            'common:admin.nowadays.nowWatch.placeholder'
                        )}
                    />
                </Form.Item>

                <Button
                    type='primary'
                    htmlType='submit'
                    loading={isPending}
                    icon={<SaveOutlined />}
                >
                    {t('common:admin.nowadays.save')}
                </Button>
            </Form>
        </section>
    );
};
