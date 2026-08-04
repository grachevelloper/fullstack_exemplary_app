import {describe, expect, it, jest} from "@jest/globals";
import {ExecutionContext, UnauthorizedException} from "@nestjs/common";
import {Reflector} from "@nestjs/core";
import {JwtService} from "@nestjs/jwt";
import {AuthGuard} from "src/shared/guards/auth.guard";
import {Role} from "src/types";

import {UsersService} from "@/users/users.service";

function contextWithCookies(
    cookies: Record<string, string>,
    request: Record<string, unknown> = {},
): ExecutionContext {
    Object.assign(request, {cookies});
    return {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: () => ({getRequest: () => request}),
    } as unknown as ExecutionContext;
}

describe("AuthGuard", () => {
    const usersService = {
        findById: jest.fn(),
    } as unknown as UsersService;

    it("rejects a request without an access cookie", async () => {
        const guard = new AuthGuard(
            {} as JwtService,
            {getAllAndOverride: jest.fn(() => false)} as unknown as Reflector,
            usersService,
        );

        await expect(
            guard.canActivate(contextWithCookies({})),
        ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it.each(["invalid token", "jwt expired"])(
        "rejects verification failure: %s",
        async (message) => {
            const jwt = {
                verifyAsync: jest.fn(async () => {
                    throw new Error(message);
                }),
            } as unknown as JwtService;
            const guard = new AuthGuard(jwt, {
                getAllAndOverride: jest.fn(() => false),
            } as unknown as Reflector, usersService);

            await expect(
                guard.canActivate(contextWithCookies({accessToken: "token"})),
            ).rejects.toBeInstanceOf(UnauthorizedException);
        },
    );

    it("uses the current database role on a public request with a valid access cookie", async () => {
        const request: Record<string, unknown> = {};
        const jwt = {
            verifyAsync: jest.fn(async () => ({
                sub: "user-123",
                iat: 1,
                exp: 2,
            })),
        } as unknown as JwtService;
        const findById = jest.fn(async (_id: string) => ({role: Role.ADMIN}));
        const guard = new AuthGuard(
            jwt,
            {getAllAndOverride: jest.fn(() => true)} as unknown as Reflector,
            {findById} as unknown as UsersService,
        );

        await expect(
            guard.canActivate(contextWithCookies({accessToken: "token"}, request)),
        ).resolves.toBe(true);

        expect(findById).toHaveBeenCalledWith("user-123");
        expect(request.user).toEqual({
            id: "user-123",
            role: Role.ADMIN,
            iat: 1,
            exp: 2,
        });
    });

    it("uses the current database role for a protected request", async () => {
        const request: Record<string, unknown> = {};
        const jwt = {
            verifyAsync: jest.fn(async () => ({
                sub: "user-123",
                iat: 1,
                exp: 2,
            })),
        } as unknown as JwtService;
        const findById = jest.fn(async (_id: string) => ({role: Role.ADMIN}));
        const guard = new AuthGuard(
            jwt,
            {getAllAndOverride: jest.fn(() => false)} as unknown as Reflector,
            {findById} as unknown as UsersService,
        );

        await expect(
            guard.canActivate(contextWithCookies({accessToken: "token"}, request)),
        ).resolves.toBe(true);

        expect(findById).toHaveBeenCalledWith("user-123");
        expect(request.user).toEqual({
            id: "user-123",
            role: Role.ADMIN,
            iat: 1,
            exp: 2,
        });
    });
});
