declare global {
    type Nullable<T> = T | null;
    type Undefinable<T> = T | undefined;

    type PartialFields<T, K extends keyof T> = Partial<Pick<T, K>> & Omit<T, K>;
}

interface JwtUser {
    id: string;
    email: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: JwtUser;
        }
    }
}

export {};
