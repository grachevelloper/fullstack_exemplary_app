import {createHash} from "crypto";
import type {CookieOptions} from "express";
export function hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
}

export function tokenConfig(ttl: number): CookieOptions {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: ttl,
        path: "/",
    };
}
