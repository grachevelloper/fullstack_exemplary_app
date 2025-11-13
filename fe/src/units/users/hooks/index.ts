import {useMutation, useQuery} from '@tanstack/react-query';

import {queryClient} from '@/shared/configs/api';

import api from '../api';
import {DtoSignInUser, DtoSignUpUser} from '../api/types';

export const useSignUpMutation = () => {
    return useMutation({
        mutationKey: ['signup'],
        mutationFn: (userData: DtoSignUpUser) => api.signUp(userData),
    });
};

export const useSignInQuery = (signInData: DtoSignInUser) => {
    const {data, isPending, isError} = useQuery(
        {
            queryKey: ['signin'],
            queryFn: () => api.signIn(signInData),
        },
        queryClient
    );

    return {user: data, isPending, isError};
};

// export const useUserMutation = () => {
//     const queryClient = useQueryClient();
//     return useMutation(
//         {
//             mutationFn: (updateData: DtoUpdateTodo) =>
//                 api.updateTodoById(updateData),
//             onSuccess: (variables) => {
//                 queryClient.invalidateQueries({
//                     queryKey: ['todos', variables.id],
//                 });
//                 queryClient.invalidateQueries({
//                     queryKey: ['todo', variables.id],
//                 });
//             },
//         },
//         queryClient
//     );
// };
