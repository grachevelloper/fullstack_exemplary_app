import {
    DeleteOutlined,
    EditOutlined,
    FileAddOutlined,
    PlusOutlined,
} from '@ant-design/icons';
import {
    Button,
    Card,
    Empty,
    Input,
    Modal,
    Popover,
    Space,
    Steps,
    Typography,
} from 'antd';
import block from 'bem-cn-lite';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';

import {
    useChecklistMutations,
    useChecklistQuery,
} from '@/todos/store/useChecklist';

import './Checklist.scss';

const {Text} = Typography;
const b = block('checklist');

interface ChecklistProps {
    canEdit: boolean;
    todoId: string;
}

export const Checklist = ({todoId, canEdit}: ChecklistProps) => {
    const {t} = useTranslation('todo');
    const [editing, setEditing] = useState(false);
    const [popoverVisible, setPopoverVisible] = useState(false);
    const [newItemText, setNewItemText] = useState('');
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editingText, setEditingText] = useState('');

    const {data: checklistData} = useChecklistQuery(todoId);
    const {
        addItem,
        updateItemText,
        removeItem,
        updateProgress,
        createChecklist,
        isPending,
    } = useChecklistMutations(todoId);

    const steps = checklistData?.text || [];

    const showActionError = () => {
        Modal.error({
            title: t('todo.checklist.error.title'),
            content: t('todo.checklist.error.content'),
        });
    };

    const ensureChecklistExists = async () => {
        if (!checklistData) {
            await createChecklist();
        }
    };

    const handleAddItem = async () => {
        if (newItemText.trim()) {
            try {
                await ensureChecklistExists();
                await addItem(newItemText.trim());
                setNewItemText('');
                setPopoverVisible(false);
            } catch {
                showActionError();
            }
        }
    };

    const handleDeleteItem = (index: number) => {
        Modal.confirm({
            title: t('todo.checklist.delete.title'),
            content: t('todo.checklist.delete.content'),
            okText: t('todo.checklist.delete.ok'),
            cancelText: t('todo.checklist.delete.cancel'),
            okType: 'danger',
            onOk: async () => {
                try {
                    await removeItem(index);
                } catch {
                    showActionError();
                }
            },
        });
    };

    const handleStartEdit = (index: number) => {
        setEditingIndex(index);
        setEditingText(steps[index] || '');
    };

    const handleSaveEdit = async () => {
        if (editingIndex !== null && editingText.trim()) {
            try {
                await updateItemText(editingIndex, editingText.trim());
                setEditingIndex(null);
                setEditingText('');
            } catch {
                showActionError();
            }
        }
    };

    const handleCancelEdit = () => {
        setEditingIndex(null);
        setEditingText('');
    };

    const handleStepChange = async (current: number) => {
        try {
            if (!checklistData) {
                await ensureChecklistExists();
            }
            await updateProgress(current - (checklistData?.progress || 0));
        } catch {
            showActionError();
        }
    };

    const handleCreateChecklist = async () => {
        try {
            await createChecklist();
        } catch {
            showActionError();
        }
    };

    const popoverContent = (
        <div className={b('popover-content')}>
            <Space direction='vertical' className={b('popover-fields')}>
                <Input
                    placeholder={t('todo.checklist.add.placeholder')}
                    value={newItemText}
                    data-marker='checklist-add-input'
                    onChange={(e) => setNewItemText(e.target.value)}
                    onPressEnter={() => {
                        void handleAddItem();
                    }}
                    disabled={isPending}
                />
                <Button
                    type='primary'
                    icon={<PlusOutlined />}
                    onClick={() => {
                        void handleAddItem();
                    }}
                    data-marker='checklist-add-button'
                    block
                    disabled={!newItemText.trim() || isPending}
                    loading={isPending}
                >
                    {t('todo.checklist.add.submit')}
                </Button>
            </Space>
        </div>
    );

    const renderChecklistTitle = () => (
        <div className={b('title')}>
            <div className={b('title-copy')}>
                <Text strong className={b('title-text')}>
                    {t('todo.checklist.title')}
                </Text>
                {isPending && (
                    <Text type='secondary' className={b('pending-text')}>
                        {t('todo.checklist.updating')}
                    </Text>
                )}
            </div>
            {canEdit && (
                <Button
                    className={b('edit-button')}
                    type={editing ? 'primary' : 'text'}
                    icon={<EditOutlined />}
                    size='small'
                    onClick={() => setEditing(!editing)}
                    disabled={isPending}
                >
                    {editing
                        ? t('todo.checklist.edit.done')
                        : t('todo.checklist.edit.start')}
                </Button>
            )}
        </div>
    );

    const renderAddItemButton = (label: string) => (
        <Popover
            title={t('todo.checklist.add.title')}
            content={popoverContent}
            trigger='click'
            open={popoverVisible}
            onOpenChange={setPopoverVisible}
            placement='bottomRight'
        >
            <Button
                className={b('add-button')}
                type='dashed'
                icon={<PlusOutlined />}
                size='small'
                disabled={isPending}
            >
                {label}
            </Button>
        </Popover>
    );

    if (!checklistData) {
        return (
            <Card
                title={t('todo.checklist.title')}
                size='small'
                className={b({pending: isPending})}
                data-marker='checklist-card'
                extra={
                    canEdit ? (
                        <Button
                            type='primary'
                            icon={<FileAddOutlined />}
                            size='small'
                            onClick={() => {
                                void handleCreateChecklist();
                            }}
                            loading={isPending}
                        >
                            {t('todo.checklist.create')}
                        </Button>
                    ) : undefined
                }
            >
                <Empty
                    description={
                        <Space direction='vertical' size='small'>
                            <Text type='secondary'>
                                {t('todo.checklist.empty.not-created')}
                            </Text>
                            <Text type='secondary'>
                                {t('todo.checklist.empty.hint')}
                            </Text>
                        </Space>
                    }
                />
            </Card>
        );
    }

    if (steps.length === 0) {
        return (
            <Card
                title={renderChecklistTitle()}
                size='small'
                className={b({pending: isPending})}
                data-marker='checklist-card'
                extra={
                    canEdit
                        ? renderAddItemButton(t('todo.checklist.add.item'))
                        : undefined
                }
            >
                <Empty
                    description={t('todo.checklist.empty.no-items')}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            </Card>
        );
    }

    const stepItems = steps.map((stepText, index) => ({
        title:
            editingIndex === index ? (
                <Space.Compact className={b('edit-field')}>
                    <Input
                        size='small'
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onClick={(event) => event.stopPropagation()}
                        onPressEnter={() => {
                            void handleSaveEdit();
                        }}
                        disabled={isPending}
                    />
                    <Button
                        size='small'
                        type='link'
                        onClick={(event) => {
                            event.stopPropagation();
                            void handleSaveEdit();
                        }}
                        loading={isPending}
                    >
                        {t('todo.checklist.edit.save')}
                    </Button>
                    <Button
                        size='small'
                        type='link'
                        danger
                        onClick={(event) => {
                            event.stopPropagation();
                            handleCancelEdit();
                        }}
                        disabled={isPending}
                    >
                        {t('todo.checklist.edit.cancel')}
                    </Button>
                </Space.Compact>
            ) : (
                <span className={b('step-title')}>
                    <Text
                        className={b('step-text')}
                        data-marker='checklist-item'
                    >
                        {stepText}
                    </Text>
                    {canEdit && editing && (
                        <Space size='small' className={b('step-actions')}>
                            <Button
                                type='link'
                                size='small'
                                onClick={(event) => {
                                    event.stopPropagation();
                                    handleStartEdit(index);
                                }}
                                disabled={isPending}
                            >
                                {t('todo.checklist.edit.change')}
                            </Button>
                            <Button
                                type='link'
                                danger
                                size='small'
                                icon={<DeleteOutlined />}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    handleDeleteItem(index);
                                }}
                                disabled={isPending}
                            />
                        </Space>
                    )}
                </span>
            ),
        description:
            index < (checklistData?.progress || 0)
                ? t('todo.checklist.step.done')
                : index === (checklistData?.progress || 0)
                  ? t('todo.checklist.step.current')
                  : t('todo.checklist.step.pending'),
    }));

    return (
        <Card
            title={renderChecklistTitle()}
            size='small'
            className={b({pending: isPending})}
            data-marker='checklist-card'
            extra={
                canEdit &&
                editing &&
                renderAddItemButton(t('todo.checklist.add.short'))
            }
        >
            <Steps
                current={checklistData?.progress || 0}
                items={stepItems}
                direction='vertical'
                size='default'
                className={b('steps')}
                onChange={
                    !canEdit || editing || editingIndex !== null
                        ? undefined
                        : (current) => {
                              void handleStepChange(current);
                          }
                }
                responsive
            />
        </Card>
    );
};
