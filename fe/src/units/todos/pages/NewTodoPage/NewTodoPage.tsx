import {ArrowLeftOutlined, CheckCircleOutlined} from '@ant-design/icons';
import {Button, Col, Form, Input, Row, Select, Space, Typography, message} from 'antd';
import block from 'bem-cn-lite';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';

import {useLocalStorage} from '@/shared/hooks';
import {NEW_TODO_KEY} from '@/shared/utils/constants';

import {DtoCreateTodo} from '../../api/types';
import {useCreateTodoMutation} from '../../store';
import {TodoPriority, TodoState} from '../../types';

import './NewTodoPage.scss';

const b = block('new-todo-page');

const {TextArea} = Input;

const defaultTodo: DtoCreateTodo = {
    title: '',
    content: '',
    priority: TodoPriority.MEDIUM,
    state: TodoState.PLANNING,
};

const priorityKeyByValue: Record<TodoPriority, string> = {
    [TodoPriority.LOW]: 'low',
    [TodoPriority.MEDIUM]: 'medium',
    [TodoPriority.HIGH]: 'high',
    [TodoPriority.SUPER]: 'super',
};

const stateKeyByValue: Record<TodoState, string> = {
    [TodoState.IN_WORK]: 'in_work',
    [TodoState.PLANNING]: 'planning',
    [TodoState.FINISHED]: 'finished',
    [TodoState.CANCELED]: 'canceled',
};

export const NewTodoPage = () => {
    const {t} = useTranslation('todo');
    const {t: tCommon} = useTranslation('common');
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();
    const [draft, setDraft] = useLocalStorage<DtoCreateTodo>(
        NEW_TODO_KEY,
        defaultTodo
    );
    const [form] = Form.useForm<DtoCreateTodo>();
    const {mutateAsync: createTodo, isPending} = useCreateTodoMutation();

    const handleValuesChange = (
        changedValues: Partial<DtoCreateTodo>,
        values: DtoCreateTodo
    ) => {
        setDraft({...values, ...changedValues});
    };

    const handleSubmit = async (values: DtoCreateTodo) => {
        const createdTodo = await createTodo(values);
        setDraft(defaultTodo);
        form.resetFields();
        void messageApi.success(t('new-todo-page.success'));
        void navigate(`/todos/${createdTodo.id}`);
    };

    return (
        <section className={b()}>
            {contextHolder}
            <Button
                type='text'
                icon={<ArrowLeftOutlined />}
                onClick={() => {
                    void navigate(-1);
                }}
                className={b('back')}
            >
                {tCommon('button.back')}
            </Button>
            <div className={b('header')}>
                <Typography.Title level={1} className={b('title')}>
                    {t('new-todo-page.title')}
                </Typography.Title>
                <Typography.Text type='secondary' className={b('subtitle')}>
                    {t('new-todo-page.subtitle')}
                </Typography.Text>
            </div>
            <Form<DtoCreateTodo>
                form={form}
                layout='vertical'
                initialValues={draft}
                onValuesChange={handleValuesChange}
                onFinish={(values) => {
                    void handleSubmit(values);
                }}
                className={b('form')}
            >
                <Row gutter={[24, 16]}>
                    <Col xs={24} lg={14}>
                        <Form.Item
                            name='title'
                            label={t('todo.table.col.todo')}
                            rules={[
                                {
                                    required: true,
                                    message: tCommon('validation.required'),
                                },
                            ]}
                        >
                            <Input
                                size='large'
                                data-marker='todo-title-input'
                                placeholder={t(
                                    'new-todo-form.your-title.placeholder'
                                )}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} lg={5}>
                        <Form.Item
                            name='priority'
                            label={t('todo.table.col.priority')}
                        >
                            <Select
                                size='large'
                                data-marker='todo-priority-select'
                                options={Object.values(TodoPriority).map(
                                    (priority) => ({
                                        value: priority,
                                        label: t(
                                            `todo.priority.${priorityKeyByValue[priority]}`
                                        ),
                                    })
                                )}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} lg={5}>
                        <Form.Item name='state' label={t('todo.table.col.state')}>
                            <Select
                                size='large'
                                data-marker='todo-state-select'
                                options={Object.values(TodoState).map((state) => ({
                                    value: state,
                                    label: t(
                                        `todo.state.${stateKeyByValue[state]}`
                                    ),
                                }))}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            name='content'
                            label={t('todo.table.col.content')}
                            rules={[
                                {
                                    required: true,
                                    message: tCommon('validation.required'),
                                },
                            ]}
                        >
                            <TextArea
                                data-marker='todo-content-input'
                                placeholder={t(
                                    'new-todo-form.your-content.placeholder'
                                )}
                                autoSize={{minRows: 8, maxRows: 18}}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Space className={b('actions')} wrap>
                    <Button
                        onClick={() => {
                            void navigate(-1);
                        }}
                    >
                        {tCommon('cancel')}
                    </Button>
                    <Button
                        type='primary'
                        htmlType='submit'
                        icon={<CheckCircleOutlined />}
                        data-marker='todo-create-button'
                        loading={isPending}
                    >
                        {t('new-todo-page.create')}
                    </Button>
                </Space>
            </Form>
        </section>
    );
};
