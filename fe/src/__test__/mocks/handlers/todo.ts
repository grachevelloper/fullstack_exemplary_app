import {http, HttpResponse} from 'msw';

import {Todo, TodoPriority, TodoState} from '@/todos/types';

import {createMockTodo} from '../factories/todoFactory';

export const todoHandlers = [
    http.get('*/api/todos', () => {
        const mockTodos = [
            createMockTodo({
                id: '1',
                title: 'Первый мок в моей жизни!',
                content: 'Настроить MSW и моки для проекта',
                priority: TodoPriority.HIGH,
                state: TodoState.CANCELED,
            }),
            createMockTodo({
                id: '2',
                title: 'Набрать массу',
                content: 'Сьесть фургон мороженного',
                priority: TodoPriority.MEDIUM,
                state: TodoState.IN_WORK,
            }),
            createMockTodo({
                id: '3',
                title: 'Изучить TypeScript',
                content: 'Продвинутые типы и дженерики',
                priority: TodoPriority.HIGH,
                state: TodoState.FINISHED,
            }),
            createMockTodo({
                id: '4',
                title: 'Создать компонент TodoList',
                content: 'Реализовать drag and drop',
                priority: TodoPriority.HIGH,
            }),
            createMockTodo({
                id: '5',
                title: 'Написать тесты',
                content: 'Unit тесты для всех компонентов',
                priority: TodoPriority.MEDIUM,
                state: TodoState.IN_WORK,
            }),
            createMockTodo({
                id: '6',
                title: 'Оптимизировать бандл',
                content: 'Уменьшить размер приложения',
                priority: TodoPriority.LOW,
                state: TodoState.PLANNING,
            }),
        ];

        return HttpResponse.json(mockTodos);
    }),

    http.get('*/api/todos/:id', ({params}) => {
        const {todoId} = params;

        const todoDetails = {
            '1': createMockTodo({
                id: '1',
                title: 'Первый мок в моей жизни!',
                content:
                    'Подробное описание настройки MSW: установка, конфигурация, создание моков',
                priority: TodoPriority.HIGH,
                state: TodoState.CANCELED,
                authorId: 'user-1',
            }),
            '2': createMockTodo({
                id: '2',
                title: 'Набрать массу',
                content:
                    'План питания: завтрак - овсянка, обед - курица с рисом, ужин - творог. Тренировки 3 раза в неделю.',
                priority: TodoPriority.MEDIUM,
                state: TodoState.CANCELED,
                authorId: 'user-2',
            }),
            '3': createMockTodo({
                id: '3',
                title: 'Изучить TypeScript',
                content:
                    'Темы для изучения: дженерики, условные типы, утилитарные типы, декораторы',
                authorId: 'user-1',
            }),
        };

        const todo =
            todoDetails[todoId as keyof typeof todoDetails] ||
            createMockTodo({
                id: todoId as string,
                title: `Todo ${todoId}`,
                content: `Детальное описание задачи ${todoId}`,
                priority: TodoPriority.MEDIUM,
                state: TodoState.CANCELED,
            });

        return HttpResponse.json(todo);
    }),

    http.patch('*/api/todos/:id', async ({request}) => {
        const newTodo = (await request.json()) as Todo;
        console.log(newTodo, '123');
        const createdTodo = createMockTodo({
            ...newTodo,
            updatedAt: new Date(),
            id: '1',
        });
        console.log(createdTodo);
        return HttpResponse.json(createdTodo);
    }),

    //     return HttpResponse.json(createdTodo, {status: 201});
    // }),

    // http.put('*/api/todos/:todoId', async ({params, request}) => {
    //     const {todoId} = params;
    //     const updates = (await request.json()) as Partial<Todo>;

    //     const updatedTodo = createMockTodo({
    //         id: todoId as string,
    //         ...updates,
    //     });

    //     return HttpResponse.json(updatedTodo);
    // }),

    // http.delete('*/api/todos/:todoId', ({params}) => {
    //     const {todoId} = params;
    //     return HttpResponse.json({
    //         success: true,
    //         message: `Todo ${todoId} успешно удален`,
    //         deletedId: todoId,
    //     });
    // }),
];
