import {BaseEntity, Role} from '@/typings/common';

export interface User extends BaseEntity {
    email: string;
    avatar?: string | null;
    username?: string;
    role?: Role;

    nowWatch?: string | null;
    nowReading?: string | null;
    nowListening?: string | null;
    nowBeingIn?: string | null;
}

export type Nowadays = Pick<
    User,
    'nowWatch' | 'nowReading' | 'nowListening' | 'nowBeingIn'
>;

export interface SubmitData {
    isLoading: boolean;
    onFinish?: () => void;
    onSubmit: () => Promise<void>;
}
