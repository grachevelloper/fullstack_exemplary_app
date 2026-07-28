import {Nowadays, User} from '../types';

export type SignResponse = User;

export interface DtoSignUpUser {
    email: string;
    password: string;
    username: string;
}

export interface DtoSignInUser {
    email: string;
    password: string;
}

export interface DtoUpdateUser extends Pick<User, 'id'> {
    username?: string;
    avatar?: string | null;
    nowBeingIn?: string | null;
    nowListening?: string | null;
    nowReading?: string | null;
    nowWatch?: string | null;
}

export interface DtoChangePassword {
    currentPassword: string;
    newPassword: string;
}

export interface UserApi {
    signIn: (signInData: DtoSignInUser) => Promise<SignResponse>;
    signUp: (signUpData: DtoSignUpUser) => Promise<User>;
    logout: () => Promise<void>;
    getMe: () => Promise<User>;
    getNowadays: () => Promise<Nowadays | null>;
    updateMe: (updateData: Omit<DtoUpdateUser, 'id'>) => Promise<User>;
    changeMyPassword: (data: DtoChangePassword) => Promise<void>;
    getUserById: (id: string) => Promise<User>;
    updateUserById: (updateData: DtoUpdateUser) => Promise<User>;
    changeUserPassword: (
        id: string,
        data: DtoChangePassword
    ) => Promise<void>;
    deleteUserById: (id: string) => Promise<void>;
}
