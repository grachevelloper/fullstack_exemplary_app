import {http, HttpResponse} from 'msw';

export const todoHandlers = [
    http.get('*/api/listTodos', () => {
        return HttpResponse.json([
            {id: '1', title: 'Первый мок в моей жизни!', completed: false},
            {
                id: '2',
                title: 'Набрать массу',
                content: 'Сьесть фургон мороженного',
                completed: false,
            },
        ]);
    }),

    http.get('*/api/todos/:todoId', ({params}) => {
        const {todoId} = params;
        return HttpResponse.json({
            id: todoId,
            title: `Todo ${todoId}`,
            completed: false,
        });
    }),
];
