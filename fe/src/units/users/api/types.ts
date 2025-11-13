import { Tokens } from '@/typings/common';

import { User } from '../types';

export type SignResponse = Tokens & User;

export type DtoSignUpUser = Pick<User, 'email' | 'password' | 'username'>;

export type DtoSignInUser = Pick<User, 'email' | 'password'>;

export interface DtoUpdateUser extends Pick<User, 'id'> {
    username?: string;
    password?: string;
}

export interface ResponseYandex0Auth {
    login: string;
    id: string;
    default_email: string;
    is_avatar_empty: boolean;
    default_avatar_id: string;
    display_name: string;
}

export interface UserApi {
    signIn: (signInData: DtoSignInUser) => Promise<void>;
    signUp: (signUpData: DtoSignUpUser) => Promise<void>;
    updateUserById: (updateData: DtoUpdateUser) => Promise<User>;
    yandexSignIn: () => Promise<ResponseYandex0Auth>;
}
