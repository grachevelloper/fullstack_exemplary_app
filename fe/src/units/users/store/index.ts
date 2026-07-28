import {useMutation, useQuery} from '@tanstack/react-query';

import {queryClient} from '@/shared/configs/api';
import {useAuth} from '@/shared/context';

import api from '../api';
import {DtoChangePassword, DtoSignInUser, DtoSignUpUser, DtoUpdateUser} from '../api/types';

export const nowadaysQueryKey = ['users', 'nowadays'] as const;

export const useNowadays = () => {
    return useQuery({
        queryKey: nowadaysQueryKey,
        queryFn: () => api.getNowadays(),
    });
};

export const useSignupMutation = () => {
    return useMutation({
        mutationKey: ['signup'],
        mutationFn: (userData: DtoSignUpUser) => api.signUp(userData),
    });
};

export const useLogoutMutation = () => {
    const {setUserData} = useAuth();

    return useMutation({
        mutationKey: ['logout'],
        mutationFn: () => api.logout(),
        onSuccess: () => {
            setUserData(undefined);
            queryClient.clear();
        },
    });
};

export const useSigninMutatuon = () => {
    const {mutateAsync, isPending, error} = useMutation(
        {
            mutationKey: ['signin'],
            mutationFn: (signInData: DtoSignInUser) => api.signIn(signInData),
        },
        queryClient
    );

    return {isPending, error, mutateAsync};
};

export const useUpdateMeMutation = () => {
    return useMutation({
        mutationKey: ['users', 'me', 'update'],
        mutationFn: (data: Omit<DtoUpdateUser, 'id'>) => api.updateMe(data),
        onSuccess: (user) => {
            queryClient.setQueryData(['users', 'me'], user);
            queryClient.setQueryData(nowadaysQueryKey, {
                nowBeingIn: user.nowBeingIn,
                nowListening: user.nowListening,
                nowReading: user.nowReading,
                nowWatch: user.nowWatch,
            });
        },
    });
};

export const useChangeMyPasswordMutation = () => {
    return useMutation({
        mutationKey: ['users', 'me', 'password'],
        mutationFn: (data: DtoChangePassword) => api.changeMyPassword(data),
    });
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
