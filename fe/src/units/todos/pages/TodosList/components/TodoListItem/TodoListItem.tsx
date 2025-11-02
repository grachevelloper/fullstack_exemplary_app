import { Flex, Typography } from 'antd'
import { Todo } from "src/units/todos/types/todo"
import { TODO_TITLE_MAX_LENGTH } from '@/utils/constants';
import { EditOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface TodoListItemProps {
    todo: Todo;
}


export const TodoListItem = ({ todo }: TodoListItemProps) => {
    const {
        title,
        priority,
        isActive
    } = todo

    const { t } = useTranslation(["todo"])

    const editTitleConfig = {
        icon: <EditOutlined />,
        editable: isActive,
        maxLength: TODO_TITLE_MAX_LENGTH,
        text: '3',
    };

    const priorityT = priority.toLowerCase();

    return (
        <Flex
            justify='center'
            align='center'
            gap={8}
        >
            <Typography.Title
                editable={editTitleConfig}
            >
                {title}
            </Typography.Title>

            <Typography.Title
                editable={isActive}
            >
                {/* {t(`todo.?`)} */}
            </Typography.Title>

        </Flex>

    )
}