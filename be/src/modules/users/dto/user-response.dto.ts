import {Role} from "../../../types";

export interface UserResponseDto {
    id: string;
    username: string;
    email: string;
    role: Role;
    avatar: string | null;
    nowReading: string | null;
    nowWatch: string | null;
    nowBeingIn: string | null;
    nowListening: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface NowadaysResponseDto {
    nowReading: string | null;
    nowWatch: string | null;
    nowBeingIn: string | null;
    nowListening: string | null;
}
