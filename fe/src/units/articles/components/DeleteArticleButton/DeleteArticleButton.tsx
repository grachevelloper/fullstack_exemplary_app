import {DeleteOutlined} from '@ant-design/icons';
import {Button, Modal, notification, Typography} from 'antd';
import axios from 'axios';
import {useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';

import {useAuth} from '@/shared/context';
import {Role} from '@/typings/common';

import {useDeleteArticle} from '../../store';

interface DeleteArticleButtonProps {
    article: {
        id: string;
        title: string;
        isDraft: boolean;
        author: {
            id: string;
        };
    };
}

export const DeleteArticleButton = ({
    article,
}: DeleteArticleButtonProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const isDeleteInFlight = useRef(false);
    const [notificationApi, notificationContextHolder] =
        notification.useNotification();
    const {user} = useAuth();
    const {t} = useTranslation('article');
    const navigate = useNavigate();
    const deleteMutation = useDeleteArticle();

    const canDelete =
        user?.id === article.author.id || user?.role === Role.ADMIN;

    if (!canDelete) {
        return null;
    }

    const destination = article.isDraft ? '/articles/drafts' : '/articles';

    const openModal = () => {
        deleteMutation.reset();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        if (!deleteMutation.isPending) {
            setIsModalOpen(false);
        }
    };

    const handleDelete = async () => {
        if (isDeleteInFlight.current) {
            return;
        }

        isDeleteInFlight.current = true;

        try {
            await deleteMutation.mutateAsync(article.id);
            notificationApi.success({
                message: t('article.delete.success.title'),
            });
            navigate(destination);
        } catch (error) {
            const status = axios.isAxiosError(error)
                ? error.response?.status
                : undefined;

            if (status === 404) {
                notificationApi.info({
                    message: t('article.delete.error.notFound.title'),
                    description: t(
                        'article.delete.error.notFound.description'
                    ),
                });
                navigate(destination);
                return;
            }

            notificationApi.error({
                message:
                    status === 403
                        ? t('article.delete.error.forbidden.title')
                        : t('article.delete.error.generic.title'),
                description:
                    status === 403
                        ? t('article.delete.error.forbidden.description')
                        : t('article.delete.error.generic.description'),
            });
        } finally {
            isDeleteInFlight.current = false;
        }
    };

    return (
        <>
            {notificationContextHolder}
            <Button
                danger
                icon={<DeleteOutlined />}
                onClick={openModal}
                data-marker='article-delete-button'
            >
                {t('article.delete.action')}
            </Button>
            <Modal
                open={isModalOpen}
                title={t('article.delete.confirm.title')}
                okText={t('article.delete.action')}
                cancelText={t('article.delete.cancel')}
                confirmLoading={deleteMutation.isPending}
                okButtonProps={{
                    danger: true,
                    disabled: deleteMutation.isPending,
                }}
                cancelButtonProps={{disabled: deleteMutation.isPending}}
                closable={!deleteMutation.isPending}
                keyboard={!deleteMutation.isPending}
                maskClosable={!deleteMutation.isPending}
                onCancel={closeModal}
                onOk={() => {
                    void handleDelete();
                }}
            >
                <Typography.Text>
                    {t('article.delete.confirm.description', {
                        title: article.title,
                    })}
                </Typography.Text>
            </Modal>
        </>
    );
};
