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
import type {ReactElement} from 'react';
import {useState} from 'react';

import {
    useChecklistMutations,
    useChecklistQuery,
} from '@/todos/store/useChecklist';

import './Checklist.scss';

const {Text} = Typography;
const b = block('checklist');

interface ChecklistProps {
    todoId: string;
}

export const Checklist = ({todoId}: ChecklistProps) => {
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

    const ensureChecklistExists = async () => {
        if (!checklistData) {
            try {
                await createChecklist();
            } catch (error) {
                console.error('Failed to create checklist:', error);
                throw error; // Пробрасываем ошибку дальше
            }
        }
    };

    const handleAddItem = async () => {
        if (newItemText.trim()) {
            try {
                await ensureChecklistExists();
                await addItem(newItemText.trim());
                setNewItemText('');
                setPopoverVisible(false);
            } catch (error) {
                console.error('Failed to add item:', error);
            }
        }
    };

    const handleStartEditing = async () => {
        try {
            await ensureChecklistExists();
            setEditing(true);
        } catch (error) {
            console.error('Failed to start editing:', error);
        }
    };

    const handleDeleteItem = (index: number) => {
        Modal.confirm({
            title: 'Удалить пункт?',
            content: 'Вы уверены, что хотите удалить этот пункт из чек-листа?',
            okText: 'Удалить',
            cancelText: 'Отмена',
            okType: 'danger',
            onOk: async () => {
                try {
                    await removeItem(index);
                } catch (error) {
                    console.error('Failed to remove item:', error);
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
            } catch (error) {
                console.error('Failed to update item:', error);
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
        } catch (error) {
            console.error('Failed to update progress:', error);
        }
    };

    const handleCreateChecklist = async () => {
        try {
            await createChecklist();
        } catch (error) {
            console.error('Failed to create checklist:', error);
        }
    };

    const popoverContent = (
        <div style={{width: 300}}>
            <Space direction='vertical' style={{width: '100%'}}>
                <Input
                    placeholder='Введите название пункта...'
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
                    Добавить запись
                </Button>
            </Space>
        </div>
    );

    const renderAddPopover = (
        trigger: ReactElement,
        placement: 'bottom' | 'bottomRight' = 'bottomRight'
    ) => (
        <Popover
            title='Добавить новый пункт'
            content={popoverContent}
            trigger='click'
            open={popoverVisible}
            onOpenChange={setPopoverVisible}
            placement={placement}
        >
            {trigger}
        </Popover>
    );

    // Если чеклист загружается
    if (isPending) {
        return (
            <Card
                title='Чек-лист'
                size='small'
                className={b()}
                data-marker='checklist-card'
            >
                <Empty description='Загрузка...' />
            </Card>
        );
    }

    // Если чеклиста нет - показываем кнопку создания
    if (!checklistData) {
        return (
            <Card
                title='Чек-лист'
                size='small'
                className={b()}
                data-marker='checklist-card'
                extra={
                    <Button
                        type='primary'
                        icon={<FileAddOutlined />}
                        size='small'
                        onClick={() => {
                            void handleCreateChecklist();
                        }}
                        loading={isPending}
                    >
                        Создать чек-лист
                    </Button>
                }
            >
                <Empty
                    description={
                        <Space direction='vertical' size='small'>
                            <Text type='secondary'>Чек-лист еще не создан</Text>
                            <Text type='secondary'>
                                Начните планирование задач
                            </Text>
                        </Space>
                    }
                >
                    <Button
                        type='primary'
                        icon={<FileAddOutlined />}
                        onClick={() => {
                            void handleCreateChecklist();
                        }}
                        loading={isPending}
                    >
                        Создать чек-лист
                    </Button>
                </Empty>
            </Card>
        );
    }

    // Если чеклист пустой
    if (steps.length === 0) {
        return (
            <Card
                title={
                    <Space className={b('title')}>
                        Чек-лист
                        <Button
                            type={editing ? 'primary' : 'text'}
                            icon={<EditOutlined />}
                            size='small'
                            onClick={() => setEditing(!editing)}
                            disabled={isPending}
                        >
                            {editing ? 'Завершить' : 'Редактировать'}
                        </Button>
                    </Space>
                }
                size='small'
                className={b()}
                data-marker='checklist-card'
                extra={renderAddPopover(
                        <Button
                            type='dashed'
                            icon={<PlusOutlined />}
                            size='small'
                            disabled={isPending}
                        >
                            Добавить пункт
                        </Button>,
                        'bottomRight'
                    )}
            >
                <Empty
                    description='Чек-лист пустой'
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            </Card>
        );
    }

    // Обычное отображение чеклиста с данными
    const stepItems = steps.map((stepText, index) => ({
        title:
            editingIndex === index ? (
                <Space>
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
                        ✓
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
                        ✕
                    </Button>
                </Space>
            ) : (
                <Space>
                    <span data-marker='checklist-item'>{stepText}</span>
                    {editing && (
                        <Space size='small' style={{marginLeft: 8}}>
                            <Button
                                type='link'
                                size='small'
                                onClick={(event) => {
                                    event.stopPropagation();
                                    handleStartEdit(index);
                                }}
                                disabled={isPending}
                            >
                                Изменить
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
                </Space>
            ),
        description:
            index < (checklistData?.progress || 0)
                ? 'Выполнено'
                : index === (checklistData?.progress || 0)
                ? 'Текущий шаг'
                : 'Не выполнено',
    }));

    return (
        <Card
            title={
                <Space className={b('title')}>
                    Чек-лист
                    <Button
                        type={editing ? 'primary' : 'text'}
                        icon={<EditOutlined />}
                        size='small'
                        onClick={() => setEditing(!editing)}
                        disabled={isPending}
                    >
                        {editing ? 'Завершить' : 'Редактировать'}
                    </Button>
                </Space>
            }
            size='small'
            className={b()}
            data-marker='checklist-card'
            extra={
                editing &&
                renderAddPopover(
                    <Button
                        type='dashed'
                        icon={<PlusOutlined />}
                        size='small'
                        disabled={isPending}
                    >
                        Добавить
                    </Button>,
                    'bottomRight'
                )
            }
        >
            <Steps
                current={checklistData?.progress || 0}
                items={stepItems}
                direction='vertical'
                size='default'
                style={{
                    height: '100%',
                    minHeight: '300px',
                }}
                onChange={
                    editing || editingIndex !== null
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
