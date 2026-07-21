import {BaseEntity, Role} from '@/typings/common';

export interface User extends BaseEntity {
    email: string;
    avatar?: string;
    username?: string;
    role?: Role;

    nowWatch?: string;
    nowReading?: string;
    nowListening?: string;
    nowBeingIn?: string;
}

export interface SubmitData {
    isLoading: boolean;
    onFinish?: () => void;
    onSubmit: () => Promise<void>;
}
