export interface User {
    id: string;
    email: string;
    username?: string;
    password: string;
}

export interface SubmitData {
    isLoading: boolean;
    onSubmit: () => void;
}
